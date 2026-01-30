'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  FileText,
  Share2,
  Settings,
  Zap,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SetupStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  action: {
    label: string;
    href: string;
  };
  status?: 'pending' | 'active' | 'completed';
}

interface SetupGuideProps {
  robotsCount?: number;
  draftsCount?: number;
  activeLinksCount?: number;
}

export function SetupGuide({
  robotsCount = 0,
  draftsCount = 0,
  activeLinksCount = 0
}: SetupGuideProps) {
  const steps: SetupStep[] = [
    {
      id: 1,
      title: '設定機器人',
      description: '配置自動抓取內容的機器人',
      icon: Bot,
      action: {
        label: robotsCount > 0 ? '管理機器人' : '新增機器人',
        href: '#robots'
      },
      status: robotsCount > 0 ? 'completed' : 'pending'
    },
    {
      id: 2,
      title: '審核草稿',
      description: '檢視並編輯生成的文案',
      icon: FileText,
      action: {
        label: draftsCount > 0 ? `審核 ${draftsCount} 個草稿` : '等待草稿',
        href: '#drafts'
      },
      status: draftsCount > 0 ? 'active' : 'pending'
    },
    {
      id: 3,
      title: '發布分享',
      description: '複製連結發布到社群平台',
      icon: Share2,
      action: {
        label: activeLinksCount > 0 ? '查看連結' : '開始發布',
        href: '/automation/history'
      },
      status: activeLinksCount > 0 ? 'completed' : 'pending'
    }
  ];

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">自動化設定流程</CardTitle>
              <CardDescription className="text-xs">按照步驟完成設定，開始自動化發文</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          const isPending = step.status === 'pending';

          return (
            <div
              key={step.id}
              className={cn(
                "relative p-4 rounded-lg border transition-all",
                isCompleted && "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
                isActive && "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
                isPending && "bg-muted/30 border-muted"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                  isCompleted && "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
                  isActive && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
                  isPending && "bg-muted text-muted-foreground"
                )}>
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    {isCompleted && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400 text-[10px] h-4 px-1.5">
                        完成
                      </Badge>
                    )}
                    {isActive && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400 text-[10px] h-4 px-1.5 animate-pulse">
                        進行中
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>

                <Button
                  size="sm"
                  variant={isCompleted ? "outline" : "default"}
                  onClick={() => {
                    if (step.action.href.startsWith('#')) {
                      // 內部錨點導航
                      const element = document.querySelector(step.action.href);
                      element?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      // 外部連結
                      window.location.href = step.action.href;
                    }
                  }}
                  className={cn(
                    "gap-1",
                    isActive && "animate-pulse"
                  )}
                >
                  <span className="text-xs">{step.action.label}</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}

        {/* 快速統計 */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-primary">{robotsCount}</div>
            <div className="text-[10px] text-muted-foreground">機器人</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">{draftsCount}</div>
            <div className="text-[10px] text-muted-foreground">待審核</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{activeLinksCount}</div>
            <div className="text-[10px] text-muted-foreground">已發布</div>
          </div>
        </div>

        {/* 效率提示 */}
        <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-yellow-900 dark:text-yellow-200 mb-1">效率提示</p>
              <p className="text-[11px] text-yellow-700 dark:text-yellow-300/80">
                設定多個機器人可以自動化不同類型的內容，大幅提升發文效率
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

