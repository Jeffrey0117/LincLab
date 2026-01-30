-- ============================================================================
-- 優化短網址查詢：整合多次 DB 操作為單一 RPC 呼叫
-- 目的：減少 Vercel Function Invocations 和 DB 查詢次數
-- ============================================================================

-- 1. 建立整合查詢函數：一次取得 link 資料 + 檢查/記錄點擊
CREATE OR REPLACE FUNCTION get_link_and_track_click(
  p_short_code TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT DEFAULT NULL,
  p_is_preview BOOLEAN DEFAULT FALSE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_link RECORD;
  v_click_exists BOOLEAN;
  v_is_converted BOOLEAN;
  v_is_new_click BOOLEAN := FALSE;
BEGIN
  -- 1. 查詢 link 資料（一次查詢）
  SELECT
    id,
    short_code,
    affiliate_url,
    og_title,
    og_description,
    og_image,
    favicon_url,
    html_content,
    strategy,
    strategy_config,
    content_mode,
    template_type,
    template_config,
    link_mode,
    target_url,
    proxy_content,
    is_active
  INTO v_link
  FROM links
  WHERE short_code = p_short_code
    AND is_active = true;

  -- 如果找不到，返回 null
  IF v_link IS NULL THEN
    RETURN json_build_object(
      'found', false,
      'link', null,
      'click', null
    );
  END IF;

  -- 如果是預覽模式，不記錄點擊
  IF p_is_preview THEN
    RETURN json_build_object(
      'found', true,
      'link', row_to_json(v_link),
      'click', json_build_object(
        'is_new', false,
        'is_converted', false
      )
    );
  END IF;

  -- 2. 檢查是否已有點擊記錄
  SELECT EXISTS(
    SELECT 1 FROM link_clicks
    WHERE link_id = v_link.id
    AND ip_address = p_ip_address
  ), COALESCE(
    (SELECT converted FROM link_clicks
     WHERE link_id = v_link.id
     AND ip_address = p_ip_address),
    false
  )
  INTO v_click_exists, v_is_converted;

  -- 3. 如果沒有點擊記錄，建立新記錄並增加計數
  IF NOT v_click_exists THEN
    -- 插入點擊記錄
    INSERT INTO link_clicks (link_id, ip_address, user_agent, converted)
    VALUES (v_link.id, p_ip_address, p_user_agent, false)
    ON CONFLICT (link_id, ip_address) DO NOTHING;

    -- 遞增點擊計數
    UPDATE links
    SET click_count = COALESCE(click_count, 0) + 1,
        last_clicked_at = NOW()
    WHERE id = v_link.id;

    v_is_new_click := TRUE;
  END IF;

  -- 返回整合結果
  RETURN json_build_object(
    'found', true,
    'link', row_to_json(v_link),
    'click', json_build_object(
      'is_new', v_is_new_click,
      'is_converted', v_is_converted
    )
  );
END;
$$;

-- 2. 建立標記轉換的函數
CREATE OR REPLACE FUNCTION mark_link_converted(
  p_short_code TEXT,
  p_ip_address TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_link_id UUID;
BEGIN
  -- 找到 link_id
  SELECT id INTO v_link_id
  FROM links
  WHERE short_code = p_short_code
    AND is_active = true;

  IF v_link_id IS NULL THEN
    RETURN false;
  END IF;

  -- 更新或插入轉換記錄
  INSERT INTO link_clicks (link_id, ip_address, converted)
  VALUES (v_link_id, p_ip_address, true)
  ON CONFLICT (link_id, ip_address)
  DO UPDATE SET converted = true;

  RETURN true;
END;
$$;

-- 3. 為 RPC 函數設定權限（允許匿名存取，因為短網址是公開的）
GRANT EXECUTE ON FUNCTION get_link_and_track_click TO anon;
GRANT EXECUTE ON FUNCTION get_link_and_track_click TO authenticated;
GRANT EXECUTE ON FUNCTION mark_link_converted TO anon;
GRANT EXECUTE ON FUNCTION mark_link_converted TO authenticated;

-- 4. 確保 last_clicked_at 欄位存在
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'last_clicked_at'
  ) THEN
    ALTER TABLE links ADD COLUMN last_clicked_at TIMESTAMPTZ;
  END IF;
END
$$;
