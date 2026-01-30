'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Crown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMembership, MembershipProvider } from '@/contexts/MembershipContext';

// Usage Stats Card Component
function UsageStatsCard({
  usage,
}: {
  usage: {
    links: { current: number; limit: number };
    strategies: { current: number; limit: number };
    templates: { current: number; limit: number };
  };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">使用統計</CardTitle>
        <CardDescription>您的資源使用情況</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="font-medium">短連結</span>
          <span className="font-semibold text-green-600">
            {usage.links.current} 個
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">自動化機器人</span>
          <span className="font-semibold text-green-600">
            {usage.strategies.current} 個
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">模板使用</span>
          <span className="font-semibold text-green-600">
            {usage.templates.current} 個
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Membership Page Content
function MembershipPageContent() {
  const router = useRouter();
  const { membership, loading, error } = useMembership();
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

  if (isAuthChecking || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !membership) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>載入失敗</CardTitle>
            <CardDescription>無法取得會員資訊，請重新整理頁面</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
              返回首頁
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysRemaining = membership.expireAt
    ? Math.ceil((new Date(membership.expireAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回 Dashboard
            </Button>
            <h1 className="text-4xl font-bold mb-2">會員中心</h1>
            <p className="text-muted-foreground text-lg">查看您的會員狀態</p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Member Status Card */}
            <Card className="border-2 border-purple-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                      <Crown className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">付費會員</CardTitle>
                      <CardDescription>享有所有功能</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2">
                    啟用中
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {membership.expireAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {daysRemaining && daysRemaining > 0 ? (
                      <span>
                        還有 {daysRemaining} 天到期（{new Date(membership.expireAt).toLocaleDateString('zh-TW')}）
                      </span>
                    ) : daysRemaining && daysRemaining <= 0 ? (
                      <span className="text-destructive">已過期</span>
                    ) : null}
                  </div>
                )}
                {!membership.expireAt && (
                  <p className="text-sm text-muted-foreground">永久會員</p>
                )}
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <UsageStatsCard usage={membership.usage} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function MembershipPage() {
  return (
    <MembershipProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }
      >
        <MembershipPageContent />
      </Suspense>
    </MembershipProvider>
  );
}
