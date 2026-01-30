'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Check } from 'lucide-react';
import { CaptchaVerificationConfig } from '@/lib/strategy-types';

interface CaptchaVerificationProps {
  affiliateUrl: string;
  config?: CaptchaVerificationConfig;
  onVerified?: () => void;
}

export default function CaptchaVerification({
  affiliateUrl,
  config,
  onVerified,
}: CaptchaVerificationProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const title = config?.title || '安全驗證';
  const description = config?.description || '為了保護您的安全，請完成驗證';
  const verifyText = config?.verifyText || '我不是機器人';
  const style = config?.style || 'google';
  const showSpinner = config?.showSpinner !== false;
  const delaySeconds = config?.delaySeconds || 2;

  useEffect(() => {
    // 延遲顯示驗證框
    const timer = setTimeout(() => {
      setShowDialog(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleVerify = () => {
    setIsVerifying(true);

    // 模擬驗證過程
    setTimeout(() => {
      setIsVerified(true);
      setIsVerifying(false);

      // 再延遲一下後跳轉
      setTimeout(() => {
        window.open(affiliateUrl, '_blank');
        onVerified?.();
        setShowDialog(false);
      }, delaySeconds * 1000);
    }, 1500);
  };

  const handleOutsideClick = () => {
    // 點擊外面或按 ESC 也跳轉連結
    window.open(affiliateUrl, '_blank');
    onVerified?.();
    setShowDialog(false);
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onInteractOutside={(e) => {
          e.preventDefault();
          handleOutsideClick();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          handleOutsideClick();
        }}
      >
        <div className="flex flex-col items-center space-y-4 py-4">
          {/* Icon */}
          <div className="rounded-full bg-primary/10 p-3">
            <Shield className="h-8 w-8 text-primary" />
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {/* Verification Box */}
          <div
            className={`w-full max-w-sm border-2 rounded-lg p-4 ${
              isVerified
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : 'border-muted bg-background'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Checkbox */}
              <button
                onClick={handleVerify}
                disabled={isVerifying || isVerified}
                className={`w-8 h-8 border-2 rounded flex items-center justify-center transition-colors ${
                  isVerified
                    ? 'border-green-500 bg-green-500'
                    : 'border-muted-foreground hover:border-primary'
                } ${isVerifying ? 'animate-pulse' : ''}`}
              >
                {isVerified && <Check className="h-5 w-5 text-white" />}
                {isVerifying && showSpinner && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </button>

              {/* Text */}
              <div className="flex-1">
                <p className="text-sm font-medium">{verifyText}</p>
              </div>

              {/* Logo (模擬 reCAPTCHA) */}
              {style === 'google' && (
                <div className="flex flex-col items-end text-xs text-muted-foreground">
                  <span className="font-mono">reCAPTCHA</span>
                  <span className="text-[10px]">Privacy - Terms</span>
                </div>
              )}

              {style === 'cloudflare' && (
                <div className="flex flex-col items-end text-xs text-muted-foreground">
                  <span className="font-mono">Turnstile</span>
                  <span className="text-[10px]">by Cloudflare</span>
                </div>
              )}
            </div>
          </div>

          {/* Success Message */}
          {isVerified && (
            <div className="text-center space-y-2">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ 驗證成功！正在為您導向...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
