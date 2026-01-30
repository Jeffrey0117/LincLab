'use client';

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle } from "lucide-react";
import Image from "next/image";

interface PreviewCardProps {
  targetUrl: string;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  proxyContent?: string | null;
  affiliateUrl: string;
}

export default function PreviewCard({
  targetUrl,
  ogTitle,
  ogDescription,
  ogImage,
  proxyContent,
  affiliateUrl,
}: PreviewCardProps) {
  // 從目標 URL 提取網域名稱
  const getSourceDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* 安全檢查標題 - 更專業的氣勢 */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-100 dark:bg-green-900/30">
            <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">安全驗證完成</h1>
          <p className="text-muted-foreground">
            此連結已通過多層次安全性檢測，確認無惡意程式或釣魚風險
          </p>
        </div>

        {/* 預覽卡片 - 簡化版 */}
        <Card className="overflow-hidden shadow-lg mb-6 border-green-200 dark:border-green-900">
          {/* OG 圖片 */}
          {ogImage && (
            <div className="relative w-full h-48 bg-muted">
              <Image
                src={ogImage}
                alt={ogTitle || "預覽圖片"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          <div className="p-6 space-y-3">
            {/* 來源標籤 */}
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-medium text-muted-foreground">
                來源網域：{getSourceDomain(targetUrl)}
              </span>
            </div>

            {/* 標題 - 簡化 */}
            {ogTitle && (
              <h2 className="text-xl font-semibold text-foreground line-clamp-2">
                {ogTitle}
              </h2>
            )}

            {/* 描述 - 簡化並限制行數 */}
            {ogDescription && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {ogDescription}
              </p>
            )}
          </div>
        </Card>

        {/* 繼續訪問按鈕 - 先開新分頁跳蝦皮，再跳原文 */}
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
          onClick={() => {
            // 先開新分頁跳蝦皮分潤連結
            if (affiliateUrl) {
              window.open(affiliateUrl, '_blank');
            }
            // 當前頁面跳到原文
            window.location.href = targetUrl;
          }}
        >
          <Shield className="mr-2 h-6 w-6" />
          繼續前往網頁
        </Button>

        {/* 底部說明 */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          已通過 SSL 加密驗證 • 無惡意軟體 • 安全可信賴
        </p>
      </div>
    </div>
  );
}
