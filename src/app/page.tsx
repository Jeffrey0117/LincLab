'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import {
  Link2,
  Zap,
  BarChart3,
  Users,
  Shield,
  Sparkles,
  Check,
  ArrowRight,
  Target,
  Layers,
  TrendingUp,
} from "lucide-react";
import { siteConfig } from "@/lib/config/site";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* 導航欄 */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt={siteConfig.name} width={40} height={40} className="rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-foreground">{siteConfig.name}</h1>
                <p className="text-xs text-muted-foreground">{siteConfig.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth">
                <Button variant="ghost">登入</Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-gradient-primary hover:opacity-90">
                  立即開始
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero 區域 */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <Badge className="bg-gradient-primary text-white border-0 px-4 py-2 text-sm">
              <Sparkles className="inline-block mr-2 h-4 w-4" />
              專為聯盟行銷打造
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              讓你的分潤連結
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                轉換率翻倍
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              智能短網址服務，支援多帳號管理、點擊追蹤、自訂 OG 圖片。
              <br />
              讓每一次分享都更專業、更吸引人！
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/auth">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6">
                  立即開始
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                查看功能介紹
              </Button>
            </div>

            <div className="pt-8 flex justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>免費方案可用</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>無需信用卡</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>即刻開始使用</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 功能特色 */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">核心功能</Badge>
            <h2 className="text-4xl font-bold mb-4">為什麼選擇 {siteConfig.name}？</h2>
            <p className="text-muted-foreground text-lg">
              專為聯盟行銷打造的全方位解決方案
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 p-3 bg-gradient-primary/10 rounded-lg w-fit">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">多帳號管理</h3>
              <p className="text-muted-foreground">
                支援建立多個行銷帳號，每個帳號可設定專屬的 OG 圖片和策略，輕鬆管理不同定位的分潤內容。
              </p>
            </Card>

            <Card className="p-6 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 p-3 bg-gradient-primary/10 rounded-lg w-fit">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">自訂 OG 模板</h3>
              <p className="text-muted-foreground">
                為每個帳號設定專屬的預覽圖片、標題和描述，讓你的連結在社群平台上更吸睛，提升點擊率。
              </p>
            </Card>

            <Card className="p-6 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 p-3 bg-gradient-primary/10 rounded-lg w-fit">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">點擊追蹤統計</h3>
              <p className="text-muted-foreground">
                即時追蹤每個連結的點擊次數和轉換數據，了解哪些內容最受歡迎，優化你的行銷策略。
              </p>
            </Card>

            <Card className="p-6 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 p-3 bg-gradient-primary/10 rounded-lg w-fit">
                <Link2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">智能短網址</h3>
              <p className="text-muted-foreground">
                自動生成簡潔易記的短網址，支援自訂代碼，讓你的分享連結更專業、更容易傳播。
              </p>
            </Card>

            <Card className="p-6 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 p-3 bg-gradient-primary/10 rounded-lg w-fit">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">標籤分類系統</h3>
              <p className="text-muted-foreground">
                使用標籤整理你的連結，快速篩選和查找特定類別的分潤內容，提升管理效率。
              </p>
            </Card>

            <Card className="p-6 hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 p-3 bg-gradient-primary/10 rounded-lg w-fit">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">安全可靠</h3>
              <p className="text-muted-foreground">
                使用 Supabase 雲端資料庫，確保你的數據安全無虞。支援帳號權限管理，保護你的行銷資產。
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 使用說明 */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">使用說明</Badge>
            <h2 className="text-4xl font-bold mb-4">三步驟開始賺取分潤</h2>
            <p className="text-muted-foreground text-lg">
              簡單易用，快速上手
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-glow transition-all duration-300">
              <div className="mb-6 mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">建立帳號與設定</h3>
              <p className="text-muted-foreground">
                註冊並登入後，建立你的第一個行銷帳號。設定帳號名稱、類型（美妝、3C、生活等）並上傳專屬的 OG 預覽圖片。
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-glow transition-all duration-300">
              <div className="mb-6 mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">創建分潤連結</h3>
              <p className="text-muted-foreground">
                貼上你的聯盟行銷連結，選擇對應的帳號，系統會自動生成短網址。你也可以自訂標題、標籤來更好地管理連結。
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-glow transition-all duration-300">
              <div className="mb-6 mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">分享並追蹤成效</h3>
              <p className="text-muted-foreground">
                將短網址分享到社群平台、部落格或 LINE 群組。隨時回到後台查看點擊數據，了解哪些內容最受歡迎。
              </p>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Link href="/auth">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                立即開始
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA 區域 */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <Zap className="h-12 w-12 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              準備好提升你的分潤收入了嗎？
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              加入 {siteConfig.name}，讓你的聯盟行銷更專業、更有效率！
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                  立即開始
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt={siteConfig.name} width={32} height={32} className="rounded-lg" />
              <div className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
              </div>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/auth" className="hover:text-foreground transition-colors">
                登入
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
