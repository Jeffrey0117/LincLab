-- ============================================================
-- Migration: Fix scraped_items columns
-- Description: 修正 scraped_items 表的欄位名稱
-- Created: 2024-11-14
-- ============================================================

-- 1. 檢查並修正欄位名稱
DO $$
BEGIN
    -- 如果 created_link_id 存在，改名為 link_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'scraped_items'
        AND column_name = 'created_link_id'
    ) THEN
        ALTER TABLE scraped_items RENAME COLUMN created_link_id TO link_id;
        RAISE NOTICE 'Renamed created_link_id to link_id';
    END IF;

    -- 如果 source_title 存在，改名為 title
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'scraped_items'
        AND column_name = 'source_title'
    ) THEN
        ALTER TABLE scraped_items RENAME COLUMN source_title TO title;
        RAISE NOTICE 'Renamed source_title to title';
    END IF;
END $$;

-- 2. 確保所有必要的欄位都存在
DO $$
BEGIN
    -- 確保 title 欄位存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'scraped_items'
        AND column_name = 'title'
    ) THEN
        ALTER TABLE scraped_items ADD COLUMN title TEXT;
        RAISE NOTICE 'Added title column';
    END IF;

    -- 確保 author 欄位存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'scraped_items'
        AND column_name = 'author'
    ) THEN
        ALTER TABLE scraped_items ADD COLUMN author VARCHAR(100);
        RAISE NOTICE 'Added author column';
    END IF;

    -- 確保 push_count 欄位存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'scraped_items'
        AND column_name = 'push_count'
    ) THEN
        ALTER TABLE scraped_items ADD COLUMN push_count INTEGER;
        RAISE NOTICE 'Added push_count column';
    END IF;

    -- 確保 images 欄位存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'scraped_items'
        AND column_name = 'images'
    ) THEN
        ALTER TABLE scraped_items ADD COLUMN images TEXT[];
        RAISE NOTICE 'Added images column';
    END IF;

    -- 確保 primary_image 欄位存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'scraped_items'
        AND column_name = 'primary_image'
    ) THEN
        ALTER TABLE scraped_items ADD COLUMN primary_image TEXT;
        RAISE NOTICE 'Added primary_image column';
    END IF;

    -- 確保 link_id 欄位存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'scraped_items'
        AND column_name = 'link_id'
    ) THEN
        ALTER TABLE scraped_items ADD COLUMN link_id UUID REFERENCES links(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added link_id column';
    END IF;
END $$;

-- 3. 刷新 Supabase schema cache
NOTIFY pgrst, 'reload schema';

COMMENT ON MIGRATION '20251114000002_fix_scraped_items_columns' IS '修正 scraped_items 表的欄位名稱，從 created_link_id 改為 link_id，從 source_title 改為 title';
