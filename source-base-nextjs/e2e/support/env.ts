import { APP_ENV } from '../../scripts/ci-env.mjs';

/**
 * Hằng dùng chung của bộ e2e — `playwright.config.ts`, `scripts/e2e-server.mjs` (qua biến môi trường do config truyền) và mọi
 * file `*.e2e.ts` cùng đọc từ đây, nên cổng / gốc site / tên cookie phiên chỉ khai MỘT chỗ.
 */

/** Cổng riêng của bản e2e: không trùng 3000 của `npm run dev` nên chạy song song với dev server được. */
export const E2E_PORT = Number(process.env.E2E_PORT ?? 3210);

/**
 * `localhost` chứ KHÔNG `127.0.0.1`: server chạy `next start --hostname localhost` (`scripts/e2e-server.mjs`); với IP `127.0.0.1` Next 16 viết
 * lại URL nội bộ của proxy.ts sang host khác và mọi route đi qua proxy chuyển hướng vòng (`ERR_TOO_MANY_REDIRECTS`).
 */
export const BASE_URL = `http://localhost:${E2E_PORT}`;

/** Gốc site khai lúc build (`NEXT_PUBLIC_SITE_URL` của `scripts/ci-env.mjs`) — nền canonical / hreflang / sitemap / `og:image`. */
export const SITE_ORIGIN = APP_ENV.NEXT_PUBLIC_SITE_URL;

/** Cookie phiên mà `proxy.ts` kiểm CÓ TỒN TẠI (`AUTH_SESSION_COOKIE`); config truyền đúng tên này cho server e2e. */
export const SESSION_COOKIE = 'refresh_token';
