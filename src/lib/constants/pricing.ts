/**
 * Membership Info - Simplified
 *
 * Only two tiers: FREE and MEMBER
 * Members are manually assigned by admin (no online purchase)
 */

export const MEMBERSHIP_INFO = {
  FREE: {
    name: '免費版',
    description: '基本功能體驗',
    color: 'gray',
    features: [
      '3 個短連結',
      '1 個模板使用',
    ],
  },
  MEMBER: {
    name: '付費會員',
    description: '無限制使用所有功能',
    color: 'purple',
    features: [
      '無限短連結',
      '無限模板使用',
      '無限自動化機器人',
      '專屬子網域',
      '優先技術支援',
    ],
  },
} as const;

export type MembershipType = keyof typeof MEMBERSHIP_INFO;

// Feature list for display
export const MEMBER_FEATURES = [
  { feature: '短連結數量', free: '3 個', member: '無限' },
  { feature: '模板使用', free: '1 個', member: '無限' },
  { feature: '自動化機器人', free: '無法使用', member: '無限' },
  { feature: '專屬子網域', free: false, member: true },
  { feature: '優先技術支援', free: false, member: true },
] as const;

// Legacy exports for backwards compatibility
export const PRICING = {
  FREE: MEMBERSHIP_INFO.FREE,
  PRO: MEMBERSHIP_INFO.MEMBER,
  VIP: MEMBERSHIP_INFO.MEMBER,
} as const;

export type PricingTier = keyof typeof PRICING;

export function getCheckoutUrl(_tier: 'PRO' | 'VIP'): string {
  // No longer using online checkout - return contact info
  return '';
}

export const FEATURE_COMPARISON = MEMBER_FEATURES;
