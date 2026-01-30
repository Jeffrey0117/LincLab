'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Trash2, ExternalLink, FileText, FileSpreadsheet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface DraftLink {
  id: string;
  shortCode: string;
  title?: string; // 連結標題（Dashboard 設定的）
  affiliateUrl: string;
  contentMode: string;
  templateType: string;
  templateConfig: {
    imageUrl?: string;
    images?: string[];
    altText?: string;
    showHint?: boolean;
    hintText?: string;
    hintPosition?: string;
    fitMode?: string;
  };
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  createdAt: string;
  updatedAt: string;
}

interface DraftCardProps {
  draft: DraftLink;
  onApprove: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}


export function DraftCard({
  draft,
  onApprove,
  onDelete,
  isSelected = false,
  onToggleSelect,
}: DraftCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [content] = useState(''); // 保留用於 onApprove，但不再顯示編輯介面
  const [ogTitle, setOgTitle] = useState(draft.ogTitle);
  const [ogDescription, setOgDescription] = useState(draft.ogDescription);

  // Alert dialog state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');

  // 顯示 alert 彈窗
  const showAlert = (title: string, description: string) => {
    setAlertTitle(title);
    setAlertDescription(description);
    setAlertOpen(true);
  };

  const imageUrl = draft.templateConfig?.imageUrl || draft.ogImage;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shortUrl = `${baseUrl}/${draft.shortCode}`;

  // 更新草稿的 OG 資訊
  const handleUpdateDraft = async () => {
    try {
      const response = await fetch(`/api/automation/drafts/${draft.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ogTitle,
          ogDescription,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '更新失敗');
      }

      return true;
    } catch (error) {
      console.error('Failed to update draft:', error);
      showAlert('更新失敗', error instanceof Error ? error.message : '無法更新草稿資訊');
      return false;
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      // 先更新 OG 資訊
      const updateSuccess = await handleUpdateDraft();
      if (!updateSuccess) {
        setIsApproving(false);
        return;
      }

      // 再標記為已使用
      await onApprove(draft.id, content);
      setIsOpen(false);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(draft.id);
      setIsOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePushToSheets = async (e?: React.MouseEvent) => {
    // 防止事件冒泡觸發卡片點擊
    if (e) {
      e.stopPropagation();
    }

    setIsPushing(true);
    try {
      // 先更新 OG 資訊
      const updateSuccess = await handleUpdateDraft();
      if (!updateSuccess) {
        setIsPushing(false);
        return;
      }

      // 推送到 Google Sheets
      const pushResponse = await fetch('/api/integrations/google-sheets/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkIds: [draft.id],
        }),
      });

      const result = await pushResponse.json();

      if (!pushResponse.ok) {
        // 特別處理未設定 Google Sheets 的情況
        console.log('Push failed with error:', result.error);
        if (result.error?.includes('尚未設定')) {
          showAlert('尚未設定 Google Sheets', '請先到「設定」→「Google Sheets」頁面完成設定');
        } else {
          showAlert('推送失敗', result.error || '無法推送到 Google Sheets');
        }
        return;
      }

      // 推送成功後，標記草稿為已使用
      await onApprove(draft.id, content);

      showAlert('推送成功', '連結已推送到 Google Sheets 並標記為已使用');
    } catch (error) {
      console.error('Failed to push to sheets:', error);
      showAlert('推送失敗', error instanceof Error ? error.message : '無法推送到 Google Sheets');
    } finally {
      setIsPushing(false);
    }
  };


  const handleQuickDelete = async (e: React.MouseEvent) => {
    // 防止事件冒泡觸發卡片點擊
    e.stopPropagation();

    // 簡單確認
    if (window.confirm('確定要刪除此草稿嗎？')) {
      setIsDeleting(true);
      try {
        await onDelete(draft.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* 卡片 - 統一高度設計 */}
      <div className={`group relative flex flex-col h-full rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-all duration-200 ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        {/* 選擇 Checkbox - 左上角 */}
        {onToggleSelect && (
          <div className="absolute top-2 left-2 z-20" onClick={handleCheckboxClick}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect()}
              className="bg-white dark:bg-gray-800 shadow-sm"
              aria-label={`選擇 ${draft.title || draft.ogTitle}`}
            />
          </div>
        )}

        {/* 草稿標籤 */}
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 z-10 text-[10px] px-2 py-0.5 bg-yellow-500/90 text-white border-0"
        >
          草稿
        </Badge>

        {/* 圖片區域 - 可點擊查看詳情 */}
        <div
          className="relative aspect-square bg-gray-100 dark:bg-gray-900 cursor-pointer overflow-hidden"
          onClick={() => setIsOpen(true)}
        >
          <img
            alt={draft.ogTitle}
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
            src={imageUrl}
            onError={(e) => {
              // 圖片載入失敗時的處理
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUzMyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUzMyIgZmlsbD0iI2UyZThlZiIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMjY2LjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OTk5OSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
            }}
          />

          {/* Hover 時顯示查看詳情提示 */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
            <div className="text-white text-center">
              <FileText className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs font-medium">查看詳情</p>
            </div>
          </div>
        </div>

        {/* 內容區域 */}
        <div className="flex-1 flex flex-col p-2">
          {/* 標題 - 優先顯示連結標題，否則顯示 OG 標題 */}
          <h3 className="text-xs font-medium line-clamp-2 mb-2 flex-1">
            {draft.title || draft.ogTitle}
          </h3>

          {/* 操作按鈕組 */}
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-[11px] px-2"
              onClick={handlePushToSheets}
              disabled={isPushing}
            >
              <FileSpreadsheet className="w-3 h-3 mr-1" />
              {isPushing ? '推送中...' : '推送 Sheet'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-1.5"
              onClick={handleQuickDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </div>
        </div>
      </div>

      {/* 詳情彈窗 - 保持原有功能 */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft.title || draft.ogTitle}</DialogTitle>
            <DialogDescription>{draft.ogDescription}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* 左側：圖片預覽 */}
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border bg-gray-50 dark:bg-gray-900">
                <div className="aspect-[3/4] relative">
                  <img
                    src={imageUrl}
                    alt={draft.ogTitle}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* 預覽連結 */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">短連結</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs flex-1 truncate font-mono">{shortUrl}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(shortUrl, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* 元資訊 */}
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>建立時間</span>
                  <span>{new Date(draft.createdAt).toLocaleString('zh-TW')}</span>
                </div>
                <div className="flex justify-between">
                  <span>短連結代碼</span>
                  <span className="font-mono">{draft.shortCode}</span>
                </div>
              </div>
            </div>

            {/* 右側：OG 編輯區 */}
            <div className="space-y-4">
              {/* OG 標題編輯 */}
              <div>
                <label className="text-sm font-medium mb-2 block">OG 標題</label>
                <Input
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  className="text-sm"
                  placeholder="輸入 OG 標題..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {ogTitle.length} 字元
                </p>
              </div>

              {/* OG 描述編輯 */}
              <div>
                <label className="text-sm font-medium mb-2 block">OG 描述</label>
                <Textarea
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  rows={4}
                  className="text-sm resize-none"
                  placeholder="輸入 OG 描述..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {ogDescription.length} 字元
                </p>
              </div>

              {/* 操作按鈕 */}
              <div className="space-y-2 pt-4 border-t">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePushToSheets}
                  disabled={isPushing}
                  variant="default"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  {isPushing ? '推送中...' : '推送 Sheet'}
                </Button>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleApprove}
                  disabled={isApproving || isDeleting}
                  variant="secondary"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isApproving ? '處理中...' : '標記已使用'}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-2">
                  推送 Sheet 會自動標記為已使用
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert 彈窗 */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
            <AlertDialogDescription>{alertDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertOpen(false)}>確定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}