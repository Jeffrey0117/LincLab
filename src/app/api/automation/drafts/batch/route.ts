/**
 * POST /api/automation/drafts/batch
 * 批量操作草稿（批量審核通過或批量刪除）
 * Plan-8: 草稿審核系統
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface BatchOperationRequest {
  action: 'approve' | 'delete';
  linkIds: string[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: BatchOperationRequest = await request.json();
    const { action, linkIds } = body;

    if (!action || !linkIds || !Array.isArray(linkIds)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    if (linkIds.length === 0) {
      return NextResponse.json(
        { error: 'No link IDs provided' },
        { status: 400 }
      );
    }

    // 獲取當前用戶（必須登入）
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    const userId = user.id;

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    if (action === 'approve') {
      // 批量審核通過
      for (const linkId of linkIds) {
        try {
          const { data: draft, error: fetchError } = await supabase
            .from('links')
            .select('id')
            .eq('id', linkId)
            .eq('user_id', userId)
            .eq('status', 'draft')
            .single();

          if (fetchError || !draft) {
            failedCount++;
            errors.push(`Link ${linkId}: not found or not a draft`);
            continue;
          }

          const { error: updateError } = await supabase
            .from('links')
            .update({
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', linkId);

          if (updateError) {
            failedCount++;
            errors.push(`Link ${linkId}: ${updateError.message}`);
          } else {
            successCount++;
          }
        } catch (error) {
          failedCount++;
          errors.push(`Link ${linkId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } else if (action === 'delete') {
      // 批量刪除
      for (const linkId of linkIds) {
        try {
          const { data: draft, error: fetchError } = await supabase
            .from('links')
            .select('id')
            .eq('id', linkId)
            .eq('user_id', userId)
            .eq('status', 'draft')
            .single();

          if (fetchError || !draft) {
            failedCount++;
            errors.push(`Link ${linkId}: not found or not a draft`);
            continue;
          }

          const { error: deleteError } = await supabase
            .from('links')
            .delete()
            .eq('id', linkId);

          if (deleteError) {
            failedCount++;
            errors.push(`Link ${linkId}: ${deleteError.message}`);
          } else {
            successCount++;
          }
        } catch (error) {
          failedCount++;
          errors.push(`Link ${linkId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "delete"' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      successCount,
      failedCount,
      total: linkIds.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error in POST /api/automation/drafts/batch:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
