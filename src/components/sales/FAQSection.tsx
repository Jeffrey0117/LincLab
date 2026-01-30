'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: '這個系統真的可以避開社群平台的封鎖嗎？',
      answer: '可以。我們使用「OG 偽裝」技術，讓你的連結在社群平台上顯示成正常的網頁內容，而不是明顯的分潤連結。實測數千次發文，封鎖率大幅降低。',
    },
    {
      question: '我完全不會技術，也能用嗎？',
      answer: '當然可以！整個系統就是為「不懂技術的人」設計的。只要會複製貼上、會發文，3 分鐘就能上手。',
    },
    {
      question: '可以自架部署嗎？',
      answer: '可以！本專案支援 Self-hosting，你可以用 Docker 一鍵部署到自己的伺服器上，完全掌控你的數據。',
    },
    {
      question: '我已經在用其他短網址工具了，為什麼要換？',
      answer: '一般短網址工具只是「縮網址」，沒有針對聯盟行銷優化。我們有 OG 偽裝、專屬模板、爬蟲機器人，全部都是為了讓你的分潤更好賺，不會被平台封鎖。',
    },
    {
      question: '系統包含哪些功能？',
      answer: '包含：智能短網址管理、OG 偽裝技術、多帳號管理、點擊追蹤統計、自動爬蟲機器人（PTT、ETtoday）、YouTube 摘要生成、Google Sheets 整合等。',
    },
    {
      question: '資料安全嗎？',
      answer: '完全安全。系統使用 Supabase 作為後端，支援 Row Level Security。自架部署的話，所有數據都在你自己的伺服器上。',
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            常見問題
          </h2>
          <p className="text-xl text-muted-foreground">
            想了解的，都在這裡
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="overflow-hidden transition-all hover:shadow-lg"
            >
              <button
                className="w-full text-left p-6 flex items-center justify-between gap-4"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-lg font-bold pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-6 h-6 shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 pt-0">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/auth">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white"
            >
              立即開始使用
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
