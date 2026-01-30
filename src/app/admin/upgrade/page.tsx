'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

type UpgradeResult = {
  success: boolean;
  user?: {
    id: string;
    tier: string;
    expireAt: string | null;
  };
  log?: any;
  error?: string;
  details?: string;
};

export default function AdminUpgradePage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [tier, setTier] = useState<'PRO' | 'VIP'>('PRO');
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UpgradeResult | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // 檢查管理員權限
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/user/is-admin');
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
          if (!data.isAdmin) {
            router.push('/dashboard');
          }
        } else {
          // 未登入或發生錯誤
          router.push('/auth');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/auth');
      }
    };

    checkAdminStatus();
  }, [router]);

  // 載入中或非管理員
  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const handleUpgrade = async () => {
    if (!userId.trim()) {
      setResult({
        success: false,
        error: '請輸入用戶 ID',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const expireAt =
        tier === 'VIP'
          ? null
          : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

      const response = await fetch('/api/admin/upgrade-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: userId.trim(),
          tier,
          expireAt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '升級失敗');
      }

      setResult({ success: true, ...data });
      // Clear form on success
      setUserId('');
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : '升級失敗',
        details: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateExpireDate = () => {
    if (tier === 'VIP') return '終身';
    const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">管理員升級面板</h1>
        <p className="text-muted-foreground">
          手動升級用戶的會員等級 (僅限管理員)
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>升級用戶</CardTitle>
            <CardDescription>
              填寫用戶資訊並選擇目標會員等級
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">目標用戶 ID *</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="輸入完整的 UUID"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                可從 Supabase 查詢: auth.users 表
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tier">會員等級 *</Label>
              <Select
                value={tier}
                onValueChange={(value) => setTier(value as 'PRO' | 'VIP')}
                disabled={loading}
              >
                <SelectTrigger id="tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRO">PRO 會員</SelectItem>
                  <SelectItem value="VIP">VIP 會員 (終身)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tier === 'PRO' && (
              <div className="space-y-2">
                <Label htmlFor="days">有效天數</Label>
                <Input
                  id="days"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value) || 30)}
                  min={1}
                  max={365}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  過期日期: {calculateExpireDate()}
                </p>
              </div>
            )}

            {tier === 'VIP' && (
              <Alert>
                <AlertDescription>
                  VIP 會員為終身會籍，無需設定過期時間
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleUpgrade}
              disabled={loading || !userId.trim()}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? '升級中...' : '升級用戶'}
            </Button>
          </CardContent>
        </Card>

        {/* Result Card */}
        <Card>
          <CardHeader>
            <CardTitle>執行結果</CardTitle>
            <CardDescription>查看升級操作的詳細結果</CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center py-8 text-muted-foreground">
                執行升級後，結果將顯示在此
              </div>
            ) : result.success ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">升級成功！</span>
                </div>

                {result.user && (
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">用戶 ID:</span>
                      <span className="font-mono text-xs break-all">
                        {result.user.id}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">新等級:</span>
                      <span className="font-semibold">{result.user.tier}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">過期時間:</span>
                      <span>
                        {result.user.expireAt
                          ? new Date(result.user.expireAt).toLocaleString(
                              'zh-TW'
                            )
                          : '終身'}
                      </span>
                    </div>
                  </div>
                )}

                {result.log && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      查看完整日誌
                    </summary>
                    <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                      {JSON.stringify(result.log, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold">升級失敗</span>
                </div>

                <Alert variant="destructive">
                  <AlertDescription>
                    <p className="font-semibold mb-2">{result.error}</p>
                    {result.details && (
                      <p className="text-xs mt-1">{result.details}</p>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Reference Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>快速參考</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h3 className="font-semibold mb-1">查找用戶 ID</h3>
            <code className="block bg-muted p-2 rounded text-xs">
              SELECT id, email FROM auth.users WHERE email = 'user@example.com';
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-1">會員等級說明</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>FREE: 免費版，5 個短連結，1 個機器人</li>
              <li>PRO: 月費制，30 個短連結，2 個機器人</li>
              <li>VIP: 終身制，無上限使用</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-1">注意事項</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>PRO 會員需要設定過期時間</li>
              <li>VIP 會員為終身會籍，無需過期時間</li>
              <li>所有操作都會記錄日誌</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
