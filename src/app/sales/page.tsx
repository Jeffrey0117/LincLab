import { Suspense } from 'react';
import { LiveDemoBanner } from '@/components/sales/LiveDemoBanner';
import { PainPointsSection } from '@/components/sales/PainPointsSection';
import { FeaturesSection } from '@/components/sales/FeaturesSection';
import { PricingSection } from '@/components/sales/PricingSection';
import { FAQSection } from '@/components/sales/FAQSection';
import { CTASection } from '@/components/sales/CTASection';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: `${process.env.NEXT_PUBLIC_SITE_NAME || 'LincLab'} - 聯盟行銷智能管理系統`,
  description: '專為聯盟行銷打造的智能短網址管理平台。提供 OG 偽裝、數據追蹤、多帳號管理等專業功能，幫助您提升轉換率、優化行銷策略。',
  keywords: '聯盟行銷,短網址,OG偽裝,數據追蹤,聯盟行銷工具,分潤',
};

export default function SalesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="h-8 w-8 text-orange-600 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">載入中…</p>
          </div>
        </div>
      }
    >
      <main className="min-h-screen bg-white">
        {/* Live Demo Banner - 偽裝連結體驗提示 */}
        <LiveDemoBanner />

        {/* Pain Points Section - 痛點區 */}
        <PainPointsSection />

        {/* Features Section - 產品特色 */}
        <FeaturesSection />

        {/* Pricing Section - 方案定價 */}
        <PricingSection />

        {/* FAQ Section - 常見問題 */}
        <FAQSection />

        {/* CTA Section - 最終行動呼籲 */}
        <CTASection />

        {/* Footer 說明 */}
        <footer className="py-12 bg-gray-50 border-t">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-600 mb-3">
              &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME || 'LincLab'}
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-400">
              <a href="/terms" className="hover:text-gray-600 hover:underline">服務條款</a>
              <span>&middot;</span>
              <a href="/privacy" className="hover:text-gray-600 hover:underline">隱私權政策</a>
            </div>
          </div>
        </footer>
      </main>
    </Suspense>
  );
}
