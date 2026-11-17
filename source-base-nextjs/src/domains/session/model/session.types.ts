import type { z } from 'zod';

import type { sessionPayloadSchema, sessionUserSchema } from './session.schema';

export type SessionUser = z.output<typeof sessionUserSchema>;

/** Thứ BE trả về khi login / refresh thành công. */
export type SessionPayload = z.output<typeof sessionPayloadSchema>;

type SessionStatus =
  /** Chưa thử khôi phục phiên (khung hình đầu sau F5). */
  | 'idle'
  /** Đang gọi refresh để khôi phục phiên. */
  | 'restoring'
  | 'authenticated'
  /** Máy chủ đã xác nhận không có phiên. */
  | 'anonymous'
  /** Không hỏi được máy chủ — chưa biết còn phiên hay không. */
  | 'unavailable';

export type SessionEndReason =
  /** Người dùng bấm đăng xuất ở tab này. */
  | 'logout'
  /** Máy chủ từ chối làm mới phiên. */
  | 'expired'
  /** Người dùng đăng xuất ở tab khác. */
  | 'remote'
  /** Phiên vẫn sống nhưng đã thuộc một tài khoản KHÁC (`user.id` đổi) — chỉ có ở `onSessionEnd`. */
  | 'switched';

export interface SessionState {
  user: SessionUser | null;
  /** Access token — chỉ nằm trong bộ nhớ, không persist. */
  accessToken: string | null;
  status: SessionStatus;
  /** Vì sao phiên ĐANG SỐNG gần nhất ở tab này kết thúc; `null` khi đang có phiên hoặc chưa từng có. */
  endReason: SessionEndReason | null;
}

export type RefreshOutcome =
  | { status: 'ok'; session: SessionPayload }
  /** Máy chủ nói phiên đã chết (400/401/403). */
  | { status: 'unauthenticated' }
  /** Mất mạng / 5xx / quá hạn / payload sai — phiên được giữ nguyên. */
  | { status: 'unavailable'; reason: string };
