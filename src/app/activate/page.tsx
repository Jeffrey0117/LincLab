'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key } from 'lucide-react';

export default function ActivatePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Key className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">啟用會員</CardTitle>
          <CardDescription>
            請聯繫管理員開通您的 VIP 會員資格。
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Self-hosted 部署模式下，所有用戶自動擁有完整功能。
            </p>
            <Button
              className="w-full"
              onClick={() => router.push('/auth')}
            >
              前往登入
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
