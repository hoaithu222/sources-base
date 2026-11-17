/**
 * Đích quay lại sau đăng nhập (`/login?next=…`) — `resolveReturnPath` · `createReturnPath`.
 *
 * `?next=` là đầu vào do NGƯỜI NGOÀI viết (link trong email, trang lừa đảo). Hàm này là hàng rào duy nhất trước `router.push`
 * / `redirect` — để lọt một URL ngoài site là open-redirect: người dùng vừa nhập mật khẩu thật xong bị đưa sang trang giả.
 * Bài kiểm liệt kê từng thủ thuật đã biết; `URL` của trình duyệt bỏ tab / xuống dòng, đổi `\` thành `/`, gấp `/..//` nên một
 * phép so chuỗi `startsWith('//')` trên đầu vào thô là KHÔNG đủ.
 */

import { describe, expect, it } from 'vitest';

import { PATHS, RETURN_PATH_PARAM } from '@/shared/constants/paths.constants';
import { createReturnPath, resolveReturnPath } from '@/shared/utils/url/return-path.utils';

/** Đầu vào tấn công: phải RƠI VỀ mặc định (không được trả lại đúng chuỗi, cũng không trả bản đã chuẩn hoá). */
const ATTACKS: [string, string][] = [
  ['URL bỏ-scheme', '//evil.com'],
  ['URL bỏ-scheme kèm đường dẫn', '//evil.com/login'],
  ['backslash thay `/` (trình duyệt coi `\\` = `/`)', '/\\evil.com'],
  ['hai backslash', '/\\\\evil.com'],
  ['URL tuyệt đối https', 'https://evil.com'],
  ['URL tuyệt đối http', 'http://evil.com/dashboard'],
  ['scheme javascript', 'javascript:alert(1)'],
  ['scheme data', 'data:text/html,<script>alert(1)</script>'],
  ['không bắt đầu bằng `/`', 'dashboard'],
  ['tab chen giữa (`URL` bỏ tab → `//evil.com`)', '/\t/evil.com'],
  ['xuống dòng chen giữa', '/\n/evil.com'],
  ['xuống dòng đầu', '\n//evil.com'],
  ['gấp `..` ra `//evil.com`', '/..//evil.com'],
  ['gấp `.` ra `//evil.com`', '/.//evil.com'],
  ['gấp `..` sâu ra `//evil.com`', '/a/b/../..//evil.com'],
  ['chuỗi rỗng', ''],
];

describe('resolveReturnPath', () => {
  it.each(ATTACKS)('⛔ từ chối: %s', (_name, value) => {
    expect(resolveReturnPath(value)).toBe(PATHS.DASHBOARD);
  });

  it.each(ATTACKS)('⛔ từ chối và dùng `fallback` tuỳ chọn: %s', (_name, value) => {
    expect(resolveReturnPath(value, PATHS.HOME)).toBe(PATHS.HOME);
  });

  it.each([null, undefined, 42, true, {}, ['/dashboard'], Symbol.for('x')])(
    'đầu vào không phải chuỗi (%s) → mặc định',
    (value) => {
      expect(resolveReturnPath(value)).toBe(PATHS.DASHBOARD);
    },
  );

  it.each([
    '/dashboard',
    '/settings',
    '/dashboard/reports/monthly',
    '/dashboard?tab=2',
    '/dashboard?tab=2&view=table#top',
    '/profile#security',
    '/',
  ])('đường nội bộ hợp lệ giữ nguyên: %s', (value) => {
    expect(resolveReturnPath(value)).toBe(value);
  });

  it('đường nội bộ có tiền tố ngôn ngữ giữ nguyên', () => {
    expect(resolveReturnPath('/en/dashboard?tab=2')).toBe('/en/dashboard?tab=2');
  });

  it('chuẩn hoá `.` / `..` nhưng vẫn là đường nội bộ', () => {
    expect(resolveReturnPath('/a/../dashboard')).toBe('/dashboard');
    expect(resolveReturnPath('/./dashboard')).toBe('/dashboard');
  });

  it('ký tự lạ trong query được mã hoá, không phá cấu trúc đường dẫn', () => {
    expect(resolveReturnPath('/dashboard?q=a b')).toBe('/dashboard?q=a%20b');
  });

  it('mọi kết quả đều là đường nội bộ: bắt đầu bằng `/`, KHÔNG bắt đầu bằng `//` hay `/\\`', () => {
    for (const [, value] of ATTACKS) {
      const result = resolveReturnPath(value);
      expect(result.startsWith('/')).toBe(true);
      expect(result.startsWith('//')).toBe(false);
      expect(result.startsWith('/\\')).toBe(false);
    }
  });

  it('mặc định là bảng điều khiển', () => {
    expect(resolveReturnPath(undefined)).toBe('/dashboard');
    expect(RETURN_PATH_PARAM).toBe('next');
  });
});

describe('createReturnPath', () => {
  it('ghép pathname + search + hash', () => {
    expect(createReturnPath('/dashboard', '?tab=2', '#top')).toBe('/dashboard?tab=2#top');
    expect(createReturnPath('/dashboard')).toBe('/dashboard');
    expect(createReturnPath('/dashboard', '?tab=2')).toBe('/dashboard?tab=2');
  });

  it.each(['//evil.com', '/\\evil.com', 'https://evil.com', 'dashboard', '/..//evil.com', ''])(
    '⛔ pathname không nội bộ (%s) → null (không ghi gì vào `?next=`)',
    (pathname) => {
      expect(createReturnPath(pathname)).toBeNull();
    },
  );

  it('khứ hồi: thứ tạo ra luôn được `resolveReturnPath` chấp nhận nguyên vẹn', () => {
    const created = createReturnPath('/settings', '?tab=2', '#theme');
    expect(created).not.toBeNull();
    expect(resolveReturnPath(created)).toBe(created);
  });
});
