/**
 * Env của hai job build trong CI (`.github/workflows/ci.yml`) — MỘT nơi để `verify-commit.mjs` và `build-app.mjs` dựng
 * đúng cấu hình đó ở máy dev. Đổi env của job CI thì đổi ở đây.
 */
export const DEMO_ENV = { NEXT_PUBLIC_APP_MODE: 'demo' };

export const APP_ENV = {
  NEXT_PUBLIC_APP_MODE: 'app',
  NEXT_PUBLIC_API_BASE_URL: '/api',
  NEXT_PUBLIC_SITE_URL: 'https://example.com',
};
