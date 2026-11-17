import { safeStorage } from '@/shared/utils/browser/storage.utils';

import { isChunkLoadError } from './describe-error';

/**
 * chunk-reload.utils — lỗi tải chunk (thường do vừa triển khai bản mới: `index.html` cũ trỏ tới file đã bị
 * xoá) thì tự tải lại trang MỘT lần để lấy bản mới; vẫn lỗi trong `CHUNK_RELOAD_WINDOW_MS` thì thôi, để
 * màn lỗi có nút "Tải lại trang" hiện như cũ.
 *
 * Dùng:   reloadOnceOnChunkError(error)  — ranh giới lỗi (`ErrorBoundary`) và `RouteErrorScreen` gọi khi bắt lỗi.
 * Lưu ý:  cờ chống lặp là THỜI ĐIỂM tự tải lại gần nhất, ghi qua `safeStorage` (chung mọi tab); không ghi
 *         được cờ (storage bị chặn) thì KHÔNG tự tải lại — thà hiện màn lỗi còn hơn lặp tải vô hạn.
 */

/** Khoá `safeStorage` giữ thời điểm (ms, `Date.now()`) lần tự tải lại gần nhất. */
export const CHUNK_RELOAD_STORAGE_KEY = 'app:chunk-reload-at';

/** Trong khoảng này (ms) sau một lần tự tải lại, lỗi chunk KHÔNG tải lại nữa mà hiện màn lỗi. */
export const CHUNK_RELOAD_WINDOW_MS = 60_000;

function reloadedRecently(now: number): boolean {
  const last = Number(safeStorage.getItem(CHUNK_RELOAD_STORAGE_KEY));
  return last > 0 && now >= last && now - last < CHUNK_RELOAD_WINDOW_MS;
}

/**
 * Lỗi tải chunk và chưa tự tải lại gần đây → ghi cờ rồi `location.reload()`, trả `true`.
 * Lỗi khác, vừa tự tải lại, hoặc không ghi được cờ → không làm gì, trả `false`.
 */
export function reloadOnceOnChunkError(error: unknown, now: number = Date.now()): boolean {
  if (!isChunkLoadError(error) || reloadedRecently(now)) return false;
  if (!safeStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(now))) return false;

  window.location.reload();
  return true;
}
