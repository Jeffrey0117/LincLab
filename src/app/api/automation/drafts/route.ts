/**
 * GET /api/automation/drafts
 * 獲取用戶的草稿連結列表
 * Plan-8: 草稿審核系統
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 獲取當前用戶（必須登入）
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // 查詢用戶的草稿連結
    const { data: drafts, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'draft')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching drafts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch drafts', message: error.message },
        { status: 500 }
      );
    }

    // 格式化回應
    const formattedDrafts = (drafts || []).map(draft => ({
      id: draft.id,
      shortCode: draft.short_code,
      title: draft.title, // 連結標題（Dashboard 設定的）
      affiliateUrl: draft.affiliate_url,
      contentMode: draft.content_mode,
      templateType: draft.template_type,
      templateConfig: draft.template_config,
      ogTitle: draft.og_title,
      ogDescription: draft.og_description,
      ogImage: draft.og_image,
      createdAt: draft.created_at,
      updatedAt: draft.updated_at,
    }));

    return NextResponse.json({
      drafts: formattedDrafts,
      total: formattedDrafts.length,
    });

  } catch (error) {
    console.error('Error in GET /api/automation/drafts:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
