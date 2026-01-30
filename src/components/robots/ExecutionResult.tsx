'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  AlertCircle,
  TrendingUp,
  Image
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ExecutionLog } from '@/lib/robot-mock-data';
import { cn } from '@/lib/utils';

interface ExecutionResultProps {
  result: ExecutionLog;
  onViewStrategy?: (strategyId: string) => void;
}

export function ExecutionResult({ result, onViewStrategy }: ExecutionResultProps) {
  const router = useRouter();
  const successRate = result.targetCount > 0
    ? Math.round((result.successCount / result.targetCount) * 100)
    : 0;

  const handleViewStrategy = (strategy: any) => {
    // 如果有 shortCode，直接打開短連結預覽
    if (strategy.shortCode) {
      window.open(`/${strategy.shortCode}`, '_blank');
    } else if (onViewStrategy) {
      onViewStrategy(strategy.id);
    } else {
      router.push(`/automation/${strategy.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">成功</p>
                <p className="text-2xl font-bold text-green-600">{result.successCount}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">失敗</p>
                <p className="text-2xl font-bold text-red-600">{result.failedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">成功率</p>
                <p className="text-2xl font-bold">{successRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">耗時</p>
                <p className="text-2xl font-bold">{result.durationSeconds}s</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 成功的卡片預覽 */}
      {result.createdStrategies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
              成功生成的策略卡片
            </CardTitle>
            <CardDescription>
              點擊卡片可查看詳情並使用
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {result.createdStrategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className="group cursor-pointer"
                  onClick={() => handleViewStrategy(strategy)}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all">
                    <div className="aspect-[3/4] relative bg-gray-100 dark:bg-gray-800">
                      {strategy.imageUrl ? (
                        <img
                          src={strategy.imageUrl}
                          alt={strategy.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-sm font-medium line-clamp-2">
                            {strategy.title}
                          </p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium line-clamp-1">{strategy.title}</p>
                      {(strategy as any).shortUrl && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {(strategy as any).shortUrl}
                        </p>
                      )}
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewStrategy(strategy);
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        {(strategy as any).shortCode ? '預覽短連結' : '立即使用'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 錯誤列表 */}
      {result.errors.length > 0 && (
        <Alert className="border-red-500/20 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 dark:text-red-400">執行過程中的錯誤</AlertTitle>
          <AlertDescription className="mt-2">
            <ul className="space-y-1">
              {result.errors.map((error, index) => (
                <li key={index} className="flex items-center text-sm text-red-700 dark:text-red-300">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* 執行摘要 */}
      <Card className={cn(
        "border-2",
        result.status === 'completed' ? "border-green-500/20" : "border-red-500/20"
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              {result.status === 'completed' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                  執行完成
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 mr-2 text-red-500" />
                  執行失敗
                </>
              )}
            </CardTitle>
            <Badge variant={result.status === 'completed' ? 'default' : 'destructive'}>
              {result.status === 'completed' ? '成功' : '失敗'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">目標數量：</span>
              <span className="font-medium">{result.targetCount} 篇</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">成功處理：</span>
              <span className="font-medium text-green-600">{result.successCount} 篇</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">失敗數量：</span>
              <span className="font-medium text-red-600">{result.failedCount} 篇</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">總耗時：</span>
              <span className="font-medium">{result.durationSeconds} 秒</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}