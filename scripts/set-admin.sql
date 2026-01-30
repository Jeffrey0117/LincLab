-- =====================================================
-- Script: Set User as Admin
-- Description: Sets a user as admin for manual upgrades
-- =====================================================

-- Instructions:
-- 1. Replace 'YOUR_USER_ID_HERE' with your actual user UUID
-- 2. Run this in Supabase SQL Editor

-- Set your user as admin
UPDATE public.profiles
SET is_admin = TRUE
WHERE id = 'YOUR_USER_ID_HERE';

-- Verify the change
SELECT id, tier, is_admin, created_at
FROM public.profiles
WHERE is_admin = TRUE;

-- To find your user ID, you can use:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
