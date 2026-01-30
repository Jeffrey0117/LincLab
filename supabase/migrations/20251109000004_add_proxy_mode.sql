-- Migration: Add Proxy/Preview Mode Support
-- Purpose: Enable links to show preview cards instead of direct redirect

-- Add proxy mode fields to links table
ALTER TABLE public.links
ADD COLUMN IF NOT EXISTS link_mode TEXT DEFAULT 'redirect' CHECK (link_mode IN ('redirect', 'proxy_preview', 'proxy_ai'));

ALTER TABLE public.links
ADD COLUMN IF NOT EXISTS target_url TEXT;

ALTER TABLE public.links
ADD COLUMN IF NOT EXISTS proxy_content TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.links.link_mode IS 'Link display mode: redirect (direct jump), proxy_preview (show preview card), proxy_ai (AI-generated content)';
COMMENT ON COLUMN public.links.target_url IS 'Target URL to preview/proxy (optional, used in proxy modes)';
COMMENT ON COLUMN public.links.proxy_content IS 'Preview content or summary to display (used in proxy_preview mode)';

-- Create index for link_mode queries
CREATE INDEX IF NOT EXISTS idx_links_link_mode ON public.links(link_mode);
