import { z } from 'zod';

/**
 * Hình dạng dữ liệu phiên — kiểm lúc chạy ở MỌI nguồn không tin được: BE trả (`readData(response, schema)`)
 * và hồ sơ đã lưu ở localStorage (`merge` / `migrate` của `useSessionStore`).
 *
 * BE của dự án dùng tên trường khác thì đổi ở file này (`.transform()` về hình dạng dưới đây); phần còn
 * lại của app không phải biết.
 */

export const sessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string(),
  name: z.string(),
  avatar: z.string().nullish(),
  /** Nhãn vai trò, vd `['admin']`. */
  roles: z.array(z.string()).default([]),
  /** Quyền dạng `"resource:action"`, vd `['user:create']` — dựng bằng `permissionKey`. */
  permissions: z.array(z.string()).default([]),
});

/** Payload của login / refresh. Refresh token không có ở đây — nó nằm trong cookie HttpOnly. */
export const sessionPayloadSchema = z.object({
  accessToken: z.string().min(1),
  user: sessionUserSchema,
  /** Số giây còn hiệu lực của access token, nếu BE trả về. */
  expiresIn: z.number().optional(),
});
