-- ============================================================
-- Plan-8: 機器人草稿審核系統 & 重複檢測機制
-- 建立時間: 2025-11-14
-- ============================================================

-- ============================================================
-- 1. 新增 links.status 欄位
-- ============================================================
ALTER TABLE links ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 檢查約束
ALTER TABLE links ADD CONSTRAINT valid_link_status 
  CHECK (status IN ('draft', 'active', 'archived'));

-- 索引
CREATE INDEX IF NOT EXISTS idx_links_status ON links(status);
CREATE INDEX IF NOT EXISTS idx_links_user_status ON links(user_id, status);
CREATE INDEX IF NOT EXISTS idx_links_draft_created ON links(created_at DESC) 
  WHERE status = 'draft';

-- 更新現有記錄（預設都是 active）
UPDATE links SET status = 'active' WHERE status IS NULL;

COMMENT ON COLUMN links.status IS '連結狀態：draft=草稿待審核, active=已啟用, archived=已封存';

-- ============================================================
-- 2. 優化 scraped_items 的去重索引
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_scraped_items_robot_created 
  ON scraped_items(robot_id, created_at DESC);

-- ============================================================
-- 3. 新增 robot_execution_logs.duplicate_count 欄位
-- ============================================================
ALTER TABLE robot_execution_logs 
  ADD COLUMN IF NOT EXISTS duplicate_count INTEGER DEFAULT 0;

COMMENT ON COLUMN robot_execution_logs.duplicate_count IS '檢測到的重複項目數量';

-- ============================================================
-- 4. 實用函數：清理舊的爬取記錄
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_old_scraped_items(
  p_robot_id UUID,
  days_to_keep INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM scraped_items
  WHERE robot_id = p_robot_id
    AND created_at < NOW() - (days_to_keep || ' days')::INTERVAL
    AND is_processed = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_scraped_items IS '清理指定天數之前的爬取記錄（僅刪除已處理記錄）';

-- ============================================================
-- 5. 實用函數：檢查是否為重複項目（支援時間範圍）
-- ============================================================
CREATE OR REPLACE FUNCTION is_duplicate_item(
  p_robot_id UUID,
  p_source_hash VARCHAR(64),
  days_back INTEGER DEFAULT 30
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM scraped_items
    WHERE robot_id = p_robot_id
      AND source_hash = p_source_hash
      AND created_at >= NOW() - (days_back || ' days')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_duplicate_item IS '檢查項目是否在指定天數內已被爬取';

-- ============================================================
-- 6. 實用函數：批量更新 links 狀態
-- ============================================================
CREATE OR REPLACE FUNCTION batch_update_link_status(
  p_link_ids UUID[],
  p_user_id UUID,
  p_new_status VARCHAR(20)
)
RETURNS TABLE (
  success_count INTEGER,
  failed_count INTEGER
) AS $$
DECLARE
  v_success_count INTEGER := 0;
  v_failed_count INTEGER := 0;
  v_link_id UUID;
BEGIN
  FOREACH v_link_id IN ARRAY p_link_ids
  LOOP
    BEGIN
      UPDATE links
      SET status = p_new_status
      WHERE id = v_link_id
        AND user_id = p_user_id;
      
      IF FOUND THEN
        v_success_count := v_success_count + 1;
      ELSE
        v_failed_count := v_failed_count + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_failed_count := v_failed_count + 1;
    END;
  END LOOP;
  
  RETURN QUERY SELECT v_success_count, v_failed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION batch_update_link_status IS '批量更新連結狀態（只能更新自己的連結）';

-- ============================================================
-- 7. RLS 政策更新
-- ============================================================

-- 刪除可能存在的舊政策
DROP POLICY IF EXISTS "Users can view active links or their own" ON links;

-- 草稿連結只能由 owner 查看
CREATE POLICY "Users can view active links or their own"
  ON links
  FOR SELECT
  USING (
    status = 'active' OR user_id = auth.uid()
  );

-- ============================================================
-- 8. 視圖：用戶草稿統計
-- ============================================================
CREATE OR REPLACE VIEW user_draft_stats AS
SELECT
  l.user_id,
  COUNT(*) as total_drafts,
  COUNT(*) FILTER (WHERE l.created_at >= NOW() - INTERVAL '24 hours') as drafts_today,
  COUNT(*) FILTER (WHERE l.created_at >= NOW() - INTERVAL '7 days') as drafts_this_week,
  MIN(l.created_at) as oldest_draft_at,
  MAX(l.created_at) as newest_draft_at
FROM links l
WHERE l.status = 'draft'
GROUP BY l.user_id;

COMMENT ON VIEW user_draft_stats IS '用戶草稿統計視圖';

-- ============================================================
-- 9. 完成
-- ============================================================
-- Plan-8 Migration 完成
