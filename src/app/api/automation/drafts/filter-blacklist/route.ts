/**
 * GET /api/automation/drafts/filter-blacklist
 * 預覽包含黑名單圖片的草稿（dry-run 模式）
 *
 * Query Parameters:
 * - dryRun: boolean (預設 true) - 是否為預覽模式
 *
 * POST /api/automation/drafts/filter-blacklist
 * 批量刪除包含黑名單圖片的草稿
 *
 * Body:
 * - confirm: boolean (必須為 true) - 確認刪除
 * - draftIds?: string[] (可選) - 指定要刪除的草稿 ID，如果不提供則刪除所有符合條件的草稿
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { draftContainsBlacklistedImage, findBlacklistedImages } from '@/lib/image-blacklist';

interface DraftRecord {
  id: string;
  short_code: string;
  title: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  template_config: {
    imageUrl?: string;
    images?: string[];
  } | null;
  created_at: string;
  user_id: string;
}

interface FilteredDraft {
  id: string;
  shortCode: string;
  title: string;
  ogTitle: string;
  ogDescription: string;
  blacklistedImages: string[];
  createdAt: string;
}

/**
 * GET - 預覽包含黑名單圖片的草稿
 */
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

    // 查詢所有草稿
    const { data: drafts, error } = await supabase
      .from('links')
      .select('id, short_code, title, og_title, og_description, og_image, template_config, created_at, user_id')
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

    // 過濾包含黑名單圖片的草稿
    const filteredDrafts: FilteredDraft[] = [];

    for (const draft of (drafts as DraftRecord[] || [])) {
      if (draftContainsBlacklistedImage(draft)) {
        const blacklistedImages = findBlacklistedImages(draft);
        filteredDrafts.push({
          id: draft.id,
          shortCode: draft.short_code,
          title: draft.title || draft.og_title || 'Untitled',
          ogTitle: draft.og_title || '',
          ogDescription: draft.og_description || '',
          blacklistedImages,
          createdAt: draft.created_at,
        });
      }
    }

    return NextResponse.json({
      total: filteredDrafts.length,
      drafts: filteredDrafts,
      message: filteredDrafts.length > 0
        ? `Found ${filteredDrafts.length} drafts containing blacklisted images`
        : 'No drafts with blacklisted images found',
    });

  } catch (error) {
    console.error('Error in GET /api/automation/drafts/filter-blacklist:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST - 批量刪除包含黑名單圖片的草稿
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { confirm, draftIds } = body;

    // 安全檢查：必須明確確認
    if (confirm !== true) {
      return NextResponse.json(
        { error: 'Must set confirm=true to proceed with deletion' },
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

    // 查詢所有草稿
    const { data: drafts, error: fetchError } = await supabase
      .from('links')
      .select('id, short_code, title, og_title, og_description, og_image, template_config, created_at, user_id')
      .eq('user_id', userId)
      .eq('status', 'draft')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching drafts:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch drafts', message: fetchError.message },
        { status: 500 }
      );
    }

    // 過濾要刪除的草稿
    const draftsToDelete: DraftRecord[] = [];

    for (const draft of (drafts as DraftRecord[] || [])) {
      // 如果指定了 draftIds，只刪除指定的草稿
      if (draftIds && Array.isArray(draftIds) && draftIds.length > 0) {
        if (draftIds.includes(draft.id) && draftContainsBlacklistedImage(draft)) {
          draftsToDelete.push(draft);
        }
      } else {
        // 否則刪除所有包含黑名單圖片的草稿
        if (draftContainsBlacklistedImage(draft)) {
          draftsToDelete.push(draft);
        }
      }
    }

    if (draftsToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        deleted: 0,
        message: 'No drafts to delete',
      });
    }

    // 執行批量刪除
    let successCount = 0;
    let failedCount = 0;
    const deletedDrafts: FilteredDraft[] = [];
    const errors: string[] = [];

    for (const draft of draftsToDelete) {
      try {
        const { error: deleteError } = await supabase
          .from('links')
          .delete()
          .eq('id', draft.id)
          .eq('user_id', userId); // 額外的安全檢查

        if (deleteError) {
          failedCount++;
          errors.push(`Failed to delete ${draft.short_code}: ${deleteError.message}`);
          console.error(`Error deleting draft ${draft.id}:`, deleteError);
        } else {
          successCount++;
          const blacklistedImages = findBlacklistedImages(draft);
          deletedDrafts.push({
            id: draft.id,
            shortCode: draft.short_code,
            title: draft.title || draft.og_title || 'Untitled',
            ogTitle: draft.og_title || '',
            ogDescription: draft.og_description || '',
            blacklistedImages,
            createdAt: draft.created_at,
          });
          console.log(`✓ Deleted draft ${draft.short_code} (${draft.id}) containing blacklisted images`);
        }
      } catch (error) {
        failedCount++;
        errors.push(`Exception deleting ${draft.short_code}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(`Exception deleting draft ${draft.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      deleted: successCount,
      failed: failedCount,
      total: draftsToDelete.length,
      deletedDrafts,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully deleted ${successCount} out of ${draftsToDelete.length} drafts`,
    });

  } catch (error) {
    console.error('Error in POST /api/automation/drafts/filter-blacklist:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
