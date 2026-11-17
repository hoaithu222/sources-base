import { z } from 'zod';

/**
 * Schema biến môi trường — dùng chung cho Node (`next.config.ts`), server và trình duyệt.
 *
 *   parseAppEnv(raw)     biến `NEXT_PUBLIC_*` — NẰM TRONG BUNDLE gửi cho trình duyệt
 *   parseServerEnv(raw)  biến chỉ có ở server (proxy API, cookie phiên, mã xác minh công cụ tìm kiếm)
 *
 * Thêm biến mới: khai ở schema + interface tương ứng + `.env.example` (+ map tường minh ở `app-config.ts`
 * nếu là biến `NEXT_PUBLIC_*`).
 *
 * Lưu ý: file này không đọc `process.env` và chỉ import `zod` (chạy ở cả hai môi trường). Lý do thiết kế:
 * `docs/notes/code/core.md`.
 */

const blankToUndefined = (value: unknown): unknown =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const text = (fallback: string) =>
  z.preprocess(blankToUndefined, z.string().trim().default(fallback));

const optionalText = () => z.preprocess(blankToUndefined, z.string().trim().optional());

const flag = () =>
  z.preprocess(
    blankToUndefined,
    z
      .enum(['true', 'false', '1', '0'], { error: 'chỉ nhận true | false | 1 | 0' })
      .transform((value) => value === 'true' || value === '1')
      .optional(),
  );

const positiveInt = (fallback: number) =>
  z.preprocess(
    blankToUndefined,
    z
      .string()
      .trim()
      .regex(/^[1-9]\d*$/, { error: 'phải là số nguyên dương, không kèm đơn vị hay ký tự khác' })
      .transform(Number)
      .default(fallback),
  );

const apiBaseUrl = z.preprocess(
  blankToUndefined,
  z
    .string()
    .trim()
    .regex(/^(https?:\/\/[^\s/]+|\/)[^\s]*$/, {
      error: 'phải là URL http(s) hoặc đường dẫn bắt đầu bằng "/" (vd /api)',
    })
    .transform((value) => value.replace(/\/+$/, ''))
    .optional(),
);

const originUrl = z.preprocess(
  blankToUndefined,
  z
    .string()
    .trim()
    .regex(/^https?:\/\/[^\s/]+$/, {
      error: 'phải là gốc URL http(s) KHÔNG kèm đường dẫn, vd https://example.com',
    })
    .optional(),
);

const rawEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: text('Base App'),
  NEXT_PUBLIC_APP_MODE: z.preprocess(
    blankToUndefined,
    z.enum(['demo', 'app'], { error: 'chỉ nhận demo | app' }).default('app'),
  ),
  NEXT_PUBLIC_SITE_URL: originUrl,
  NEXT_PUBLIC_API_BASE_URL: apiBaseUrl,
  NEXT_PUBLIC_API_TIMEOUT: positiveInt(30_000),
  NEXT_PUBLIC_ENABLE_ERROR_TOAST: flag(),
  NEXT_PUBLIC_ENABLE_API_LOGGING: flag(),
  NEXT_PUBLIC_AUTH_ENABLED: flag(),
});

const rawServerSchema = z.object({
  API_PROXY_TARGET: z.preprocess(
    blankToUndefined,
    z
      .string()
      .trim()
      .regex(/^https?:\/\/[^\s/]+/, {
        error: 'phải là URL http(s) đầy đủ, vd http://localhost:5000',
      })
      .transform((value) => value.replace(/\/+$/, ''))
      .default('http://localhost:5000'),
  ),
  AUTH_SESSION_COOKIE: text('refresh_token'),
  SEO_ALLOW_INDEXING: flag(),
  GOOGLE_SITE_VERIFICATION: optionalText(),
  BING_SITE_VERIFICATION: optionalText(),
  VERCEL_ENV: optionalText(),
  VERCEL_PROJECT_PRODUCTION_URL: optionalText(),
  NODE_ENV: optionalText(),
});

/** Gốc API mặc định — khớp `rewrites()` của `next.config.ts` (đường `/api/*` đi qua proxy same-origin). */
const DEFAULT_API_BASE_URL = '/api';

/** Gốc site khi chưa khai — chỉ hợp lý lúc phát triển (`npm run dev`). */
export const DEFAULT_SITE_URL = 'http://localhost:3000';

export interface AppEnv {
  appName: string;
  /** `NEXT_PUBLIC_APP_MODE=demo`: bản trưng bày, không cần backend. `false` = sản phẩm thật (`app`). */
  isDemo: boolean;
  /** Gốc site (`https://example.com`, không có `/` cuối) — nền của canonical, hreflang, sitemap, OG. */
  siteUrl: string;
  /** `NEXT_PUBLIC_SITE_URL` được khai tường minh hay đang dùng mặc định phát triển. */
  siteUrlExplicit: boolean;
  /** Gốc API, đã bỏ dấu `/` cuối. */
  apiBaseUrl: string;
  /** `NEXT_PUBLIC_API_BASE_URL` được khai tường minh hay đang dùng mặc định. */
  apiBaseUrlExplicit: boolean;
  /** Thời gian chờ tối đa mỗi request (ms). */
  apiTimeout: number;
  /** Bật toast lỗi tập trung cho query/mutation. */
  enableErrorToast: boolean;
  /** Log request/response ra console — chỉ bật ở máy dev. */
  enableApiLogging: boolean;
  /** Kiểm đăng nhập. Mặc định: bật ở `app`, tắt ở `demo`. */
  authEnabled: boolean;
}

