/**
 * `GET /api/health` — kiểm tra sống cho load balancer / Docker / uptime monitor. Không đọc DB hay phiên, luôn nhanh;
 * `no-store` để không bị CDN giữ lại. `next.config.ts` thêm `X-Robots-Tag: noindex` cho mọi `/api/*`.
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
}
