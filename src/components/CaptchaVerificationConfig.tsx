'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CaptchaVerificationConfig as ConfigType } from '@/lib/strategy-types';

interface CaptchaVerificationConfigProps {
  config: ConfigType;
  onChange: (config: ConfigType) => void;
}

export default function CaptchaVerificationConfig({
  config,
  onChange,
}: CaptchaVerificationConfigProps) {
  const updateConfig = (key: keyof ConfigType, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-2">
        <Label htmlFor="captcha-title">驗證框標題</Label>
        <Input
          id="captcha-title"
          value={config.title || ''}
          onChange={(e) => updateConfig('title', e.target.value)}
          placeholder="安全驗證"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="captcha-description">驗證框描述</Label>
        <Textarea
          id="captcha-description"
          value={config.description || ''}
          onChange={(e) => updateConfig('description', e.target.value)}
          placeholder="為了保護您的安全，請完成驗證"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="captcha-verify-text">驗證按鈕文字</Label>
        <Input
          id="captcha-verify-text"
          value={config.verifyText || ''}
          onChange={(e) => updateConfig('verifyText', e.target.value)}
          placeholder="我不是機器人"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="captcha-style">驗證風格</Label>
        <Select
          value={config.style || 'google'}
          onValueChange={(value) => updateConfig('style', value as 'google' | 'cloudflare')}
        >
          <SelectTrigger id="captcha-style">
            <SelectValue placeholder="選擇驗證風格" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google">Google reCAPTCHA 風格</SelectItem>
            <SelectItem value="cloudflare">Cloudflare Turnstile 風格</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="captcha-show-spinner" className="flex-1">
          顯示加載動畫
        </Label>
        <Switch
          id="captcha-show-spinner"
          checked={config.showSpinner !== false}
          onCheckedChange={(checked) => updateConfig('showSpinner', checked)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="captcha-delay">驗證後延遲秒數</Label>
        <Input
          id="captcha-delay"
          type="number"
          min="0"
          max="10"
          value={config.delaySeconds || 2}
          onChange={(e) => updateConfig('delaySeconds', parseInt(e.target.value) || 2)}
        />
        <p className="text-xs text-muted-foreground">
          驗證成功後延遲幾秒才跳轉（增加真實感）
        </p>
      </div>
    </div>
  );
}
