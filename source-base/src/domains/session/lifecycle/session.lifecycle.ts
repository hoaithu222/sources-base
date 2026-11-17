import { toAppError } from '@/core/http';

import { sessionApi } from '../api/session.api';
import { useSessionStore } from '../model/session.store';
import type { RefreshOutcome, SessionEndReason, SessionPayload } from '../model/session.types';

import { broadcastSessionSignal, subscribeSessionSignals } from './session.sync';

/**
 * Vòng đời phiên đăng nhập — nơi DUY NHẤT đổi trạng thái phiên.
 *
 *   establishSession(payload)   sau khi đăng nhập thành công
 *   logout()                    đăng xuất (không bao giờ ném); chỉ xoá phiên lúc bắt đầu gọi
 *   restoreSession()            khôi phục phiên khi mở tab / nút "Thử lại"; luôn thoát `restoring`
 *   refreshSession()            làm mới phiên; khởi động và 401 đều đi qua đây
 *   onSessionEnd(listener)      nghe "phiên đang sống vừa kết thúc / vừa đổi sang tài khoản khác"
 *
 * Lưu ý: kết quả `unavailable` (mất mạng, 5xx) giữ nguyên phiên — chỉ máy chủ
 * mới được tuyên bố phiên chết. Lý do thiết kế: `docs/notes/code/domains.md`.
 */

const REFRESH_LOCK = 'app:session-refresh';

/**
 * Trả cho lượt refresh bắt đầu TRƯỚC khi phiên đổi (đăng xuất, người khác đăng nhập) — không ghi store.
 * Gộp vào `unavailable` vì nơi gọi xử lý y hệt: interceptor 401 bỏ cuộc, không gửi lại bằng token cũ.
 */
const STALE_OUTCOME: RefreshOutcome = {
  status: 'unavailable',
  reason: 'Phiên đã thay đổi trong lúc làm mới',
};

type SessionEndListener = (reason: SessionEndReason) => void;

let epoch = 0;
let inflight: Promise<RefreshOutcome> | null = null;
const endListeners = new Set<SessionEndListener>();

/**
 * Trả hàm huỷ đăng ký. Bắn khi phiên ĐANG SỐNG kết thúc (`logout` · `expired` · `remote`) và khi phiên
 * chuyển sang người dùng khác (`switched`); listener ném chỉ bị `console.error`, listener khác vẫn chạy.
 */
export function onSessionEnd(listener: SessionEndListener): () => void {
  endListeners.add(listener);
  return () => endListeners.delete(listener);
}

export const getAccessToken = (): string | null => useSessionStore.getState().accessToken;

/** Sang "thời" mới: kết quả của mọi lượt refresh đang bay sẽ bị bỏ (`STALE_OUTCOME`). */
function startNewEpoch(): void {
  epoch += 1;
  inflight = null;
}

function notifySessionEnd(reason: SessionEndReason): void {
  endListeners.forEach((listener) => {
    try {
      listener(reason);
    } catch (error) {
      console.error('Listener của onSessionEnd gặp lỗi:', error);
    }
  });
}

/** Ghi phiên vào store; hồ sơ đang giữ là của người KHÁC (so `user.id`) thì báo `switched`. */
function storeSession(session: SessionPayload): void {
  const previous = useSessionStore.getState().user;
  useSessionStore.setState({
    user: session.user,
    accessToken: session.accessToken,
    status: 'authenticated',
    endReason: null,
  });
  if (previous && previous.id !== session.user.id) notifySessionEnd('switched');
}

export function establishSession(session: SessionPayload): void {
  startNewEpoch();
  storeSession(session);
  broadcastSessionSignal({ type: 'login' });
}

