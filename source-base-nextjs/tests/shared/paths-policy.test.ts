/**
 * Chính sách truy cập theo route — `PATHS` · `GUEST_ONLY_PATHS` · `PROTECTED_PATH_PREFIXES` · `isGuestOnlyPath` · `isProtectedPath`.
 *
 * `proxy.ts` (chặn theo cookie phiên), `AuthGate` / `GuestGate`, sitemap và robots cùng đọc MỘT bảng này; route không thuộc
 * nhóm nào là công khai. Hỏng ở đây là hoặc lộ trang riêng tư cho người chưa đăng nhập, hoặc nhốt người đã đăng nhập vào trang khách
 * (`/login` ↔ `/dashboard` đá qua đá lại). Bài kiểm giữ:
 *   - hai nhóm không giao nhau, và mọi đường trong nhóm đều là đường THẬT của `PATHS`;
 *   - hàm `is…Path` khớp bảng, kể cả ranh giới tiền tố (`/dashboardx` KHÔNG thuộc `/dashboard`);
 *   - `PATHS` ↔ cây `src/app/[locale]/**` (route nào cũng có trang, và nhóm route `(auth)` / `(app)` / `(public)` đúng chính sách).
 */

import { describe, expect, it } from 'vitest';

import {
  GUEST_ONLY_PATHS,
  PATHS,
  PROTECTED_PATH_PREFIXES,
  isGuestOnlyPath,
  isProtectedPath,
} from '@/shared/constants/paths.constants';
import { SOURCE_CODE } from '@tests/helpers/source-files';

const ALL_PATHS = Object.values(PATHS) as string[];
const isPublicPath = (path: string) => !isGuestOnlyPath(path) && !isProtectedPath(path);

describe('PATHS', () => {
  it('mỗi đường bắt đầu bằng `/`, không dấu `/` cuối (trừ gốc), không tiền tố ngôn ngữ, không trùng nhau', () => {
    for (const path of ALL_PATHS) {
      expect(path.startsWith('/'), path).toBe(true);
      expect(path === '/' || !path.endsWith('/'), path).toBe(true);
      expect(path, path).not.toMatch(/^\/(vi|en)(\/|$)/);
    }
    expect(new Set(ALL_PATHS).size).toBe(ALL_PATHS.length);
  });
});

describe('nhóm truy cập', () => {
  it('⛔ GUEST_ONLY ∩ PROTECTED = ∅ — một đường không thể vừa cấm người đã đăng nhập vừa đòi đăng nhập', () => {
    const overlap = GUEST_ONLY_PATHS.filter(
      (path) => PROTECTED_PATH_PREFIXES.includes(path) || isProtectedPath(path),
    );
    expect(overlap).toEqual([]);
    const reverse = PROTECTED_PATH_PREFIXES.filter(
      (prefix) => isGuestOnlyPath(prefix) || isGuestOnlyPath(`${prefix}/x`),
    );
    expect(reverse).toEqual([]);
  });

  it('mọi đường trong hai nhóm là đường thật của `PATHS`', () => {
    for (const path of [...GUEST_ONLY_PATHS, ...PROTECTED_PATH_PREFIXES]) {
      expect(ALL_PATHS, path).toContain(path);
    }
  });

  it('không dấu `/` cuối trong tiền tố (khớp theo ranh giới đoạn, `/dashboard/` sẽ không khớp gì)', () => {
    for (const prefix of PROTECTED_PATH_PREFIXES) expect(prefix.endsWith('/')).toBe(false);
  });

  it('trang khách: đăng nhập · đăng ký · quên / đặt lại mật khẩu', () => {
    expect([...GUEST_ONLY_PATHS].sort()).toEqual(
      [PATHS.LOGIN, PATHS.REGISTER, PATHS.FORGOT_PASSWORD, PATHS.RESET_PASSWORD].sort(),
    );
  });

  it('công khai (không thuộc nhóm nào): trang chủ · giới thiệu · 403', () => {
    expect(ALL_PATHS.filter(isPublicPath).sort()).toEqual(
      [PATHS.HOME, PATHS.ABOUT, PATHS.FORBIDDEN].sort(),
    );
  });
});

describe('isProtectedPath', () => {
  it.each(PROTECTED_PATH_PREFIXES)('`%s` và mọi route con cần đăng nhập', (prefix) => {
    expect(isProtectedPath(prefix)).toBe(true);
    expect(isProtectedPath(`${prefix}/con`)).toBe(true);
    expect(isProtectedPath(`${prefix}/con/chau`)).toBe(true);
  });

  it.each(PROTECTED_PATH_PREFIXES)(
    '⛔ ranh giới tiền tố: `%sx` và `%s-x` KHÔNG thuộc vùng riêng tư',
    (prefix) => {
      expect(isProtectedPath(`${prefix}x`)).toBe(false);
      expect(isProtectedPath(`${prefix}-x`)).toBe(false);
    },
  );

  it('đường công khai và trang khách không phải vùng riêng tư; so khớp phân biệt hoa thường', () => {
    for (const path of [PATHS.HOME, PATHS.ABOUT, PATHS.FORBIDDEN, ...GUEST_ONLY_PATHS]) {
      expect(isProtectedPath(path), path).toBe(false);
    }
    expect(isProtectedPath('/Dashboard')).toBe(false);
  });
});

