-- 如果表格已經存在但不完整，先刪除再重建
DROP TABLE IF EXISTS link_clicks CASCADE;

-- 重新創建 IP 追蹤表
CREATE TABLE link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted BOOLEAN NOT NULL DEFAULT FALSE,

  -- 同一個 link 和 IP 只能有一筆記錄
  CONSTRAINT unique_link_ip UNIQUE (link_id, ip_address)
);

-- 建立索引以加速查詢
CREATE INDEX idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX idx_link_clicks_clicked_at ON link_clicks(clicked_at);
CREATE INDEX idx_link_clicks_link_ip_converted ON link_clicks(link_id, ip_address, converted);
