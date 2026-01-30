'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { siteConfig } from '@/lib/config/site';

export function HeroSection() {
  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-white border-b">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* 標籤 */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-900 text-sm font-medium mb-8">
            聯盟行銷專用工具
          </div>

          {/* 主標題 */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            {siteConfig.name}<br />聯盟行銷智能管理
          </h1>

          {/* 副標題 */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            專業的短網址管理平台，幫助您提升轉換率、追蹤數據、優化行銷策略
          </p>

          {/* CTA 按鈕 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              onClick={scrollToPricing}
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg rounded-lg shadow-sm"
            >
              開始免費試用
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 text-gray-700 px-8 py-6 text-lg rounded-lg hover:bg-gray-50"
            >
              查看功能介紹
            </Button>
          </div>

          {/* 核心價值點 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto pt-8 border-t">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-1">智能短網址</h3>
                <p className="text-sm text-gray-600">自動生成易記連結</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-1">數據追蹤</h3>
                <p className="text-sm text-gray-600">即時查看點擊數據</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-1">多帳號管理</h3>
                <p className="text-sm text-gray-600">輕鬆管理不同策略</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
