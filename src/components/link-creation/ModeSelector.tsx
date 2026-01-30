'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type LinkMode = 'custom' | 'template';

interface ModeSelectorProps {
  onSelectMode: (mode: LinkMode) => void;
}

export default function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">選擇內容模式</h2>
        <p className="text-muted-foreground">
          根據你的需求選擇合適的內容建立方式
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 自訂內容模式 */}
        <Card
          className="relative p-6 cursor-pointer hover:shadow-glow transition-all duration-300 hover:-translate-y-1 hover:border-primary group"
          onClick={() => onSelectMode('custom')}
        >
          <div className="space-y-4">
            {/* 標籤 */}
            <div className="flex items-start justify-between">
              <div className="text-4xl">🎨</div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                VIP
              </Badge>
            </div>

            {/* 標題與描述 */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">自訂內容模式</h3>
              <p className="text-sm text-muted-foreground">
                完全自由編寫 HTML/CSS
              </p>
            </div>

            {/* 適用對象 */}
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">適用：</span>適合進階用戶
              </p>
            </div>

            {/* Hover 提示 */}
            <div className="pt-3">
              <div className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                點擊選擇 →
              </div>
            </div>
          </div>
        </Card>

        {/* 模板模式 */}
        <Card
          className="relative p-6 cursor-pointer hover:shadow-glow transition-all duration-300 hover:-translate-y-1 hover:border-primary group"
          onClick={() => onSelectMode('template')}
        >
          <div className="space-y-4">
            {/* 標籤 */}
            <div className="flex items-start justify-between">
              <div className="text-4xl">📋</div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                推薦
              </Badge>
            </div>

            {/* 標題與描述 */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">模板模式</h3>
              <p className="text-sm text-muted-foreground">
                快速建立，只需填寫內容
              </p>
            </div>

            {/* 適用對象 */}
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">適用：</span>適合所有人
              </p>
            </div>

            {/* Hover 提示 */}
            <div className="pt-3">
              <div className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                點擊選擇 →
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        💡 提示：選擇後可隨時切換模式
      </div>
    </div>
  );
}
