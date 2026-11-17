/**
 * Đường dẫn các màn mẫu của demo, cho `<Link>` giữa các màn. PHẢI khớp `path` khai ở
 * `src/app/router/modules/demo.routes.ts` — feature không import được `@/app`, nên
 * `tests/features/demo/demo-sections-wired.test.ts` so hai nơi với nhau.
 */
export const DEMO_SCREEN_PATHS = {
  library: '/demo',
  composed: '/demo/ghep',
  dashboard: '/demo/tong-quan',
} as const;
