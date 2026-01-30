'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageLinkConfig as ConfigType } from '@/lib/strategy-types';

interface ImageLinkConfigProps {
  config: ConfigType;
  onChange: (config: ConfigType) => void;
}

export default function ImageLinkConfig({
  config,
  onChange,
}: ImageLinkConfigProps) {
  const updateConfig = (key: keyof ConfigType, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-2">
        <Label htmlFor="image-url">圖片網址 *</Label>
        <Input
          id="image-url"
          value={config.imageUrl || ''}
          onChange={(e) => updateConfig('imageUrl', e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-xs text-muted-foreground">
          請提供圖片的完整網址（建議尺寸：1200x630 或更大）
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-alt">圖片替代文字</Label>
        <Input
          id="image-alt"
          value={config.altText || ''}
          onChange={(e) => updateConfig('altText', e.target.value)}
          placeholder="點擊查看詳情"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-fit">圖片顯示模式</Label>
        <Select
          value={config.fitMode || 'cover'}
          onValueChange={(value) => updateConfig('fitMode', value as 'cover' | 'contain' | 'fill')}
        >
          <SelectTrigger id="image-fit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cover">覆蓋 (Cover) - 填滿整個畫面，可能裁切</SelectItem>
            <SelectItem value="contain">包含 (Contain) - 完整顯示圖片，可能有留白</SelectItem>
            <SelectItem value="fill">填充 (Fill) - 拉伸填滿，可能變形</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between space-x-2 py-2">
        <div className="space-y-0.5">
          <Label htmlFor="show-hint">顯示點擊提示</Label>
          <p className="text-xs text-muted-foreground">
            在圖片上顯示提示文字引導使用者點擊
          </p>
        </div>
        <Switch
          id="show-hint"
          checked={config.showHint !== false}
          onCheckedChange={(checked) => updateConfig('showHint', checked)}
        />
      </div>

      {config.showHint !== false && (
        <>
          <div className="space-y-2">
            <Label htmlFor="hint-text">提示文字</Label>
            <Input
              id="hint-text"
              value={config.hintText || ''}
              onChange={(e) => updateConfig('hintText', e.target.value)}
              placeholder="👆 點擊圖片查看詳情"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hint-position">提示位置</Label>
            <Select
              value={config.hintPosition || 'bottom'}
              onValueChange={(value) => updateConfig('hintPosition', value as 'top' | 'bottom' | 'center')}
            >
              <SelectTrigger id="hint-position">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">上方</SelectItem>
                <SelectItem value="center">中央</SelectItem>
                <SelectItem value="bottom">下方</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>使用建議：</strong>圖片連結模式最適合分享到社群媒體，看起來像普通圖片分享，點擊後會開啟分潤連結。建議使用吸引人的圖片以提高點擊率。
        </p>
      </div>
    </div>
  );
}
