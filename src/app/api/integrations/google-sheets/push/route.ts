/**
 * POST /api/integrations/google-sheets/push
 *
 * 推送連結資料到 Google Sheets
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface LinkData {
  id: string;
  title: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  short_code: string;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 驗證用戶身份
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { linkIds } = body;

    if (!linkIds || !Array.isArray(linkIds) || linkIds.length === 0) {
      return NextResponse.json(
        { error: 'linkIds array is required' },
        { status: 400 }
      );
    }

    // 取得當前用戶的 Google Sheets 設定
    const { data: config, error: configError } = await supabase
      .from('google_sheets_configs')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_enabled', true)
      .limit(1)
      .single();

    if (configError || !config) {
      return NextResponse.json(
        { error: '您尚未設定 Google Sheets，請先到設定頁面進行設定' },
        { status: 400 }
      );
    }

    if (!config.webapp_url) {
      return NextResponse.json(
        { error: 'Apps Script Web App URL 尚未設定' },
        { status: 400 }
      );
    }

    // 取得連結資料（只取得屬於當前用戶的連結）
    const { data: links, error: linksError } = await supabase
      .from('links')
      .select('id, title, og_title, og_description, og_image, short_code, created_at')
      .eq('user_id', user.id)
      .in('id', linkIds);

    if (linksError) {
      console.error('Error fetching links:', linksError);
      return NextResponse.json(
        { error: 'Failed to fetch links' },
        { status: 500 }
      );
    }

    if (!links || links.length === 0) {
      return NextResponse.json(
        { error: 'No links found with provided IDs' },
        { status: 404 }
      );
    }

    // 轉換為推送格式
    // 欄位順序：時間、OG標題、OG描述、短連結、圖片URL
    const rows = (links as LinkData[]).map(link => ({
      created_at: link.created_at ? new Date(link.created_at).toLocaleString('zh-TW') : '',
      title: link.og_title || link.title || '',  // 優先使用 OG 標題，若無則使用連結標題
      description: link.og_description || '',    // OG 描述
      short_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${link.short_code}`,
      og_image: link.og_image || ''
    }));

    // 推送到 Google Sheets via Web App
    try {
      const response = await fetch(config.webapp_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rows }),
      });

      const result = await response.json();

      if (!result.success) {
        console.error('Google Sheets push failed:', result.error);
        return NextResponse.json(
          {
            error: 'Failed to push to Google Sheets',
            details: result.error
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Error calling Web App:', error);
      return NextResponse.json(
        {
          error: 'Failed to connect to Google Sheets Web App',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // 更新連結的推送時間
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('links')
      .update({ sheets_pushed_at: now })
      .in('id', linkIds);

    if (updateError) {
      console.error('Error updating sheets_pushed_at:', updateError);
      // 不中斷，因為資料已經推送成功
    }

    // 更新設定的最後推送時間
    await supabase
      .from('google_sheets_configs')
      .update({ last_push_at: now })
      .eq('id', config.id);

    return NextResponse.json({
      success: true,
      message: `成功推送 ${rows.length} 筆資料到 Google Sheets`,
      pushedCount: rows.length,
      linkIds
    });
  } catch (error) {
    console.error('Error in POST /api/integrations/google-sheets/push:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
