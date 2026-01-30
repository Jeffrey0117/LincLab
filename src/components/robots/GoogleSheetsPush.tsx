'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Table2,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GoogleSheetsPushProps {
  linkIds: string[];
  onPushComplete?: () => void;
}

interface GoogleSheetsConfig {
  id?: string;
  spreadsheet_id?: string;
  spreadsheet_url?: string;
  sheet_name?: string;
  is_enabled?: boolean;
}

export function GoogleSheetsPush({ linkIds, onPushComplete }: GoogleSheetsPushProps) {
  const router = useRouter();
  const [config, setConfig] = useState<GoogleSheetsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    count?: number;
    error?: string;
  } | null>(null);

  // 檢查 Google Sheets 設定
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/integrations/google-sheets/config');
        if (response.ok) {
          const data = await response.json();
          setConfig(data.config || {});
        } else {
          setConfig({});
        }
      } catch (error) {
        console.error('Error checking Google Sheets config:', error);
        setConfig({});
      } finally {
        setIsLoading(false);
      }
    };

    checkConfig();
  }, []);

  // 執行推送
  const handlePush = async () => {
    if (linkIds.length === 0) {
      toast({
        title: "沒有資料可推送",
        description: "請先執行機器人生成短連結",
        variant: "destructive"
      });
      return;
    }

    setIsPushing(true);
    setPushResult(null);

    try {
      const response = await fetch('/api/integrations/google-sheets/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkIds: linkIds
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPushResult({
          success: true,
          count: linkIds.length
        });

        toast({
          title: "推送成功",
          description: `成功推送 ${linkIds.length} 筆資料到 Google Sheets`,
        });

        if (onPushComplete) {
          onPushComplete();
        }
      } else {
        setPushResult({
          success: false,
          error: data.error || '推送失敗'
        });

        toast({
          title: "推送失敗",
          description: data.error || '無法推送資料到 Google Sheets',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error pushing to Google Sheets:', error);
      setPushResult({
        success: false,
        error: '網路錯誤，請稍後再試'
      });

      toast({
        title: "推送失敗",
        description: "網路錯誤，請稍後再試",
        variant: "destructive"
      });
    } finally {
      setIsPushing(false);
    }
  };

  // 開啟 Google Sheet
  const handleOpenSheet = () => {
    if (config?.spreadsheet_url) {
      window.open(config.spreadsheet_url, '_blank');
    }
  };

  // 前往設定頁面
  const handleGoToSettings = () => {
    router.push('/settings/integrations');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // 未設定 Google Sheets
  if (!config?.spreadsheet_id || !config?.is_enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Table2 className="w-5 h-5 mr-2" />
            Google Sheets 推送
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              尚未設定 Google Sheets 整合
            </p>
            <Button onClick={handleGoToSettings} variant="outline">
              前往設定
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 已設定 Google Sheets
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Table2 className="w-5 h-5 mr-2" />
            Google Sheets 推送
          </div>
          <Badge variant="outline" className="ml-2">
            <CheckCircle className="w-3 h-3 mr-1" />
            已啟用
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 推送狀態 */}
        {!isPushing && !pushResult && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              準備推送 {linkIds.length} 筆資料到 Google Sheets
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handlePush}
                disabled={linkIds.length === 0}
                className="flex-1"
              >
                <Table2 className="w-4 h-4 mr-2" />
                推送 {linkIds.length} 筆資料到 Sheet
              </Button>
              <Button
                onClick={handleOpenSheet}
                variant="outline"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* 推送中 */}
        {isPushing && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              正在推送資料...
            </p>
          </div>
        )}

        {/* 推送結果 */}
        {pushResult && (
          <div>
            {pushResult.success ? (
              <div className="space-y-4">
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    成功推送 {pushResult.count} 筆資料
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleOpenSheet}
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    開啟 Google Sheet
                  </Button>
                  <Button
                    onClick={handlePush}
                    variant="outline"
                  >
                    再次推送
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    {pushResult.error || '推送失敗'}
                  </span>
                </div>
                <Button
                  onClick={handlePush}
                  variant="outline"
                  className="w-full"
                >
                  重新嘗試
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}