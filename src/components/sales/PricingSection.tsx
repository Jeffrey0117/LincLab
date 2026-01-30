'use client';

import { Button } from '@/components/ui/button';
import { Check, Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/lib/config/site';

export function PricingSection() {
  const features = [
    `${siteConfig.name} 完整功能`,
    'OG 偽裝短網址（不再被封鎖）',
    '多帳號管理系統',
    '點擊追蹤與數據統計',
    '自動爬蟲機器人',
    '連結卡片設計與模板',
    '標籤分類管理',
    'Google Sheets 整合',
    '持續更新的新功能',
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            立即
            <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent"> 開始使用</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            註冊即可使用完整功能
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-1">
            <div className="bg-white dark:bg-gray-900 rounded-[22px] p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  <Crown className="w-4 h-4" />
                  完整功能
                </div>
                <h3 className="text-2xl md:text-3xl font-black mb-2">
                  {siteConfig.name} 聯盟行銷管理平台
                </h3>
                <p className="text-muted-foreground">
                  所有功能一次解鎖
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/auth" className="block">
                <Button
                  className="w-full text-xl py-8 font-bold bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white shadow-2xl transition-all transform hover:scale-105"
                  size="lg"
                >
                  立即註冊使用
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
