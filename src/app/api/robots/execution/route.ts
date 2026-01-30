/**
 * GET /api/robots/execution
 *
 * 獲取機器人執行歷史記錄
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RobotExecutionLog, ExecutionStatus } from '@/lib/robot-types';

interface GetExecutionLogsParams {
  robot_id?: string;
  robot_type?: string;
  status?: ExecutionStatus;
  limit?: number;
  offset?: number;
}

interface GetExecutionLogsResponse {
  logs: Array<
    RobotExecutionLog & {
      robot_config?: {
        id: string;
        name: string;
        robot_type: string;
        icon?: string;
      };
    }
  >;
  count: number;
  hasMore: boolean;
}

/**
 * GET /api/robots/execution
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 驗證用戶登入
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 解析查詢參數
    const searchParams = request.nextUrl.searchParams;
    const params: GetExecutionLogsParams = {
      robot_id: searchParams.get('robot_id') || undefined,
      robot_type: searchParams.get('robot_type') || undefined,
      status: (searchParams.get('status') as ExecutionStatus) || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // 建立查詢
    let query = supabase
      .from('robot_execution_logs')
      .select(
        `
        *,
        robot_config:robot_configs!robot_id (
          id,
          name,
          robot_type,
          icon
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', user.id);

    // 套用篩選條件
    if (params.robot_id) {
      query = query.eq('robot_id', params.robot_id);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    // 如果指定 robot_type，需要 join robot_configs
    if (params.robot_type) {
      // 先查詢符合條件的 robot_id
      const { data: robots } = await supabase
        .from('robot_configs')
        .select('id')
        .eq('robot_type', params.robot_type);

      if (robots && robots.length > 0) {
        const robotIds = robots.map((r) => r.id);
        query = query.in('robot_id', robotIds);
      } else {
        // 沒有符合的機器人，返回空結果
        return NextResponse.json({
          logs: [],
          count: 0,
          hasMore: false,
        });
      }
    }

    // 排序
    query = query.order('created_at', { ascending: false });

    // 分頁
    if (params.limit) {
      query = query.range(
        params.offset || 0,
        (params.offset || 0) + params.limit - 1
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching execution logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch execution logs' },
        { status: 500 }
      );
    }

    const response: GetExecutionLogsResponse = {
      logs: data || [],
      count: count || 0,
      hasMore:
        count !== null && params.limit
          ? count > (params.offset || 0) + params.limit
          : false,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/robots/execution:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
