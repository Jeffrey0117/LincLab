-- =====================================================
-- Migration: Add User Membership Tier System
-- Created: 2025-11-22
-- Description: Implements FREE/PRO/VIP membership tiers
-- =====================================================

-- 1. Create profiles table for user membership data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'FREE' CHECK (tier IN ('FREE', 'PRO', 'VIP')),
  expire_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add comments for documentation
COMMENT ON TABLE public.profiles IS 'Stores user membership tier and subscription data';
COMMENT ON COLUMN public.profiles.id IS 'Foreign key to auth.users(id)';
COMMENT ON COLUMN public.profiles.tier IS 'User membership tier: FREE, PRO, or VIP';
COMMENT ON COLUMN public.profiles.expire_at IS 'Subscription expiration timestamp (NULL for VIP lifetime or FREE tier)';
COMMENT ON COLUMN public.profiles.updated_at IS 'Last update timestamp';
COMMENT ON COLUMN public.profiles.created_at IS 'Profile creation timestamp';

-- 3. Create index for faster tier lookups
CREATE INDEX idx_profiles_tier ON public.profiles(tier);
CREATE INDEX idx_profiles_expire_at ON public.profiles(expire_at) WHERE expire_at IS NOT NULL;

-- 4. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Policy: Public profiles are viewable by everyone (for user info display)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Only admins can delete profiles (prevents accidental data loss)
CREATE POLICY "Only admins can delete profiles"
  ON public.profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 6. Create trigger function to auto-create profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, tier, expire_at)
  VALUES (
    NEW.id,
    'FREE',  -- All new users start as FREE tier
    NULL     -- FREE tier has no expiration
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Backfill existing users with FREE tier profile
-- This ensures all existing users get a profile
INSERT INTO public.profiles (id, tier, expire_at)
SELECT
  id,
  'FREE' as tier,
  NULL as expire_at
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id
);

-- 9. Create function to check and downgrade expired PRO memberships
CREATE OR REPLACE FUNCTION public.check_membership_expiration()
RETURNS void AS $$
BEGIN
  -- Downgrade expired PRO memberships to FREE
  UPDATE public.profiles
  SET
    tier = 'FREE',
    expire_at = NULL,
    updated_at = NOW()
  WHERE
    tier = 'PRO'
    AND expire_at IS NOT NULL
    AND expire_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create helper function to get user tier (for API use)
CREATE OR REPLACE FUNCTION public.get_user_tier(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_tier TEXT;
BEGIN
  -- First check if membership expired and downgrade if needed
  PERFORM public.check_membership_expiration();

  -- Get current tier
  SELECT tier INTO user_tier
  FROM public.profiles
  WHERE id = user_id;

  -- Return tier or FREE if profile doesn't exist
  RETURN COALESCE(user_tier, 'FREE');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_tier IS 'Returns current tier for a user, checking expiration first';
COMMENT ON FUNCTION public.check_membership_expiration IS 'Downgrades expired PRO memberships to FREE tier';
