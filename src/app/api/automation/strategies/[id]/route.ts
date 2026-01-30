import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  AutomationStrategy,
  AutomationStrategyWithLink,
  UpdateStrategyInput,
  validateStrategyInput,
} from '@/lib/automation-types';

/**
 * GET /api/automation/strategies/[id]
 * 獲取單一策略詳情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // 取得當前用戶
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const includeLink = request.nextUrl.searchParams.get('include_link') === 'true';
    const includeVariants = request.nextUrl.searchParams.get('include_variants') === 'true';

    // 建立查詢
    let selectQuery = includeLink
      ? `
          *,
          short_link:links!short_link_id (
            id,
            short_code,
            title,
            affiliate_url,
            click_count
          )
        `
      : '*';

    const { data, error } = await supabase
      .from('automation_strategies')
      .select(selectQuery)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching strategy:', error);
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    // 如果需要包含變體
    let variants = null;
    if (includeVariants) {
      const { data: variantsData } = await supabase
        .from('strategy_variants')
        .select('*')
        .eq('strategy_id', id)
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      variants = variantsData;
    }

    return NextResponse.json({
      strategy: data as unknown as AutomationStrategy | AutomationStrategyWithLink,
      variants,
    });
  } catch (error) {
    console.error('Error in GET /api/automation/strategies/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/automation/strategies/[id]
 * 更新策略（僅創建者）
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // 驗證用戶登入
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 解析請求資料
    const body: UpdateStrategyInput = await request.json();

    // 驗證輸入
    const errors = validateStrategyInput(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
    }

    // 檢查策略是否存在且屬於該用戶
    const { data: existingStrategy, error: checkError } = await supabase
      .from('automation_strategies')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (checkError || !existingStrategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    if (existingStrategy.created_by !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this strategy' },
        { status: 403 }
      );
    }

    // 檢查短連結是否存在（如果有提供）
    if (body.short_link_id) {
      const { data: link, error: linkError } = await supabase
        .from('links')
        .select('id')
        .eq('id', body.short_link_id)
        .eq('user_id', user.id)
        .single();

      if (linkError || !link) {
        return NextResponse.json(
          { error: 'Short link not found or not owned by user' },
          { status: 404 }
        );
      }
    }

    // 更新策略
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.post_content !== undefined) updateData.post_content = body.post_content;
    if (body.short_link_id !== undefined) updateData.short_link_id = body.short_link_id;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.is_public !== undefined) updateData.is_public = body.is_public;
    if (body.allowed_users !== undefined) updateData.allowed_users = body.allowed_users;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    const { data, error } = await supabase
      .from('automation_strategies')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating strategy:', error);
      return NextResponse.json({ error: 'Failed to update strategy' }, { status: 500 });
    }

    return NextResponse.json({ strategy: data as unknown as AutomationStrategy });
  } catch (error) {
    console.error('Error in PATCH /api/automation/strategies/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/automation/strategies/[id]
 * 刪除策略（僅創建者）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // 驗證用戶登入
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 檢查策略是否存在且屬於該用戶
    const { data: existingStrategy, error: checkError } = await supabase
      .from('automation_strategies')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (checkError || !existingStrategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    if (existingStrategy.created_by !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this strategy' },
        { status: 403 }
      );
    }

    // 刪除策略（會自動刪除關聯的變體和使用記錄，因為設定了 ON DELETE CASCADE）
    const { error } = await supabase.from('automation_strategies').delete().eq('id', id);

    if (error) {
      console.error('Error deleting strategy:', error);
      return NextResponse.json({ error: 'Failed to delete strategy' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Strategy deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/automation/strategies/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
