'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search,
  FileText,
  Bot,
  Package,
  Plus,
  ArrowRight,
  Sparkles,
  Filter,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  type: 'drafts' | 'strategies' | 'robots' | 'search';
  onAction?: () => void;
  searchQuery?: string;
  className?: string;
}

export function EmptyState({ type, onAction, searchQuery, className }: EmptyStateProps) {
  const configs = {
    drafts: {
      icon: FileText,
      title: '暫無待審核草稿',
      description: '設定機器人自動抓取商品，系統會生成文案草稿供您審核',
      actionLabel: '設定機器人',
      actionIcon: Bot,
      illustration: (
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-yellow-100/50 dark:bg-yellow-900/20 mx-auto" />
          <FileText className="h-16 w-16 text-yellow-500/50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      )
    },
    strategies: {
      icon: Package,
      title: '暫無可用策略',
      description: '目前沒有符合條件的策略模板，請調整篩選條件或稍後再試',
      actionLabel: '重置篩選',
      actionIcon: RefreshCw,
      illustration: (
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-primary/10 mx-auto" />
          <Package className="h-16 w-16 text-primary/30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      )
    },
    robots: {
      icon: Bot,
      title: '沒有找到機器人',
      description: searchQuery
        ? `沒有符合「${searchQuery}」的機器人`
        : '此分類下暫無機器人，立即創建您的第一個自動化機器人',
      actionLabel: '新增機器人',
      actionIcon: Plus,
      illustration: (
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-blue-100/50 dark:bg-blue-900/20 mx-auto" />
          <Bot className="h-16 w-16 text-blue-500/50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      )
    },
    search: {
      icon: Search,
      title: '找不到符合的結果',
      description: searchQuery
        ? `沒有找到包含「${searchQuery}」的內容`
        : '請嘗試使用其他關鍵字或調整篩選條件',
      actionLabel: '清除搜尋',
      actionIcon: RefreshCw,
      illustration: (
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto" />
          <Search className="h-16 w-16 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      )
    }
  };

  const config = configs[type];
  const Icon = config.icon;
  const ActionIcon = config.actionIcon;

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
        {config.illustration}

        <h3 className="text-lg font-semibold mt-6 mb-2">{config.title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {config.description}
        </p>

        {onAction && (
          <Button onClick={onAction} className="gap-2">
            <ActionIcon className="h-4 w-4" />
            {config.actionLabel}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface QuickStartCardProps {
  title: string;
  description: string;
  steps: string[];
  onStart: () => void;
}

export function QuickStartCard({ title, description, steps, onStart }: QuickStartCardProps) {
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{description}</p>

            <div className="space-y-2 mb-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>

            <Button onClick={onStart} className="w-full">
              立即開始
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface NoDataIllustrationProps {
  type: 'empty' | 'error' | 'loading';
  message?: string;
}

export function NoDataIllustration({ type, message }: NoDataIllustrationProps) {
  const configs = {
    empty: {
      color: 'text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      icon: Package
    },
    error: {
      color: 'text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      icon: Filter
    },
    loading: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      icon: RefreshCw
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={cn("w-24 h-24 rounded-full flex items-center justify-center mb-4", config.bgColor)}>
        <Icon className={cn("h-12 w-12", config.color, type === 'loading' && "animate-spin")} />
      </div>
      {message && (
        <p className="text-sm text-muted-foreground text-center max-w-xs">{message}</p>
      )}
    </div>
  );
}