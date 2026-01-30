'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NextLink from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  LogOut,
  Link as LinkIcon,
  Copy,
  Trash2,
  Eye,
  Pencil,
  Sparkles,
  Grid3x3,
  List,
  CheckSquare,
  Square,
  X,
  MousePointerClick,
  TrendingUp,
  Activity,
  BarChart3,
  Lock,
  Crown,
  Shield
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Session } from "@supabase/supabase-js";
import CreateLinkFlow from "@/components/link-creation/CreateLinkFlow";
import AccountForm from "@/components/AccountForm";
import AccountsSection from "@/components/AccountsSection";
import LinkFilters from "@/components/LinkFilters";
import LinkUrlDisplay from "@/components/LinkUrlDisplay";
import { Account, AccountType, ACCOUNT_TYPE_ICONS } from "@/lib/account-types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Link {
  id: string;
  short_code: string;
  title: string | null;
  html_content: string;
  affiliate_url: string;
  created_at: string;
  is_active: boolean;
  status?: string; // 'draft' | 'active' | 'archived'
  strategy: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  favicon_url: string | null;
  account_id: string | null;
  tags: string[] | null;
  click_count: number | null;
  accounts?: Account | null;
}

type ViewMode = 'grid' | 'list';

// 帳號類型顏色映射
const getAccountColorClasses = (type: AccountType | undefined): string => {
  if (!type) return "bg-gray-100 text-gray-700 border-gray-200";

  const colorMap: Record<AccountType, string> = {
    beauty: "bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200",
    professional: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
    emotion: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
    curiosity: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200",
    lifestyle: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200",
    benefit: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
  };

  return colorMap[type] || "bg-gray-100 text-gray-700 border-gray-200";
};

