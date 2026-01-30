-- ============================================================
-- 機器人爬蟲系統 - 資料庫 Schema
-- 建立時間: 2025-11-13
-- 功能: 自動抓取外部內容並生成 automation_strategies 卡片
-- ============================================================

-- ============================================================
-- 1. 機器人配置表 (robot_configs)
-- 存儲不同爬蟲機器人的配置資訊
-- ============================================================
CREATE TABLE IF NOT EXISTS robot_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 基本資訊
  name VARCHAR(100) NOT NULL, -- 機器人名稱：'PTT 正妹爬蟲'
  robot_type VARCHAR(50) NOT NULL UNIQUE, -- 機器人類型：'ptt_beauty', 'dcard_beauty', 'ig_beauty'
  description TEXT, -- 機器人描述
  icon TEXT, -- emoji 或 icon name
  category VARCHAR(50), -- 分類：'beauty', 'discount', 'food', 'news', 'tech'

  -- 配置
  config JSONB DEFAULT '{}'::jsonb, -- 爬蟲特定配置
  -- PTT 配置範例：
  -- {
  --   "board": "Beauty",
  --   "baseUrl": "https://www.ptt.cc/bbs/Beauty/index.html",
  --   "minPushCount": 10,
  --   "filterKeywords": ["[公告]", "[協尋]"],
  --   "maxPages": 5
  -- }

  default_template_type VARCHAR(50) DEFAULT 'image', -- 預設模板類型
  default_strategy_config JSONB DEFAULT '{}'::jsonb, -- 預設策略配置

  -- 執行設定
  max_items_per_run INTEGER DEFAULT 10, -- 每次執行最大抓取數量
  rate_limit_delay INTEGER DEFAULT 1000, -- 請求間隔（毫秒）
  timeout_seconds INTEGER DEFAULT 30, -- 單次執行超時時間

  -- 狀態
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true, -- 是否對所有用戶開放
  is_beta BOOLEAN DEFAULT false, -- 是否為測試功能

  -- 權限
  created_by UUID REFERENCES auth.users(id),
  allowed_users UUID[], -- 允許使用的用戶列表
  required_role VARCHAR(50), -- 需要的角色：'admin', 'premium', null

  -- 統計
  total_executions INTEGER DEFAULT 0,
  total_cards_created INTEGER DEFAULT 0,
  total_items_scraped INTEGER DEFAULT 0,
  last_execution_at TIMESTAMP WITH TIME ZONE,

  -- 排序和顯示
  display_order INTEGER DEFAULT 100,

  -- 約束
  CONSTRAINT valid_robot_type CHECK (
    robot_type ~ '^[a-z][a-z0-9_]*$' -- 只允許小寫字母、數字和底線
  ),
  CONSTRAINT valid_category CHECK (
    category IS NULL OR
    category IN ('beauty', 'discount', 'food', 'news', 'tech', 'entertainment', 'other')
  ),
  CONSTRAINT valid_template_type CHECK (
    default_template_type IN ('image', 'external_link', 'beauty', 'article', 'video', 'product')
  )
);

-- 索引
CREATE INDEX idx_robot_configs_type ON robot_configs(robot_type);
CREATE INDEX idx_robot_configs_category ON robot_configs(category) WHERE category IS NOT NULL;
CREATE INDEX idx_robot_configs_active ON robot_configs(is_active) WHERE is_active = true;
CREATE INDEX idx_robot_configs_public ON robot_configs(is_public) WHERE is_public = true;
CREATE INDEX idx_robot_configs_display_order ON robot_configs(display_order, created_at);

