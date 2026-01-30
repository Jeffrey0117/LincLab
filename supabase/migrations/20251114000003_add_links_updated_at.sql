-- ============================================================
-- 修復 links 表缺少 updated_at 欄位的問題
-- 建立時間: 2025-11-14
-- ============================================================

-- 1. 添加 updated_at 欄位
ALTER TABLE links
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. 為現有記錄設定 updated_at（使用 created_at 作為初始值）
UPDATE links
SET updated_at = created_at
WHERE updated_at IS NULL;

-- 3. 建立觸發器函數（如果不存在）
CREATE OR REPLACE FUNCTION update_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 建立觸發器
DROP TRIGGER IF EXISTS trigger_update_links_updated_at ON links;

CREATE TRIGGER trigger_update_links_updated_at
  BEFORE UPDATE ON links
  FOR EACH ROW
  EXECUTE FUNCTION update_links_updated_at();

-- 5. 添加索引以優化按更新時間查詢
CREATE INDEX IF NOT EXISTS idx_links_updated_at ON links(updated_at DESC);

-- 6. 添加註釋
COMMENT ON COLUMN links.updated_at IS '連結最後更新時間（自動維護）';
COMMENT ON TRIGGER trigger_update_links_updated_at ON links IS '自動更新 updated_at 欄位';

-- ============================================================
-- 完成
-- ============================================================
