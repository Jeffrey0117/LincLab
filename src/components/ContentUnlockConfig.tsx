'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ContentUnlockConfig as ConfigType } from '@/lib/strategy-types';

interface ContentUnlockConfigProps {
  config: ConfigType;
  onChange: (config: ConfigType) => void;
}

export default function ContentUnlockConfig({
  config,
  onChange,
}: ContentUnlockConfigProps) {
  const updateConfig = (key: keyof ConfigType, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-2">
        <Label htmlFor="unlock-title">標題</Label>
        <Input
          id="unlock-title"
          value={config.title || ''}
          onChange={(e) => updateConfig('title', e.target.value)}
          placeholder="請確認您已閱讀以下內容"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unlock-description">描述</Label>
        <Textarea
          id="unlock-description"
          value={config.description || ''}
          onChange={(e) => updateConfig('description', e.target.value)}
          placeholder="為了確保您了解相關資訊，請仔細閱讀以下內容"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unlock-content">內容/條款</Label>
        <Textarea
          id="unlock-content"
          value={config.content || ''}
          onChange={(e) => updateConfig('content', e.target.value)}
          placeholder="輸入需要使用者閱讀的內容或條款..."
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          這段文字會顯示在可滾動的區域中
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unlock-checkbox">勾選框文字</Label>
        <Input
          id="unlock-checkbox"
          value={config.checkboxText || ''}
          onChange={(e) => updateConfig('checkboxText', e.target.value)}
          placeholder="我已詳細閱讀上述內容"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unlock-confirm">確認按鈕文字</Label>
        <Input
          id="unlock-confirm"
          value={config.confirmText || ''}
          onChange={(e) => updateConfig('confirmText', e.target.value)}
          placeholder="我已閱讀並同意"
        />
      </div>

      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="unlock-require-scroll" className="flex-1">
          需要滾動至底部
        </Label>
        <Switch
          id="unlock-require-scroll"
          checked={config.requireScroll !== false}
          onCheckedChange={(checked) => updateConfig('requireScroll', checked)}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        啟用後，使用者必須滾動至內容底部才能勾選確認框
      </p>
    </div>
  );
}
