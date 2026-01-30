'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Play,
  Settings,
  Sparkles,
  Link,
  Info,
  Loader2,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExecutionProgress } from '@/components/robots/ExecutionProgress';
import { ExecutionResult } from '@/components/robots/ExecutionResult';
import { GoogleSheetsPush } from '@/components/robots/GoogleSheetsPush';
import { AnnouncementModal } from '@/components/AnnouncementModal';
import { mockCurrentExecution, ExecutionLog } from '@/lib/robot-mock-data';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ETtodayConfig {
  fetchCount: number;
  affiliateLink: string;
}

export default function ETtodayNewsRobotPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settings');
  const [config, setConfig] = useState<ETtodayConfig>({
    fetchCount: 5,
    affiliateLink: ''
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<typeof mockCurrentExecution | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionLog | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isMember, setIsMember] = useState(false);

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
  }, [executionResult]); // 執行完成後重新獲取

  // 獲取短連結詳細資訊
  const fetchLinkDetails = async (linkIds: string[]) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const links = [];

    for (const linkId of linkIds) {
      try {
        const response = await fetch(`/api/links/${linkId}`);
        if (response.ok) {
          const link = await response.json();
          links.push({
            id: link.id,
            title: link.og_title || '短連結',
            imageUrl: link.og_image || '',
            shortCode: link.short_code,
            shortUrl: `${baseUrl}/${link.short_code}`
          });
        }
      } catch (error) {
        console.error(`Failed to fetch link ${linkId}:`, error);
      }
    }

    return links;
  };

  // 真正執行爬蟲
  const realExecute = async () => {
    setIsExecuting(true);
    setExecutionResult(null);

    try {
      // 呼叫 API 開始執行
      const response = await fetch('/api/robots/ettoday-news/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          count: config.fetchCount,
          affiliateUrl: config.affiliateLink || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);

        // 特殊處理 401 未登入
        if (response.status === 401) {
          toast({
            title: "未登入",
            description: "請先登入才能使用機器人功能，即將跳轉到登入頁面...",
            variant: "destructive"
          });
          setTimeout(() => router.push('/auth'), 2000);
          throw new Error('請先登入');
        }

        // 特殊處理 403 使用限制
        if (response.status === 403) {
          const limitMessage = errorData.message || '已達到使用限制';
          const current = errorData.current;
          const limit = errorData.limit;

          toast({
            title: "已達到每日使用上限",
            description: `${limitMessage}${current !== undefined ? ` (今日已用 ${current}/${limit} 次)` : ''}`,
            variant: "destructive"
          });
          throw new Error(limitMessage);
        }

        throw new Error(errorData.error || errorData.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      const logId = data.executionLogId;

      // 開始輪詢狀態
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/robots/execution/${logId}`);
          if (!statusResponse.ok) {
            clearInterval(pollInterval);
            throw new Error('Failed to get status');
          }

          const status = await statusResponse.json();

          // 更新進度
          setCurrentExecution({
            currentStep: status.success_count || 0,
            totalSteps: status.target_count || config.fetchCount,
            currentStatus: status.current_step || '執行中...',
            progress: status.progress_percentage || 0
          });

          // 檢查是否完成
          if (status.status === 'completed' || status.status === 'partial' || status.status === 'failed') {
            clearInterval(pollInterval);
            setIsExecuting(false);
            setCurrentExecution(null);

            // 獲取短連結詳細資訊
            const linkIds = status.created_link_ids || [];
            const createdLinks = await fetchLinkDetails(linkIds);

            // 設置執行結果
            const result: ExecutionLog = {
              id: status.id,
              robotId: 'ettoday-news',
              status: status.status,
              targetCount: status.target_count,
              successCount: status.success_count,
              failedCount: status.failed_count,
              durationSeconds: status.duration_seconds || 0,
              createdStrategies: createdLinks,
              errors: status.error_messages || [],
              startedAt: new Date(status.started_at),
              completedAt: new Date(status.completed_at || Date.now())
            };

            setExecutionResult(result);

            // 自動跳轉到結果分頁
            setActiveTab('results');

            toast({
              title: "執行完成",
              description: `成功抓取 ${result.successCount} 則新聞，生成 ${createdLinks.length} 個短連結`,
            });
          }
        } catch (error) {
          console.error('Error polling status:', error);
        }
      }, 2000); // 每 2 秒輪詢一次

    } catch (error) {
      console.error('Error executing scraper:', error);
      setIsExecuting(false);
      setCurrentExecution(null);

      toast({
        title: "執行失敗",
        description: error instanceof Error ? error.message : "未知錯誤",
        variant: "destructive"
      });
    }
  };

  const handleExecute = () => {
    if (!config.fetchCount || config.fetchCount < 1) {
      toast({
        title: "設定錯誤",
        description: "請設定正確的抓取數量",
        variant: "destructive"
      });
      return;
    }

    realExecute();
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* 公告彈窗 */}
      <AnnouncementModal />

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center overflow-hidden shadow-lg">
              <div className="relative w-full h-full">
                <Image
                  src="/robot-ettoday-news.jpg"
                  alt="ETtoday 熱門新聞爬蟲"
                  fill
                  className="object-cover object-top"
                  style={{ objectPosition: '50% 0%' }}
                />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">ETtoday 熱門新聞爬蟲</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                自動抓取 ETtoday 熱門新聞，生成外部連結預覽卡片
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg py-1 px-3">
            Beta
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            設定
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!executionResult}>
            <Sparkles className="w-4 h-4 mr-2" />
            執行結果
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          {/* 設定區 */}
          <Card>
            <CardHeader>
              <CardTitle>爬蟲設定</CardTitle>
              <CardDescription>
                調整爬蟲參數以獲得最佳結果
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 抓取數量 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fetch-count">抓取數量</Label>
                  <span className="text-2xl font-bold text-blue-600">
                    {config.fetchCount}
                  </span>
                </div>
                <Slider
                  id="fetch-count"
                  min={1}
                  max={5}
                  step={1}
                  value={[config.fetchCount]}
                  onValueChange={(value) => setConfig({ ...config, fetchCount: value[0] })}
                  className="w-full"
                  disabled={isExecuting}
                />
                <p className="text-sm text-gray-500">
                  設定要抓取的新聞數量（1-5 則）
                </p>
              </div>

              <Separator />

              {/* 分潤連結 */}
              <div className="space-y-3">
                <Label htmlFor="affiliate-link">
                  <Link className="w-4 h-4 inline mr-2" />
                  聯盟連結（選填）
                </Label>
                <Input
                  id="affiliate-link"
                  type="url"
                  placeholder="https://shopee.tw/..."
                  value={config.affiliateLink}
                  onChange={(e) => setConfig({ ...config, affiliateLink: e.target.value })}
                  disabled={isExecuting}
                />
                <p className="text-sm text-gray-500">
                  自動加入到所有生成的預覽卡片中
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 執行區 */}
          <Card className="border-2 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>執行說明</AlertTitle>
                  <AlertDescription className="space-y-2 mt-2">
                    <p>爬蟲將會：</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>從 ETtoday 網站抓取最新熱門新聞</li>
                      <li>自動提取新聞標題、摘要和圖片</li>
                      <li>生成具有預覽功能的外部連結卡片</li>
                      <li>如有設定，自動加入聯盟連結</li>
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
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={usageStats.remaining > 3 ? "secondary" : usageStats.remaining > 0 ? "outline" : "destructive"}
                        className="font-mono"
                      >
                        {usageStats.robotToday} / {usageStats.robotLimit} 次
                      </Badge>
                      {usageStats.remaining <= 3 && usageStats.remaining > 0 && (
                        <span className="text-xs text-yellow-600">剩餘 {usageStats.remaining} 次</span>
                      )}
                      {usageStats.remaining === 0 && (
                        <span className="text-xs text-destructive">今日已達上限</span>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  className={cn(
                    "w-full h-12 text-lg font-semibold",
                    "bg-gradient-to-r from-blue-500 to-purple-500",
                    "hover:from-blue-600 hover:to-purple-600",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  onClick={handleExecute}
                  disabled={isExecuting || (usageStats?.remaining === 0)}
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      執行中...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      開始執行爬蟲
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 執行進度 */}
          {isExecuting && currentExecution && (
            <ExecutionProgress
              currentStep={currentExecution.currentStep}
              totalSteps={currentExecution.totalSteps}
              status={currentExecution.currentStatus}
              progress={currentExecution.progress}
            />
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {executionResult && (
            <>
              <ExecutionResult result={executionResult} />
              {/* Google Sheets 推送 */}
              {executionResult.createdStrategies.length > 0 && (
                <GoogleSheetsPush
                  linkIds={executionResult.createdStrategies.map(s => s.id)}
                  onPushComplete={() => {
                    toast({
                      title: "推送完成",
                      description: "資料已成功同步到 Google Sheets",
                    });
                  }}
                />
              )}
            </>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}