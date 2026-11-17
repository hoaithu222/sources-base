/**
 * Giữ cấu trúc folder — `docs/rules/foundations/folder-structure.md`.
 *
 * Toàn `src/`:
 *   1. Mỗi folder có ≤ 8 mục (file + folder con, không tính `index.ts`).
 *   2. Folder vai trò (`hooks/ parts/ utils/ types/ shared/`) chỉ tồn tại khi có ≥ 2 mục
 *      (`component-structure.md §6`); `hooks/` chỉ chứa hook `useXxx`. Folder VÙNG cùng tên
 *      (`src/shared`, `src/shared/hooks`, `src/shared/utils`) không phải folder vai trò. Trong
 *      `src/features/**` các folder này là MỐI QUAN TÂM cấp 2 (`feature-structure.md`: "chỉ tạo
 *      folder đang có file") nên được có 1 mục — luật `hooks/` chỉ hook vẫn áp.
 *   Feature chỉ có `index.ts` ở GỐC; folder mối quan tâm không có barrel (`feature-structure.md`).
 *
 * Riêng `src/shared/ui` (`docs/rules/structure/component-structure.md §6`):
 *   3. Mọi folder nhóm / component đều có `index.ts` (barrel).
 *   4. Không lồng quá 5 cấp.
 */

import { describe, expect, it } from 'vitest';

import { SOURCE_CODE } from '@tests/helpers/source-files';

const UI = 'shared/ui';

const MAX_ENTRIES = 8;
const MAX_UI_DEPTH = 5;
const ROLE_DIRS = new Set(['hooks', 'parts', 'utils', 'types', 'shared']);

/** Ngoại lệ có lý do (khoá tính từ `src/`) — xoá khi hết lý do. */
const OVERSIZE_ALLOWED: Record<string, string> = {
  [UI]: 'Gốc ui/ là 14 nhóm chức năng cố định của ui-kit-architecture §2 — nhóm là đơn vị người dùng tìm component.',
  app: 'Gốc app/ do hệ thống file của Next quy định: file đặc biệt (robots · sitemap · manifest · global-*), `[locale]/` · `api/` và các folder lắp ráp `_*` — không gom thêm được (folder-structure.md §1).',
};

/** Đường dẫn tính từ `src/` của mọi file `.ts` / `.tsx`. */
const FILES = Object.keys(SOURCE_CODE).map((path) => path.slice('src/'.length));

const childrenOf = (files: string[]) => {
  const map = new Map<string, Set<string>>();
  for (const file of files) {
    const parts = file.split('/');
    for (let i = 0; i < parts.length; i++) {
      const dir = parts.slice(0, i).join('/');
      if (!map.has(dir)) map.set(dir, new Set());
      map.get(dir)!.add(parts[i]);
    }
  }
  return map;
};

const entriesIn = (map: Map<string, Set<string>>, dir: string) =>
  [...map.get(dir)!].filter((n) => n !== 'index.ts');

const depthOf = (dir: string) => (dir === '' ? 0 : dir.split('/').length);

const srcTree = childrenOf(FILES);

/** Folder vai trò: tên thuộc `ROLE_DIRS` và nằm sâu hơn tầng / vùng (`shared/hooks` là VÙNG). */
const isRoleDir = (dir: string) => depthOf(dir) >= 3 && ROLE_DIRS.has(dir.split('/').pop()!);

describe('cấu trúc folder — toàn src/', () => {
  it('có đủ file để kiểm', () => {
    expect(FILES.length).toBeGreaterThan(300);
  });

  it(`mỗi folder ≤ ${MAX_ENTRIES} mục (không tính index.ts)`, () => {
    const hits = [...srcTree.keys()]
      .filter((d) => entriesIn(srcTree, d).length > MAX_ENTRIES && !(d in OVERSIZE_ALLOWED))
      .map(
        (d) =>
          `${d || '(gốc src/)'} — ${entriesIn(srcTree, d).length} mục: ${entriesIn(srcTree, d).join(', ')}`,
      );
    expect(
      hits,
      `Gom theo vai trò (hooks/ parts/ utils/ types/) hoặc nhóm con — folder-structure.md §2:\n  ${hits.join('\n  ')}`,
    ).toEqual([]);
  });

  it('danh sách ngoại lệ không chứa folder đã hết quá cỡ', () => {
    const stale = Object.keys(OVERSIZE_ALLOWED).filter(
      (d) => !srcTree.has(d) || entriesIn(srcTree, d).length <= MAX_ENTRIES,
    );
    expect(stale, `Xoá khỏi OVERSIZE_ALLOWED: ${stale.join(', ')}`).toEqual([]);
  });

  it('folder vai trò có ≥ 2 mục, hooks/ chỉ chứa hook', () => {
    const roleDirs = [...srcTree.keys()].filter(isRoleDir);
    const lonely = roleDirs
      .filter((d) => !d.startsWith('features/') && entriesIn(srcTree, d).length < 2)
      .map((d) => `${d} — ${entriesIn(srcTree, d).length} mục`);
    const notHooks = roleDirs
      .filter((d) => d.endsWith('/hooks'))
      .flatMap((d) =>
        entriesIn(srcTree, d)
          .filter((n) => !/^use[A-Z]\w*\.tsx?$/.test(n))
          .map((n) => `${d}/${n}`),
      );
    expect(lonely, `Không tạo folder cho một file:\n  ${lonely.join('\n  ')}`).toEqual([]);
    expect(notHooks, `hooks/ chỉ chứa hook useXxx:\n  ${notHooks.join('\n  ')}`).toEqual([]);
  });

  it('feature chỉ có index.ts ở gốc — folder mối quan tâm import thẳng file', () => {
    const nested = FILES.filter((f) => /^features\/[^/]+\/.+\/index\.ts$/.test(f));
    expect(
      nested,
      `Bỏ barrel, import thẳng file (feature-structure.md · folder-structure.md §5):\n  ${nested.join('\n  ')}`,
    ).toEqual([]);
  });
});

describe('cấu trúc folder — src/shared/ui', () => {
  const uiFiles = FILES.filter((f) => f.startsWith(`${UI}/`)).map((f) => f.slice(UI.length + 1));
  const uiTree = childrenOf(uiFiles);
  const dirs = [...uiTree.keys()];

  const isInternal = (dir: string) => dir.split('/').some((seg, i) => i >= 2 && ROLE_DIRS.has(seg));

  it('có đủ file để kiểm', () => {
    expect(uiFiles.length).toBeGreaterThan(100);
  });

  it('mọi folder nhóm / component có index.ts', () => {
    const missing = dirs.filter(
      (d) => d !== '' && !isInternal(d) && !uiTree.get(d)!.has('index.ts'),
    );
    expect(missing, `Thiếu index.ts:\n  ${missing.join('\n  ')}`).toEqual([]);
  });

  it(`không lồng quá ${MAX_UI_DEPTH} cấp`, () => {
    const deep = uiFiles.filter((f) => f.split('/').length > MAX_UI_DEPTH);
    expect(deep, `Quá ${MAX_UI_DEPTH} cấp:\n  ${deep.join('\n  ')}`).toEqual([]);
  });
});
