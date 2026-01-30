-- Migration: 新增點擊追蹤 RPC 函數
-- Date: 2025-11-09
-- Description: 建立原子性遞增點擊次數的資料庫函數

-- 建立點擊追蹤的 RPC 函數
CREATE OR REPLACE FUNCTION public.increment_click_count(p_short_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.links
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE short_code = p_short_code
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 新增函數註解
COMMENT ON FUNCTION public.increment_click_count IS '原子性遞增連結點擊次數，確保高併發下的資料一致性';
