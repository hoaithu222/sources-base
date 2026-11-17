import 'server-only';

import { parseServerEnv } from './env.schema';
import type { ServerEnv } from './env.schema';

/**
 * serverConfig — cấu hình CHỈ có ở server (proxy API, cookie phiên, chỉ mục tìm kiếm, mã xác minh).
 *
 * Dùng:   import { serverConfig } from '@/core/config/server-config';   // trong Server Component, `proxy.ts`, route handler
 * Lưu ý:  `import 'server-only'` làm build đỏ nếu một Client Component lỡ import file này — secret không bao giờ
 *         lọt vào bundle trình duyệt.
 */

export const serverConfig: ServerEnv = Object.freeze(parseServerEnv(process.env));