-- ============================================================
-- 2. 機器人執行記錄表 (robot_execution_logs)
-- 記錄每次爬蟲執行的詳細資訊
-- ============================================================
CREATE TABLE IF NOT EXISTS robot_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  robot_id UUID NOT NULL REFERENCES robot_configs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- 執行狀態
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending': 準備中
  -- 'running': 執行中
  -- 'completed': 完成
  -- 'failed': 失敗
  -- 'partial': 部分成功
  -- 'cancelled': 已取消

  -- 執行參數
  execution_params JSONB DEFAULT '{}'::jsonb,
  -- {
  --   "targetCount": 10,
  --   "filters": {
  --     "minPushCount": 15,
  --     "excludeKeywords": ["協尋"]
  --   }
  -- }

  -- 執行結果
  target_count INTEGER, -- 目標抓取數量
  scraped_count INTEGER DEFAULT 0, -- 實際抓取數量
  success_count INTEGER DEFAULT 0, -- 成功創建卡片數量
  failed_count INTEGER DEFAULT 0, -- 失敗數量
  skipped_count INTEGER DEFAULT 0, -- 跳過數量（重複或不符合條件）

  -- 創建的資源
  created_strategy_ids UUID[], -- 創建的策略 ID 陣列
  created_link_ids UUID[], -- 創建的短連結 ID 陣列

  -- 錯誤資訊
  error_messages TEXT[], -- 錯誤訊息陣列
  warnings TEXT[], -- 警告訊息陣列

  -- 執行時間
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- 進度追蹤
  progress_percentage INTEGER DEFAULT 0, -- 執行進度百分比
  current_step VARCHAR(100), -- 當前步驟描述

  -- 詳細記錄
  scraped_items JSONB DEFAULT '[]'::jsonb, -- 抓取的原始資料
  processing_logs JSONB DEFAULT '[]'::jsonb, -- 處理過程記錄

  -- 元資料
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT valid_status CHECK (
    status IN ('pending', 'running', 'completed', 'failed', 'partial', 'cancelled')
  ),
  CONSTRAINT valid_progress CHECK (
    progress_percentage >= 0 AND progress_percentage <= 100
  )
);

-- 索引
CREATE INDEX idx_execution_logs_robot ON robot_execution_logs(robot_id);
CREATE INDEX idx_execution_logs_user ON robot_execution_logs(user_id);
CREATE INDEX idx_execution_logs_status ON robot_execution_logs(status);
CREATE INDEX idx_execution_logs_created_at ON robot_execution_logs(created_at DESC);
CREATE INDEX idx_execution_logs_user_created ON robot_execution_logs(user_id, created_at DESC);

-- ============================================================
-- 3. 爬蟲項目表 (scraped_items)
-- 存儲爬取的原始資料（去重用）
-- ============================================================
CREATE TABLE IF NOT EXISTS scraped_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  robot_id UUID NOT NULL REFERENCES robot_configs(id) ON DELETE CASCADE,
  execution_log_id UUID REFERENCES robot_execution_logs(id) ON DELETE SET NULL,

  -- 來源識別
  source_url TEXT NOT NULL, -- 原始網址
  source_id VARCHAR(255), -- 來源平台的 ID（如 PTT 文章編號）
  source_hash VARCHAR(64), -- 內容雜湊值（用於去重）

  -- 抓取的資料
  title TEXT,
  content TEXT,
  author VARCHAR(100),
  publish_date TIMESTAMP WITH TIME ZONE,

  -- 圖片和媒體
  images TEXT[], -- 圖片網址陣列
  videos TEXT[], -- 影片網址陣列
  primary_image TEXT, -- 主要圖片

  -- 互動數據
  view_count INTEGER,
  like_count INTEGER,
  comment_count INTEGER,
  share_count INTEGER,
  push_count INTEGER, -- PTT 推文數

  -- 處理狀態
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  strategy_id UUID REFERENCES automation_strategies(id) ON DELETE SET NULL,
  link_id UUID REFERENCES links(id) ON DELETE SET NULL,

  -- 原始資料
  raw_data JSONB, -- 完整的原始資料

  -- 建立唯一索引防止重複
  CONSTRAINT unique_source_item UNIQUE (robot_id, source_hash)
);

-- 索引
CREATE INDEX idx_scraped_items_robot ON scraped_items(robot_id);
CREATE INDEX idx_scraped_items_execution ON scraped_items(execution_log_id);
CREATE INDEX idx_scraped_items_processed ON scraped_items(is_processed);
CREATE INDEX idx_scraped_items_created_at ON scraped_items(created_at DESC);
CREATE INDEX idx_scraped_items_source_hash ON scraped_items(source_hash);

