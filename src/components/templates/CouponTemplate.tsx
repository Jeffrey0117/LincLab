'use client';

import React, { useState } from 'react';
import { Ticket, Copy, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CouponTemplateConfig {
  title: string;
  discount: string;
  code: string;
  description?: string;
  terms?: string[];
  expiryDate?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface CouponTemplateProps {
  config: CouponTemplateConfig;
}

const CouponTemplate: React.FC<CouponTemplateProps> = ({ config }) => {
  const {
    title,
    discount,
    code,
    description,
    terms,
    expiryDate,
    ctaText = '立即使用',
    backgroundColor = '#ef4444',
    textColor = '#ffffff',
  } = config;

  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('優惠碼已複製！');
    setTimeout(() => setCopied(false), 3000);
  };

  // 計算剩餘天數
  const getDaysLeft = () => {
    if (!expiryDate) return null;
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysLeft = getDaysLeft();

  return (
    <div className="max-w-lg mx-auto">
      {/* Coupon Card */}
      <div
        className="relative rounded-lg overflow-hidden shadow-lg"
        style={{ backgroundColor, color: textColor }}
      >
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full border-[20px] border-current" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full border-[20px] border-current" />
        </div>

        <div className="relative p-8 text-center space-y-6">
          <div className="flex justify-center">
            <Ticket className="w-16 h-16" />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <div className="text-5xl font-black">{discount}</div>
          </div>

          {description && (
            <p className="text-lg opacity-90">{description}</p>
          )}

          {/* Coupon Code */}
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-sm opacity-90 mb-2">優惠代碼</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-mono font-bold">{code}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyCode}
                className="text-current hover:bg-white/20"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Expiry */}
          {daysLeft !== null && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>
                {daysLeft > 0 ? `還剩 ${daysLeft} 天` : '今天截止'}
              </span>
            </div>
          )}

          <Button
            size="lg"
            className="bg-white hover:bg-gray-100"
            style={{ color: backgroundColor }}
          >
            {ctaText}
          </Button>
        </div>
      </div>

      {/* Terms */}
      {terms && terms.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-sm mb-2">使用條款</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            {terms.map((term, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="mt-0.5">•</span>
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CouponTemplate;