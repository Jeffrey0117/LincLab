'use client';

import { Badge } from '@/components/ui/badge';
import { AutomationStrategy } from '@/lib/automation-data';
import { BarChart, MousePointer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StrategyCardProps {
  strategy: AutomationStrategy;
  isUsed?: boolean;
  onClick: () => void;
}

export function StrategyCard({ strategy, isUsed = false, onClick }: StrategyCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col h-full rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer",
        isUsed && "border-green-500/50 bg-green-50/10"
      )}
      onClick={onClick}
    >
      {/* 使用狀態標籤 */}
      {isUsed && (
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 z-10 text-[10px] px-2 py-0.5 bg-green-500/90 text-white border-0"
        >
          已使用
        </Badge>
      )}

      {/* 圖標區域 - 統一高度以匹配圖片區域 */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
        <div className="text-7xl transform group-hover:scale-110 transition-transform duration-200">
          {strategy.icon}
        </div>

        {/* Hover 效果 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* 內容區域 */}
      <div className="flex-1 flex flex-col p-3">
        {/* 標題 - 與 DraftCard 一致的大小 */}
        <h3 className="text-sm font-medium line-clamp-2 mb-2">
          {strategy.title}
        </h3>

        {/* 描述 */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
          {strategy.description}
        </p>

        {/* 統計資訊 */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <BarChart className="h-3 w-3" />
            <span>使用 {strategy.useCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MousePointer className="h-3 w-3" />
            <span>點擊 {strategy.clickCount.toLocaleString()}</span>
          </div>
        </div>

        {/* 標籤 */}
        <div className="flex flex-wrap gap-1">
          {strategy.hashtags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-5"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* 底部裝飾線 */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}