export interface ServerEnv {
  /** Đích `rewrites()` của đường `/api/*` — biến CHỈ DÀNH CHO NODE, không vào bundle. */
  apiProxyTarget: string;
  /** Tên cookie HttpOnly mà BE đặt khi đăng nhập; `proxy.ts` chỉ kiểm sự TỒN TẠI của nó. */
  authSessionCookie: string;
  /** Cho công cụ tìm kiếm lập chỉ mục: khai tường minh, hoặc tự suy từ môi trường triển khai. */
  allowIndexing: boolean;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  /** Gốc site production do Vercel cấp (`VERCEL_PROJECT_PRODUCTION_URL`, không có scheme). */
  vercelProductionHost?: string;
}

export class EnvValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(
      [
        'Biến môi trường không hợp lệ — sửa file .env rồi chạy lại:',
        ...issues.map((line) => `  - ${line}`),
      ].join('\n'),
    );
    this.name = 'EnvValidationError';
    this.issues = issues;
  }
}

function describeIssues(
  issues: readonly { path: PropertyKey[]; message: string }[],
  rawEnv: Record<string, unknown>,
): string[] {
  return issues.map((issue) => {
    const key = String(issue.path[0] ?? '(không rõ)');
    return `${key}: ${issue.message} (đang là ${JSON.stringify(rawEnv[key])})`;
  });
}

/** Đọc + kiểm env `NEXT_PUBLIC_*`; ném `EnvValidationError` liệt kê mọi biến sai. */
export function parseAppEnv(rawEnv: Record<string, unknown>): AppEnv {
  const result = rawEnvSchema.safeParse(rawEnv);
  if (!result.success) throw new EnvValidationError(describeIssues(result.error.issues, rawEnv));

  const parsed = result.data;
  const isDemo = parsed.NEXT_PUBLIC_APP_MODE === 'demo';

  return {
    appName: parsed.NEXT_PUBLIC_APP_NAME,
    isDemo,
    siteUrl: parsed.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
    siteUrlExplicit: parsed.NEXT_PUBLIC_SITE_URL !== undefined,
    apiBaseUrl: parsed.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL,
    apiBaseUrlExplicit: parsed.NEXT_PUBLIC_API_BASE_URL !== undefined,
    apiTimeout: parsed.NEXT_PUBLIC_API_TIMEOUT,
    enableErrorToast: parsed.NEXT_PUBLIC_ENABLE_ERROR_TOAST ?? true,
    enableApiLogging: parsed.NEXT_PUBLIC_ENABLE_API_LOGGING ?? false,
    authEnabled: parsed.NEXT_PUBLIC_AUTH_ENABLED ?? !isDemo,
  };
}

/** Đọc + kiểm env chỉ có ở server; ném `EnvValidationError` liệt kê mọi biến sai. */
export function parseServerEnv(rawEnv: Record<string, unknown>): ServerEnv {
  const result = rawServerSchema.safeParse(rawEnv);
  if (!result.success) throw new EnvValidationError(describeIssues(result.error.issues, rawEnv));

  const parsed = result.data;
  const onVercel = parsed.VERCEL_ENV !== undefined;
  const isProductionDeploy = onVercel
    ? parsed.VERCEL_ENV === 'production'
    : parsed.NODE_ENV === 'production';

  return {
    apiProxyTarget: parsed.API_PROXY_TARGET,
    authSessionCookie: parsed.AUTH_SESSION_COOKIE,
    allowIndexing: parsed.SEO_ALLOW_INDEXING ?? isProductionDeploy,
    googleSiteVerification: parsed.GOOGLE_SITE_VERIFICATION,
    bingSiteVerification: parsed.BING_SITE_VERIFICATION,
    vercelProductionHost: parsed.VERCEL_PROJECT_PRODUCTION_URL,
  };
}

/** Lỗi chặn build production của chế độ `app`; mảng rỗng = đạt. Chỉ `next.config.ts` gọi. */
export function findProductionIssues(config: AppEnv, server: ServerEnv): string[] {
  if (config.isDemo) return [];

  const issues: string[] = [];
  if (!config.authEnabled) {
    issues.push(
      'NEXT_PUBLIC_AUTH_ENABLED=false: mọi route sẽ mở cho người chưa đăng nhập. Bỏ biến này (mặc định BẬT) hoặc đặt true.',
    );
  }
  if (!config.apiBaseUrlExplicit) {
    issues.push(
      `NEXT_PUBLIC_API_BASE_URL chưa khai: bản build sẽ gọi "${DEFAULT_API_BASE_URL}" same-origin, chỉ đúng khi máy chủ thật cũng reverse-proxy đường đó. Khai tường minh (kể cả khi giá trị là ${DEFAULT_API_BASE_URL}).`,
    );
  }
  if (!config.siteUrlExplicit && server.vercelProductionHost === undefined) {
    issues.push(
      'NEXT_PUBLIC_SITE_URL chưa khai: canonical, hreflang, sitemap và ảnh OG sẽ trỏ về http://localhost:3000. Khai gốc site thật, vd https://example.com.',
    );
  }
  return issues;
}
