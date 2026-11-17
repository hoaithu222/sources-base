/**
 * Kênh báo tin phiên giữa các tab của cùng một trình duyệt.
 *
 *   broadcastSessionSignal({ type: 'logout' });
 *   const stop = subscribeSessionSignals((signal) => { … });
 *
 * Lưu ý: file này chỉ là đường truyền — phản ứng với tín hiệu nằm ở
 * `startSessionSync()` (`session.lifecycle.ts`). Tín hiệu không mang token.
 * Tin sai hình dạng (`isSessionSignal`) bị bỏ qua; kênh lỗi khi phát được mở lại.
 */

type SessionSignal = { type: 'login' } | { type: 'logout' };

type MessageListener = (event: MessageEvent<unknown>) => void;

const CHANNEL_NAME = 'app:session';

let channel: BroadcastChannel | null = null;
const listeners = new Set<MessageListener>();

export function isSessionSignal(value: unknown): value is SessionSignal {
  if (value === null || typeof value !== 'object') return false;
  const { type } = value as { type?: unknown };
  return type === 'login' || type === 'logout';
}

function openChannel(): BroadcastChannel | null {
  try {
    const opened = new BroadcastChannel(CHANNEL_NAME);
    listeners.forEach((listener) => opened.addEventListener('message', listener));
    return opened;
  } catch {
    return null;
  }
}

function getChannel(): BroadcastChannel | null {
  if (!channel && typeof BroadcastChannel !== 'undefined') channel = openChannel();
  return channel;
}

function replaceBrokenChannel(): void {
  channel?.close();
  channel = openChannel();
}

/** Báo cho các tab khác; tab gửi không nhận lại tin của chính nó. */
export function broadcastSessionSignal(signal: SessionSignal): void {
  try {
    getChannel()?.postMessage(signal);
  } catch {
    replaceBrokenChannel();
  }
}

/** Trả hàm dừng nghe. Chỉ chuyển tin đúng `SessionSignal`; nghe tiếp được sau khi kênh bị thay. */
export function subscribeSessionSignals(handler: (signal: SessionSignal) => void): () => void {
  const listener: MessageListener = (event) => {
    if (isSessionSignal(event.data)) handler(event.data);
  };
  listeners.add(listener);
  getChannel()?.addEventListener('message', listener);

  return () => {
    listeners.delete(listener);
    channel?.removeEventListener('message', listener);
  };
}
