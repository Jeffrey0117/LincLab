'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { DraftCard, type DraftLink } from '@/components/automation/DraftCard';
import { RobotCard } from '@/components/robots/RobotCard';
import { mockRobots } from '@/lib/robot-mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, Home, Settings, Sparkles, Shield, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function AutomationDashboardContent() {
  const router = useRouter();

  const [drafts, setDrafts] = useState<DraftLink[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isMember, setIsMember] = useState(false);

  // 認證狀態檢查 + 會員檢查
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth');
        return;
      }

      // 檢查會員等級
      try {
        const response = await fetch('/api/user/membership');
        if (response.ok) {
          const data = await response.json();
          const tier = data.tier || 'free';

          if (tier === 'free') {
            // 非會員，跳轉到會員頁面
            toast({
              title: '需要升級會員',
              description: '自動化功能僅供付費會員使用',
              variant: 'destructive',
            });
            router.push('/membership');
            return;
          }
          setIsMember(true);
        }
      } catch (error) {
        console.error('Error checking membership:', error);
      }

      setIsAuthChecking(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (isAuthChecking || !isMember) return;

    const fetchDrafts = async () => {
      try {
        setIsLoadingDrafts(true);
        const response = await fetch('/api/automation/drafts');

        if (!response.ok) {
          throw new Error('Failed to fetch drafts');
        }

        const data = await response.json();
        setDrafts(data.drafts || []);
      } catch (error) {
        console.error('Error fetching drafts:', error);
        toast({
          title: '載入草稿失敗',
          description: error instanceof Error ? error.message : '發生未知錯誤，請稍後再試',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingDrafts(false);
      }
    };

    fetchDrafts();
  }, [isAuthChecking, isMember]);

  useEffect(() => {
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

    checkAdminStatus();
  }, []);

  const handleApproveDraft = async (id: string, content: string) => {
    try {
      const response = await fetch(`/api/automation/drafts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'active',
          content
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve draft');
      }

      toast({
        title: '已確認使用此草稿',
        description: '內容已複製到剪貼簿，可以直接貼到其他地方使用。',
      });

      try {
        await navigator.clipboard.writeText(content);
      } catch (error) {
        console.warn('Failed to copy content:', error);
      }

      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error('Error approving draft:', error);
      toast({
        title: '審核失敗',
        description: error instanceof Error ? error.message : '發生未知錯誤，請稍後再試',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDraft = async (id: string) => {
    try {
      const response = await fetch(`/api/automation/drafts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete draft');
      }

      toast({
        title: '草稿已刪除',
        description: '此筆草稿已從列表中移除。',
      });

      setDrafts((prev) => prev.filter((d) => d.id !== id));
      // Remove from selection if it was selected
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast({
        title: '刪除失敗',
        description: error instanceof Error ? error.message : '發生未知錯誤，請稍後再試',
        variant: 'destructive',
      });
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;

    if (!window.confirm(`確定要刪除選中的 ${selectedIds.size} 筆草稿嗎？`)) {
      return;
    }

    setIsDeletingBatch(true);
    try {
      const response = await fetch('/api/automation/drafts/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          linkIds: Array.from(selectedIds),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Batch delete failed');
      }

      toast({
        title: '批量刪除成功',
        description: `已刪除 ${selectedIds.size} 筆草稿`,
      });

      // Remove deleted drafts from the list
      setDrafts((prev) => prev.filter((d) => !selectedIds.has(d.id)));
      // Clear selection
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error batch deleting drafts:', error);
      toast({
        title: '批量刪除失敗',
        description: error instanceof Error ? error.message : '發生未知錯誤，請稍後再試',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingBatch(false);
    }
  };

  const handleToggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === drafts.length) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all
      setSelectedIds(new Set(drafts.map((d) => d.id)));
    }
  };

  const isAllSelected = drafts.length > 0 && selectedIds.size === drafts.length;

  const activeRobots = useMemo(
    () => mockRobots.filter((r) => r.isActive),
    []
  );

  // 認證檢查中顯示載入
  // 檢查中或非會員時顯示載入畫面（非會員會被自動跳轉）
  if (isAuthChecking || !isMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* 頂部導覽列 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="shrink-0"
            >
              <Home className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  自動化發文控制台
                </h1>
                {drafts.length > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    {drafts.length} 筆待審核草稿
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-base text-muted-foreground max-w-xl">
                在這裡檢視機器人抓回來的內容、快速審核發文草稿，並串接外部自動化工具，讓整個發文流程真正「不用你盯」。
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/dashboard')}
                className="shrink-0"
              >
                <Shield className="h-4 w-4 mr-2" />
                管理儀表板
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/admin/blacklist')}
                className="shrink-0"
              >
                <Shield className="h-4 w-4 mr-2" />
                黑名單管理
              </Button>
            </div>
          )}
        </div>

        {/* 自動化總覽說明卡片 - Dashboard 風格 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 p-8 shadow-2xl">
          {/* 動畫背景圖案 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`,
            }}></div>
          </div>

          <div className="relative z-10">
            {/* 頂部標籤 */}
            <div className="mb-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              <span className="text-white font-semibold text-sm">快速上手指南</span>
            </div>

            {/* 大標題 */}
            <h2 className="mb-3 text-3xl md:text-4xl font-black text-white">
              自動化發文，
              <span className="bg-gradient-to-r from-yellow-300 to-amber-200 bg-clip-text text-transparent">
                輕鬆賺取流量
              </span>
            </h2>

            {/* 副標題說明 */}
            <p className="mb-6 text-lg text-white/90 max-w-3xl">
              只要 3 步驟設定完成，機器人就會自動幫你產生草稿、推送到 Google Sheets，再由 Make/Zapier 排程發文。
            </p>

            {/* 3 步驟卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-indigo-700 font-bold text-lg">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">
                      設定 Google Sheets
                    </h3>
                    <p className="text-sm text-white/80">
                      建立試算表，加入 App Script，設定 Webhook 自動觸發
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-indigo-700 font-bold text-lg">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">
                      連接自動化工具
                    </h3>
                    <p className="text-sm text-white/80">
                      用 Make/Zapier 串接 Google Sheets 與 Buffer 排程
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-indigo-700 font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">
                      啟動機器人
                    </h3>
                    <p className="text-sm text-white/80">
                      回到這裡審核草稿，推送後就自動發文了
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部操作區 */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/20">
              <div className="flex flex-wrap gap-3">
                <Button
                  size="default"
                  className="bg-white hover:bg-gray-50 text-indigo-700 hover:text-indigo-800 font-semibold border-0 shadow-md hover:shadow-lg transition-all"
                  onClick={() => router.push('/settings/google-sheets')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  設定 Google Sheets
                </Button>
                <Button
                  size="default"
                  className="bg-white/90 hover:bg-white text-indigo-600 hover:text-indigo-700 border border-white/50 shadow-sm hover:shadow-md transition-all"
                  onClick={() =>
                    window.open(
                      'https://zapier.com/apps/google-sheets/integrations/buffer',
                      '_blank'
                    )
                  }
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Zapier 範例
                </Button>
                <Button
                  size="default"
                  className="bg-white/90 hover:bg-white text-indigo-600 hover:text-indigo-700 border border-white/50 shadow-sm hover:shadow-md transition-all"
                  onClick={() =>
                    window.open(
                      'https://www.make.com/en/integrations/google-sheets/buffer',
                      '_blank'
                    )
                  }
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Make 範例
                </Button>
              </div>
              <p className="text-sm text-white/70">
                設定完成後，整個流程將全自動運行
              </p>
            </div>
          </div>
        </div>

        {/* 主體內容：左邊草稿、右邊機器人 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 草稿列表 */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-col gap-3">
                <div className="flex flex-row items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      草稿列表
                      {drafts.length > 0 && (
                        <Badge variant="outline">{drafts.length} 筆</Badge>
                      )}
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      每一張卡片都是一篇候選貼文，你可以點進去編輯內容、複製或推送到 Google Sheets。
                    </p>
                  </div>
                </div>

                {/* Batch Selection Controls */}
                {drafts.length > 0 && (
                  <div className="flex items-center gap-3 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="select-all"
                        checked={isAllSelected}
                        onCheckedChange={handleToggleSelectAll}
                        aria-label="全選"
                      />
                      <label
                        htmlFor="select-all"
                        className="text-sm font-medium cursor-pointer select-none"
                      >
                        全選
                      </label>
                    </div>

                    {selectedIds.size > 0 && (
                      <>
                        <Separator orientation="vertical" className="h-4" />
                        <Badge variant="secondary" className="font-normal">
                          已選擇 {selectedIds.size} 項
                        </Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleBatchDelete}
                          disabled={isDeletingBatch}
                          className="ml-auto"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {isDeletingBatch ? '刪除中...' : '批量刪除'}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {isLoadingDrafts ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    讀取草稿中…
                  </div>
                ) : drafts.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground space-y-2">
                    <p>目前沒有待審核草稿。</p>
                    <p>先前往各個機器人頁面啟動一次擷取，或過一陣子再回來看看。</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {drafts.map((draft) => (
                      <DraftCard
                        key={draft.id}
                        draft={draft}
                        onApprove={handleApproveDraft}
                        onDelete={handleDeleteDraft}
                        isSelected={selectedIds.has(draft.id)}
                        onToggleSelect={() => handleToggleSelection(draft.id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 機器人總覽 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  機器人總覽
                  {activeRobots.length > 0 && (
                    <Badge variant="outline">{activeRobots.length} 個啟用中</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  機器人會定期抓取來源（例如 PTT 表特、蝦皮優惠、新聞等），產生草稿後送到上方的草稿列表。
                  想調整抓取頻率或來源，可以進到各機器人詳細頁調整設定。
                </p>
                <div className="space-y-3">
                  {activeRobots.map((robot) => (
                    <RobotCard key={robot.id} robot={robot} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AutomationDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">載入中…</p>
          </div>
        </div>
      }
    >
      <AutomationDashboardContent />
    </Suspense>
  );
}

