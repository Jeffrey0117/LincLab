'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Megaphone, Lightbulb } from 'lucide-react';

// 公告版本號 - 改這個數字會讓所有用戶重新看到公告
const ANNOUNCEMENT_VERSION = '2024-12-13-robot-limit';

interface AnnouncementModalProps {
  /** 強制顯示（忽略 localStorage） */
  forceShow?: boolean;
}

export function AnnouncementModal({ forceShow = false }: AnnouncementModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 檢查是否已經看過這個版本的公告
    const seenVersion = localStorage.getItem('announcement_seen');

    if (forceShow || seenVersion !== ANNOUNCEMENT_VERSION) {
      setIsOpen(true);
    }
  }, [forceShow]);

  const handleClose = () => {
    // 記錄已看過
    localStorage.setItem('announcement_seen', ANNOUNCEMENT_VERSION);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Megaphone className="h-5 w-5 text-orange-500" />
            使用限制調整
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            為確保服務穩定與永續經營，機器人每日使用次數調整為{' '}
            <span className="font-bold text-foreground">1 次</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">小提醒：</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>每次最多抓取 5 篇內容</li>
                <li>建議搭配手動建立連結使用</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full sm:w-auto">
            我知道了
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
