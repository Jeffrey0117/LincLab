'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye, Sparkles, Plus } from 'lucide-react';
import Link from 'next/link';
import { strategies } from '@/components/StrategySelector';
import CaptchaVerification from '@/components/strategies/CaptchaVerification';
import ContentUnlock from '@/components/strategies/ContentUnlock';
import ImageLink from '@/components/strategies/ImageLink';

export default function TemplatesPage() {
  const router = useRouter();
  const [previewStrategy, setPreviewStrategy] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const demoAffiliateUrl = 'https://shp.ee/example';

  const handlePreview = (strategyId: string) => {
    setPreviewStrategy(strategyId);
    setShowPreview(true);
  };

  const handleUseTemplate = (strategyId: string) => {
    // Navigate to dashboard with strategy pre-selected
    router.push(`/dashboard?strategy=${strategyId}`);
  };

  const renderPreview = () => {
    if (!previewStrategy) return null;

    const commonProps = {
      affiliateUrl: demoAffiliateUrl,
      onVerified: () => setShowPreview(false),
      onUnlocked: () => setShowPreview(false),
      onExpired: () => {},
    };

    switch (previewStrategy) {
      case 'captcha_verification':
        return <CaptchaVerification {...commonProps} />;
      case 'content_unlock':
        return <ContentUnlock {...commonProps} />;
      // case 'countdown_timer':
      //   return <CountdownTimer {...commonProps} />;
      // case 'social_proof':
      //   return <SocialProof affiliateUrl={demoAffiliateUrl} />;
      // case 'download_button':
      //   return <DownloadButton {...commonProps} />;
      case 'image_link':
        return <ImageLink affiliateUrl={demoAffiliateUrl} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回控制台
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">轉換策略展示</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            瀏覽並預覽所有可用的轉換策略，找到最適合你的方案
          </p>
        </div>

        {/* Strategy Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((strategy) => (
            <Card
              key={strategy.id}
              className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{strategy.icon}</div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {strategy.name}
                        {strategy.recommended && (
                          <Badge variant="default" className="bg-green-600">
                            推薦
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2 line-clamp-3">
                  {strategy.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handlePreview(strategy.id)}
                    className="w-full"
                    variant={strategy.recommended ? 'default' : 'outline'}
                    disabled={!strategy.implemented}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {strategy.implemented ? '預覽效果' : '即將推出'}
                  </Button>
                  {strategy.implemented && (
                    <Button
                      onClick={() => handleUseTemplate(strategy.id)}
                      className="w-full"
                      variant="secondary"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      使用此模板
                    </Button>
                  )}
                </div>
              </CardContent>

              {/* Decorative gradient */}
              {strategy.recommended && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-full" />
              )}
            </Card>
          ))}
        </div>

        {/* Cookie Popup 特別說明 */}
        <Card className="mt-8 border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🍪 Cookie 同意彈窗
              <Badge variant="secondary">已整合在系統中</Badge>
            </CardTitle>
            <CardDescription>
              Cookie 彈窗策略已經在創建連結時可以配置，可以自訂觸發方式（立即、延遲、滾動、離開意圖等）
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Tips Section */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>💡 使用建議</CardTitle>
            <div className="text-sm text-foreground/80 space-y-2 mt-2">
              <p><strong>強制性最高：</strong>安全驗證、年齡驗證、內容解鎖 - 適合需要 100% 觸及率的情境</p>
              <p><strong>自然融入：</strong>社交證明 - 持續運作，不打斷使用者體驗</p>
              <p><strong>促銷感較重：</strong>倒計時、下載按鈕 - 適合限時優惠或特定場景</p>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Preview Overlay */}
      {showPreview && (
        <div className="fixed inset-0 bg-background z-50">
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              onClick={() => previewStrategy && handleUseTemplate(previewStrategy)}
              variant="default"
            >
              <Plus className="mr-2 h-4 w-4" />
              使用此模板
            </Button>
            <Button onClick={() => setShowPreview(false)} variant="outline">
              關閉預覽
            </Button>
          </div>
          <div className="h-full flex items-center justify-center">
            {renderPreview()}
          </div>
        </div>
      )}
    </div>
  );
}
