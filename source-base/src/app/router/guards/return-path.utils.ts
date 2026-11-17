import type { Location } from 'react-router-dom';

import { PATHS } from '@/shared/constants/paths.constants';

/**
 * return-path — đích quay lại sau khi đăng nhập: `AuthGuard` ghi (`createReturnState`, trừ khi vừa
 * đăng xuất chủ động), `GuestGuard` đọc và điều hướng (`resolveReturnPath`).
 *
 * Dùng:   <Navigate state={createReturnState(location)} to={PATHS.LOGIN} />  (AuthGuard)
 *         resolveReturnPath(location.state)  (GuestGuard)
 * Lưu ý:  chỉ cặp này đụng tới `location.state.from`; `resolveReturnPath` chỉ nhận đường NỘI BỘ
 *         (`//evil.com`, `/\evil.com`, URL tuyệt đối bị bỏ → về trang chủ) — routing-conventions.md §10.
 */

interface ReturnState {
  from: string;
}

const PROBE_ORIGIN = 'http://return-path.invalid';

export function createReturnState(
  location: Pick<Location, 'pathname' | 'search' | 'hash'>,
): ReturnState {
  return { from: location.pathname + location.search + location.hash };
}

function toInternalPath(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith('/')) return null;

  try {
    const url = new URL(value, PROBE_ORIGIN);
    if (url.origin !== PROBE_ORIGIN) return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
}

/**
 * @param state `location.state` của trang đăng nhập (do `AuthGuard` đặt).
 * @param fallback Dùng khi không có đích, hoặc đích không phải đường nội bộ.
 */
export function resolveReturnPath(state: unknown, fallback: string = PATHS.HOME): string {
  const from = (state as Partial<ReturnState> | null | undefined)?.from;
  return toInternalPath(from) ?? fallback;
}
