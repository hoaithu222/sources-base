import { parseAppEnv } from './env.schema';
import type { AppEnv } from './env.schema';

/**
 * appConfig — cấu hình ứng dụng đã kiểm; đọc qua đây, không đọc `import.meta.env` trực tiếp.
 *
 * Dùng:   import { appConfig } from '@/core/config';   if (appConfig.isDemo) …
 * Lưu ý:  mọi giá trị nằm trong bundle gửi cho trình duyệt — không đặt secret. Biến sai định dạng
 *         làm module này ném lỗi ngay lúc nạp.
 */

export const appConfig: AppEnv = Object.freeze(parseAppEnv(import.meta.env));
