-- Google Sheets 整合設定表
-- 用於儲存用戶的 Google Sheets 連線設定

CREATE TABLE IF NOT EXISTS google_sheets_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  spreadsheet_url TEXT NOT NULL,
  spreadsheet_id VARCHAR(255) NOT NULL,
  sheet_name VARCHAR(100) DEFAULT 'Sheet1',
  webapp_url TEXT,
  is_enabled BOOLEAN DEFAULT true,
  last_push_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_user_sheets UNIQUE (user_id)
);

-- 如果表已存在，加入 webapp_url 欄位
ALTER TABLE google_sheets_configs ADD COLUMN IF NOT EXISTS webapp_url TEXT;

-- 在 links 表加推送狀態欄位
ALTER TABLE links ADD COLUMN IF NOT EXISTS sheets_pushed_at TIMESTAMP WITH TIME ZONE;

-- 建立索引以加速查詢
CREATE INDEX IF NOT EXISTS idx_google_sheets_configs_user_id ON google_sheets_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_google_sheets_configs_is_enabled ON google_sheets_configs(is_enabled);
CREATE INDEX IF NOT EXISTS idx_links_sheets_pushed_at ON links(sheets_pushed_at);

-- RLS 政策 (暫時允許所有操作，開發階段使用)
ALTER TABLE google_sheets_configs ENABLE ROW LEVEL SECURITY;

-- 允許所有操作的政策
CREATE POLICY "Allow all operations on google_sheets_configs" ON google_sheets_configs
  FOR ALL USING (true) WITH CHECK (true);
