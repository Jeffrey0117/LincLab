import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GetExecutionHistoryResponse } from '@/lib/robot-types';

/**
 * GET /api/robots/history
 * 獲取執行歷史記錄
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      );
    }

    // 驗證用戶
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: '無效的授權令牌' },
        { status: 401 }
      );
    }

    // 獲取查詢參數
    const searchParams = request.nextUrl.searchParams;
    const robotId = searchParams.get('robot_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // 構建查詢
    let query = supabase
      .from('robot_execution_logs')
      .select(`
        *,
        robot:robot_configs(
          id,
          name,
          robot_type,
          icon,
          category
        )
      `, { count: 'exact' })
      .eq('user_id', user.id);

    // 應用篩選條件
    if (robotId) {
      query = query.eq('robot_id', robotId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // 排序
    const orderColumn = sortBy === 'duration' ? 'duration_seconds' : sortBy;
    query = query.order(orderColumn, { ascending: sortOrder === 'asc' });

    // 分頁
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // 執行查詢
    const { data: logs, count, error: queryError } = await query;

    if (queryError) {
      console.error('查詢執行歷史失敗:', queryError);
      return NextResponse.json(
        { error: '查詢執行歷史失敗' },
        { status: 500 }
      );
    }

    // 處理結果
    const processedLogs = logs?.map(log => ({
      ...log,
      // 計算執行時間
      duration_text: log.duration_seconds
        ? formatDuration(log.duration_seconds)
        : '進行中',
      // 成功率
      success_rate: log.target_count > 0
        ? Math.round((log.success_count / log.target_count) * 100)
        : 0
    })) || [];

    const response: GetExecutionHistoryResponse = {
      logs: processedLogs,
      total: count || 0,
      page,
      pageSize
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('執行歷史 API 錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/robots/history
 * 刪除執行記錄
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      );
    }

    // 驗證用戶
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: '無效的授權令牌' },
        { status: 401 }
      );
    }

    // 獲取要刪除的記錄 ID
    const body = await request.json();
    const { logIds } = body;

    if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
      return NextResponse.json(
        { error: '缺少要刪除的記錄 ID' },
        { status: 400 }
      );
    }

    // 刪除記錄（只能刪除自己的記錄）
    const { error: deleteError } = await supabase
      .from('robot_execution_logs')
      .delete()
      .in('id', logIds)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('刪除執行記錄失敗:', deleteError);
      return NextResponse.json(
        { error: '刪除執行記錄失敗' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `成功刪除 ${logIds.length} 條記錄`
    });

  } catch (error) {
    console.error('刪除執行記錄 API 錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}

/**
 * 格式化執行時間
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} 秒`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return `${minutes} 分 ${remainingSeconds} 秒`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} 小時 ${remainingMinutes} 分`;
}