/** Xoá phiên phía client; phiên đang sống thì ghi `endReason` và báo các bên nghe `onSessionEnd`. */
export function clearSession(reason: SessionEndReason): void {
  const endsLiveSession = useSessionStore.getState().status === 'authenticated';
  startNewEpoch();
  useSessionStore.setState({
    user: null,
    accessToken: null,
    status: 'anonymous',
    endReason: endsLiveSession ? reason : null,
  });
  if (endsLiveSession) notifySessionEnd(reason);
}

async function requestRefresh(): Promise<RefreshOutcome> {
  try {
    return { status: 'ok', session: await sessionApi.refresh() };
  } catch (cause) {
    const error = toAppError(cause);
    const rejectedByServer = error.status === 400 || error.status === 401 || error.status === 403;
    return rejectedByServer
      ? { status: 'unauthenticated' }
      : { status: 'unavailable', reason: error.message };
  }
}

async function withCrossTabLock(task: () => Promise<RefreshOutcome>): Promise<RefreshOutcome> {
  const locks = typeof navigator === 'undefined' ? undefined : navigator.locks;
  if (!locks) return task();

  let started: Promise<RefreshOutcome> | undefined;
  try {
    return await locks.request(REFRESH_LOCK, () => (started = task()));
  } catch {
    return started ?? task();
  }
}

function applyOutcome(outcome: RefreshOutcome): void {
  if (outcome.status === 'ok') storeSession(outcome.session);
  if (outcome.status === 'unauthenticated') clearSession('expired');
}

/** Làm mới phiên (single-flight), tự ghi kết quả vào store. */
export function refreshSession(): Promise<RefreshOutcome> {
  if (inflight) return inflight;

  const startedAt = epoch;
  const run = withCrossTabLock(requestRefresh)
    .then((outcome): RefreshOutcome => {
      if (startedAt !== epoch) return STALE_OUTCOME;
      applyOutcome(outcome);
      return outcome;
    })
    .finally(() => {
      if (inflight === run) inflight = null;
    });

  inflight = run;
  return run;
}

/** Bản rút gọn cho tầng HTTP: token mới, hoặc `null` nếu không làm mới được. */
export async function refreshAccessToken(): Promise<string | null> {
  const outcome = await refreshSession();
  return outcome.status === 'ok' ? outcome.session.accessToken : null;
}

/** Khôi phục phiên. Chỉ chạy từ `idle` / `unavailable`, nên gọi trùng vô hại. */
export async function restoreSession(): Promise<void> {
  const { status } = useSessionStore.getState();
  if (status !== 'idle' && status !== 'unavailable') return;

  useSessionStore.setState({ status: 'restoring' });
  try {
    await refreshSession();
  } catch (error) {
    console.error('Khôi phục phiên gặp lỗi ngoài dự kiến:', error);
  }

  if (useSessionStore.getState().status === 'restoring') {
    useSessionStore.setState({ status: 'unavailable' });
  }
}

/** "Phiên nào" = thời (`epoch`) + người dùng — `logout()` so trước / sau khi chờ BE. */
function sessionIdentity(): string {
  return `${epoch}:${useSessionStore.getState().user?.id ?? ''}`;
}

/** Báo máy chủ thu hồi phiên rồi xoá phiên phía client — kể cả khi máy chủ lỗi. */
export async function logout(): Promise<void> {
  const startedWith = sessionIdentity();
  await sessionApi.logout().catch(() => undefined);
  if (sessionIdentity() !== startedWith) return;

  clearSession('logout');
  broadcastSessionSignal({ type: 'logout' });
}

/** Bắt đầu phản ứng với tín hiệu từ tab khác; trả hàm dừng. Gọi một lần ở `app/bootstrap.ts`. */
export function startSessionSync(): () => void {
  return subscribeSessionSignals((signal) => {
    if (signal.type === 'login') {
      refreshSession().catch((error: unknown) => {
        console.error('Làm mới phiên sau tín hiệu từ tab khác gặp lỗi:', error);
      });
      return;
    }
    if (useSessionStore.getState().status === 'authenticated') clearSession('remote');
  });
}
