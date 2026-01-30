import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GetRobotsResponse } from '@/lib/robot-types';

/**
 * GET /api/robots
 * 獲取所有可用的機器人列表
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    // 從 header 獲取用戶 token
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

    // 獲取可用的機器人列表
    const { data: robots, error: robotsError } = await supabase
      .rpc('get_available_robots', { user_id: user.id });

    if (robotsError) {
      console.error('獲取機器人列表失敗:', robotsError);
      return NextResponse.json(
        { error: '獲取機器人列表失敗' },
        { status: 500 }
      );
    }

    // 統計各分類的機器人數量
    const categories = robots.reduce((acc: any[], robot: any) => {
      const existing = acc.find(c => c.category === robot.category);
      if (existing) {
        existing.count++;
      } else if (robot.category) {
        acc.push({ category: robot.category, count: 1 });
      }
      return acc;
    }, []);

    const response: GetRobotsResponse = {
      robots: robots || [],
      categories
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('機器人 API 錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/robots
 * 創建新機器人（管理員專用）
 */
export async function POST(request: NextRequest) {
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

    // 檢查是否為管理員
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('raw_user_meta_data')
      .eq('id', user.id)
      .single();

    if (userError || userData?.raw_user_meta_data?.role !== 'admin') {
      return NextResponse.json(
        { error: '需要管理員權限' },
        { status: 403 }
      );
    }

    // 獲取請求資料
    const body = await request.json();

    // 驗證必要欄位
    if (!body.name || !body.robot_type) {
      return NextResponse.json(
        { error: '缺少必要欄位' },
        { status: 400 }
      );
    }

    // 創建機器人
    const { data: robot, error: createError } = await supabase
      .from('robot_configs')
      .insert({
        ...body,
        created_by: user.id
      })
      .select()
      .single();

    if (createError) {
      console.error('創建機器人失敗:', createError);
      return NextResponse.json(
        { error: '創建機器人失敗' },
        { status: 500 }
      );
    }

    return NextResponse.json(robot);

  } catch (error) {
    console.error('機器人創建 API 錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    );
  }
}