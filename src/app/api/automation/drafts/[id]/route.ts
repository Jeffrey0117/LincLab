/**
 * PATCH/DELETE /api/automation/drafts/[id]
 * PATCH: 審核通過草稿（標記為已使用）
 * DELETE: 刪除草稿連結
 * Plan-8: 草稿審核系統
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/automation/drafts/[id]
 * 審核通過草稿，將狀態從 draft 改為 active
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await context.params;
    const body = await request.json();

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
    // 如果是更新 OG 資訊，不限制 status 必須是 draft
    const query = supabase
      .from('links')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId);

    // 只有在更新狀態時才檢查必須是 draft
    if (body.status) {
      query.eq('status', 'draft');
    }

    const { data: draft, error: fetchError } = await query.single();

    if (fetchError || !draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    // 更新草稿狀態為 active 或只更新 OG 資訊
    const updateData: Record<string, unknown> = {};

    // 如果有提供 status，更新狀態（用於標記已使用）
    if (body.status) {
      updateData.status = body.status;
    }

    // 如果有提供 ogTitle，更新 OG 標題
    if (body.ogTitle !== undefined) {
      updateData.og_title = body.ogTitle;
    }

    // 如果有提供 ogDescription，更新 OG 描述
    if (body.ogDescription !== undefined) {
      updateData.og_description = body.ogDescription;
    }

    // 如果有提供 content，也一起更新
    if (body.content) {
      updateData.metadata = {
        ...((draft.metadata as Record<string, unknown>) || {}),
        approved_content: body.content,
        approved_at: new Date().toISOString(),
      };
    }

    // 如果沒有任何要更新的資料，返回錯誤
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No data to update' },
        { status: 400 }
      );
    }

    const { data: updatedDraft, error: updateError } = await supabase
      .from('links')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error approving draft:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve draft', message: updateError.message },
        { status: 500 }
      );
    }

    console.log(`✓ Draft approved: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Draft approved successfully',
      draft: updatedDraft,
    });

  } catch (error) {
    console.error('Error in PATCH /api/automation/drafts/[id]:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // 刪除草稿連結
    // 注意：scraped_items 表的 created_link_id 欄位有 ON DELETE SET NULL
    // 所以刪除 link 時，scraped_items 記錄會保留，只是 created_link_id 會被設為 NULL
    // 這樣可以防止同一篇文章被重複抓取
    const { error: deleteError } = await supabase
      .from('links')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting draft:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete draft', message: deleteError.message },
        { status: 500 }
      );
    }

    console.log(`✓ Draft deleted: ${id}, scraped_items record preserved for deduplication`);

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully',
    });

  } catch (error) {
    console.error('Error in DELETE /api/automation/drafts/[id]:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
