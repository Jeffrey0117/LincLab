'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StrategySelector, { type StrategyType } from '@/components/StrategySelector';
import CookieTriggerConfig from '@/components/CookieTriggerConfig';
import CaptchaVerificationConfig from '@/components/CaptchaVerificationConfig';
import ContentUnlockConfig from '@/components/ContentUnlockConfig';
import ImageLinkConfig from '@/components/ImageLinkConfig';
import Adult18PlusConfig from '@/components/Adult18PlusConfig';
import CloudDriveConfig from '@/components/CloudDriveConfig';

interface StrategyStepProps {
  onBack: () => void;
  onSubmit: (strategy: StrategyType, strategyConfig: any) => void;
  initialStrategy?: StrategyType;
  initialConfig?: any;
  loading?: boolean;
  isEditing?: boolean;
}

export default function StrategyStep({
  onBack,
  onSubmit,
  initialStrategy = 'none',
  initialConfig = {},
  loading = false,
  isEditing = false,
}: StrategyStepProps) {
  const [strategy, setStrategy] = useState<StrategyType>(initialStrategy);
  const [strategyConfig, setStrategyConfig] = useState<any>(initialConfig);

  // Sync with initial values
  useEffect(() => {
    setStrategy(initialStrategy);
    setStrategyConfig(initialConfig);
  }, [initialStrategy, initialConfig]);

  const handleSubmit = () => {
    onSubmit(strategy, strategyConfig);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">轉換策略</h2>
            <p className="text-muted-foreground">選擇互動方式來提高點擊率</p>
          </div>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
      </div>

      {/* Strategy Selector */}
      <div className="space-y-4">
        <StrategySelector
          value={strategy}
          onChange={setStrategy}
        />

        {/* Strategy-specific configs */}
        {strategy === 'cookie_popup' && (
          <CookieTriggerConfig
            config={strategyConfig}
            onChange={setStrategyConfig}
          />
        )}

        {strategy === 'captcha_verification' && (
          <CaptchaVerificationConfig
            config={strategyConfig}
            onChange={setStrategyConfig}
          />
        )}

        {strategy === 'content_unlock' && (
          <ContentUnlockConfig
            config={strategyConfig}
            onChange={setStrategyConfig}
          />
        )}

        {strategy === 'image_link' && (
          <ImageLinkConfig
            config={strategyConfig}
            onChange={setStrategyConfig}
          />
        )}

        {strategy === 'adult_18plus' && (
          <Adult18PlusConfig
            config={strategyConfig}
            onChange={setStrategyConfig}
          />
        )}

        {strategy === 'cloud_drive' && (
          <CloudDriveConfig
            config={strategyConfig}
            onChange={setStrategyConfig}
          />
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>提示：</strong>策略會在使用者進入頁面時觸發，引導他們完成特定動作後才會跳轉到分潤連結。
          選擇「無策略」則會直接顯示內容。
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          返回上一步
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-gradient-primary hover:opacity-90"
        >
          {loading ? '處理中...' : isEditing ? '更新連結' : '建立連結'}
        </Button>
      </div>
    </div>
  );
}
