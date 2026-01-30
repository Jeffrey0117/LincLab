import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * 健康檢查 API - 使用 cookies()
 * 用於驗證 cookies() 是否造成 Vercel Function 卡住
 */
export async function GET() {
  try {
    // 設定 5 秒超時
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('cookies() timeout')), 5000);
    });

    const cookiesPromise = (async () => {
      const cookieStore = await cookies();
      return cookieStore.getAll();
    })();

    const allCookies = await Promise.race([cookiesPromise, timeoutPromise]);

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      cookiesWorking: true,
      cookieCount: Array.isArray(allCookies) ? allCookies.length : 0,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      cookiesWorking: false,
    }, { status: 500 });
  }
}
