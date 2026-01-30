/**
 * GET /api/admin/stats
 *
 * 管理員專用：獲取系統統計資訊
 * 只有 is_admin = true 的用戶可以存取
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface UserStats {
  id: string;
  email: string;
  membership_tier: string;
  membership_expires_at: string | null;
  is_admin: boolean;
  created_at: string;
  links_count: number;
  drafts_count: number;
  active_links_count: number;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // 驗證當前用戶是管理員
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    // 檢查是否為管理員
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: '權限不足，此功能僅限管理員' },
        { status: 403 }
      );
    }

    // 使用 service role 來獲取 auth.users 的 email
    const serviceClient = createAdminClient();

    // 獲取所有用戶的 profiles（使用正確的欄位名）
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, tier, expire_at, is_admin, created_at')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: '無法獲取用戶資料' },
        { status: 500 }
      );
    }

    // 獲取所有用戶的 email（從 auth.users）
    const { data: authUsers, error: authUsersError } = await serviceClient.auth.admin.listUsers();

    const emailMap = new Map<string, string>();
    if (!authUsersError && authUsers?.users) {
      authUsers.users.forEach(u => {
        emailMap.set(u.id, u.email || '未知');
      });
    }

    // 獲取每個用戶的連結統計
    const userStats: UserStats[] = [];

    for (const p of (profiles || [])) {
      // 獲取該用戶的連結數量
      const { count: totalLinks } = await supabase
        .from('links')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', p.id);

      const { count: draftLinks } = await supabase
        .from('links')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', p.id)
        .eq('status', 'draft');

      const { count: activeLinks } = await supabase
        .from('links')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', p.id)
        .eq('status', 'active');

      userStats.push({
        id: p.id,
        email: emailMap.get(p.id) || '未知',
        membership_tier: p.tier || 'FREE',
        membership_expires_at: p.expire_at,
        is_admin: p.is_admin || false,
        created_at: p.created_at,
        links_count: totalLinks || 0,
        drafts_count: draftLinks || 0,
        active_links_count: activeLinks || 0,
      });
    }

    // 計算總體統計
    const totalUsers = userStats.length;
    const totalLinks = userStats.reduce((sum, u) => sum + u.links_count, 0);
    const totalDrafts = userStats.reduce((sum, u) => sum + u.drafts_count, 0);
    const totalActiveLinks = userStats.reduce((sum, u) => sum + u.active_links_count, 0);

    // 會員等級分布
    const tierDistribution = {
      FREE: userStats.filter(u => u.membership_tier === 'FREE').length,
      PRO: userStats.filter(u => u.membership_tier === 'PRO').length,
      VIP: userStats.filter(u => u.membership_tier === 'VIP').length,
    };

    return NextResponse.json({
      overview: {
        total_users: totalUsers,
        total_links: totalLinks,
        total_drafts: totalDrafts,
        total_active_links: totalActiveLinks,
      },
      tier_distribution: tierDistribution,
      users: userStats,
    });

  } catch (error) {
    console.error('Error in GET /api/admin/stats:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
