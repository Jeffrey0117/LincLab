import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/user/is-admin
 *
 * Checks if the current user is an admin
 * Only uses database profiles.is_admin - no fallback for security
 *
 * Returns:
 * {
 *   isAdmin: boolean,
 *   email?: string
 * }
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user (must be logged in)
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    // Check database for is_admin flag (only method - no fallbacks)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // No profile found - not an admin
      return NextResponse.json({
        isAdmin: false,
        email: user.email,
      }, { status: 200 });
    }

    return NextResponse.json({
      isAdmin: !!profile.is_admin,
      email: user.email,
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}
