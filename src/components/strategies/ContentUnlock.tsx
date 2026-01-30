'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';
import { ContentUnlockConfig } from '@/lib/strategy-types';

interface ContentUnlockProps {
  affiliateUrl: string;
  config?: ContentUnlockConfig;
  onUnlocked?: () => void;
}

export default function ContentUnlock({
  affiliateUrl,
  config,
  onUnlocked,
}: ContentUnlockProps) {
  const [showDialog, setShowDialog] = useState(true);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const title = config?.title || '請確認您已閱讀以下內容';
  const description = config?.description || '為了確保您了解相關資訊，請仔細閱讀以下內容';
  const content = config?.content || '使用條款與隱私政策\n\n本網站提供的所有內容僅供參考，使用者需自行判斷內容的正確性。繼續使用本網站即表示您同意遵守相關規定。';
  const confirmText = config?.confirmText || '我已閱讀並同意';
  const checkboxText = config?.checkboxText || '我已詳細閱讀上述內容';
  const requireScroll = config?.requireScroll !== false;

  const canConfirm = (!requireScroll || hasScrolledToBottom) && isChecked;

  // 不需要滾動的話，直接允許確認
  useEffect(() => {
    if (!requireScroll) {
      setHasScrolledToBottom(true);
    }
  }, [requireScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10;

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleConfirm = () => {
    if (!canConfirm) return;

    window.open(affiliateUrl, '_blank');
    onUnlocked?.();
    setShowDialog(false);
  };

  const handleOutsideClick = () => {
    // 點擊外面或按 ESC 也跳轉連結
    window.open(affiliateUrl, '_blank');
    onUnlocked?.();
    setShowDialog(false);
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent
        className="sm:max-w-2xl [&>button]:hidden max-h-[90vh]"
        onInteractOutside={(e) => {
          e.preventDefault();
          handleOutsideClick();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          handleOutsideClick();
        }}
      >
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3 pb-2 border-b">
            <div className="rounded-full bg-primary/10 p-2">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </div>

          {/* Content Area */}
          <ScrollArea
            className="h-64 w-full rounded border p-4 bg-muted/30"
            onScrollCapture={handleScroll}
          >
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {content}
            </div>
          </ScrollArea>

          {/* Scroll Hint */}
          {requireScroll && !hasScrolledToBottom && (
            <p className="text-xs text-center text-amber-600 dark:text-amber-400 font-medium animate-pulse">
              ↓ 請滾動至底部閱讀完整內容 ↓
            </p>
          )}

          {/* Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="agree"
              checked={isChecked}
              onCheckedChange={(checked) => setIsChecked(checked as boolean)}
              disabled={requireScroll && !hasScrolledToBottom}
            />
            <label
              htmlFor="agree"
              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                requireScroll && !hasScrolledToBottom ? 'text-muted-foreground' : ''
              }`}
            >
              {checkboxText}
            </label>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            size="lg"
            className="w-full"
          >
            {confirmText}
          </Button>

          {/* Help Text */}
          {!canConfirm && (
            <p className="text-xs text-center text-muted-foreground">
              {requireScroll && !hasScrolledToBottom
                ? '請先滾動至底部閱讀完整內容'
                : '請勾選確認框以繼續'}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
