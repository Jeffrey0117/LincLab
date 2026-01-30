'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Link as LinkIcon,
  FileText,
  Crown,
  Shield,
  ArrowLeft,
  RefreshCw,
  Loader2,
  UserMinus,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  id: string;
  email: string;
  membership_tier: string;
  membership_expires_at: string | null;
  is_admin: boolean;
  created_at: string;
  links_count: number;
  drafts_count: number;
  active_links_count: number;
}

interface StatsData {
  overview: {
    total_users: number;
    total_links: number;
    total_drafts: number;
    total_active_links: number;
  };
  tier_distribution: {
    FREE: number;
    PRO: number;
    VIP: number;
  };
  users: UserStats[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchStats = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError('權限不足，此頁面僅限管理員');
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        if (response.status === 401) {
          setError('請先登入');
          setTimeout(() => router.push('/auth'), 2000);
          return;
        }
        throw new Error(data.error || '無法載入統計資料');
      }

      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : '載入失敗');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSetTier = async (userId: string, newTier: 'FREE' | 'VIP') => {
    if (!stats) return;

    const user = stats.users.find(u => u.id === userId);
    if (!user) return;

    const oldTier = user.membership_tier as 'FREE' | 'PRO' | 'VIP';

    setUpdatingUserId(userId);
    try {
      const response = await fetch('/api/admin/set-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId, tier: newTier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '操作失敗');
      }

      // 本地狀態更新：直接改 state，不用重新 fetch
      setStats(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.map(u =>
            u.id === userId ? { ...u, membership_tier: newTier } : u
          ),
          tier_distribution: {
            ...prev.tier_distribution,
            [oldTier]: prev.tier_distribution[oldTier] - 1,
            [newTier]: prev.tier_distribution[newTier] + 1,
          },
        };
      });

      toast({
        title: '成功',
        description: `已將用戶設為 ${newTier}`,
      });
    } catch (err) {
      toast({
        title: '錯誤',
        description: err instanceof Error ? err.message : '操作失敗',
        variant: 'destructive',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`確定要刪除用戶 ${email} 嗎？此操作無法復原！`)) {
      return;
    }

    setUpdatingUserId(userId);
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '刪除失敗');
      }

      toast({
        title: '成功',
        description: `已刪除用戶 ${email}`,
      });

      fetchStats(true);
    } catch (err) {
      toast({
        title: '錯誤',
        description: err instanceof Error ? err.message : '刪除失敗',
        variant: 'destructive',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'VIP':
        return <Badge className="bg-purple-500">VIP</Badge>;
      case 'PRO':
        return <Badge className="bg-blue-500">PRO</Badge>;
      default:
        return <Badge variant="secondary">FREE</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* 頁面標題 */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/automation')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">管理員儀表板</h1>
              <p className="text-muted-foreground">系統使用統計與用戶管理</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            重新整理
          </Button>
        </div>
      </div>

      {stats && (
        <>
          {/* 總覽卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.overview.total_users}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  FREE: {stats.tier_distribution.FREE} / PRO: {stats.tier_distribution.PRO} / VIP: {stats.tier_distribution.VIP}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">總連結數</CardTitle>
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.overview.total_links}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  所有用戶建立的連結
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">啟用連結</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.overview.total_active_links}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  狀態為 active 的連結
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">草稿數</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.overview.total_drafts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  等待審核的草稿
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 會員分布 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                會員等級分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-400"></div>
                  <span>FREE: {stats.tier_distribution.FREE} 人</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500"></div>
                  <span>PRO: {stats.tier_distribution.PRO} 人</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-purple-500"></div>
                  <span>VIP: {stats.tier_distribution.VIP} 人</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 用戶列表 */}
          <Card>
            <CardHeader>
              <CardTitle>用戶列表</CardTitle>
              <CardDescription>
                所有註冊用戶及其使用統計
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>會員等級</TableHead>
                    <TableHead className="text-center">連結數</TableHead>
                    <TableHead className="text-center">啟用</TableHead>
                    <TableHead className="text-center">草稿</TableHead>
                    <TableHead>註冊時間</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {getTierBadge(user.membership_tier)}
                      </TableCell>
                      <TableCell className="text-center">
                        {user.links_count}
                      </TableCell>
                      <TableCell className="text-center text-green-600">
                        {user.active_links_count}
                      </TableCell>
                      <TableCell className="text-center text-yellow-600">
                        {user.drafts_count}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell>
                        {user.is_admin && (
                          <Badge variant="outline" className="border-red-500 text-red-500">
                            <Shield className="w-3 h-3 mr-1" />
                            管理員
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {updatingUserId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-500 border-green-500 hover:bg-green-50"
                              onClick={() => handleSetTier(user.id, 'VIP')}
                              disabled={user.membership_tier === 'VIP'}
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              開通
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-500 hover:bg-red-50"
                              onClick={() => handleSetTier(user.id, 'FREE')}
                              disabled={user.membership_tier === 'FREE'}
                            >
                              <UserMinus className="w-3 h-3 mr-1" />
                              取消
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              disabled={user.is_admin}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              刪除
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
