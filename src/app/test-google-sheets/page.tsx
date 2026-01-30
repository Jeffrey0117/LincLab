'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { GoogleSheetsPush } from '@/components/robots/GoogleSheetsPush';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function TestGoogleSheetsPage() {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [configStatus, setConfigStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [configMessage, setConfigMessage] = useState('');
  const [testLinkIds, setTestLinkIds] = useState<string[]>([]);

  // 設定 Google Sheets
  const handleSaveConfig = async () => {
    if (!spreadsheetUrl) {
      setConfigMessage('請輸入 Google Sheets URL');
      setConfigStatus('error');
      return;
    }

    setConfigStatus('loading');
    setConfigMessage('');

    try {
      const response = await fetch('/api/integrations/google-sheets/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetUrl,
          sheetName: 'Sheet1'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setConfigStatus('success');
        setConfigMessage('設定已成功儲存！現在可以測試推送功能。');
      } else {
        setConfigStatus('error');
        setConfigMessage(data.error || '設定儲存失敗');
      }
    } catch (error) {
      setConfigStatus('error');
      setConfigMessage('網路錯誤，請稍後再試');
    }
  };

  // 建立測試連結
  const handleCreateTestLinks = async () => {
    setConfigStatus('loading');
    setConfigMessage('建立測試連結中...');

    try {
      // 建立 3 個測試連結
      const mockLinks = [
        {
          title: '測試連結 1',
          original_url: 'https://example.com/test1',
          og_title: '這是第一個測試連結',
          og_description: '測試描述 1',
          og_image: 'https://picsum.photos/400/300?random=1',
          affiliate_url: 'https://shopee.tw/test1'
        },
        {
          title: '測試連結 2',
          original_url: 'https://example.com/test2',
          og_title: '這是第二個測試連結',
          og_description: '測試描述 2',
          og_image: 'https://picsum.photos/400/300?random=2',
          affiliate_url: 'https://shopee.tw/test2'
        },
        {
          title: '測試連結 3',
          original_url: 'https://example.com/test3',
          og_title: '這是第三個測試連結',
          og_description: '測試描述 3',
          og_image: 'https://picsum.photos/400/300?random=3',
          affiliate_url: 'https://shopee.tw/test3'
        }
      ];

      const linkIds: string[] = [];

      for (const linkData of mockLinks) {
        const response = await fetch('/api/links/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(linkData),
        });

        if (response.ok) {
          const data = await response.json();
          linkIds.push(data.id);
        }
      }

      if (linkIds.length > 0) {
        setTestLinkIds(linkIds);
        setConfigStatus('success');
        setConfigMessage(`成功建立 ${linkIds.length} 個測試連結！現在可以測試推送到 Google Sheets。`);
      } else {
        setConfigStatus('error');
        setConfigMessage('無法建立測試連結');
      }
    } catch (error) {
      setConfigStatus('error');
      setConfigMessage('建立測試連結失敗');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Google Sheets 整合測試</h1>

      {/* 步驟 1: 設定 Google Sheets */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>步驟 1: 設定 Google Sheets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sheet-url">Google Sheets URL</Label>
            <Input
              id="sheet-url"
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={spreadsheetUrl}
              onChange={(e) => setSpreadsheetUrl(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              請提供一個公開的 Google Sheets URL（需設定為「任何人都能編輯」）
            </p>
          </div>

          <Button onClick={handleSaveConfig} disabled={configStatus === 'loading'}>
            {configStatus === 'loading' && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            儲存設定
          </Button>

          {configMessage && (
            <Alert variant={configStatus === 'error' ? 'destructive' : 'default'}>
              {configStatus === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{configMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 步驟 2: 建立測試連結 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>步驟 2: 建立測試連結</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            點擊下方按鈕建立 3 個測試連結，用於測試推送功能。
          </p>
          <Button onClick={handleCreateTestLinks} disabled={configStatus === 'loading'}>
            {configStatus === 'loading' && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            建立測試連結
          </Button>

          {testLinkIds.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>測試連結已建立</AlertTitle>
              <AlertDescription>
                連結 IDs: {testLinkIds.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 步驟 3: 測試推送元件 */}
      {testLinkIds.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>步驟 3: 測試推送功能</CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleSheetsPush
              linkIds={testLinkIds}
              onPushComplete={() => {
                console.log('推送完成！');
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* 使用說明 */}
      <Alert>
        <AlertTitle>測試說明</AlertTitle>
        <AlertDescription className="space-y-2 mt-2">
          <p>1. 首先建立一個新的 Google Sheets</p>
          <p>2. 將權限設定為「任何人都能編輯」</p>
          <p>3. 複製 Google Sheets 的 URL 並貼到上方輸入框</p>
          <p>4. 儲存設定後，建立測試連結</p>
          <p>5. 使用推送元件將資料推送到 Google Sheets</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}