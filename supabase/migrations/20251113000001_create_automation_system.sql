-- ============================================================
-- 自動化發文助手系統 - 資料庫 Schema
-- 建立時間: 2025-11-13
-- ============================================================

-- ============================================================
-- 1. 策略模板表 (automation_strategies)
-- ============================================================
CREATE TABLE IF NOT EXISTS automation_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 基本資訊
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'beauty', 'discount', 'food', '3c', 'travel', 'game', 'fashion', 'other'
  icon TEXT, -- emoji or icon name

  -- 內容設定
  post_content TEXT NOT NULL, -- 預設的貼文文案
  short_link_id UUID REFERENCES links(id) ON DELETE SET NULL, -- 關聯的短連結

  -- 狀態
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true, -- 是否對所有用戶公開

  -- 統計
  total_uses INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,

  -- 權限
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  allowed_users UUID[], -- 允許使用的用戶 ID 列表（null = 所有人）

  -- 元資料
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- 約束
  CONSTRAINT valid_category CHECK (
    category IS NULL OR
    category IN ('beauty', 'discount', 'food', '3c', 'travel', 'game', 'fashion', 'other')
  )
);

-- 索引
CREATE INDEX idx_strategies_category ON automation_strategies(category) WHERE category IS NOT NULL;
CREATE INDEX idx_strategies_active ON automation_strategies(is_active) WHERE is_active = true;
CREATE INDEX idx_strategies_public ON automation_strategies(is_public) WHERE is_public = true;
CREATE INDEX idx_strategies_created_by ON automation_strategies(created_by);
CREATE INDEX idx_strategies_created_at ON automation_strategies(created_at DESC);

-- 更新時間觸發器
CREATE OR REPLACE FUNCTION update_automation_strategies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_automation_strategies_updated_at
  BEFORE UPDATE ON automation_strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_automation_strategies_updated_at();

-- ============================================================
-- 2. 文案變體表 (strategy_variants)
-- ============================================================
CREATE TABLE IF NOT EXISTS strategy_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  strategy_id UUID NOT NULL REFERENCES automation_strategies(id) ON DELETE CASCADE,

  post_content TEXT NOT NULL,
  variant_name VARCHAR(50),
  is_active BOOLEAN DEFAULT true,

  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_variants_strategy_id ON strategy_variants(strategy_id);
CREATE INDEX idx_variants_active ON strategy_variants(is_active) WHERE is_active = true;

-- ============================================================
-- 3. 使用記錄表 (strategy_usage_logs)
-- ============================================================
CREATE TABLE IF NOT EXISTS strategy_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  strategy_id UUID NOT NULL REFERENCES automation_strategies(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES strategy_variants(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 使用資訊
  copied_content BOOLEAN DEFAULT false,
  copied_link BOOLEAN DEFAULT false,
  marked_as_used BOOLEAN DEFAULT false,

  -- 元資料
  user_agent TEXT,
  ip_address INET,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 索引
CREATE INDEX idx_usage_logs_user ON strategy_usage_logs(user_id);
CREATE INDEX idx_usage_logs_strategy ON strategy_usage_logs(strategy_id);
CREATE INDEX idx_usage_logs_created_at ON strategy_usage_logs(created_at DESC);
CREATE INDEX idx_usage_logs_user_created_at ON strategy_usage_logs(user_id, created_at DESC);

-- ============================================================
-- 4. Row Level Security (RLS) 策略
-- ============================================================

-- 啟用 RLS
ALTER TABLE automation_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_usage_logs ENABLE ROW LEVEL SECURITY;

-- ========== automation_strategies RLS ==========

-- 讀取策略：可以看到公開的策略，或自己創建的策略，或被允許使用的策略
CREATE POLICY "Users can view public or owned or allowed strategies"
  ON automation_strategies
  FOR SELECT
  USING (
    is_public = true
    OR created_by = auth.uid()
    OR auth.uid() = ANY(allowed_users)
  );

-- 插入策略：只有登入用戶可以創建策略
CREATE POLICY "Authenticated users can create strategies"
  ON automation_strategies
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- 更新策略：只有創建者可以更新
CREATE POLICY "Users can update their own strategies"
  ON automation_strategies
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- 刪除策略：只有創建者可以刪除
CREATE POLICY "Users can delete their own strategies"
  ON automation_strategies
  FOR DELETE
  USING (created_by = auth.uid());

-- ========== strategy_variants RLS ==========

-- 讀取變體：可以看到所屬策略可見的變體
CREATE POLICY "Users can view variants of accessible strategies"
  ON strategy_variants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM automation_strategies s
      WHERE s.id = strategy_variants.strategy_id
      AND (
        s.is_public = true
        OR s.created_by = auth.uid()
        OR auth.uid() = ANY(s.allowed_users)
      )
    )
  );

