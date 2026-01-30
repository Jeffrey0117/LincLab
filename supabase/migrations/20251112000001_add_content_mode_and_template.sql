-- 新增內容模式和模板相關欄位
ALTER TABLE links ADD COLUMN IF NOT EXISTS content_mode VARCHAR(20);
-- 值: 'custom' | 'template'

ALTER TABLE links ADD COLUMN IF NOT EXISTS template_type VARCHAR(50);
-- 值: 'image' | 'external_link' | 'beauty' | 'article' | 'video' | 'product' | null

ALTER TABLE links ADD COLUMN IF NOT EXISTS template_config JSONB;
-- 儲存模板特定的配置

-- 向下兼容：將現有 link_mode 遷移到新欄位
UPDATE links
SET content_mode = CASE
  WHEN link_mode = 'redirect' THEN 'custom'
  WHEN link_mode = 'proxy_preview' OR link_mode = 'external' THEN 'template'
  ELSE 'custom'
END
WHERE content_mode IS NULL;

UPDATE links
SET template_type = CASE
  WHEN link_mode = 'proxy_preview' OR link_mode = 'external' THEN 'external_link'
  WHEN strategy = 'image_link' THEN 'image'
  ELSE NULL
END
WHERE template_type IS NULL AND content_mode = 'template';

-- 為圖片模板遷移 strategy_config 到 template_config
UPDATE links
SET template_config = strategy_config
WHERE template_type = 'image' AND strategy = 'image_link' AND strategy_config IS NOT NULL;
