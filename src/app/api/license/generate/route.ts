/**
 * License Key Generation API
 *
 * POST /api/license/generate
 *
 * For sales site to generate license keys after payment.
 * Requires API secret for authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// API secret for sales site authentication (required)
const API_SECRET = process.env.LICENSE_API_SECRET;
if (!API_SECRET) {
  console.error('CRITICAL: LICENSE_API_SECRET environment variable is not set');
}

interface GenerateRequest {
  plan: 'PRO' | 'VIP';
  duration_days?: number; // Optional, null for lifetime
  quantity?: number; // How many keys to generate (default 1)
  source?: string; // Where the sale came from
  note?: string; // Optional admin note
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // 1. Verify API secret
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Invalid API secret' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body: GenerateRequest = await request.json();

    // 3. Validate required fields
    if (!body.plan || !['PRO', 'VIP'].includes(body.plan)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_PLAN', message: 'Plan must be PRO or VIP' },
        { status: 400 }
      );
    }

    const quantity = body.quantity || 1;
    if (quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { success: false, error: 'INVALID_QUANTITY', message: 'Quantity must be 1-100' },
        { status: 400 }
      );
    }

    // 4. Generate keys
    const generatedKeys: string[] = [];

    for (let i = 0; i < quantity; i++) {
      // Generate key using the database function
      const { data: keyResult, error: keyError } = await supabase.rpc(
        'generate_license_key',
        { plan_type: body.plan }
      );

      if (keyError) {
        console.error('Error generating key:', keyError);
        continue;
      }

      const newKey = keyResult as string;

      // Insert the key
      const { error: insertError } = await supabase.from('license_keys').insert({
        key: newKey,
        plan: body.plan,
        duration_days: body.duration_days ?? (body.plan === 'VIP' ? null : 30),
        source: body.source || 'api',
        note: body.note,
      });

      if (insertError) {
        // Key collision, try again
        if (insertError.code === '23505') {
          i--;
          continue;
        }
        console.error('Error inserting key:', insertError);
        continue;
      }

      generatedKeys.push(newKey);
    }

    // 5. Return generated keys
    return NextResponse.json({
      success: true,
      count: generatedKeys.length,
      keys: generatedKeys,
      plan: body.plan,
      duration_days: body.duration_days ?? (body.plan === 'VIP' ? null : 30),
    });
  } catch (error) {
    console.error('License generation error:', error);
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
