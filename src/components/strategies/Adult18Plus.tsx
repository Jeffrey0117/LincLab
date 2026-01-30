'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { Adult18PlusConfig } from '@/lib/strategy-types';

interface Adult18PlusProps {
  affiliateUrl: string;
  config?: Adult18PlusConfig;
  onVerified?: () => void;
}

export default function Adult18Plus({
  affiliateUrl,
  config,
  onVerified,
}: Adult18PlusProps) {
  const [showDialog, setShowDialog] = useState(true);

  const title = config?.title || '18 禁內容警告';
  const warningText = config?.warningText || '本網站包含成人內容';
  const description = config?.description || '您即將進入包含成人內容的網站，僅限年滿 18 歲（含）以上之成年人瀏覽。若您尚未年滿 18 歲，請立即離開。';
  const confirmText = config?.confirmText || '我已滿 18 歲，進入網站';
  const cancelText = config?.cancelText || '離開';
  const showWarningIcon = config?.showWarningIcon !== false;

  // 所有互動都導向分潤連結
  const handleNavigate = () => {
    window.open(affiliateUrl, '_blank');
    onVerified?.();
    setShowDialog(false);
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent
        className="sm:max-w-lg [&>button]:hidden bg-black/95 border-red-600 border-2"
        onInteractOutside={(e) => {
          e.preventDefault();
          handleNavigate();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          handleNavigate();
        }}
      >
        <div className="flex flex-col items-center space-y-6 py-8 px-4">
          {/* Warning Badge */}
          {showWarningIcon && (
            <div className="relative">
              {/* Pulsing background effect */}
              <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-20" />
              <div className="relative rounded-full bg-gradient-to-br from-red-600 to-red-800 p-6 shadow-2xl shadow-red-600/50">
                <ShieldAlert className="h-16 w-16 text-white" strokeWidth={2.5} />
              </div>
            </div>
          )}

          {/* 18+ Badge */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-red-600 blur-xl opacity-50" />
            <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-900 px-8 py-4 rounded-2xl border-2 border-red-400 shadow-2xl">
              <div className="text-6xl font-black text-white tracking-wider">
                18+
              </div>
            </div>
          </div>

          {/* Warning Text */}
          <div className="flex items-center gap-3 bg-red-950/50 px-6 py-3 rounded-lg border border-red-800">
            <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0" />
            <span className="text-red-200 font-bold text-lg">
              {warningText}
            </span>
          </div>

          {/* Title & Description */}
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <p className="text-gray-300 leading-relaxed text-base">
              {description}
            </p>
          </div>

          {/* Warning Notice */}
          <div className="w-full bg-yellow-950/30 border border-yellow-700/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-yellow-200 text-sm font-semibold">
                  法律聲明
                </p>
                <p className="text-yellow-300/80 text-xs leading-relaxed">
                  根據《兒童及少年福利與權益保障法》規定，未滿 18 歲者不得瀏覽成人內容。
                  繼續瀏覽即表示您確認已達法定年齡。
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col w-full gap-3 pt-2">
            <Button
              onClick={handleNavigate}
              size="lg"
              className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-600 hover:from-red-700 hover:via-red-800 hover:to-red-700 text-white font-bold text-lg shadow-lg shadow-red-600/30 border border-red-500 transition-all duration-300 hover:scale-[1.02]"
            >
              {confirmText}
            </Button>
            <Button
              onClick={handleNavigate}
              size="lg"
              variant="outline"
              className="w-full bg-gray-900/50 hover:bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600 font-semibold transition-all duration-300"
            >
              {cancelText}
            </Button>
          </div>

          {/* Footer Disclaimer */}
          <div className="text-center space-y-2 pt-4">
            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
              本網站受到《兒童及少年福利與權益保障法》、《刑法》第 235 條等相關法律規範。
              不當使用可能觸犯法律，請謹慎使用。
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
