'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Package,
  MousePointer,
  Star,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: React.ElementType;
  color?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  color = 'primary',
  onClick
}: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-600',
    blue: 'bg-blue-500/10 text-blue-600',
    purple: 'bg-purple-500/10 text-purple-600',
    yellow: 'bg-yellow-500/10 text-yellow-600',
    red: 'bg-red-500/10 text-red-600'
  }[color] || 'bg-primary/10 text-primary';

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-lg",
        onClick && "cursor-pointer hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-2 rounded-lg", colorClasses)}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground/80 mt-2">{description}</p>
          )}
        </div>

        {onClick && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PerformanceCardProps {
  title: string;
  metrics: {
    label: string;
    value: number;
    max: number;
    color: string;
  }[];
}

export function PerformanceCard({ title, metrics }: PerformanceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{metric.label}</span>
              <span className="font-medium">{metric.value}/{metric.max}</span>
            </div>
            <Progress
              value={(metric.value / metric.max) * 100}
              className={cn("h-2", metric.color)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  badge?: React.ReactNode;
  color?: string;
}

export function QuickAction({
  title,
  description,
  icon: Icon,
  onClick,
  badge,
  color = 'primary'
}: QuickActionProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary hover:bg-primary/20',
    yellow: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20',
    blue: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
    green: 'bg-green-500/10 text-green-600 hover:bg-green-500/20',
    purple: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20'
  }[color] || 'bg-primary/10 text-primary hover:bg-primary/20';

  return (
    <button
      onClick={onClick}
      className="group relative w-full p-4 rounded-lg border bg-card hover:shadow-md transition-all text-left"
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2.5 rounded-lg transition-colors", colorClasses)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm truncate">{title}</h3>
            {badge}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
      </div>
    </button>
  );
}

interface InsightCardProps {
  title: string;
  insights: {
    label: string;
    value: string;
    change?: string;
    isPositive?: boolean;
  }[];
  onViewDetails?: () => void;
}

export function InsightCard({ title, insights, onViewDetails }: InsightCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {onViewDetails && (
            <Button variant="ghost" size="sm" onClick={onViewDetails}>
              查看詳情
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm text-muted-foreground">{insight.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{insight.value}</span>
                {insight.change && (
                  <Badge
                    variant={insight.isPositive ? 'default' : 'secondary'}
                    className={cn(
                      "text-xs px-1.5 py-0",
                      insight.isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}
                  >
                    {insight.change}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats({
  robots,
  drafts
}: {
  robots: any[];
  drafts: any[];
}) {
  const activeRobots = robots.filter(r => r.isActive).length;
  const runningRobots = robots.filter(r => r.status === 'running').length;
  const totalCardsCreated = robots.reduce((sum, r) => sum + r.totalCardsCreated, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Package}
        title="總機器人數"
        value={robots.length}
        description="已設定的機器人"
        trend={{ value: `${activeRobots} 啟用`, isPositive: true }}
        color="primary"
      />
      <StatCard
        icon={Activity}
        title="執行中機器人"
        value={runningRobots}
        description="正在執行的任務"
        trend={{ value: `${activeRobots - runningRobots} 待命`, isPositive: true }}
        color="green"
      />
      <StatCard
        icon={MousePointer}
        title="生成卡片總數"
        value={totalCardsCreated.toLocaleString()}
        description="累計生成"
        trend={{ value: "+15%", isPositive: true }}
        color="blue"
      />
      <StatCard
        icon={Star}
        title="待審核草稿"
        value={drafts.length}
        description="需要處理的草稿"
        trend={drafts.length > 0 ? { value: "待處理", isPositive: false } : { value: "已完成", isPositive: true }}
        color={drafts.length > 0 ? "yellow" : "purple"}
      />
    </div>
  );
}