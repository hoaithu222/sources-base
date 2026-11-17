import { PATHS } from '@/shared/constants/paths.constants';

/**
 * return-path — đích quay lại sau khi đăng nhập, mang trên query `?next=` (xem `RETURN_PATH_PARAM`).
 *
 * Dùng:   createReturnPath('/dashboard?tab=2')            → '/dashboard?tab=2'   (ghi vào `?next=`)
 *         resolveReturnPath(searchParams.get('next'))     → đích an toàn, hoặc `PATHS.DASHBOARD`
 * Lưu ý:  CHỈ nhận đường NỘI BỘ — `//evil.com`, `/\evil.com`, URL tuyệt đối, và dạng chuẩn hoá ra `//host`
 *         (`/..//evil.com`) đều bị bỏ (chống open-redirect); `tests/shared/return-path.test.ts` giữ.
 *         Hàm thuần: dùng được ở `proxy.ts`, Server Component lẫn client.
 */

const PROBE_ORIGIN = 'http://return-path.invalid';

function toInternalPath(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith('/')) return null;

  try {
    const url = new URL(value, PROBE_ORIGIN);
    if (url.origin !== PROBE_ORIGIN) return null;
    const path = url.pathname + url.search + url.hash;
    return path.startsWith('//') ? null : path;
  } catch {
    return null;
  }
}

export function createReturnPath(pathname: string, search = '', hash = ''): string | null {
  return toInternalPath(pathname + search + hash);
}

/**
 * @param value Giá trị `?next=` của trang đăng nhập.
 * @param fallback Dùng khi không có đích, hoặc đích không phải đường nội bộ.
 */
export function resolveReturnPath(value: unknown, fallback: string = PATHS.DASHBOARD): string {
  return toInternalPath(value) ?? fallback;
}
