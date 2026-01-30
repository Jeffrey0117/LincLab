/**
 * POST /api/automation/drafts/[id]/approve
 * 審核通過草稿，將狀態從 draft 變更為 active
 * Plan-8: 草稿審核系統
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;

    // 獲取當前用戶（必須登入）
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // 檢查草稿是否存在且屬於當前用戶
    const { data: draft, error: fetchError } = await supabase
      .from('links')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('status', 'draft')
      .single();

    if (fetchError || !draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    // 更新狀態為 active，並設定 title 為「自動化-{og_title}」
    const updateData: any = {
      status: 'active',
      updated_at: new Date().toISOString(),
    };

    // 如果有 og_title 但沒有 title，設定為「[自動化機器人]{og_title}」
    if (draft.og_title && !draft.title) {
      updateData.title = `[自動化機器人]${draft.og_title}`;
    }

    const { error: updateError } = await supabase
      .from('links')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Error approving draft:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve draft', message: updateError.message },
        { status: 500 }
      );
    }

    console.log(`✓ Draft approved: ${id}, title: ${updateData.title || draft.title || 'N/A'}`);

    return NextResponse.json({
      success: true,
      message: 'Draft approved successfully',
      linkId: id,
    });

  } catch (error) {
    console.error('Error in POST /api/automation/drafts/[id]/approve:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
