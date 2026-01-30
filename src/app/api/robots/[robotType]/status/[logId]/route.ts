import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GetExecutionStatusResponse } from '@/lib/robot-types';

/**
 * GET /api/robots/[robotType]/status/[logId]
 * 查詢執行狀態
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ robotType: string; logId: string }> }
) {
  try {
    const supabase = await createClient();
    const { robotType, logId } = await context.params;
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

    // 獲取執行記錄
    const { data: log, error: logError } = await supabase
      .from('robot_execution_logs')
      .select(`
        *,
        robot:robot_configs(*)
      `)
      .eq('id', logId)
      .eq('user_id', user.id)
      .single();

    if (logError || !log) {
      return NextResponse.json(
        { error: '找不到執行記錄' },
        { status: 404 }
      );
    }

    // 驗證機器人類型
    if (log.robot.robot_type !== robotType) {
      return NextResponse.json(
        { error: '機器人類型不匹配' },
        { status: 400 }
      );
    }

    // 如果執行完成，獲取創建的策略詳情
    let strategies: any[] = [];
    if (log.created_strategy_ids && log.created_strategy_ids.length > 0) {
      const { data: strategiesData } = await supabase
        .from('automation_strategies')
        .select('id, name, post_content, short_link_id')
        .in('id', log.created_strategy_ids);

      if (strategiesData) {
        // 獲取短連結資訊
        const linkIds = strategiesData
          .map((s: any) => s.short_link_id)
          .filter(Boolean);

        const { data: links } = await supabase
          .from('links')
          .select('id, short_code')
          .in('id', linkIds);

        const linkMap = new Map(links?.map((l: any) => [l.id, l.short_code]) || []);

        strategies = strategiesData.map((s: any) => ({
          id: s.id,
          name: s.name,
          post_content: s.post_content,
          short_link: linkMap.get(s.short_link_id)
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/${linkMap.get(s.short_link_id)}`
            : undefined
        }));
      }
    }

    // 構建回應
    const response: GetExecutionStatusResponse = {
      log,
      robot: log.robot,
      progress: {
        percentage: log.progress_percentage || 0,
        current: log.success_count + log.failed_count,
        total: log.target_count || 0,
        currentStep: log.current_step || '準備中'
      },
      results: {
        strategies,
        errors: log.error_messages || [],
        warnings: log.warnings || []
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('狀態查詢 API 錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}