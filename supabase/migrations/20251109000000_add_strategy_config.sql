-- Add strategy_config column to links table for customizable strategies
-- This allows each link to have custom configuration for their chosen strategy

ALTER TABLE public.links
ADD COLUMN IF NOT EXISTS strategy_config JSONB DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.links.strategy_config IS 'JSON configuration for customizable strategies (e.g., button text, download URL, colors, etc.)';

-- Create an index for better query performance on JSONB data
CREATE INDEX IF NOT EXISTS idx_links_strategy_config ON public.links USING GIN (strategy_config);

-- Example strategy_config structure:
/*
For download_button strategy:
{
  "buttonText": "🎁 免費下載電子書",
  "buttonPosition": "center",
  "downloadUrl": "https://example.com/file.pdf",
  "downloadFilename": "免費電子書.pdf",
  "dialogTitle": "開始下載",
  "dialogDescription": "確認下載後將為您準備檔案..."
}

For floating_button strategy:
{
  "text": "限時優惠",
  "position": "right"
}

For exit_intent strategy:
{
  "title": "等等！別走！",
  "description": "限時優惠還沒領取",
  "buttonText": "立即查看"
}
*/