const DashboardContent = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [defaultAccountId, setDefaultAccountId] = useState<string | null>(null);
  const [defaultStrategy, setDefaultStrategy] = useState<string | null>(null);

  // 新增的 state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 會員狀態
  const [isPaid, setIsPaid] = useState<boolean | null>(null); // null = loading
  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // 計算連結數量
  const linkCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    links.forEach(link => {
      if (link.account_id) {
        counts[link.account_id] = (counts[link.account_id] || 0) + 1;
      }
    });
    return counts;
  }, [links]);

  // 計算統計數據
  const stats = useMemo(() => {
    const totalClicks = links.reduce((sum, link) => sum + (link.click_count || 0), 0);
    const totalLinks = links.length;
    const activeLinks = links.filter(link => link.is_active || link.status === 'active').length;
    const avgClicksPerLink = totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0;

    return {
      totalClicks,
      totalLinks,
      activeLinks,
      avgClicksPerLink
    };
  }, [links]);

  // 獲取所有可用的標籤
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    links.forEach(link => {
      link.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [links]);

  // 篩選連結
  const filteredLinks = useMemo(() => {
    let filtered = [...links];

    // 帳號篩選
    if (selectedAccountId) {
      filtered = filtered.filter(link => link.account_id === selectedAccountId);
    }

    // 搜尋篩選
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(link => {
        const title = link.title?.toLowerCase() || "";
        const ogTitle = link.og_title?.toLowerCase() || "";
        return title.includes(keyword) || ogTitle.includes(keyword);
      });
    }

    // 標籤篩選
    if (selectedTags.length > 0) {
      filtered = filtered.filter(link => {
        if (!link.tags || link.tags.length === 0) return false;
        return selectedTags.some(tag => link.tags?.includes(tag));
      });
    }

    return filtered;
  }, [links, selectedAccountId, searchKeyword, selectedTags]);

  // 認證狀態檢查
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          router.push("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.push("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // 載入資料
  useEffect(() => {
    if (session) {
      checkMembership();
      checkAdminStatus();
      fetchAccounts();
      fetchLinks();
    }
  }, [session]);

  // 檢查管理員狀態
  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/user/is-admin');
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  // 檢查會員狀態
  const checkMembership = async () => {
    if (!session?.user?.id) {
      setIsPaid(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.log('Profile not found, user is FREE tier');
        setIsPaid(false);
        return;
      }

      const isVIP = profile?.tier === 'VIP';
      setIsPaid(isVIP);

      // VIP 歡迎通知（只顯示一次）
      if (isVIP) {
        const welcomeKey = `vip_welcomed_${session?.user?.id}`;
        const hasWelcomed = localStorage.getItem(welcomeKey);
        if (!hasWelcomed) {
          localStorage.setItem(welcomeKey, 'true');
          toast({
            title: "🎉 歡迎成為 VIP 會員！",
            description: "您已解鎖所有功能，開始創建您的分潤連結吧！",
          });
        }
      }
    } catch (err) {
      console.error('checkMembership error:', err);
      setIsPaid(false);
    }
  };

  // 處理 URL 參數
  useEffect(() => {
    const accountParam = searchParams.get('account');
    if (accountParam && accounts.some(a => a.id === accountParam)) {
      setSelectedAccountId(accountParam);
    }

    // Handle strategy parameter from templates page
    const strategyParam = searchParams.get('strategy');
    if (strategyParam) {
      setDefaultStrategy(strategyParam);
      setDialogOpen(true);
      // Clear the strategy param from URL after opening dialog
      const params = new URLSearchParams(window.location.search);
      params.delete('strategy');
      const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, accounts, router]);

  // 更新 URL 參數
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAccountId) {
      params.set('account', selectedAccountId);
    }
    if (searchKeyword) {
      params.set('search', searchKeyword);
    }
    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','));
    }

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '/dashboard';

    // 只有當 URL 實際改變時才更新
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [selectedAccountId, searchKeyword, selectedTags]);

  const fetchLinks = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from("links")
        .select("*, accounts(*)")
        .eq("user_id", session.user.id) // 只顯示當前用戶的連結
        .neq("status", "draft") // 不顯示草稿狀態的連結
        .order("created_at", { ascending: false });

      if (error) throw error;
      // 確保資料包含 click_count（如果為 null，設為 0）
      const linksWithClickCount = (data || []).map(link => ({
        ...link,
        click_count: link.click_count ?? 0
      }));
      setLinks(linksWithClickCount as Link[]);
    } catch (error: any) {
      toast({
        title: "錯誤",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", session.user.id) // 只顯示當前用戶的帳號
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      console.error("Failed to fetch accounts:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleAccountSelect = useCallback((accountId: string | null) => {
    setSelectedAccountId(accountId);
  }, []);

  const handleAddAccount = () => {
    setEditingAccount(null);
    setAccountDialogOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setAccountDialogOpen(true);
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("確定要刪除這個帳號嗎？關聯的連結不會被刪除，但會失去帳號關聯。")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", accountId);

      if (error) throw error;

      toast({
        title: "成功",
        description: "帳號已刪除",
      });

      // 如果刪除的是當前選中的帳號，清除選擇
      if (selectedAccountId === accountId) {
        setSelectedAccountId(null);
      }

      fetchAccounts();
      fetchLinks();
    } catch (error: any) {
      toast({
        title: "錯誤",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddLink = (accountId?: string) => {
    setEditingLink(null);
    setDefaultAccountId(accountId || null);
    setDialogOpen(true);
  };

  const copyToClipboard = (shortCode: string) => {
    const url = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "已複製",
      description: "短網址已複製到剪貼簿",
    });
  };

  const previewLink = (shortCode: string) => {
    window.open(`/${shortCode}`, "_blank");
  };

  const editLink = (link: Link) => {
    setEditingLink(link);
    setDefaultAccountId(null);
    setDialogOpen(true);
  };

  const deleteLink = async (id: string) => {
    if (!confirm("確定要刪除這個連結嗎？")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "已刪除",
        description: "連結已成功刪除",
      });
      fetchLinks();
    } catch (error: any) {
      toast({
        title: "錯誤",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // 新增的多選相關函數
  const toggleLinkSelection = (linkId: string) => {
    const newSelection = new Set(selectedLinks);
    if (newSelection.has(linkId)) {
      newSelection.delete(linkId);
    } else {
      newSelection.add(linkId);
    }
    setSelectedLinks(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedLinks.size === filteredLinks.length) {
      setSelectedLinks(new Set());
    } else {
      setSelectedLinks(new Set(filteredLinks.map(link => link.id)));
    }
  };

  const clearSelection = () => {
    setSelectedLinks(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedLinks.size === 0) return;

    setIsDeleting(true);
    try {
      const selectedIds = Array.from(selectedLinks);
      const { error } = await supabase
        .from("links")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;

      toast({
        title: "成功",
        description: `已刪除 ${selectedIds.length} 個連結`,
      });

      clearSelection();
      fetchLinks();
    } catch (error: any) {
      toast({
        title: "錯誤",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading || isPaid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* 未付費用戶：付費牆覆蓋層 */}
      {!isPaid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 半透明背景 */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* 付費牆卡片 */}
          <Card className="relative max-w-md w-full mx-4 p-8 text-center shadow-2xl">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-orange-600" />
            </div>

            <h1 className="text-2xl font-bold mb-2">需要 VIP 權限</h1>
            <p className="text-sm text-muted-foreground mb-2">
              {session?.user?.email}
            </p>
            <p className="text-muted-foreground mb-6">
              您的帳號尚未開通 VIP，請聯繫管理員。
            </p>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                登出
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Dashboard 內容（背景可見但無法操作） */}
      <div className={!isPaid ? 'pointer-events-none select-none' : ''}>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted">
          {/* VIP 會員 Header */}
          {isPaid && (
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white">
              <div className="container mx-auto px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-300" />
                  <span className="font-bold">VIP 會員</span>
                  <span className="text-white/80 text-sm hidden sm:inline">· 無限功能已解鎖</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/80 hidden md:inline">{session?.user?.email}</span>
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                    永久會員
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="container mx-auto px-4 py-8">
        {/* 頂部標題列 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">管理您的帳號和分潤連結</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <NextLink href="/admin/dashboard">
                <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                  <Shield className="mr-2 h-4 w-4" />
                  管理儀表板
                </Button>
              </NextLink>
            )}
            <NextLink href="/templates">
              <Button variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                瀏覽策略
              </Button>
            </NextLink>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              登出
            </Button>
          </div>
        </div>

        {/* 🤖 自動化助手超大宣傳區塊 */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 shadow-2xl">
          {/* 動畫背景 */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-20"></div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* 左側：內容 */}
            <div className="space-y-6">
              <div className="inline-block">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                  <span className="text-white font-semibold text-sm">AI 智能助手</span>
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                自動化發文<br />
                <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  輕鬆賺取流量
                </span>
              </h2>

              <p className="text-white/90 text-lg leading-relaxed">
                使用 PTT 機器人自動抓取熱門內容，一鍵生成吸睛短連結，<br />
                省下 <span className="font-bold text-yellow-300">80% 時間</span>，提升 <span className="font-bold text-green-300">35% 轉換率</span>
              </p>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">智能內容生成</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">提升轉換率</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">即時生效</span>
                </div>
              </div>

              <div className="pt-4">
                <NextLink href="/automation">
                  <Button
                    size="lg"
                    className="bg-white text-purple-700 hover:bg-gray-100 font-bold text-lg px-12 py-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    立即開始使用
                  </Button>
                </NextLink>
              </div>
            </div>

            {/* 右側：視覺元素 */}
            <div className="hidden md:flex justify-center items-center relative">
              <div className="relative">
                {/* 中心機器人圖標 */}
                <div className="relative z-10 bg-white rounded-3xl p-8 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-24 w-24 text-purple-600" />
                </div>

                {/* 環繞的功能圖標 */}
                <div className="absolute -top-4 -right-4 bg-yellow-400 rounded-2xl p-4 shadow-lg animate-bounce">
                  <LinkIcon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-green-400 rounded-2xl p-4 shadow-lg animate-bounce" style={{ animationDelay: '0.2s' }}>
                  <Copy className="h-8 w-8 text-white" />
                </div>
                <div className="absolute top-1/2 -left-8 bg-blue-400 rounded-2xl p-4 shadow-lg animate-bounce" style={{ animationDelay: '0.4s' }}>
                  <Eye className="h-8 w-8 text-white" />
                </div>

                {/* 統計浮動卡片 */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-xl px-6 py-3 shadow-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">+35%</div>
                    <div className="text-xs text-gray-600">轉換率提升</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 帳號管理區 */}
        <AccountsSection
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          linkCounts={linkCounts}
          onAccountSelect={handleAccountSelect}
          onAddAccount={handleAddAccount}
          onAddLink={handleAddLink}
          onEditAccount={handleEditAccount}
          onDeleteAccount={handleDeleteAccount}
        />

        {/* 📊 統計概覽卡片區塊 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          {/* 總點擊次數 */}
          <Card className="overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <MousePointerClick className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">總點擊次數</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.totalClicks.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">累計所有連結</p>
              </div>
            </div>
          </Card>

          {/* 總連結數 */}
          <Card className="overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <LinkIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <Badge variant="secondary" className="bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200">
                  {stats.activeLinks} 啟用
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">總連結數</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.totalLinks}
                </p>
                <p className="text-xs text-purple-600/70 dark:text-purple-400/70">
                  {stats.activeLinks} 個啟用中
                </p>
              </div>
            </div>
          </Card>

          {/* 平均點擊率 */}
          <Card className="overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <Activity className="h-4 w-4 text-green-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">平均點擊</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {stats.avgClicksPerLink}
                </p>
                <p className="text-xs text-green-600/70 dark:text-green-400/70">每個連結平均</p>
              </div>
            </div>
          </Card>

          {/* 帳號數量 */}
          <Card className="overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Sparkles className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">管理帳號</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {accounts.length}
                </p>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70">多帳號管理</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 批量操作工具列 */}
        {selectedLinks.size > 0 && (
          <div className="mb-4 p-4 bg-primary/10 rounded-lg border border-primary/20 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  已選擇 {selectedLinks.size} 個連結
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="hover:bg-background"
                >
                  <X className="h-4 w-4 mr-1" />
                  取消選擇
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  刪除選中項目
                </Button>
              </div>
            </div>
          </div>
        )}



        {/* 篩選工具列 - 加入視圖切換按鈕 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <LinkFilters
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              searchKeyword={searchKeyword}
              selectedTags={selectedTags}
              availableTags={availableTags}
              linkCounts={linkCounts}
              totalLinks={links.length}
              onAccountChange={handleAccountSelect}
              onSearchChange={setSearchKeyword}
              onTagsChange={setSelectedTags}
            />
            <div className="flex items-center gap-2 ml-4">
              {filteredLinks.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="hidden sm:flex"
                >
                  {selectedLinks.size === filteredLinks.length ? (
                    <>
                      <Square className="h-4 w-4 mr-1" />
                      取消全選
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4 mr-1" />
                      全選
                    </>
                  )}
                </Button>
              )}
              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className="rounded-r-none h-8 w-8"
                  onClick={() => setViewMode('grid')}
                  title="卡片視圖"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className="rounded-l-none border-l h-8 w-8"
                  onClick={() => setViewMode('list')}
                  title="列表視圖"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 連結列表 */}
        {filteredLinks.length === 0 ? (
          <Card className="p-12 text-center shadow-card max-w-2xl mx-auto">
            <LinkIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {selectedAccountId || searchKeyword || selectedTags.length > 0
                ? "沒有符合篩選條件的連結"
                : "還沒有連結"
              }
            </h3>
            <p className="text-muted-foreground mb-6">
              {selectedAccountId
                ? `為 ${accounts.find(a => a.id === selectedAccountId)?.name || '此帳號'} 創建第一個連結`
                : searchKeyword || selectedTags.length > 0
                ? "嘗試調整篩選條件"
                : "開始創建您的第一個分潤連結"
              }
            </p>
            <Button onClick={() => handleAddLink(selectedAccountId || undefined)} className="bg-gradient-primary hover:opacity-90">
              <LinkIcon className="mr-2 h-4 w-4" />
              新增連結
            </Button>
          </Card>
        ) : viewMode === 'grid' ? (
          // 卡片視圖
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLinks.map((link) => (
              <Card
                key={link.id}
                className={`group relative overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1 flex flex-col h-full ${
                  selectedLinks.has(link.id) ? 'ring-2 ring-primary' : ''
                }`}
              >
                {/* Checkbox */}
                <div className="absolute top-3 left-3 z-20">
                  <Checkbox
                    checked={selectedLinks.has(link.id)}
                    onCheckedChange={() => toggleLinkSelection(link.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-background border-2"
                  />
                </div>

                {/* 帳號標籤 */}
                {link.accounts && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge
                      className={`${getAccountColorClasses(link.accounts.type)} border font-medium transition-colors cursor-default`}
                    >
                      <span className="mr-1.5 text-sm">{ACCOUNT_TYPE_ICONS[link.accounts.type]}</span>
                      <span className="text-xs">{link.accounts.name}</span>
                    </Badge>
                  </div>
                )}
                {!link.accounts && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge
                      variant="outline"
                      className="text-muted-foreground border-muted-foreground/20"
                    >
                      <span className="text-xs">未分類</span>
                    </Badge>
                  </div>
                )}

                {/* 可點擊區域 */}
                <div
                  className="p-5 flex-1 flex flex-col cursor-pointer"
                  onClick={() => previewLink(link.short_code)}
                >
                  {/* 標題區塊 */}
                  <div className="mb-3 pr-24 pl-8">
                    {link.title || link.og_title ? (
                      <h3 className="text-base font-semibold text-foreground line-clamp-2 min-h-[2.5rem]">
                        {link.status === 'active' && link.og_title && !link.title
                          ? `[自動化機器人]${link.og_title}`
                          : link.title || link.og_title}
                      </h3>
                    ) : (
                      <div className="text-base font-semibold text-muted-foreground min-h-[2.5rem] flex items-center">
                        無標題
                      </div>
                    )}
                  </div>

                  {/* 短連結 URL 區塊 */}
                  <div className="mb-3 pl-8">
                    <LinkUrlDisplay
                      shortCode={link.short_code}
                      onCopy={() => copyToClipboard(link.short_code)}
                    />
                  </div>

                  {/* 標籤 */}
                  {link.tags && link.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1 pl-8">
                      {link.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {link.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{link.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* 點擊統計 */}
                  <div className="mb-3 pl-8">
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {link.click_count || 0}
                        </span>
                        <span className="ml-1">次點擊</span>
                      </p>
                    </div>
                  </div>

                  {/* 時間戳記 */}
                  <div className="mt-auto pt-2 pl-8">
                    <p className="text-[10px] text-muted-foreground/60">
                      {new Date(link.created_at).toLocaleString("zh-TW", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>

                {/* 操作按鈕區塊 */}
                <div className="border-t bg-muted/20 px-5 py-3">
                  <div className="flex justify-end items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        editLink(link);
                      }}
                      title="編輯連結"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLink(link.id);
                      }}
                      title="刪除連結"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 懸停裝飾效果 */}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Card>
            ))}
          </div>
        ) : (
          // 列表視圖
          <div className="space-y-0 border rounded-lg overflow-hidden bg-background">
            {/* 列表標題 */}
            <div className="flex items-center gap-4 px-4 py-3 bg-muted/30 border-b font-medium text-sm text-muted-foreground">
              <div className="w-8">
                <Checkbox
                  checked={selectedLinks.size === filteredLinks.length && filteredLinks.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </div>
              <div className="w-12">圖片</div>
              <div className="flex-1 min-w-0">標題</div>
              <div className="w-32 hidden lg:block">帳號</div>
              <div className="w-40 hidden sm:block">短連結</div>
              <div className="w-20 text-center hidden md:block">點擊數</div>
              <div className="w-32 hidden xl:block">建立時間</div>
              <div className="w-24 text-center">操作</div>
            </div>

            {/* 列表項目 */}
            {filteredLinks.map((link, index) => (
              <div
                key={link.id}
                className={`flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors ${
                  index !== filteredLinks.length - 1 ? 'border-b' : ''
                } ${selectedLinks.has(link.id) ? 'bg-primary/5' : ''}`}
              >
                <div className="w-8">
                  <Checkbox
                    checked={selectedLinks.has(link.id)}
                    onCheckedChange={() => toggleLinkSelection(link.id)}
                  />
                </div>

                {/* 縮圖 */}
                <div
                  className="w-12 h-12 bg-muted rounded flex-shrink-0 cursor-pointer"
                  onClick={() => previewLink(link.short_code)}
                >
                  {link.og_image ? (
                    <img
                      src={link.og_image}
                      alt=""
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <LinkIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* 標題 */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => previewLink(link.short_code)}
                >
                  <div className="font-medium text-sm truncate">
                    {link.title || link.og_title || '無標題'}
                  </div>
                  {link.tags && link.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {link.tags.slice(0, 2).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs py-0">
                          #{tag}
                        </Badge>
                      ))}
                      {link.tags.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{link.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 帳號 */}
                <div className="w-32 hidden lg:block">
                  {link.accounts ? (
                    <Badge
                      className={`${getAccountColorClasses(link.accounts.type)} border text-xs`}
                    >
                      {link.accounts.name}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">未分類</span>
                  )}
                </div>

                {/* 短連結 */}
                <div className="w-40 hidden sm:block">
                  <div className="flex items-center gap-1">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded truncate">
                      /{link.short_code}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(link.short_code);
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* 點擊數 */}
                <div className="w-20 text-center hidden md:block">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{link.click_count || 0}</span>
                  </div>
                </div>

                {/* 建立時間 */}
                <div className="w-32 hidden xl:block">
                  <span className="text-xs text-muted-foreground">
                    {new Date(link.created_at).toLocaleString("zh-TW", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>

                {/* 操作 */}
                <div className="w-24 flex items-center justify-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      editLink(link);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLink(link.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 批量刪除確認對話框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              您確定要刪除選中的 {selectedLinks.size} 個連結嗎？此操作無法撤銷。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? '刪除中...' : '確認刪除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 對話框 */}
      <CreateLinkFlow
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingLink(null);
            setDefaultAccountId(null);
            setDefaultStrategy(null);
          }
        }}
        onSuccess={fetchLinks}
        editingLink={editingLink as any}
        defaultAccountId={defaultAccountId}
        defaultStrategy={defaultStrategy}
      />

      <AccountForm
        open={accountDialogOpen}
        onOpenChange={(open) => {
          setAccountDialogOpen(open);
          if (!open) {
            setEditingAccount(null);
          }
        }}
        onSuccess={() => {
          fetchAccounts();
          fetchLinks();
        }}
        editingAccount={editingAccount}
      />
        </div>
      </div>
    </>
  );
};

const Dashboard = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
};

export default Dashboard;