-- Migration: 為帳號新增 OG 模版設定
-- Date: 2025-11-09
-- Description: 新增預設 OG tags 和蝦皮分潤連結欄位，讓帳號可以設定模版

-- 新增欄位到 accounts 表格
ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS default_og_title TEXT,
ADD COLUMN IF NOT EXISTS default_og_description TEXT,
ADD COLUMN IF NOT EXISTS default_og_image TEXT,
ADD COLUMN IF NOT EXISTS default_favicon_url TEXT,
ADD COLUMN IF NOT EXISTS default_affiliate_url TEXT;

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_accounts_default_affiliate_url
ON public.accounts(default_affiliate_url)
WHERE default_affiliate_url IS NOT NULL;

-- 新增欄位註解
COMMENT ON COLUMN public.accounts.default_og_title IS '預設 OG 標題模版';
COMMENT ON COLUMN public.accounts.default_og_description IS '預設 OG 描述模版';
COMMENT ON COLUMN public.accounts.default_og_image IS '預設 OG 圖片 URL';
COMMENT ON COLUMN public.accounts.default_favicon_url IS '預設 Favicon URL';
COMMENT ON COLUMN public.accounts.default_affiliate_url IS '預設蝦皮分潤連結';
