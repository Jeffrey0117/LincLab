'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Crown, Clock, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMembership } from '@/contexts/MembershipContext';

// All users are paid members
const MEMBER_CONFIG = {
  label: '付費會員',
  color: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
  borderColor: 'border-purple-500',
  icon: Crown,
  iconColor: 'text-purple-500',
};

interface MembershipBadgeProps {
  variant?: 'compact' | 'full';
  showUsage?: boolean;
}

export function MembershipBadge({ variant = 'compact', showUsage = false }: MembershipBadgeProps) {
  const { membership, loading, error } = useMembership();

  // Loading state
  if (loading) {
    return <Skeleton className="h-10 w-32" />;
  }

  // Error state
  if (error || !membership) {
    return (
      <Badge variant="outline" className="gap-1">
        <AlertCircle className="w-3 h-3" />
        載入錯誤
      </Badge>
    );
  }

  const config = MEMBER_CONFIG;
  const Icon = config.icon;

  // Format expiration date
  const expirationText = membership.expireAt
    ? new Date(membership.expireAt).toLocaleDateString('zh-TW')
    : null;

  // Calculate days remaining
  const daysRemaining = membership.expireAt
    ? Math.ceil((new Date(membership.expireAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Compact variant (for navbar)
  if (variant === 'compact') {
    return (
      <Badge className={`${config.color} gap-1.5 px-3 py-1.5 font-semibold`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </Badge>
    );
  }

  // Full variant (for dashboard)
  return (
    <Card className={`border-2 ${config.borderColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-opacity-10 ${config.iconColor}`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div>
              <h3 className="font-bold text-lg">{config.label}</h3>
              {membership.isMember && expirationText && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {daysRemaining && daysRemaining > 0 ? (
                    <span>
                      {daysRemaining} 天後到期 ({expirationText})
                    </span>
                  ) : (
                    <span className="text-destructive">已過期</span>
                  )}
                </div>
              )}
              {membership.isMember && !membership.expireAt && (
                <p className="text-sm text-muted-foreground">永久會員</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {showUsage && (
        <CardContent className="space-y-3">
          {/* Link usage */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>短連結使用</span>
              <span className="font-semibold">
                {membership.usage.links.current} / {(membership.usage.links.limit === Infinity || membership.usage.links.limit === null) ? '無上限' : membership.usage.links.limit}
              </span>
            </div>
            {membership.usage.links.limit !== Infinity && membership.usage.links.limit !== null && (
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    membership.usage.links.percentage > 80
                      ? 'bg-destructive'
                      : membership.usage.links.percentage > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(membership.usage.links.percentage, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Strategy usage */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>自動化機器人</span>
              <span className="font-semibold">
                {membership.usage.strategies.current} / {(membership.usage.strategies.limit === Infinity || membership.usage.strategies.limit === null) ? '無上限' : membership.usage.strategies.limit}
              </span>
            </div>
          </div>

          {/* Member features */}
          {membership.isMember && (
            <div className="pt-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground mb-2">會員功能</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-green-500" />
                  無限短連結
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-green-500" />
                  無限機器人
                </div>
                {membership.features.hasSubdomain && (
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-green-500" />
                    專屬子網域
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// Export useMembership from context for backwards compatibility
export { useMembership } from '@/contexts/MembershipContext';
