import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createSafeJSONStorage } from '@/shared/utils/browser/storage.utils';

import { SESSION_STORAGE } from './session.constants';
import { sessionUserSchema } from './session.schema';
import type { SessionState } from './session.types';

const SESSION_INITIAL_STATE: SessionState = {
  user: null,
  accessToken: null,
  status: 'idle',
  endReason: null,
};

/** Phần đã lưu ở localStorage (KHÔNG tin cậy) → chỉ `user` đúng schema, sai thì `null`. Không ném. */
function sanitizeSessionState(raw: unknown): Pick<SessionState, 'user'> {
  const stored = typeof raw === 'object' && raw !== null ? (raw as { user?: unknown }).user : null;
  const parsed = sessionUserSchema.safeParse(stored);
  return { user: parsed.success ? parsed.data : null };
}

/**
 * useSessionStore — store phiên đăng nhập: ai đang đăng nhập, token, trạng thái phiên. Chỉ chứa DỮ LIỆU.
 *
 * Đọc luôn qua selector (`selectUser`, `selectStatus`…); quyền thì dùng `usePermission` / `canAccess`.
 * Lưu ý: không `setState` từ ngoài domain — đổi trạng thái bằng hàm vòng đời (`establishSession`,
 * `logout`, `restoreSession`…). Chỉ `user` được persist và được kiểm lại bằng schema ở CẢ `merge` lẫn
 * `migrate`; `accessToken`, `status`, `endReason` không persist — docs/notes/code/domains.md.
 *
 * @example
 * const user = useSessionStore(selectUser);
 */
export const useSessionStore = create<SessionState>()(
  persist(() => SESSION_INITIAL_STATE, {
    name: SESSION_STORAGE.key,
    version: SESSION_STORAGE.version,
    storage: createSafeJSONStorage(),
    partialize: (state) => ({ user: state.user }),
    migrate: sanitizeSessionState,
    merge: (persisted, current) => ({ ...current, ...sanitizeSessionState(persisted) }),
  }),
);
