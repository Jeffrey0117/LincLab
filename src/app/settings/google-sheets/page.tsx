'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, TestTube, Save, AlertCircle, CheckCircle, BookOpen, ChevronDown, Copy, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function GoogleSheetsSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 認證狀態檢查
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push('/auth');
        }
        setIsAuthChecking(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/auth');
      }
      setIsAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // 狀態管理
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [webappUrl, setWebappUrl] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // 教學區收合狀態
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // 載入現有設定和教學區收合狀態
  useEffect(() => {
    loadConfig();

    // 從 localStorage 載入教學區收合狀態
    const savedTutorialState = localStorage.getItem('googleSheetsTutorialOpen');
    if (savedTutorialState !== null) {
      setIsTutorialOpen(savedTutorialState === 'true');
    }
  }, []);

  // 儲存教學區收合狀態到 localStorage
  const handleTutorialToggle = (open: boolean) => {
    setIsTutorialOpen(open);
    localStorage.setItem('googleSheetsTutorialOpen', open.toString());
  };

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/integrations/google-sheets/config');
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setSheetUrl(data.config.spreadsheet_url || '');
          setSheetName(data.config.sheet_name || 'Sheet1');
          setWebappUrl(data.config.webapp_url || '');
          setIsEnabled(data.config.is_enabled || false);
        }
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      toast({
        title: '載入失敗',
        description: '無法載入現有設定',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 複製文字到剪貼簿
  const copyToClipboard = async (text: string, toastMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: '複製成功',
        description: toastMessage,
      });
    } catch (error) {
      toast({
        title: '複製失敗',
        description: '無法複製到剪貼簿',
        variant: 'destructive',
      });
    }
  };

  // Apps Script 範例程式碼
  const appsScriptCode = `function doPost(e) {
  try {
    // 取得當前的 Spreadsheet 和 Sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 解析 POST 請求的資料
    const data = JSON.parse(e.postData.contents);

    // 新增一行資料
    sheet.appendRow([
      new Date(), // 時間戳記
      data.title || '', // 標題
      data.imageUrl || '', // 圖片連結
      data.affiliateUrl || '', // 分潤連結
      data.platform || '', // 平台來源
      data.category || '', // 分類
      data.originalUrl || '' // 原始連結
    ]);

    // 回傳成功訊息
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Data saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 錯誤處理
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 請求處理（用於測試）
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'OK', message: 'Apps Script is working!' }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  // 測試連接
  const handleTestConnection = async () => {
    if (!sheetUrl) {
      toast({
        title: '請輸入 Sheet URL',
        description: '需要提供 Google Sheet 的 URL 才能進行測試',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/integrations/google-sheets/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetUrl: sheetUrl,
          sheetName: sheetName || 'Sheet1',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: data.message || '連接測試成功！Google Sheet 可以正常使用。',
        });
        toast({
          title: '測試成功',
          description: '已成功連接到 Google Sheet',
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || '無法連接到 Google Sheet，請檢查 URL 和權限設定。',
        });
        toast({
          title: '測試失敗',
          description: data.error || '無法連接到 Google Sheet',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: '測試連接時發生錯誤，請稍後再試。',
      });
      toast({
        title: '測試失敗',
        description: '無法完成連接測試',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // 儲存設定
  const handleSaveConfig = async () => {
    if (!sheetUrl) {
      toast({
        title: '請輸入 Sheet URL',
        description: 'Google Sheet URL 為必填欄位',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/integrations/google-sheets/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetUrl: sheetUrl,
          sheetName: sheetName || 'Sheet1',
          webappUrl,
          isEnabled,
        }),
      });

      if (response.ok) {
        toast({
          title: '儲存成功',
          description: '設定已成功儲存',
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || '儲存失敗');
      }
    } catch (error) {
      toast({
        title: '儲存失敗',
        description: error instanceof Error ? error.message : '無法儲存設定',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 認證檢查中顯示載入
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 頁面標題與返回按鈕 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>

        <h1 className="text-2xl font-bold mb-2">Google Sheets 整合設定</h1>
        <p className="text-sm text-muted-foreground">
          將機器人生成的內容自動推送到 Google Sheet
        </p>
      </div>

      {/* Apps Script 設定教學 */}
      <Card className="mb-6">
        <Collapsible open={isTutorialOpen} onOpenChange={handleTutorialToggle}>
          <CardHeader>
            <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Apps Script 設定教學</CardTitle>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                  isTutorialOpen ? 'rotate-180' : ''
                }`}
              />
            </CollapsibleTrigger>
            <CardDescription className="mt-2 text-sm">
              了解如何設定 Google Apps Script 來接收資料
            </CardDescription>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-6 pt-0">
              {/* 為什麼需要 Apps Script */}
              <Alert className="border-muted">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="space-y-2 text-sm">
                  <strong className="block text-foreground">為什麼需要 Apps Script？</strong>
                  <span className="block text-muted-foreground">• 直接使用 Google Sheets API 需要複雜的 OAuth 設定和權限管理</span>
                  <span className="block text-muted-foreground">• Apps Script 可作為簡單的中介層，接收 HTTP POST 請求並自動寫入 Sheet</span>
                  <span className="block text-muted-foreground">• 不需要管理 API 金鑰或進行身份驗證，部署後即可使用</span>
                </AlertDescription>
              </Alert>

              {/* 設定步驟 */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">設定步驟</h3>

                {/* Step 1 */}
                <div className="border-l-2 border-primary/20 pl-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded">Step 1</span>
                    <span className="text-sm font-medium">開啟 Apps Script 編輯器</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    開啟你的 Google Sheet → 點選上方選單「擴充功能」→「Apps Script」
                  </p>
                </div>

                {/* Step 2 */}
                <div className="border-l-2 border-primary/20 pl-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded">Step 2</span>
                    <span className="text-sm font-medium">貼上接收資料的程式碼</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    將下方的程式碼完整複製並貼到 Apps Script 編輯器中：
                  </p>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      <code>{appsScriptCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(appsScriptCode, '已複製 Apps Script 程式碼')}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      複製
                    </Button>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="border-l-2 border-primary/20 pl-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded">Step 3</span>
                    <span className="text-sm font-medium">部署為 Web App</span>
                  </div>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside ml-2">
                    <li>點擊右上角「部署」→「新增部署」</li>
                    <li>類型選擇「網頁應用程式」</li>
                    <li>執行身分選擇「我」</li>
                    <li>誰可以存取選擇「<strong className="text-foreground">任何人</strong>」（重要！）</li>
                    <li>點擊「部署」按鈕</li>
                  </ol>
                </div>

                {/* Step 4 */}
                <div className="border-l-2 border-primary/20 pl-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded">Step 4</span>
                    <span className="text-sm font-medium">複製部署 URL</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    部署成功後會顯示一個 URL（格式如：https://script.google.com/macros/s/.../exec），
                    將這個 URL 複製並貼到下方的「Apps Script Web App URL」欄位中。
                  </p>
                </div>
              </div>

              {/* 常見問題 */}
              <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
                <CardContent className="pt-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                    常見問題與注意事項
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• 確保 Google Sheet 的共享權限設為「<strong className="text-foreground">知道連結的人可以編輯</strong>」</li>
                    <li>• 每次修改 Apps Script 程式碼後，需要<strong className="text-foreground">重新部署</strong>並取得新的 URL</li>
                    <li>• 部署時如果出現權限要求，請按照提示授權</li>
                    <li>• 資料會自動新增在 Sheet 的最後一行</li>
                  </ul>
                </CardContent>
              </Card>

              {/* 測試提示 */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  完成設定後，記得使用下方的「測試連接」按鈕來確認 Apps Script 是否正常運作。
                </AlertDescription>
              </Alert>

              {/* 外部資源連結 */}
              <div className="pt-2 border-t">
                <a
                  href="https://developers.google.com/apps-script/guides/web"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  查看 Google Apps Script 官方文件
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* 基本設定卡片 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>基本設定</CardTitle>
          <CardDescription>
            設定要使用的 Google Sheet 檔案和工作表
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sheet URL 輸入 */}
          <div className="space-y-2">
            <Label htmlFor="sheet-url">
              Google Sheet URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sheet-url"
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              請提供完整的 Google Sheet URL
            </p>
          </div>

          {/* 工作表名稱輸入 */}
          <div className="space-y-2">
            <Label htmlFor="sheet-name">
              工作表名稱
            </Label>
            <Input
              id="sheet-name"
              type="text"
              placeholder="Sheet1"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              留空將使用預設的 "Sheet1"
            </p>
          </div>

          {/* Web App URL 輸入 */}
          <div className="space-y-2">
            <Label htmlFor="webapp-url">
              Apps Script Web App URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="webapp-url"
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={webappUrl}
              onChange={(e) => setWebappUrl(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              部署 Apps Script 為 Web App 後取得的 URL
            </p>
          </div>

          {/* 測試連接按鈕 */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting || isLoading || !sheetUrl}
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTesting ? '測試中...' : '測試連接'}
            </Button>
          </div>

          {/* 測試結果顯示 */}
          {testResult && (
            <Alert className={testResult.success ? 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800' : 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800'}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
              )}
              <AlertDescription className={testResult.success ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}>
                {testResult.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 推送設定卡片 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>推送設定</CardTitle>
          <CardDescription>
            控制是否自動將內容推送到 Google Sheet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-push">啟用自動推送</Label>
              <p className="text-sm text-muted-foreground">
                當機器人生成新內容時自動推送到 Sheet
              </p>
            </div>
            <Switch
              id="auto-push"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* 提示訊息 */}
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>重要提示：</strong>
          <ul className="mt-2 ml-4 list-disc space-y-1">
            <li>Google Sheet 必須設為「任何知道連結的人都能編輯」才能推送資料</li>
            <li>推送的資料包含：標題、圖片URL、分潤連結、建立時間</li>
            <li>確保 Sheet 有足夠的空間來接收新資料</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* 儲存按鈕 */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveConfig}
          disabled={isLoading || !sheetUrl}
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? '儲存中...' : '儲存設定'}
        </Button>
      </div>
    </div>
  );
}