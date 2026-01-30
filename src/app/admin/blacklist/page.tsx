'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle, CheckCircle, RefreshCw, Eye, ArrowLeft, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FilteredDraft {
  id: string;
  shortCode: string;
  title: string;
  ogTitle: string;
  ogDescription: string;
  blacklistedImages: string[];
  createdAt: string;
}

interface PreviewResponse {
  total: number;
  drafts: FilteredDraft[];
  message: string;
}

interface DeleteResponse {
  success: boolean;
  deleted: number;
  failed: number;
  total: number;
  deletedDrafts: FilteredDraft[];
  errors?: string[];
  message: string;
}

export default function BlacklistManagementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [selectedDrafts, setSelectedDrafts] = useState<Set<string>>(new Set());
  const [deleteResult, setDeleteResult] = useState<DeleteResponse | null>(null);

  // 檢查 admin 權限
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/user/is-admin');
        if (response.ok) {
          const data = await response.json();
          if (!data.isAdmin) {
            toast({
              title: '權限不足',
              description: '此頁面僅供管理員使用',
              variant: 'destructive',
            });
            router.push('/automation');
          } else {
            setIsAdmin(true);
          }
        } else {
          router.push('/automation');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/automation');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  // 預覽包含黑名單圖片的草稿
  const handlePreview = async () => {
    setIsLoading(true);
    setDeleteResult(null);
    try {
      const response = await fetch('/api/automation/drafts/filter-blacklist');
      const data: PreviewResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch preview');
      }

      setPreviewData(data);

      // 預設全選
      setSelectedDrafts(new Set(data.drafts.map(d => d.id)));

      toast({
        title: '預覽完成',
        description: data.message,
      });
    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: '預覽失敗',
        description: error instanceof Error ? error.message : '無法載入預覽',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 切換選擇
  const toggleDraft = (draftId: string) => {
    const newSelection = new Set(selectedDrafts);
    if (newSelection.has(draftId)) {
      newSelection.delete(draftId);
    } else {
      newSelection.add(draftId);
    }
    setSelectedDrafts(newSelection);
  };

  // 全選/取消全選
  const toggleSelectAll = () => {
    if (!previewData) return;

    if (selectedDrafts.size === previewData.drafts.length) {
      setSelectedDrafts(new Set());
    } else {
      setSelectedDrafts(new Set(previewData.drafts.map(d => d.id)));
    }
  };

  // 執行刪除
  const handleDelete = async () => {
    if (selectedDrafts.size === 0) {
      toast({
        title: '未選擇草稿',
        description: '請至少選擇一個草稿進行刪除',
        variant: 'destructive',
      });
      return;
    }

    // 二次確認
    const confirmed = window.confirm(
      `確定要刪除 ${selectedDrafts.size} 個包含黑名單圖片的草稿嗎？\n\n此操作無法復原！`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch('/api/automation/drafts/filter-blacklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirm: true,
          draftIds: Array.from(selectedDrafts),
        }),
      });

      const data: DeleteResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete drafts');
      }

      setDeleteResult(data);

      // 刪除成功後重新預覽
      await handlePreview();

      toast({
        title: '刪除完成',
        description: data.message,
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: '刪除失敗',
        description: error instanceof Error ? error.message : '刪除過程發生錯誤',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // 自動預覽
  useEffect(() => {
    handlePreview();
  }, []);

  // 權限檢查中
  if (isCheckingAuth) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">驗證權限中...</p>
          </div>
        </div>
      </div>
    );
  }

  // 非 admin 用戶（已在 useEffect 中重定向）
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/automation')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回自動化控制台
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">圖片黑名單管理</h1>
          <Badge variant="outline" className="text-xs">管理員專用</Badge>
        </div>
        <p className="text-muted-foreground">
          管理和刪除包含黑名單圖片的草稿
        </p>
      </div>

      {/* 當前黑名單 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>當前黑名單</CardTitle>
          <CardDescription>
            以下圖片 ID 已被列入黑名單
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="destructive" className="font-mono">
              imgur.com/e8dN5uA
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            匹配所有格式：imgur.com/e8dN5uA, i.imgur.com/e8dN5uA.jpg 等
          </p>
        </CardContent>
      </Card>

      {/* 操作按鈕 */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={handlePreview}
          disabled={isLoading || isDeleting}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? '載入中...' : '重新掃描'}
        </Button>

        {previewData && previewData.total > 0 && (
          <>
            <Button
              onClick={toggleSelectAll}
              disabled={isLoading || isDeleting}
              variant="outline"
            >
              {selectedDrafts.size === previewData.drafts.length ? '取消全選' : '全選'}
            </Button>

            <Button
              onClick={handleDelete}
              disabled={isLoading || isDeleting || selectedDrafts.size === 0}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? '刪除中...' : `刪除選中的 ${selectedDrafts.size} 個草稿`}
            </Button>
          </>
        )}
      </div>

      {/* 刪除結果 */}
      {deleteResult && deleteResult.deleted > 0 && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>刪除成功：</strong> {deleteResult.message}
            <div className="mt-2 text-sm">
              <div>成功刪除：{deleteResult.deleted} 個</div>
              {deleteResult.failed > 0 && <div>失敗：{deleteResult.failed} 個</div>}
            </div>
            {deleteResult.errors && deleteResult.errors.length > 0 && (
              <div className="mt-2 text-sm">
                <strong>錯誤：</strong>
                <ul className="list-disc list-inside">
                  {deleteResult.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* 預覽結果 */}
      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle>
              包含黑名單圖片的草稿 ({previewData.total})
            </CardTitle>
            <CardDescription>
              {previewData.total > 0
                ? `發現 ${previewData.total} 個包含黑名單圖片的草稿，已選擇 ${selectedDrafts.size} 個`
                : '沒有發現包含黑名單圖片的草稿'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {previewData.total === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>目前沒有包含黑名單圖片的草稿</p>
              </div>
            ) : (
              <div className="space-y-3">
                {previewData.drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      selectedDrafts.has(draft.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedDrafts.has(draft.id)}
                        onChange={() => toggleDraft(draft.id)}
                        className="mt-1 w-4 h-4"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium truncate">{draft.title}</h3>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {draft.shortCode}
                          </Badge>
                        </div>

                        {draft.ogDescription && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {draft.ogDescription}
                          </p>
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-destructive" />
                            <span className="text-xs font-medium text-destructive">
                              黑名單圖片：
                            </span>
                          </div>
                          <div className="pl-5 space-y-1">
                            {draft.blacklistedImages.map((url, i) => (
                              <div key={i} className="text-xs font-mono text-muted-foreground truncate">
                                {url}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground mt-2">
                          建立時間：{new Date(draft.createdAt).toLocaleString('zh-TW')}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`/${draft.shortCode}`, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 使用說明 */}
      <Alert className="mt-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>使用說明：</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>點擊「重新掃描」可重新檢查所有草稿</li>
            <li>勾選要刪除的草稿，或點擊「全選」選擇所有草稿</li>
            <li>點擊「刪除選中的草稿」執行刪除操作</li>
            <li>刪除操作無法復原，請謹慎操作</li>
            <li>刪除草稿時，scraped_items 記錄會保留以防止重複抓取</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
