'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Play,
  Copy,
  Check,
  Loader2,
  Youtube,
  BookOpen,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function YoutubeSummaryRobotPage() {
  const router = useRouter();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [copied, setCopied] = useState(false);

  // 結果狀態
  const [result, setResult] = useState<{
    summary: string;
    shortUrl: string;
    postContent: string;
    videoTitle: string;
  } | null>(null);

  // 認證狀態檢查 + 會員檢查
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth');
        return;
      }

      // 檢查會員等級
      try {
        const response = await fetch('/api/user/membership');
        if (response.ok) {
          const data = await response.json();
          const tier = data.tier || 'free';

          if (tier === 'free') {
            toast({
              title: '需要升級會員',
              description: '機器人功能僅供付費會員使用',
              variant: 'destructive',
            });
            router.push('/membership');
            return;
          }
          setIsMember(true);
        }
      } catch (error) {
        console.error('Error checking membership:', error);
      }

      setIsAuthChecking(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  // 使用量狀態
  const [usageStats, setUsageStats] = useState<{
    robotToday: number;
    robotLimit: number;
    remaining: number;
  } | null>(null);

  // 獲取使用量
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/user/usage');
        if (response.ok) {
          const data = await response.json();
          setUsageStats({
            robotToday: data.usage?.robotToday || 0,
            robotLimit: data.limits?.robotDaily || 10,
            remaining: data.remaining?.robotToday || 10,
          });
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error);
      }
    };
    fetchUsage();
  }, [result]);

  // 驗證 YouTube URL
  const isValidYoutubeUrl = (url: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^https?:\/\/youtu\.be\/[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  // 執行摘要
  const handleGenerate = async () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: "請輸入 YouTube 連結",
        variant: "destructive"
      });
      return;
    }

    if (!isValidYoutubeUrl(youtubeUrl)) {
      toast({
        title: "無效的 YouTube 連結",
        description: "請輸入正確的 YouTube 影片網址",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('/api/robots/youtube-summary/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          youtubeUrl: youtubeUrl.trim(),
          affiliateUrl: affiliateUrl.trim() || undefined,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          toast({
            title: "未登入",
            description: "請先登入才能使用機器人功能",
            variant: "destructive"
          });
          setTimeout(() => router.push('/auth'), 2000);
          throw new Error('請先登入');
        }

        if (response.status === 403) {
          toast({
            title: "已達到每日使用上限",
            description: errorData.message || '已達到使用限制',
            variant: "destructive"
          });
          throw new Error(errorData.message);
        }

        throw new Error(errorData.error || errorData.message || `處理失敗: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: "生成成功！",
        description: "課代表已為您整理好重點摘要",
      });

    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "生成失敗",
        description: error instanceof Error ? error.message : "未知錯誤",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 複製發文內容
  const handleCopy = async () => {
    if (!result?.postContent) return;

    try {
      await navigator.clipboard.writeText(result.postContent);
      setCopied(true);
      toast({
        title: "已複製到剪貼簿",
        description: "可以直接貼到社群媒體發文",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "複製失敗",
        description: "請手動選取複製",
        variant: "destructive"
      });
    }
  };

  // 檢查中或非會員時顯示載入畫面
  if (isAuthChecking || !isMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* 頁面頂部 */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/automation')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">課代表來了</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                YouTube 影片 AI 重點摘要，一鍵生成發文內容
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg py-1 px-3">
            Beta
          </Badge>
        </div>
      </div>

      <div className="space-y-6">
        {/* 輸入區 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              輸入 YouTube 連結
            </CardTitle>
            <CardDescription>
              貼上想要摘要的 YouTube 影片網址
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube 網址 *</Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliate-url">分潤連結（選填）</Label>
              <Input
                id="affiliate-url"
                type="url"
                placeholder="https://shopee.tw/..."
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                留空則使用 YouTube 原始連結
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 執行區 */}
        <Card className="border-2 border-red-500/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>課代表會幫你：</AlertTitle>
                <AlertDescription className="space-y-2 mt-2">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>分析 YouTube 影片內容</li>
                    <li>AI 生成 1. 2. 3. 重點摘要</li>
                    <li>自動建立嘟嘟網盤分享連結</li>
                    <li>產生可複製的發文內容</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* 使用量顯示 */}
              {usageStats && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">今日使用量</span>
                  </div>
                  <Badge
                    variant={usageStats.remaining > 3 ? "secondary" : usageStats.remaining > 0 ? "outline" : "destructive"}
                    className="font-mono"
                  >
                    {usageStats.robotToday} / {usageStats.robotLimit} 次
                  </Badge>
                </div>
              )}

              <Button
                className={cn(
                  "w-full h-12 text-lg font-semibold",
                  "bg-gradient-to-r from-red-500 to-orange-500",
                  "hover:from-red-600 hover:to-orange-600",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                onClick={handleGenerate}
                disabled={isProcessing || (usageStats?.remaining === 0)}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    課代表正在整理筆記...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    開始生成摘要
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 結果區 */}
        {result && (
          <Card className="border-2 border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Check className="w-5 h-5" />
                課代表筆記完成！
              </CardTitle>
              {result.videoTitle && (
                <CardDescription>
                  影片：{result.videoTitle}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 發文內容預覽 */}
              <div className="space-y-2">
                <Label>發文內容（點擊複製）</Label>
                <div
                  className="relative cursor-pointer group"
                  onClick={handleCopy}
                >
                  <Textarea
                    value={result.postContent}
                    readOnly
                    rows={12}
                    className="font-mono text-sm resize-none bg-white dark:bg-gray-900 cursor-pointer"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge variant="secondary" className="gap-1">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? '已複製' : '點擊複製'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 快速操作 */}
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  className="flex-1"
                  variant={copied ? "secondary" : "default"}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      已複製
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      複製發文內容
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(result.shortUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  預覽連結
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
