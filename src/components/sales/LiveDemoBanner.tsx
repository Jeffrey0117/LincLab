'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, X, Zap, TrendingUp, MousePointer, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/lib/config/site';

export function LiveDemoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(prev => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white overflow-hidden">
      <div className={`absolute inset-0 bg-yellow-400/10 ${isAnimating ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`} />

      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors z-10"
        aria-label="關閉"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="container mx-auto px-4 py-6 md:py-8 relative">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className={`p-3 bg-yellow-400 rounded-full ${isAnimating ? 'scale-110' : 'scale-100'} transition-transform shadow-lg`}>
              <MousePointer className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-sm md:text-base text-yellow-200 font-semibold mb-1">
                什麼是 OG 偽裝連結？
              </p>
              <h2 className="text-2xl md:text-4xl font-black text-yellow-300 drop-shadow-lg">
                {siteConfig.name} 聯盟行銷管理系統
              </h2>
            </div>
          </div>

          <div className="max-w-2xl space-y-3">
            <div className="bg-black/30 border-2 border-yellow-400/50 rounded-xl p-4 md:p-5">
              <div className="flex items-start gap-3 text-left">
                <Zap className="w-6 h-6 shrink-0 mt-0.5 text-yellow-400" />
                <div className="text-sm md:text-base">
                  <p className="font-black text-yellow-300 text-base md:text-lg mb-2">
                    讓你的分潤連結不再被封鎖
                  </p>
                  <p className="text-white/90 leading-relaxed">
                    使用 OG 偽裝技術，讓連結在社群平台上顯示成正常的網頁內容，
                    <span className="font-bold text-yellow-300">大幅降低封鎖率</span>。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-400 text-red-700 rounded-lg px-4 py-2 font-bold text-sm md:text-base">
              <TrendingUp className="w-4 h-4 inline mr-2" />
              智能短網址 + OG 偽裝 + 自動爬蟲 = 高效聯盟行銷
            </div>
          </div>

          <Link href="/auth" className="w-full md:w-auto">
            <Button
              size="lg"
              className="w-full md:w-auto bg-yellow-400 text-red-700 hover:bg-yellow-300 px-8 md:px-10 py-6 md:py-7 text-lg md:text-xl font-black shadow-2xl transition-all transform hover:scale-105 border-4 border-yellow-200"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              立即開始使用
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
