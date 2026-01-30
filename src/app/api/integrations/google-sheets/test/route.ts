/**
 * POST /api/integrations/google-sheets/test
 *
 * 測試 Google Sheets 連線是否可用
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractSpreadsheetId, testSheetConnection } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    // 驗證登入狀態
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 });
    }

    const body = await request.json();
    const { spreadsheetUrl } = body;

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

    // 測試連線
    const result = await testSheetConnection(spreadsheetId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `成功連接到 Google Sheet: ${result.title}`,
        spreadsheetId,
        title: result.title
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || '無法連接到 Google Sheet',
          spreadsheetId
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/integrations/google-sheets/test:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
