'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Ban, Clock, TrendingDown, Frown, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function PainPointsSection() {
  const painPoints = [
    {
      icon: <Ban className="w-12 h-12 text-red-500" />,
      title: '社群平台一直封你的連結？',
      description: '剛發文就被限制，流量歸零，辛苦經營的帳號說沒就沒。',
    },
    {
      icon: <Clock className="w-12 h-12 text-orange-500" />,
      title: '每次發文都要花 30 分鐘？',
      description: '找圖、想文案、複製連結...光準備就累死，根本沒時間大量發文。',
    },
    {
      icon: <Frown className="w-12 h-12 text-yellow-500" />,
      title: '不知道發什麼內容才有人點？',
      description: '隨便發發沒流量，看別人爆紅不知道怎麼做，摸黑亂試浪費時間。',
    },
    {
      icon: <TrendingDown className="w-12 h-12 text-blue-500" />,
      title: '轉換率低到爆，賺不到錢？',
      description: '發了一堆文，點擊率超低，分潤收入少得可憐，根本不值得做。',
    },
  ];

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-6 py-3 rounded-full mb-6">
            <AlertCircle className="w-5 h-5" />
            <span className="font-bold text-lg">你是不是遇到這些問題？</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-4">
            做聯盟行銷，
            <br />
            <span className="text-red-600">為什麼這麼難賺？</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            大多數人做分潤失敗，不是因為不努力，而是因為...
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          {painPoints.map((point, index) => (
            <Card
              key={index}
              className="p-8 hover:shadow-xl transition-all border-2 border-muted hover:border-red-200 dark:hover:border-red-900"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0">{point.icon}</div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-red-600 dark:text-red-400">
                    {point.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl p-8">
            <p className="text-2xl font-bold mb-3">
              如果你有這些問題...
            </p>
            <p className="text-lg opacity-90 mb-6">
              那你需要的不是「更努力」，而是一套能讓你<span className="font-black underline">避開封鎖、快速產出、穩定賺錢</span>的系統。
            </p>
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100 px-8 py-6 text-lg font-bold shadow-xl transition-all transform hover:scale-105"
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
