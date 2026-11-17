import { parseAppEnv } from './env.schema';
import type { AppEnv } from './env.schema';

/**
 * appConfig — cấu hình ứng dụng đã kiểm; đọc qua đây, không đọc `process.env` trực tiếp.
 *
 * Dùng:   import { appConfig } from '@/core/config';   if (appConfig.isDemo) …
 * Lưu ý:  mọi giá trị nằm trong bundle gửi cho trình duyệt — không đặt secret. Biến sai định dạng
 *         làm module này ném lỗi ngay lúc nạp.
 *         ⛔ Next chỉ nhúng `NEXT_PUBLIC_*` khi truy cập THẲNG `process.env.NEXT_PUBLIC_X` — đừng đổi
 *         khối bên dưới thành `parseAppEnv(process.env)`: ở trình duyệt `process.env` rỗng.
 */

export const appConfig: AppEnv = Object.freeze(
  parseAppEnv({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_MODE: process.env.NEXT_PUBLIC_APP_MODE,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT,
    NEXT_PUBLIC_ENABLE_ERROR_TOAST: process.env.NEXT_PUBLIC_ENABLE_ERROR_TOAST,
    NEXT_PUBLIC_ENABLE_API_LOGGING: process.env.NEXT_PUBLIC_ENABLE_API_LOGGING,
    NEXT_PUBLIC_AUTH_ENABLED: process.env.NEXT_PUBLIC_AUTH_ENABLED,
  }),
);
