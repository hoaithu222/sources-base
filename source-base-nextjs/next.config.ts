import type { NextConfig } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants.js';
import createNextIntlPlugin from 'next-intl/plugin';

import {
  EnvValidationError,
  findProductionIssues,
  parseAppEnv,
  parseServerEnv,
} from './src/core/config/env.schema.ts';

/**
 * next.config.ts — cấu hình Next.js; mỗi khối có một dòng nói nó phục vụ việc gì.
 *
 * Env được KIỂM ngay tại đây (cùng schema với server / trình duyệt): `.env` sai là đỏ ở terminal lúc
 * `npm run dev` / `npm run build`, không đợi tới màn lỗi trong trình duyệt.
 */

const withNextIntl = createNextIntlPlugin('./src/core/i18n/request.ts');

const isProduction = process.env.NODE_ENV === 'production';

/** Header bảo mật áp cho MỌI route. CSP đầy đủ (cần nonce → ép render động) là tuỳ chọn: docs/rules/data/security-checklist.md. */
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  ...(isProduction
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]
    : []),
];

function validateEnv(phase: string) {
  const appEnv = parseAppEnv(process.env);
  const serverEnv = parseServerEnv(process.env);

  if (phase === PHASE_PRODUCTION_BUILD) {
    const issues = findProductionIssues(appEnv, serverEnv);
    if (issues.length > 0) {
      throw new EnvValidationError([
        ...issues,
        'Nếu đây là bản TRƯNG BÀY giao diện (không backend), đặt NEXT_PUBLIC_APP_MODE=demo.',
      ]);
    }
    if (appEnv.isDemo) {
      console.warn(
        `\n⚠️  Đang build ở chế độ DEMO (NEXT_PUBLIC_APP_MODE=demo): kiểm đăng nhập ${
          appEnv.authEnabled ? 'BẬT' : 'TẮT'
        }, có phân hệ "Thư viện UI". Sản phẩm thật phải build với NEXT_PUBLIC_APP_MODE=app.\n`,
      );
    }
  }

  return { appEnv, serverEnv };
}

export default function createConfig(phase: string): NextConfig {
  const { appEnv, serverEnv } = validateEnv(phase);
  const apiPrefix = appEnv.apiBaseUrl.startsWith('/') ? appEnv.apiBaseUrl : null;

  const config: NextConfig = {
    /** Tự memo hoá component lúc build (React Compiler) — không cần `useMemo` / `useCallback` rải rác. */
    reactCompiler: true,
    reactStrictMode: true,
    /** Build chỉ kiểm kiểu `src/` — lỗi kiểu trong `tests/` không được làm hỏng bản production (`npm run typecheck` vẫn kiểm cả tests). */
    typescript: { tsconfigPath: 'tsconfig.build.json' },
    /** Không lộ `X-Powered-By: Next.js` — bớt thông tin cho kẻ dò quét. */
    poweredByHeader: false,
    compress: true,
    /** Thư mục build — `NEXT_DIST_DIR` để kiểm commit / CI build song song mà không đụng `.next` của dev server. */
    distDir: process.env.NEXT_DIST_DIR ?? '.next',
    /** `NEXT_OUTPUT=standalone` → gói tự chứa cho Docker; để trống trên Vercel / `next start`. */
    output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
    turbopack: { root: import.meta.dirname },
    /** Font của ảnh Open Graph đọc bằng `fs` lúc chạy — báo cho bước đóng gói standalone mang theo. */
    outputFileTracingIncludes: { '/[locale]/opengraph-image': ['./src/assets/fonts/og/**'] },

    images: {
      formats: ['image/avif', 'image/webp'],
      minimumCacheTTL: 60 * 60 * 24 * 31,
      /** Thêm host CDN / API cho `next/image` ở đây: `{ protocol: 'https', hostname: 'cdn.example.com' }`. */
      remotePatterns: [],
    },

    experimental: {
      /** Chỉ nạp phần dùng tới của thư viện nhiều export; Next tự rung cây thay vì kéo cả gói. */
      optimizePackageImports: ['recharts', 'dayjs', '@dnd-kit/core', '@dnd-kit/sortable'],
      /** 404 toàn cục kèm `app/global-not-found.tsx` cho URL không khớp route nào (kể cả ngoài `[locale]`). */
      globalNotFound: true,
    },

    async rewrites() {
      /** Proxy `/api/*` về backend: cookie HttpOnly refresh-token đi same-origin, không bị trình duyệt coi là third-party. */
      if (!apiPrefix) return [];
      return {
        beforeFiles: [],
        afterFiles: [
          {
            source: `${apiPrefix}/:path*`,
            destination: `${serverEnv.apiProxyTarget}${apiPrefix}/:path*`,
          },
        ],
        fallback: [],
      };
    },

    async headers() {
      return [
        { source: '/:path*', headers: SECURITY_HEADERS },
        /** API không phải nội dung để lập chỉ mục. */
        {
          source: '/api/:path*',
          headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
        },
      ];
    },
  };

  return withNextIntl(config);
}
