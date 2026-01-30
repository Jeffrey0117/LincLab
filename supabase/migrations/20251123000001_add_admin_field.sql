-- =====================================================
-- Migration: Add is_admin field to profiles
-- Created: 2025-11-23
-- Description: Adds admin flag for manual upgrade API
-- =====================================================

-- 1. Add is_admin column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Add comment for documentation
COMMENT ON COLUMN public.profiles.is_admin IS 'Whether the user has admin privileges for manual upgrades';

-- 3. Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;

-- 4. Update RLS policies to allow admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.is_admin = TRUE
    )
  );
