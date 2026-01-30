-- Migration: 新增帳號管理和標籤系統
-- Date: 2025-11-09

-- ============================================
-- 1. 建立 accounts 資料表
-- ============================================

CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('beauty', 'professional', 'emotion', 'curiosity', 'lifestyle', 'benefit')),
  description TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON public.accounts(type);

-- 註解
COMMENT ON TABLE public.accounts IS '帳號/分類管理表';
COMMENT ON COLUMN public.accounts.type IS '帳號類型：beauty(外貌吸引), professional(專業資料), emotion(情緒反應), curiosity(好奇心), lifestyle(生活共鳴), benefit(利益誘因)';

-- ============================================
-- 2. 修改 links 資料表
-- ============================================

-- 新增 account_id 欄位
ALTER TABLE public.links
ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL;

-- 新增 tags 欄位（陣列）
ALTER TABLE public.links
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 新增點擊統計欄位
ALTER TABLE public.links
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;

-- 新增轉換統計欄位
ALTER TABLE public.links
ADD COLUMN IF NOT EXISTS conversion_count INTEGER DEFAULT 0;

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_links_account_id ON public.links(account_id);
CREATE INDEX IF NOT EXISTS idx_links_tags ON public.links USING GIN(tags);

-- 註解
COMMENT ON COLUMN public.links.account_id IS '所屬帳號 ID';
COMMENT ON COLUMN public.links.tags IS '標籤陣列，例如：["正妹", "穿搭", "夏日"]';
COMMENT ON COLUMN public.links.click_count IS '總點擊次數';
COMMENT ON COLUMN public.links.conversion_count IS '總轉換次數';

-- ============================================
-- 3. Row Level Security (RLS) 設定
-- ============================================

-- 啟用 RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- accounts 表的 RLS 政策
-- 使用者只能看到自己的帳號
CREATE POLICY "Users can view own accounts"
  ON public.accounts
  FOR SELECT
  USING (auth.uid() = user_id);

-- 使用者可以新增自己的帳號
CREATE POLICY "Users can insert own accounts"
  ON public.accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 使用者可以更新自己的帳號
CREATE POLICY "Users can update own accounts"
  ON public.accounts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 使用者可以刪除自己的帳號
CREATE POLICY "Users can delete own accounts"
  ON public.accounts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. 建立更新時間的自動觸發器
-- ============================================

-- 建立更新時間的函數
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為 accounts 表建立觸發器
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 5. 插入預設帳號類型的說明資料（可選）
-- ============================================

-- 這裡可以插入一些範例資料，但先不做
-- 讓使用者自己建立帳號
