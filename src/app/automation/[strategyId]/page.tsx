'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StrategyDetail } from '@/components/automation/StrategyDetail';
import { getStrategyById } from '@/lib/automation-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, Copy, ExternalLink, Share2, Download, Heart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

export default function StrategyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const strategyId = params.strategyId as string;

  // 優先從 automation-data 取得策略
  let strategy = getStrategyById(strategyId);

  // 如果找不到，檢查是否是機器人生成的策略（以 'new-' 或 'strategy-' 開頭）
  if (!strategy && (strategyId.startsWith('new-') || strategyId.startsWith('strategy-'))) {
    // 模擬機器人生成的策略數據
    const mockRobotStrategy = {
      id: strategyId,
      title: '[正妹] 氣質長髮美女',
      description: '來自 PTT 表特版的精選正妹圖片，點擊查看更多精彩內容！',
      imageUrl: `https://picsum.photos/400/600?random=${strategyId}`,
      sourceUrl: 'https://www.ptt.cc/bbs/Beauty/index.html',
      createdAt: new Date(),
      views: 1234,
      likes: 89,
      shares: 23,
      affiliateLink: 'https://shopee.tw/...',
      tags: ['正妹', 'PTT', '表特版'],
      isRobotGenerated: true
    };

    // 渲染機器人生成的策略
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左側：圖片預覽 */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="aspect-[3/4] relative">
                <img
                  src={mockRobotStrategy.imageUrl}
                  alt={mockRobotStrategy.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Badge className="bg-black/50 text-white backdrop-blur">
                    機器人生成
                  </Badge>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold">{mockRobotStrategy.views}</p>
                  <p className="text-sm text-gray-500">瀏覽次數</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold">{mockRobotStrategy.likes}</p>
                  <p className="text-sm text-gray-500">按讚數</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold">{mockRobotStrategy.shares}</p>
                  <p className="text-sm text-gray-500">分享次數</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 右側：策略資訊 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{mockRobotStrategy.title}</CardTitle>
                <CardDescription>{mockRobotStrategy.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {mockRobotStrategy.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">來源</p>
                  <a
                    href={mockRobotStrategy.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    PTT 表特版
                  </a>
                </div>

                {mockRobotStrategy.affiliateLink && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">關聯商品</p>
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <p className="text-sm font-medium">已配置蝦皮分潤連結</p>
                      <p className="text-xs text-gray-500 mt-1">
                        用戶點擊後將導向您的分潤商品頁
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => router.push(`/dashboard?strategy=${strategyId}`)}
              >
                <Heart className="w-4 h-4 mr-2" />
                立即使用此策略
              </Button>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    const url = `${window.location.origin}/s/${strategyId}`;
                    navigator.clipboard.writeText(url);
                    toast({
                      title: '已複製連結',
                      description: '策略卡片連結已複製到剪貼簿'
                    });
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  複製
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: mockRobotStrategy.title,
                        text: mockRobotStrategy.description,
                        url: window.location.href
                      });
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  分享
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: '下載功能',
                      description: '此功能即將推出'
                    });
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  下載
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 原有策略的處理
  if (!strategy) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>找不到策略</AlertTitle>
          <AlertDescription>
            您要查看的策略不存在或已被移除。
          </AlertDescription>
        </Alert>
        <Button
          className="mt-4"
          onClick={() => router.push('/automation')}
        >
          返回策略列表
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <StrategyDetail strategy={strategy} />
    </div>
  );
}