-- 插入變體：只有策略創建者可以新增變體
CREATE POLICY "Strategy owners can create variants"
  ON strategy_variants
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM automation_strategies s
      WHERE s.id = strategy_variants.strategy_id
      AND s.created_by = auth.uid()
    )
  );

-- 更新變體：只有策略創建者可以更新變體
CREATE POLICY "Strategy owners can update variants"
  ON strategy_variants
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM automation_strategies s
      WHERE s.id = strategy_variants.strategy_id
      AND s.created_by = auth.uid()
    )
  );

-- 刪除變體：只有策略創建者可以刪除變體
CREATE POLICY "Strategy owners can delete variants"
  ON strategy_variants
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM automation_strategies s
      WHERE s.id = strategy_variants.strategy_id
      AND s.created_by = auth.uid()
    )
  );

-- ========== strategy_usage_logs RLS ==========

-- 讀取記錄：只能看到自己的使用記錄
CREATE POLICY "Users can view their own usage logs"
  ON strategy_usage_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- 插入記錄：只能創建自己的使用記錄
CREATE POLICY "Users can create their own usage logs"
  ON strategy_usage_logs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 更新記錄：只能更新自己的使用記錄
CREATE POLICY "Users can update their own usage logs"
  ON strategy_usage_logs
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 不允許刪除記錄（保留歷史）
-- 如果需要刪除，可以新增以下策略：
-- CREATE POLICY "Users can delete their own usage logs"
--   ON strategy_usage_logs
--   FOR DELETE
--   USING (user_id = auth.uid());

-- ============================================================
-- 5. 自動更新統計數據的觸發器
-- ============================================================

-- 當新增使用記錄時，更新策略的使用統計
CREATE OR REPLACE FUNCTION update_strategy_stats_on_use()
RETURNS TRIGGER AS $$
BEGIN
  -- 更新策略的總使用次數
  UPDATE automation_strategies
  SET total_uses = total_uses + 1
  WHERE id = NEW.strategy_id;

  -- 如果有變體，更新變體的使用統計
  IF NEW.variant_id IS NOT NULL THEN
    UPDATE strategy_variants
    SET
      usage_count = usage_count + 1,
      last_used_at = NEW.created_at
    WHERE id = NEW.variant_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_strategy_stats
  AFTER INSERT ON strategy_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_strategy_stats_on_use();

-- ============================================================
-- 6. 實用函數
-- ============================================================

-- 取得熱門策略（最近 30 天）
CREATE OR REPLACE FUNCTION get_popular_strategies(
  days_back INTEGER DEFAULT 30,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  strategy_id UUID,
  strategy_name VARCHAR(100),
  category VARCHAR(50),
  icon TEXT,
  recent_uses BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.category,
    s.icon,
    COUNT(l.id) as recent_uses
  FROM automation_strategies s
  LEFT JOIN strategy_usage_logs l ON s.id = l.strategy_id
    AND l.created_at >= NOW() - (days_back || ' days')::INTERVAL
  WHERE s.is_active = true AND s.is_public = true
  GROUP BY s.id, s.name, s.category, s.icon
  ORDER BY recent_uses DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 取得用戶最常使用的策略
CREATE OR REPLACE FUNCTION get_user_favorite_strategies(
  target_user_id UUID,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  strategy_id UUID,
  strategy_name VARCHAR(100),
  category VARCHAR(50),
  icon TEXT,
  use_count BIGINT,
  last_used TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.category,
    s.icon,
    COUNT(l.id) as use_count,
    MAX(l.created_at) as last_used
  FROM automation_strategies s
  INNER JOIN strategy_usage_logs l ON s.id = l.strategy_id
  WHERE l.user_id = target_user_id
  GROUP BY s.id, s.name, s.category, s.icon
  ORDER BY use_count DESC, last_used DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. 註解
-- ============================================================

COMMENT ON TABLE automation_strategies IS '自動化發文策略模板表';
COMMENT ON TABLE strategy_variants IS '策略文案變體表（支援 A/B Testing）';
COMMENT ON TABLE strategy_usage_logs IS '策略使用記錄表';

COMMENT ON COLUMN automation_strategies.post_content IS '預設的貼文文案';
COMMENT ON COLUMN automation_strategies.short_link_id IS '關聯的短連結 ID';
COMMENT ON COLUMN automation_strategies.is_public IS '是否對所有用戶公開';
COMMENT ON COLUMN automation_strategies.allowed_users IS '允許使用的用戶 ID 列表（NULL = 所有人）';
COMMENT ON COLUMN automation_strategies.total_uses IS '總使用次數';
COMMENT ON COLUMN automation_strategies.total_clicks IS '總點擊次數';

COMMENT ON COLUMN strategy_usage_logs.copied_content IS '是否複製了文案';
COMMENT ON COLUMN strategy_usage_logs.copied_link IS '是否複製了連結';
COMMENT ON COLUMN strategy_usage_logs.marked_as_used IS '是否標記為已使用';