-- ============================================================
-- 4. 文案生成模板表 (content_generation_templates)
-- 用於自動生成貼文文案
-- ============================================================
CREATE TABLE IF NOT EXISTS content_generation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  robot_id UUID REFERENCES robot_configs(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,

  -- 模板內容（支援變數替換）
  template_content TEXT NOT NULL,
  -- 範例：
  -- "🔥 {title}\n\n{description}\n\n👉 點擊查看更多精彩內容\n\n#正妹 #PTT"

  -- 可用變數
  available_variables TEXT[], -- ['title', 'description', 'author', 'date', 'push_count']

  -- 使用條件
  conditions JSONB, -- 使用此模板的條件
  -- {
  --   "minPushCount": 20,
  --   "hasImage": true
  -- }

  priority INTEGER DEFAULT 100, -- 優先級（數字越小優先級越高）
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
);

-- 索引
CREATE INDEX idx_content_templates_robot ON content_generation_templates(robot_id);
CREATE INDEX idx_content_templates_active ON content_generation_templates(is_active);
CREATE INDEX idx_content_templates_priority ON content_generation_templates(priority);

-- ============================================================
-- 5. 更新時間觸發器
-- ============================================================
CREATE OR REPLACE FUNCTION update_robot_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_robot_configs_updated_at
  BEFORE UPDATE ON robot_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_robot_configs_updated_at();

-- ============================================================
-- 6. 統計更新觸發器
-- ============================================================
CREATE OR REPLACE FUNCTION update_robot_stats_on_execution()
RETURNS TRIGGER AS $$
BEGIN
  -- 只在執行完成時更新統計
  IF NEW.status IN ('completed', 'partial') AND OLD.status != NEW.status THEN
    UPDATE robot_configs
    SET
      total_executions = total_executions + 1,
      total_cards_created = total_cards_created + COALESCE(NEW.success_count, 0),
      total_items_scraped = total_items_scraped + COALESCE(NEW.scraped_count, 0),
      last_execution_at = NEW.completed_at
    WHERE id = NEW.robot_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_robot_stats
  AFTER UPDATE ON robot_execution_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_robot_stats_on_execution();

-- ============================================================
-- 7. Row Level Security (RLS)
-- ============================================================

-- 啟用 RLS
ALTER TABLE robot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_generation_templates ENABLE ROW LEVEL SECURITY;

-- ========== robot_configs RLS ==========
CREATE POLICY "Users can view public or allowed robots"
  ON robot_configs
  FOR SELECT
  USING (
    is_public = true
    OR created_by = auth.uid()
    OR auth.uid() = ANY(allowed_users)
  );

CREATE POLICY "Only admins can create robots"
  ON robot_configs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can update robots"
  ON robot_configs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ========== robot_execution_logs RLS ==========
CREATE POLICY "Users can view their own execution logs"
  ON robot_execution_logs
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create execution logs"
  ON robot_execution_logs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their running executions"
  ON robot_execution_logs
  FOR UPDATE
  USING (user_id = auth.uid() AND status IN ('pending', 'running'));

-- ========== scraped_items RLS ==========
CREATE POLICY "Users can view scraped items from accessible robots"
  ON scraped_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM robot_configs rc
      WHERE rc.id = scraped_items.robot_id
      AND (
        rc.is_public = true
        OR rc.created_by = auth.uid()
        OR auth.uid() = ANY(rc.allowed_users)
      )
    )
  );

CREATE POLICY "System can insert scraped items"
  ON scraped_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM robot_execution_logs rel
      WHERE rel.id = scraped_items.execution_log_id
      AND rel.user_id = auth.uid()
    )
  );

-- ========== content_generation_templates RLS ==========
CREATE POLICY "Users can view templates"
  ON content_generation_templates
  FOR SELECT
  USING (true); -- 所有人都可以看模板

CREATE POLICY "Only admins can manage templates"
  ON content_generation_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================
-- 8. 實用函數
-- ============================================================

