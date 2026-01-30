'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
            準備好開始了嗎？
          </h2>

          <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed">
            立即註冊，開始使用聯盟行銷智能管理系統，提升你的轉換率和收入。
          </p>

          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 md:px-4 py-2 rounded-full">
              <Zap className="w-4 h-4" />
              <span className="text-xs md:text-sm font-medium">免費開始</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 md:px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs md:text-sm font-medium">完整功能</span>
            </div>
          </div>

          <Link href="/auth">
            <Button
              size="lg"
              className="bg-white text-purple-700 hover:bg-gray-100 px-6 md:px-12 py-6 md:py-8 text-base md:text-xl font-bold rounded-2xl shadow-2xl transition-all transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
              立即開始使用
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 md:ml-3" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
