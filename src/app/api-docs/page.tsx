'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Send, CheckCircle, AlertCircle, Code2, FileJson, Server, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const ApiDocs = () => {
  const { toast } = useToast();
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // 測試表單狀態
  const [testForm, setTestForm] = useState({
    title: '',
    affiliateUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    strategy: 'cookie',
    accountId: '',
    tags: '',
    faviconUrl: '',
    targetUrl: '',
    useTemplate: true,
    htmlContent: ''
  });

  // 複製到剪貼簿
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "已複製",
      description: "已複製到剪貼簿",
    });
  };

  // 發送測試請求
  const handleTest = async () => {
    // 驗證必填欄位
    if (!testForm.title || !testForm.affiliateUrl) {
      setTestError('請填寫必填欄位：title 和 affiliateUrl');
      return;
    }

    setTestLoading(true);
    setTestError(null);
    setTestResult(null);

    try {
      // 處理 tags 字串轉陣列
      const tags = testForm.tags
        ? testForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      const requestBody = {
        title: testForm.title,
        affiliateUrl: testForm.affiliateUrl,
        ...(testForm.ogTitle && { ogTitle: testForm.ogTitle }),
        ...(testForm.ogDescription && { ogDescription: testForm.ogDescription }),
        ...(testForm.ogImage && { ogImage: testForm.ogImage }),
        strategy: testForm.strategy,
        ...(testForm.accountId && { accountId: testForm.accountId }),
        ...(tags.length > 0 && { tags }),
        ...(testForm.faviconUrl && { faviconUrl: testForm.faviconUrl }),
        ...(testForm.targetUrl && { targetUrl: testForm.targetUrl }),
        useTemplate: testForm.useTemplate,
        ...(testForm.htmlContent && !testForm.useTemplate && { htmlContent: testForm.htmlContent })
      };

      const response = await fetch('/api/links/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult(data);
        toast({
          title: "請求成功",
          description: "API 請求成功執行",
        });
      } else {
        // 處理 401 認證錯誤
        if (response.status === 401) {
          setTestError('認證失敗：請先前往 Dashboard 頁面登入，登入後即可使用 API 測試功能。');
        } else {
          setTestError(data.error || `API 請求失敗 (${response.status})`);
        }
      }
    } catch (error: any) {
      setTestError(error.message || '發生錯誤');
    } finally {
      setTestLoading(false);
    }
  };

  // 範例請求代碼
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com';
  const curlExample = `curl -X POST ${origin}/api/links/create \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "限時優惠！iPhone 15 Pro Max 超值套餐",
    "affiliateUrl": "https://shopee.tw/product/123456789",
    "ogTitle": "iPhone 15 Pro Max - 限時特價中",
    "ogDescription": "全新 iPhone 15 Pro Max 現正熱賣，限時優惠不容錯過",
    "ogImage": "https://example.com/iphone15.jpg",
    "strategy": "cookie",
    "accountId": "acc_12345",
    "tags": ["手機", "優惠", "iPhone"],
    "faviconUrl": "https://example.com/favicon.ico"
  }'`;

  const responseExample = {
    "success": true,
    "data": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "short_code": "abc123",
      "title": "限時優惠！iPhone 15 Pro Max 超值套餐",
      "affiliate_url": "https://shopee.tw/product/123456789",
      "og_title": "iPhone 15 Pro Max - 限時特價中",
      "og_description": "全新 iPhone 15 Pro Max 現正熱賣，限時優惠不容錯過",
      "og_image": "https://example.com/iphone15.jpg",
      "strategy": "cookie",
      "account_id": "acc_12345",
      "tags": ["手機", "優惠", "iPhone"],
      "favicon_url": "https://example.com/favicon.ico",
      "created_at": "2024-11-19T10:30:00.000Z",
      "is_active": true,
      "click_count": 0
    },
    "shortUrl": "https://yourdomain.com/abc123"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 頂部標題 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Code2 className="h-10 w-10 text-primary" />
            Link Cloak API Documentation
          </h1>
          <p className="text-muted-foreground text-lg">
            完整的 API 文檔，讓您輕鬆整合短連結生成功能
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview">總覽</TabsTrigger>
            <TabsTrigger value="parameters">參數說明</TabsTrigger>
            <TabsTrigger value="examples">範例</TabsTrigger>
            <TabsTrigger value="test">測試</TabsTrigger>
          </TabsList>

          {/* 總覽標籤 */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  API Endpoint
                </CardTitle>
                <CardDescription>
                  使用此端點創建新的短連結
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    POST
                  </Badge>
                  <code className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm">
                    /api/links/create
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard('/api/links/create')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">請求標頭</h3>
                  <div className="bg-muted rounded-md p-3 font-mono text-sm">
                    Content-Type: application/json
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">認證</h3>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>注意</AlertTitle>
                    <AlertDescription>
                      目前 API 不需要認證即可使用。未來版本可能會加入 API Key 認證機制。
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>快速開始</CardTitle>
                <CardDescription>
                  只需要發送包含 title 和 affiliateUrl 的 JSON 請求即可創建短連結
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 text-slate-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre">{`{
  "title": "您的連結標題",
  "affiliateUrl": "https://shopee.tw/your-product"
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 參數說明標籤 */}
          <TabsContent value="parameters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>請求參數</CardTitle>
                <CardDescription>
                  所有可用的請求參數及其說明
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-semibold">參數名稱</th>
                        <th className="text-left p-2 font-semibold">類型</th>
                        <th className="text-left p-2 font-semibold">必填</th>
                        <th className="text-left p-2 font-semibold">預設值</th>
                        <th className="text-left p-2 font-semibold">說明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr className="hover:bg-muted/50">
                        <td className="p-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">title</code>
                        </td>
                        <td className="p-2 text-muted-foreground">string</td>
                        <td className="p-2">
                          <Badge variant="destructive" className="text-xs">必填</Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">-</td>
                        <td className="p-2">連結卡片標題，會顯示在預覽頁面中</td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="p-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">affiliateUrl</code>
                        </td>
                        <td className="p-2 text-muted-foreground">string</td>
                        <td className="p-2">
                          <Badge variant="destructive" className="text-xs">必填</Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">-</td>
                        <td className="p-2">聯盟連結網址，使用者最終會被導向此網址</td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="p-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">ogTitle</code>
                        </td>
                        <td className="p-2 text-muted-foreground">string</td>
                        <td className="p-2">
                          <Badge variant="secondary" className="text-xs">選填</Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">-</td>
                        <td className="p-2">Open Graph 標題，用於社群媒體分享</td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="p-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">ogDescription</code>
                        </td>
                        <td className="p-2 text-muted-foreground">string</td>
                        <td className="p-2">
                          <Badge variant="secondary" className="text-xs">選填</Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">-</td>
                        <td className="p-2">Open Graph 描述，用於社群媒體分享</td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="p-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">ogImage</code>
                        </td>
                        <td className="p-2 text-muted-foreground">string</td>
                        <td className="p-2">
                          <Badge variant="secondary" className="text-xs">選填</Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">-</td>
                        <td className="p-2">Open Graph 圖片 URL，用於社群媒體分享預覽</td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="p-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">strategy</code>
                        </td>
                        <td className="p-2 text-muted-foreground">string</td>
                        <td className="p-2">
                          <Badge variant="secondary" className="text-xs">選填</Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">"cookie"</td>
                        <td className="p-2">
                          <div className="space-y-1">
                            <div>轉址策略類型：</div>
                            <ul className="text-xs space-y-0.5 ml-4">
                              <li>• <code className="bg-muted px-1 rounded">cookie</code> - 設置 cookie 後轉址</li>
                              <li>• <code className="bg-muted px-1 rounded">redirect</code> - 直接外部轉址</li>
                              <li>• <code className="bg-muted px-1 rounded">iframe</code> - iframe 嵌入</li>
                              <li>• <code className="bg-muted px-1 rounded">meta-refresh</code> - meta refresh 轉址</li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="p-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">accountId</code>
                        </td>
                        <td className="p-2 text-muted-foreground">string</td>
                        <td className="p-2">
                          <Badge variant="secondary" className="text-xs">選填</Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">-</td>
                        <td className="p-2">關聯的帳號 ID，用於分組管理</td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="p-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">tags</code>
                        </td>
                        <td className="p-2 text-muted-foreground">string[]</td>
                        <td className="p-2">
                          <Badge variant="secondary" className="text-xs">選填</Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">[]</td>
                        <td className="p-2">標籤陣列，用於分類和搜尋</td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="p-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">faviconUrl</code>
                        </td>
                        <td className="p-2 text-muted-foreground">string</td>
                        <td className="p-2">
                          <Badge variant="secondary" className="text-xs">選填</Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">-</td>
                        <td className="p-2">Favicon 圖示 URL，顯示在瀏覽器標籤</td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="p-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">targetUrl</code>
                        </td>
                        <td className="p-2 text-muted-foreground">string</td>
                        <td className="p-2">
                          <Badge variant="secondary" className="text-xs">選填</Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">-</td>
                        <td className="p-2">外部連結預覽的目標 URL，用於 external_link 模板顯示預覽</td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="p-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">htmlContent</code>
                        </td>
                        <td className="p-2 text-muted-foreground">string</td>
                        <td className="p-2">
                          <Badge variant="secondary" className="text-xs">選填</Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">-</td>
                        <td className="p-2">自定義 HTML 內容，當 useTemplate=false 時使用</td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="p-2">
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">useTemplate</code>
                        </td>
                        <td className="p-2 text-muted-foreground">boolean</td>
                        <td className="p-2">
                          <Badge variant="secondary" className="text-xs">選填</Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">true</td>
                        <td className="p-2">是否使用外部連結預覽模板</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>回應格式</CardTitle>
                <CardDescription>
                  成功和錯誤回應的格式說明
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm mb-2 text-green-600 dark:text-green-400">成功回應 (200 OK)</h3>
                  <div className="bg-slate-900 text-slate-50 rounded-lg p-4 font-mono text-xs">
                    <pre>{JSON.stringify({
                      success: true,
                      data: {
                        id: "uuid",
                        short_code: "string",
                        title: "string",
                        // ... 其他欄位
                      },
                      shortUrl: "完整的短連結網址"
                    }, null, 2)}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2 text-red-600 dark:text-red-400">錯誤回應 (4xx/5xx)</h3>
                  <div className="bg-slate-900 text-slate-50 rounded-lg p-4 font-mono text-xs">
                    <pre>{JSON.stringify({
                      success: false,
                      error: "錯誤訊息描述"
                    }, null, 2)}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 範例標籤 */}
          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>cURL 範例</CardTitle>
                <CardDescription>
                  使用 cURL 發送 API 請求的完整範例
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <div className="bg-slate-900 text-slate-50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <pre>{curlExample}</pre>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(curlExample)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    複製
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>JavaScript/Fetch 範例</CardTitle>
                <CardDescription>
                  在瀏覽器或 Node.js 中使用
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="bg-slate-900 text-slate-50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <pre>{`fetch('${origin}/api/links/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: '限時優惠！iPhone 15 Pro Max 超值套餐',
    affiliateUrl: 'https://shopee.tw/product/123456789',
    ogTitle: 'iPhone 15 Pro Max - 限時特價中',
    ogDescription: '全新 iPhone 15 Pro Max 現正熱賣',
    strategy: 'cookie',
    tags: ['手機', '優惠', 'iPhone']
  })
})
.then(response => response.json())
.then(data => {
  console.log('短連結已創建:', data.shortUrl);
})
.catch(error => {
  console.error('錯誤:', error);
});`}</pre>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(`fetch('${origin}/api/links/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: '限時優惠！iPhone 15 Pro Max 超值套餐',
    affiliateUrl: 'https://shopee.tw/product/123456789',
    ogTitle: 'iPhone 15 Pro Max - 限時特價中',
    ogDescription: '全新 iPhone 15 Pro Max 現正熱賣',
    strategy: 'cookie',
    tags: ['手機', '優惠', 'iPhone']
  })
})
.then(response => response.json())
.then(data => {
  console.log('短連結已創建:', data.shortUrl);
})
.catch(error => {
  console.error('錯誤:', error);
});`)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    複製
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  回應範例
                </CardTitle>
                <CardDescription>
                  成功創建短連結後的回應內容
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="bg-slate-900 text-slate-50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <pre>{JSON.stringify(responseExample, null, 2)}</pre>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(JSON.stringify(responseExample, null, 2))}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    複製
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 測試標籤 */}
          <TabsContent value="test" className="space-y-6">
            {/* 認證提示警告 */}
            <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800 dark:text-yellow-400">認證提示</AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                <div className="space-y-2 mt-2">
                  <p>請注意：此 API 需要用戶登入後才能使用。</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>如果您尚未登入，請先前往 <a href="/dashboard" className="underline font-medium hover:text-yellow-800 dark:hover:text-yellow-200">Dashboard</a> 進行登入</li>
                    <li>登入後會自動設置認證 Cookie，即可正常使用 API</li>
                    <li>如果看到 401 錯誤，表示您需要重新登入</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>互動式 API 測試</CardTitle>
                <CardDescription>
                  填寫參數並即時測試 API 端點
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 必填欄位 */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-1">
                      title
                      <Badge variant="destructive" className="text-xs h-5">必填</Badge>
                    </Label>
                    <Input
                      id="title"
                      placeholder="限時優惠！商品名稱"
                      value={testForm.title}
                      onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="affiliateUrl" className="flex items-center gap-1">
                      affiliateUrl
                      <Badge variant="destructive" className="text-xs h-5">必填</Badge>
                    </Label>
                    <Input
                      id="affiliateUrl"
                      placeholder="https://shopee.tw/product/123"
                      value={testForm.affiliateUrl}
                      onChange={(e) => setTestForm({ ...testForm, affiliateUrl: e.target.value })}
                    />
                  </div>

                  {/* 選填欄位 */}
                  <div className="space-y-2">
                    <Label htmlFor="ogTitle">ogTitle</Label>
                    <Input
                      id="ogTitle"
                      placeholder="OG 標題（選填）"
                      value={testForm.ogTitle}
                      onChange={(e) => setTestForm({ ...testForm, ogTitle: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogDescription">ogDescription</Label>
                    <Input
                      id="ogDescription"
                      placeholder="OG 描述（選填）"
                      value={testForm.ogDescription}
                      onChange={(e) => setTestForm({ ...testForm, ogDescription: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogImage">ogImage</Label>
                    <Input
                      id="ogImage"
                      placeholder="https://example.com/image.jpg"
                      value={testForm.ogImage}
                      onChange={(e) => setTestForm({ ...testForm, ogImage: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="strategy">strategy</Label>
                    <Select
                      value={testForm.strategy}
                      onValueChange={(value) => setTestForm({ ...testForm, strategy: value })}
                    >
                      <SelectTrigger id="strategy">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cookie">cookie - 設置 cookie 後轉址</SelectItem>
                        <SelectItem value="redirect">redirect - 直接外部轉址</SelectItem>
                        <SelectItem value="iframe">iframe - iframe 嵌入</SelectItem>
                        <SelectItem value="meta-refresh">meta-refresh - meta refresh 轉址</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountId">accountId</Label>
                    <Input
                      id="accountId"
                      placeholder="acc_12345（選填）"
                      value={testForm.accountId}
                      onChange={(e) => setTestForm({ ...testForm, accountId: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags" className="flex items-center gap-1">
                      tags
                      <span className="text-xs text-muted-foreground">（逗號分隔）</span>
                    </Label>
                    <Input
                      id="tags"
                      placeholder="手機, 優惠, 限時"
                      value={testForm.tags}
                      onChange={(e) => setTestForm({ ...testForm, tags: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faviconUrl">faviconUrl</Label>
                    <Input
                      id="faviconUrl"
                      placeholder="https://example.com/favicon.ico"
                      value={testForm.faviconUrl}
                      onChange={(e) => setTestForm({ ...testForm, faviconUrl: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetUrl">targetUrl</Label>
                    <Input
                      id="targetUrl"
                      placeholder="https://example.com/product（選填）"
                      value={testForm.targetUrl}
                      onChange={(e) => setTestForm({ ...testForm, targetUrl: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="useTemplate"
                        checked={testForm.useTemplate}
                        onCheckedChange={(checked) => setTestForm({ ...testForm, useTemplate: checked as boolean })}
                      />
                      <Label htmlFor="useTemplate" className="text-sm font-normal cursor-pointer">
                        使用外部連結預覽模板 (勾選=使用模板，不勾選=自定義 HTML)
                      </Label>
                    </div>
                  </div>

                  {!testForm.useTemplate && (
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="htmlContent">htmlContent (自定義 HTML 內容)</Label>
                      <Textarea
                        id="htmlContent"
                        placeholder="輸入自定義 HTML 內容..."
                        value={testForm.htmlContent}
                        onChange={(e) => setTestForm({ ...testForm, htmlContent: e.target.value })}
                        className="min-h-[120px] font-mono text-sm"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex flex-wrap gap-3 items-center">
                  <Button
                    onClick={handleTest}
                    disabled={testLoading || !testForm.title || !testForm.affiliateUrl}
                    className="min-w-32"
                  >
                    {testLoading ? (
                      <>載入中...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        發送請求
                      </>
                    )}
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => {
                      setTestForm({
                        title: '快速測試 - Redirect 策略',
                        affiliateUrl: 'https://www.google.com',
                        ogTitle: '測試 OG 標題',
                        ogDescription: '這是一個測試連結，使用 redirect 策略',
                        ogImage: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
                        strategy: 'redirect',
                        accountId: '',
                        tags: '測試, redirect',
                        faviconUrl: '',
                        targetUrl: 'https://www.example.com/product-preview',
                        useTemplate: true,
                        htmlContent: ''
                      });
                      setTestResult(null);
                      setTestError(null);
                    }}
                  >
                    填入範例 (Redirect)
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setTestForm({
                        title: '',
                        affiliateUrl: '',
                        ogTitle: '',
                        ogDescription: '',
                        ogImage: '',
                        strategy: 'cookie',
                        accountId: '',
                        tags: '',
                        faviconUrl: '',
                        targetUrl: '',
                        useTemplate: true,
                        htmlContent: ''
                      });
                      setTestResult(null);
                      setTestError(null);
                    }}
                  >
                    清除
                  </Button>
                </div>

                {/* 測試結果 */}
                {testError && (
                  <Alert variant={testError.includes('認證失敗') ? 'default' : 'destructive'}
                    className={testError.includes('認證失敗') ? 'border-orange-200 bg-orange-50 dark:bg-orange-950/30' : ''}>
                    <AlertCircle className={`h-4 w-4 ${testError.includes('認證失敗') ? 'text-orange-600' : ''}`} />
                    <AlertTitle className={testError.includes('認證失敗') ? 'text-orange-800 dark:text-orange-400' : ''}>
                      {testError.includes('認證失敗') ? '需要登入' : '錯誤'}
                    </AlertTitle>
                    <AlertDescription className={testError.includes('認證失敗') ? 'text-orange-700 dark:text-orange-300' : ''}>
                      <div className="space-y-2">
                        <p>{testError}</p>
                        {testError.includes('認證失敗') && (
                          <div className="mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="border-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                            >
                              <a href="/dashboard">
                                前往 Dashboard 登入
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {testResult && (
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800 dark:text-green-400">請求成功</AlertTitle>
                    <AlertDescription className="mt-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">短連結：</span>
                          <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded border text-sm">
                            {testResult.shortUrl}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(testResult.shortUrl)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <ScrollArea className="h-48 mt-3 w-full rounded-md border bg-white dark:bg-gray-900 p-3">
                        <pre className="text-xs font-mono">
                          {JSON.stringify(testResult, null, 2)}
                        </pre>
                      </ScrollArea>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ApiDocs;