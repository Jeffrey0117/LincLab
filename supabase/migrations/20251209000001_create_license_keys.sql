-- =====================================================
-- Migration: Create License Keys System
-- Created: 2025-12-09
-- Description: License key activation system for membership
-- =====================================================

-- 1. Create license_keys table
CREATE TABLE public.license_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- License key (format: PRO-XXXX-XXXX or VIP-XXXX-XXXX)
  key VARCHAR(20) UNIQUE NOT NULL,

  -- Plan type: PRO or VIP
  plan VARCHAR(10) NOT NULL CHECK (plan IN ('PRO', 'VIP')),

  -- Duration in days (NULL for lifetime VIP)
  duration_days INT,

  -- Usage tracking
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,

  -- Metadata
  source VARCHAR(100),           -- Where was this key sold (e.g., 'official_website', 'promotion')
  note TEXT,                     -- Admin notes

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ         -- Key itself can expire (optional, for limited-time promotions)
);

-- 2. Indexes
CREATE INDEX idx_license_keys_key ON public.license_keys(key);
CREATE INDEX idx_license_keys_used_by ON public.license_keys(used_by) WHERE used_by IS NOT NULL;
CREATE INDEX idx_license_keys_plan ON public.license_keys(plan);

-- 3. Add comments
COMMENT ON TABLE public.license_keys IS 'License keys for membership activation';
COMMENT ON COLUMN public.license_keys.key IS 'Unique activation code (e.g., PRO-A1B2-C3D4)';
COMMENT ON COLUMN public.license_keys.plan IS 'PRO or VIP membership tier';
COMMENT ON COLUMN public.license_keys.duration_days IS 'Days of membership (NULL for lifetime)';
COMMENT ON COLUMN public.license_keys.used_by IS 'User who activated this key';
COMMENT ON COLUMN public.license_keys.used_at IS 'When the key was activated';
COMMENT ON COLUMN public.license_keys.source IS 'Source of the key (e.g., official_website)';
COMMENT ON COLUMN public.license_keys.expires_at IS 'Key expiration (for promotions), NULL for no expiry';

-- 4. Enable RLS
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Users can only see their own used keys
CREATE POLICY "Users can view their own used keys"
  ON public.license_keys
  FOR SELECT
  USING (auth.uid() = used_by);

-- Service role can do everything (for API)
-- Note: Service role bypasses RLS by default

-- 6. Function to generate a random license key
CREATE OR REPLACE FUNCTION public.generate_license_key(plan_type VARCHAR(10))
RETURNS VARCHAR(20) AS $$
DECLARE
  chars VARCHAR(36) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- No 0,O,1,I to avoid confusion
  key_part1 VARCHAR(4) := '';
  key_part2 VARCHAR(4) := '';
  i INT;
  new_key VARCHAR(20);
BEGIN
  -- Generate first 4 chars
  FOR i IN 1..4 LOOP
    key_part1 := key_part1 || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;

  -- Generate second 4 chars
  FOR i IN 1..4 LOOP
    key_part2 := key_part2 || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;

  -- Format: PRO-XXXX-XXXX or VIP-XXXX-XXXX
  new_key := plan_type || '-' || key_part1 || '-' || key_part2;

  RETURN new_key;
END;
$$ LANGUAGE plpgsql;

-- 7. Function to activate a license key
CREATE OR REPLACE FUNCTION public.activate_license_key(
  license_key VARCHAR(20),
  user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  key_record RECORD;
  new_expire_at TIMESTAMPTZ;
  current_expire TIMESTAMPTZ;
BEGIN
  -- Find the key
  SELECT * INTO key_record
  FROM public.license_keys
  WHERE key = license_key;

  -- Check if key exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_KEY', 'message', '啟用碼無效');
  END IF;

  -- Check if key already used
  IF key_record.used_by IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'ALREADY_USED', 'message', '此啟用碼已被使用');
  END IF;

  -- Check if key expired (promotional keys)
  IF key_record.expires_at IS NOT NULL AND key_record.expires_at < NOW() THEN
    RETURN jsonb_build_object('success', false, 'error', 'KEY_EXPIRED', 'message', '此啟用碼已過期');
  END IF;

  -- Calculate new expiration date
  IF key_record.duration_days IS NULL THEN
    -- Lifetime membership
    new_expire_at := NULL;
  ELSE
    -- Get current expiration
    SELECT expire_at INTO current_expire
    FROM public.profiles
    WHERE id = user_id;

    -- If current membership is still active, extend from that date
    IF current_expire IS NOT NULL AND current_expire > NOW() THEN
      new_expire_at := current_expire + (key_record.duration_days || ' days')::INTERVAL;
    ELSE
      -- Start from now
      new_expire_at := NOW() + (key_record.duration_days || ' days')::INTERVAL;
    END IF;
  END IF;

  -- Mark key as used
  UPDATE public.license_keys
  SET used_by = user_id, used_at = NOW()
  WHERE id = key_record.id;

  -- Update user profile
  INSERT INTO public.profiles (id, tier, expire_at, updated_at)
  VALUES (user_id, key_record.plan, new_expire_at, NOW())
  ON CONFLICT (id) DO UPDATE
  SET
    tier = key_record.plan,
    expire_at = new_expire_at,
    updated_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'plan', key_record.plan,
    'duration_days', key_record.duration_days,
    'expire_at', new_expire_at,
    'message', '啟用成功！'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.generate_license_key IS 'Generate a random license key with format: PLAN-XXXX-XXXX';
COMMENT ON FUNCTION public.activate_license_key IS 'Activate a license key for a user, returns JSON result';
