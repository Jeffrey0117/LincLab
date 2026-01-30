"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CookieStrategyConfig, CookieTriggerType } from "@/lib/strategy-types";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";

interface CookieTriggerConfigProps {
  config: Partial<CookieStrategyConfig>;
  onChange: (config: Partial<CookieStrategyConfig>) => void;
}

// 預設選項
const PRESET_OPTIONS = [
  { value: 'immediate', label: '立即顯示', description: '頁面載入時立即顯示彈窗' },
  { value: 'delay-3', label: '延遲 3 秒', description: '給用戶時間瀏覽內容後再顯示' },
  { value: 'delay-5', label: '延遲 5 秒', description: '更長的延遲時間' },
  { value: 'delay-10', label: '延遲 10 秒', description: '充分的瀏覽時間' },
  { value: 'scroll-25', label: '滾動 25%', description: '用戶開始瀏覽內容後顯示' },
  { value: 'scroll-50', label: '滾動 50%', description: '用戶瀏覽到一半時顯示' },
  { value: 'scroll-75', label: '滾動 75%', description: '用戶深度瀏覽後顯示' },
  { value: 'scroll-bottom', label: '滾動到底部', description: '用戶看完全部內容後顯示' },
  { value: 'exit-intent', label: '離開意圖', description: '當用戶準備離開時顯示' },
  { value: 'custom', label: '自訂設定', description: '自行設定觸發條件' },
];

const CookieTriggerConfig = ({ config, onChange }: CookieTriggerConfigProps) => {
  const [showCustomText, setShowCustomText] = useState(false);

  // 根據 config 計算當前選中的預設選項
  const getCurrentPresetValue = () => {
    const { triggerType, delaySeconds, scrollPercentage } = config;

    if (triggerType === 'immediate') return 'immediate';
    if (triggerType === 'delay' && delaySeconds === 3) return 'delay-3';
    if (triggerType === 'delay' && delaySeconds === 5) return 'delay-5';
    if (triggerType === 'delay' && delaySeconds === 10) return 'delay-10';
    if (triggerType === 'scroll' && scrollPercentage === 25) return 'scroll-25';
    if (triggerType === 'scroll' && scrollPercentage === 50) return 'scroll-50';
    if (triggerType === 'scroll' && scrollPercentage === 75) return 'scroll-75';
    if (triggerType === 'scroll-bottom') return 'scroll-bottom';
    if (triggerType === 'exit-intent') return 'exit-intent';

    return 'custom';
  };

  const handlePresetChange = (value: string) => {
    switch (value) {
      case 'immediate':
        onChange({ ...config, triggerType: 'immediate' });
        break;
      case 'delay-3':
        onChange({ ...config, triggerType: 'delay', delaySeconds: 3 });
        break;
      case 'delay-5':
        onChange({ ...config, triggerType: 'delay', delaySeconds: 5 });
        break;
      case 'delay-10':
        onChange({ ...config, triggerType: 'delay', delaySeconds: 10 });
        break;
      case 'scroll-25':
        onChange({ ...config, triggerType: 'scroll', scrollPercentage: 25 });
        break;
      case 'scroll-50':
        onChange({ ...config, triggerType: 'scroll', scrollPercentage: 50 });
        break;
      case 'scroll-75':
        onChange({ ...config, triggerType: 'scroll', scrollPercentage: 75 });
        break;
      case 'scroll-bottom':
        onChange({ ...config, triggerType: 'scroll-bottom' });
        break;
      case 'exit-intent':
        onChange({ ...config, triggerType: 'exit-intent' });
        break;
      case 'custom':
        // 保持現有配置或設置預設值
        if (!config.triggerType) {
          onChange({ ...config, triggerType: 'delay', delaySeconds: 3 });
        }
        break;
    }
  };

  const isCustom = getCurrentPresetValue() === 'custom';

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-3">Cookie 彈窗設定</h3>
      </div>

      {/* 觸發時機選擇 */}
      <div className="space-y-2">
        <Label>觸發時機</Label>
        <Select value={getCurrentPresetValue()} onValueChange={handlePresetChange}>
          <SelectTrigger>
            <SelectValue placeholder="選擇觸發時機" />
          </SelectTrigger>
          <SelectContent>
            {PRESET_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 自訂設定（當選擇自訂時顯示） */}
      {isCustom && (
        <>
          <Separator />
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>觸發類型</Label>
              <RadioGroup
                value={config.triggerType || 'immediate'}
                onValueChange={(value) => onChange({ ...config, triggerType: value as CookieTriggerType })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="immediate" id="immediate" />
                  <label htmlFor="immediate" className="text-sm cursor-pointer">立即顯示</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delay" id="delay" />
                  <label htmlFor="delay" className="text-sm cursor-pointer">延遲顯示</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scroll" id="scroll" />
                  <label htmlFor="scroll" className="text-sm cursor-pointer">滾動後顯示</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scroll-bottom" id="scroll-bottom" />
                  <label htmlFor="scroll-bottom" className="text-sm cursor-pointer">滾動到底部</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="exit-intent" id="exit-intent" />
                  <label htmlFor="exit-intent" className="text-sm cursor-pointer">離開意圖</label>
                </div>
              </RadioGroup>
            </div>

            {/* 延遲秒數（當選擇延遲顯示時） */}
            {config.triggerType === 'delay' && (
              <div className="space-y-2">
                <Label htmlFor="delaySeconds">延遲秒數</Label>
                <Input
                  id="delaySeconds"
                  type="number"
                  min="1"
                  max="60"
                  value={config.delaySeconds || 3}
                  onChange={(e) => onChange({ ...config, delaySeconds: parseInt(e.target.value) || 3 })}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">設定延遲幾秒後顯示彈窗（1-60秒）</p>
              </div>
            )}

            {/* 滾動百分比（當選擇滾動後顯示時） */}
            {config.triggerType === 'scroll' && (
              <div className="space-y-2">
                <Label htmlFor="scrollPercentage">滾動百分比</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="scrollPercentage"
                    type="number"
                    min="1"
                    max="99"
                    value={config.scrollPercentage || 50}
                    onChange={(e) => onChange({ ...config, scrollPercentage: parseInt(e.target.value) || 50 })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">用戶滾動到頁面多少百分比時顯示（1-99%）</p>
              </div>
            )}
          </div>
        </>
      )}

      <Separator />

      {/* 彈窗文案自訂（可收起） */}
      <div className="border rounded-lg p-3 bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-between font-medium"
          onClick={() => setShowCustomText(!showCustomText)}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>自訂彈窗文案（選填）</span>
          </div>
          {showCustomText ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {showCustomText && (
          <div className="space-y-4 mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              留空則使用預設文案
            </p>

            <div className="space-y-2">
              <Label htmlFor="title">彈窗標題</Label>
              <Input
                id="title"
                placeholder="Cookie 使用通知"
                value={config.title || ''}
                onChange={(e) => onChange({ ...config, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">彈窗描述</Label>
              <Input
                id="description"
                placeholder="本網站使用 Cookie 來提供更好的使用體驗..."
                value={config.description || ''}
                onChange={(e) => onChange({ ...config, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="acceptText">接受按鈕文字</Label>
                <Input
                  id="acceptText"
                  placeholder="同意並繼續"
                  value={config.acceptText || ''}
                  onChange={(e) => onChange({ ...config, acceptText: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="declineText">拒絕按鈕文字</Label>
                <Input
                  id="declineText"
                  placeholder="稍後再說"
                  value={config.declineText || ''}
                  onChange={(e) => onChange({ ...config, declineText: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieTriggerConfig;
