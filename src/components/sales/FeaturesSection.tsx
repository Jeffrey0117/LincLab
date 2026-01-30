'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, Sparkles, Bot, Palette, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/lib/config/site';

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: <ShieldIcon className="w-12 h-12 text-orange-500" />,
      title: 'OG 偽裝短網址',
      description: '社群平台連結封鎖？',
      details: '使用「偽裝 OG」功能，讓連結在社群平台上顯示成正常網頁內容，大幅降低被封鎖的風險。',
      highlight: true,
    },
    {
      icon: <Bot className="w-12 h-12 text-pink-500" />,
      title: '自動爬蟲機器人',
      description: '自動抓取熱門內容和標題。',
      details: 'PTT 表特版 + ETtoday 熱門新聞，自動生成貼文素材，省時省力。',
      highlight: true,
    },
    {
      icon: <Sparkles className="w-12 h-12 text-purple-500" />,
      title: '一鍵產生貼文',
      description: '文案自動生成。',
      details: '從標題到內容、從圖片到連結，全部自動組合。快速產出高轉換貼文。',
    },
    {
      icon: <Palette className="w-12 h-12 text-blue-500" />,
      title: '連結卡片設計與模板',
      description: '吸睛的預覽卡片，讓人忍不住點擊。',
      details: '自訂標題、描述、圖片，讓你的連結看起來專業又吸引人，點擊率大幅提升。',
    },
    {
      icon: <FileText className="w-12 h-12 text-green-500" />,
      title: '多帳號策略管理',
      description: '不同帳號、不同定位。',
      details: '支援多種主題帳號定位，從美妝到新聞、從生活到3C，靈活管理不同策略。',
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-red-500" />,
      title: '數據追蹤與分析',
      description: '即時了解成效。',
      details: '完整的點擊追蹤和數據統計，幫助你了解哪些內容最受歡迎，持續優化策略。',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {siteConfig.name} 提供的
            <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">價值</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            這些功能，讓你的聯盟行銷事半功倍
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-2 ${
                feature.highlight
                  ? 'border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20'
                  : ''
              }`}
            >
              <CardContent className="pt-8 pb-6 px-6">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-lg font-semibold text-muted-foreground mb-3">
                  {feature.description}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.details}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-6 py-3 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">開源自架，持續更新</span>
          </div>

          <div>
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white px-8 py-6 text-lg font-bold shadow-xl transition-all transform hover:scale-105"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                立即開始使用
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
