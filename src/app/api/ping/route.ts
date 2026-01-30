/**
 * 最簡單的測試 API - 不依賴任何外部服務
 */
export async function GET() {
  return new Response(JSON.stringify({ pong: Date.now() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
