-- 為 PTT 爬蟲添加缺少的 links 表欄位

-- 添加 title 欄位 (如果不存在)
ALTER TABLE links ADD COLUMN IF NOT EXISTS title TEXT;

-- 添加 strategy_type 欄位 (如果不存在)
ALTER TABLE links ADD COLUMN IF NOT EXISTS strategy_type VARCHAR(50);

-- 添加 strategy_config 欄位 (如果不存在)
ALTER TABLE links ADD COLUMN IF NOT EXISTS strategy_config JSONB;

-- 添加 is_active 欄位 (如果不存在)
ALTER TABLE links ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 添加 metadata 欄位 (如果不存在)
ALTER TABLE links ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 為常用查詢添加索引
CREATE INDEX IF NOT EXISTS idx_links_strategy_type ON links(strategy_type);
CREATE INDEX IF NOT EXISTS idx_links_is_active ON links(is_active);
CREATE INDEX IF NOT EXISTS idx_links_metadata ON links USING GIN(metadata);
