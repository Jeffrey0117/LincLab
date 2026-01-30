/**
 * GET/POST /api/integrations/google-sheets/config
 *
 * 取得或儲存用戶的 Google Sheets 設定
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractSpreadsheetId } from '@/lib/google-sheets';

interface GoogleSheetsConfig {
  id: string;
  created_at: string;
  user_id: string | null;
  spreadsheet_url: string;
  spreadsheet_id: string;
  sheet_name: string;
  is_enabled: boolean;
  last_push_at: string | null;
}

/**
 * GET /api/integrations/google-sheets/config
 * 取得用戶的 Google Sheets 設定
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // 取得當前用戶
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    // 根據 user_id 取得該用戶的設定
    const { data: config, error } = await supabase
      .from('google_sheets_configs')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching config:', error);
      return NextResponse.json(
        { error: 'Failed to fetch configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      config: config || null
    });
  } catch (error) {
    console.error('Error in GET /api/integrations/google-sheets/config:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations/google-sheets/config
 * 儲存用戶的 Google Sheets 設定
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 取得當前用戶
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { spreadsheetUrl, sheetName = 'Sheet1', webappUrl = '', isEnabled = true } = body;

    if (!spreadsheetUrl) {
      return NextResponse.json(
        { error: 'spreadsheetUrl is required' },
        { status: 400 }
      );
    }

    // 從 URL 提取 spreadsheetId
    const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'Invalid Google Sheets URL' },
        { status: 400 }
      );
    }

    // 檢查該用戶是否已有設定
    const { data: existingConfig } = await supabase
      .from('google_sheets_configs')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    let result;

    if (existingConfig) {
      // 更新現有設定
      const { data, error } = await supabase
        .from('google_sheets_configs')
        .update({
          spreadsheet_url: spreadsheetUrl,
          spreadsheet_id: spreadsheetId,
          sheet_name: sheetName,
          webapp_url: webappUrl,
          is_enabled: isEnabled
        })
        .eq('id', existingConfig.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating config:', error);
        return NextResponse.json(
          { error: 'Failed to update configuration' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // 建立新設定，包含 user_id
      const { data, error } = await supabase
        .from('google_sheets_configs')
        .insert({
          user_id: user.id,
          spreadsheet_url: spreadsheetUrl,
          spreadsheet_id: spreadsheetId,
          sheet_name: sheetName,
          webapp_url: webappUrl,
          is_enabled: isEnabled
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating config:', error);
        return NextResponse.json(
          { error: 'Failed to create configuration' },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json({
      success: true,
      config: result as GoogleSheetsConfig
    });
  } catch (error) {
    console.error('Error in POST /api/integrations/google-sheets/config:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