describe('isGuestOnlyPath', () => {
  it.each(GUEST_ONLY_PATHS)('`%s` chỉ cho người chưa đăng nhập', (path) => {
    expect(isGuestOnlyPath(path)).toBe(true);
  });

  it('khớp NGUYÊN đường — route con và đường tương tự không thuộc nhóm khách', () => {
    expect(isGuestOnlyPath('/login/x')).toBe(false);
    expect(isGuestOnlyPath('/loginx')).toBe(false);
    expect(isGuestOnlyPath('/Login')).toBe(false);
  });

  it('vùng riêng tư và trang công khai không phải trang khách', () => {
    for (const path of [...PROTECTED_PATH_PREFIXES, PATHS.HOME, PATHS.ABOUT, PATHS.FORBIDDEN]) {
      expect(isGuestOnlyPath(path), path).toBe(false);
    }
  });
});

describe('PATHS ↔ cây route src/app/[locale]', () => {
  interface Route {
    url: string;
    groups: string[];
    file: string;
  }

  /** `page.tsx` → URL (bỏ `[locale]`, nhóm `(x)`); route động (`[...rest]`) không phải đường tĩnh nên bỏ qua. */
  const ROUTES: Route[] = Object.keys(SOURCE_CODE)
    .filter((file) => /^src\/app\/\[locale\]\/(?:.*\/)?page\.tsx$/.test(file))
    .map((file) => {
      const segments = file
        .replace(/^src\/app\/\[locale\]\//, '')
        .replace(/\/?page\.tsx$/, '')
        .split('/')
        .filter(Boolean);
      return {
        file,
        groups: segments.filter((segment) => /^\(.+\)$/.test(segment)),
        url: `/${segments.filter((segment) => !/^\(.+\)$/.test(segment)).join('/')}`,
      };
    })
    .filter((route) => !route.url.includes('['));

  it('đọc được các trang tĩnh để so', () => {
    expect(ROUTES.length).toBeGreaterThanOrEqual(ALL_PATHS.length);
  });

  it('mọi giá trị của `PATHS` có `page.tsx` tương ứng, và mọi trang tĩnh đều có tên trong `PATHS`', () => {
    const urls = ROUTES.map((route) => route.url);
    expect(
      ALL_PATHS.filter((path) => !urls.includes(path)),
      'PATHS trỏ vào route không có trang',
    ).toEqual([]);
    expect(
      urls.filter((url) => !ALL_PATHS.includes(url)),
      'Trang chưa khai trong PATHS',
    ).toEqual([]);
  });

  it('nhóm route khớp chính sách: `(auth)` ↔ chỉ khách · `(app)` ↔ cần đăng nhập · `(public)` ↔ công khai', () => {
    const wrong = ROUTES.flatMap((route) => {
      const problems: string[] = [];
      if (route.groups.includes('(auth)') && !isGuestOnlyPath(route.url)) {
        problems.push(
          `${route.file} — trong (auth) nhưng \`${route.url}\` chưa khai ở GUEST_ONLY_PATHS`,
        );
      }
      if (route.groups.includes('(app)') && !isProtectedPath(route.url)) {
        problems.push(
          `${route.file} — trong (app) nhưng \`${route.url}\` chưa thuộc PROTECTED_PATH_PREFIXES`,
        );
      }
      if (route.groups.includes('(public)') && !isPublicPath(route.url)) {
        problems.push(
          `${route.file} — trong (public) nhưng \`${route.url}\` bị chặn theo chính sách`,
        );
      }
      if (route.groups.length === 0 && !isPublicPath(route.url)) {
        problems.push(
          `${route.file} — ngoài nhóm nào nhưng \`${route.url}\` bị chặn theo chính sách`,
        );
      }
      return problems;
    });
    expect(
      wrong,
      `Nhóm route lệch chính sách (paths.constants.ts):\n  ${wrong.join('\n  ')}`,
    ).toEqual([]);

    const reverse = [
      ...GUEST_ONLY_PATHS.filter(
        (path) => !ROUTES.some((route) => route.url === path && route.groups.includes('(auth)')),
      ),
      ...PROTECTED_PATH_PREFIXES.filter(
        (path) => !ROUTES.some((route) => route.url === path && route.groups.includes('(app)')),
      ),
    ];
    expect(reverse, 'Đường khai trong chính sách nhưng nằm sai nhóm route').toEqual([]);
  });
});