-- 取得可用的機器人列表
CREATE OR REPLACE FUNCTION get_available_robots(
  user_id UUID DEFAULT auth.uid()
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(100),
  robot_type VARCHAR(50),
  description TEXT,
  icon TEXT,
  category VARCHAR(50),
  is_beta BOOLEAN,
  last_execution_at TIMESTAMP WITH TIME ZONE,
  total_executions INTEGER,
  total_cards_created INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    rc.name,
    rc.robot_type,
    rc.description,
    rc.icon,
    rc.category,
    rc.is_beta,
    rc.last_execution_at,
    rc.total_executions,
    rc.total_cards_created
  FROM robot_configs rc
  WHERE
    rc.is_active = true
    AND (
      rc.is_public = true
      OR rc.created_by = user_id
      OR user_id = ANY(rc.allowed_users)
    )
    AND (
      rc.required_role IS NULL
      OR EXISTS (
        SELECT 1 FROM auth.users u
        WHERE u.id = user_id
        AND u.raw_user_meta_data->>'role' = rc.required_role
      )
    )
  ORDER BY rc.display_order, rc.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 檢查是否有重複的爬取項目
CREATE OR REPLACE FUNCTION check_duplicate_item(
  p_robot_id UUID,
  p_source_hash VARCHAR(64)
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM scraped_items
    WHERE robot_id = p_robot_id
    AND source_hash = p_source_hash
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 9. 預設資料：PTT 正妹爬蟲
-- ============================================================
INSERT INTO robot_configs (
  name,
  robot_type,
  description,
  icon,
  category,
  config,
  default_template_type,
  max_items_per_run,
  rate_limit_delay,
  is_active,
  is_public
) VALUES (
  'PTT 表特版爬蟲',
  'ptt_beauty',
  '自動抓取 PTT 表特版熱門文章，生成精美圖片連結卡片',
  '😍',
  'beauty',
  '{
    "board": "Beauty",
    "baseUrl": "https://www.ptt.cc/bbs/Beauty/index.html",
    "minPushCount": 10,
    "filterKeywords": ["[公告]", "[協尋]", "[神人]"],
    "maxPages": 3,
    "cookieOver18": "1"
  }'::jsonb,
  'image',
  10,
  1500,
  true,
  true
) ON CONFLICT (robot_type) DO NOTHING;

-- 新增 PTT 爬蟲的文案模板
INSERT INTO content_generation_templates (
  robot_id,
  name,
  template_content,
  available_variables,
  conditions,
  priority,
  is_default
) VALUES (
  (SELECT id FROM robot_configs WHERE robot_type = 'ptt_beauty'),
  '高推文模板',
  '🔥 爆推正妹來了！

{title}

推文數：{push_count} 🚀
發文者：{author}

👇 點擊查看高清大圖
#PTT表特版 #正妹 #台灣',
  ARRAY['title', 'push_count', 'author'],
  '{"minPushCount": 50}'::jsonb,
  1,
  false
),
(
  (SELECT id FROM robot_configs WHERE robot_type = 'ptt_beauty'),
  '預設模板',
  '✨ {title}

推文數：{push_count} ❤️

點擊查看更多精彩圖片 👈
#正妹 #PTT #表特版',
  ARRAY['title', 'push_count'],
  '{}'::jsonb,
  100,
  true
);

-- ============================================================
-- 10. 註解
-- ============================================================
COMMENT ON TABLE robot_configs IS '機器人爬蟲配置表';
COMMENT ON TABLE robot_execution_logs IS '機器人執行記錄表';
COMMENT ON TABLE scraped_items IS '爬取項目存儲表';
COMMENT ON TABLE content_generation_templates IS '文案生成模板表';

COMMENT ON COLUMN robot_configs.robot_type IS '機器人類型唯一識別碼';
COMMENT ON COLUMN robot_configs.config IS '爬蟲特定配置（JSON格式）';
COMMENT ON COLUMN robot_configs.default_template_type IS '預設使用的模板類型';

COMMENT ON COLUMN robot_execution_logs.status IS '執行狀態：pending/running/completed/failed/partial/cancelled';
COMMENT ON COLUMN robot_execution_logs.scraped_items IS '抓取的原始資料（JSON陣列）';
COMMENT ON COLUMN robot_execution_logs.created_strategy_ids IS '創建的策略ID陣列';

COMMENT ON COLUMN scraped_items.source_hash IS '內容雜湊值，用於去重';
COMMENT ON COLUMN scraped_items.raw_data IS '完整的原始抓取資料';

COMMENT ON COLUMN content_generation_templates.template_content IS '模板內容，支援變數替換';
COMMENT ON COLUMN content_generation_templates.conditions IS '使用此模板的條件（JSON格式）';