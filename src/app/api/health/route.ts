import { NextResponse } from 'next/server';

/**
 * 簡單健康檢查 API - 不使用 cookies()
 * 用於驗證 Vercel Function 是否正常運作
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  });
}
