'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// All users are paid members
export type MembershipTier = 'MEMBER';

export interface MembershipData {
  userId: string;
  tier: MembershipTier;
  isMember: true;
  expireAt: string | null;
  usage: {
    links: {
      current: number;
      limit: number;
      percentage: number;
    };
    templates: {
      current: number;
      limit: number;
    };
    strategies: {
      current: number;
      limit: number;
    };
  };
  features: {
    hasSubdomain: boolean;
    hasAllFeatures: boolean;
  };
}

interface MembershipContextValue {
  membership: MembershipData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isMember: true;
}

const MembershipContext = createContext<MembershipContextValue | undefined>(undefined);

export function MembershipProvider({ children }: { children: ReactNode }) {
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembership = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/membership');
      if (!response.ok) {
        throw new Error('無法取得會員資訊');
      }
      const data = await response.json();
      // All users are members
      setMembership({
        ...data,
        tier: 'MEMBER',
        isMember: true,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembership();
  }, []);

  return (
    <MembershipContext.Provider value={{ membership, loading, error, refetch: fetchMembership, isMember: true }}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const context = useContext(MembershipContext);
  if (context === undefined) {
    // During SSR, return a default state
    if (typeof window === 'undefined') {
      return {
        membership: null,
        loading: true,
        error: null,
        refetch: async () => {},
        isMember: true as const,
      };
    }
    throw new Error('useMembership must be used within a MembershipProvider');
  }
  return context;
}
