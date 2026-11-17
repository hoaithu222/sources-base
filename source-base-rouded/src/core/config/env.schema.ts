import { z } from 'zod';

/**
 * Schema biến môi trường — dùng chung cho trình duyệt (`app-config.ts`) và Node
 * (`vite.config.ts`).
 *
 * Thêm biến mới: khai ở `rawEnvSchema` + `AppEnv` + `src/vite-env.d.ts` + `.env.example`.
 *
 * Lưu ý: file này không đọc `import.meta.env` / `process.env` và chỉ import `zod`
 * (chạy ở cả hai môi trường). Lý do thiết kế: `docs/notes/code/core.md`.
 */

const blankToUndefined = (value: unknown): unknown =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const text = (fallback: string) =>
  z.preprocess(blankToUndefined, z.string().trim().default(fallback));

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

const rawEnvSchema = z.object({
  VITE_APP_NAME: text('Base App'),
  VITE_APP_MODE: z.preprocess(
    blankToUndefined,
    z.enum(['demo', 'app'], { error: 'chỉ nhận demo | app' }).default('app'),
  ),
  VITE_API_BASE_URL: apiBaseUrl,
  VITE_API_TIMEOUT: positiveInt(30_000),
  VITE_ENABLE_ERROR_TOAST: flag(),
  VITE_ENABLE_API_LOGGING: flag(),
  VITE_AUTH_ENABLED: flag(),
});

/** Gốc API mặc định — phải khớp khoá proxy `/api` của dev server (`vite.config.ts`). */
const DEFAULT_API_BASE_URL = '/api';

export interface AppEnv {
  appName: string;
  /** `VITE_APP_MODE=demo`: bản trưng bày, không cần backend. `false` = sản phẩm thật (`app`). */
  isDemo: boolean;
  /** Gốc API, đã bỏ dấu `/` cuối. */
  apiBaseUrl: string;
  /** `VITE_API_BASE_URL` được khai tường minh hay đang dùng mặc định. */
  apiBaseUrlExplicit: boolean;
  /** Thời gian chờ tối đa mỗi request (ms). */
  apiTimeout: number;
  /** Bật toast lỗi tập trung cho query/mutation. */
  enableErrorToast: boolean;
  /** Log request/response ra console — chỉ bật ở máy dev. */
  enableApiLogging: boolean;
  /** Kiểm đăng nhập trên router. Mặc định: bật ở `app`, tắt ở `demo`. */
  authEnabled: boolean;
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

/** Đọc + kiểm env thô; ném `EnvValidationError` liệt kê mọi biến sai. */
export function parseAppEnv(rawEnv: Record<string, unknown>): AppEnv {
  const result = rawEnvSchema.safeParse(rawEnv);
  if (!result.success) {
    throw new EnvValidationError(
      result.error.issues.map((issue) => {
        const key = String(issue.path[0] ?? '(không rõ)');
        return `${key}: ${issue.message} (đang là ${JSON.stringify(rawEnv[key])})`;
      }),
    );
  }

  const parsed = result.data;
  const isDemo = parsed.VITE_APP_MODE === 'demo';

  return {
    appName: parsed.VITE_APP_NAME,
    isDemo,
    apiBaseUrl: parsed.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
    apiBaseUrlExplicit: parsed.VITE_API_BASE_URL !== undefined,
    apiTimeout: parsed.VITE_API_TIMEOUT,
    enableErrorToast: parsed.VITE_ENABLE_ERROR_TOAST ?? true,
    enableApiLogging: parsed.VITE_ENABLE_API_LOGGING ?? false,
    authEnabled: parsed.VITE_AUTH_ENABLED ?? !isDemo,
  };
}

/** Lỗi chặn build production của chế độ `app`; mảng rỗng = đạt. Chỉ `vite.config.ts` gọi. */
export function findProductionIssues(config: AppEnv): string[] {
  if (config.isDemo) return [];

  const issues: string[] = [];
  if (!config.authEnabled) {
    issues.push(
      'VITE_AUTH_ENABLED=false: mọi route sẽ mở cho người chưa đăng nhập. Bỏ biến này (mặc định BẬT) hoặc đặt true.',
    );
  }
  if (!config.apiBaseUrlExplicit) {
    issues.push(
      `VITE_API_BASE_URL chưa khai: bản build sẽ gọi "${DEFAULT_API_BASE_URL}" same-origin, chỉ đúng khi máy chủ thật cũng reverse-proxy đường đó. Khai tường minh (kể cả khi giá trị là ${DEFAULT_API_BASE_URL}).`,
    );
  }
  return issues;
}
