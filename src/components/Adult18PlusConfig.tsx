'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Adult18PlusConfig as ConfigType } from '@/lib/strategy-types';

interface Adult18PlusConfigProps {
  config: ConfigType;
  onChange: (config: ConfigType) => void;
}

export default function Adult18PlusConfig({
  config,
  onChange,
}: Adult18PlusConfigProps) {
  const updateConfig = (key: keyof ConfigType, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-2">
        <Label htmlFor="adult-title">標題</Label>
        <Input
          id="adult-title"
          value={config.title || ''}
          onChange={(e) => updateConfig('title', e.target.value)}
          placeholder="18 禁內容警告"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adult-warning">警告文字</Label>
        <Input
          id="adult-warning"
          value={config.warningText || ''}
          onChange={(e) => updateConfig('warningText', e.target.value)}
          placeholder="本網站包含成人內容"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adult-description">描述</Label>
        <Textarea
          id="adult-description"
          value={config.description || ''}
          onChange={(e) => updateConfig('description', e.target.value)}
          placeholder="您即將進入包含成人內容的網站，僅限年滿 18 歲（含）以上之成年人瀏覽。"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adult-confirm">確認按鈕文字</Label>
        <Input
          id="adult-confirm"
          value={config.confirmText || ''}
          onChange={(e) => updateConfig('confirmText', e.target.value)}
          placeholder="我已滿 18 歲，進入網站"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adult-cancel">取消按鈕文字</Label>
        <Input
          id="adult-cancel"
          value={config.cancelText || ''}
          onChange={(e) => updateConfig('cancelText', e.target.value)}
          placeholder="離開"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-warning-icon"
          checked={config.showWarningIcon !== false}
          onCheckedChange={(checked) => updateConfig('showWarningIcon', checked)}
        />
        <Label htmlFor="show-warning-icon" className="cursor-pointer">
          顯示警告圖示
        </Label>
      </div>

      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
        <p>💡 <strong>提示</strong>：這個策略會讓所有互動（確認、取消、點擊外面、按 ESC）都導向分潤連結</p>
        <p>🎯 <strong>適用場景</strong>：成人內容、限制級商品、或需要專業合法外觀的推廣</p>
      </div>
    </div>
  );
}
