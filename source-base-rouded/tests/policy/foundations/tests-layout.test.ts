/**
 * Cây `tests/` PHẢN CHIẾU cây `src/` — `docs/rules/foundations/folder-structure.md` (bố cục theo
 * vùng) và `docs/rules/foundations/quality-gates.md §4` (bài kiểm luật).
 *
 *   1. Mọi file test nằm dưới `tests/{policy,app,core,domains,features,shared,helpers}/`:
 *      `policy/` = bài kiểm LUẬT (đọc mã nguồn, chia theo nhóm của `docs/rules/`); các folder còn
 *      lại = bài kiểm HÀNH VI, đặt theo tầng / vùng của module được kiểm.
 *   2. Hai cấp đầu của test hành vi trùng một folder có thật trong `src/` (`shared/ui`,
 *      `features/auth`, `app/router`…) — tìm test của `src/x/y` là mở `tests/x/y`.
 *   3. File không phải test chỉ ở `tests/helpers/` (và `tests/setup.ts` do `vite.config.ts` nạp).
 *   4. Mỗi folder ≤ 8 mục — như `src/`.
 */

import { describe, expect, it } from 'vitest';

import { SOURCE_CODE, SOURCE_CSS, TEST_FILES, dirOf } from '@tests/helpers/source-files';

const ROOTS = ['policy', 'app', 'core', 'domains', 'features', 'shared', 'helpers'];
const MIRRORED = ['app', 'core', 'domains', 'features', 'shared'];
const MAX_ENTRIES = 8;

/** Đường dẫn tính từ `tests/`. */
const FILES = Object.keys(TEST_FILES).map((path) => path.slice('tests/'.length));
const isTest = (file: string) => /\.test\.tsx?$/.test(file);

const SRC_DIRS = new Set(
  [...Object.keys(SOURCE_CODE), ...Object.keys(SOURCE_CSS)].flatMap((path) => {
    const parts = dirOf(path).split('/').slice(1);
    return parts.map((_, i) => parts.slice(0, i + 1).join('/'));
  }),
);

describe('bố cục tests/', () => {
  it('có đủ file test để kiểm', () => {
    expect(FILES.filter(isTest).length).toBeGreaterThan(80);
  });

  it(`mọi file test nằm dưới tests/{${ROOTS.join(',')}}/`, () => {
    const stray = FILES.filter(isTest).filter((file) => !ROOTS.includes(file.split('/')[0]));
    expect(stray, `Chuyển vào folder theo tầng / vùng:\n  ${stray.join('\n  ')}`).toEqual([]);
  });

  it('test hành vi nằm ở folder trùng tầng / vùng có thật trong src/', () => {
    const lost = FILES.filter(isTest)
      .filter((file) => MIRRORED.includes(file.split('/')[0]))
      .filter((file) => {
        const dirs = dirOf(file).split('/');
        return !SRC_DIRS.has(dirs.slice(0, Math.min(2, dirs.length)).join('/'));
      });
    expect(lost, `Không ứng với folder nào trong src/:\n  ${lost.join('\n  ')}`).toEqual([]);
  });

  it('file không phải test chỉ ở tests/helpers/ (và tests/setup.ts)', () => {
    const misplaced = FILES.filter((file) => !isTest(file)).filter(
      (file) => file !== 'setup.ts' && !file.startsWith('helpers/'),
    );
    expect(misplaced, `Chuyển vào tests/helpers/:\n  ${misplaced.join('\n  ')}`).toEqual([]);
  });

  it(`mỗi folder ≤ ${MAX_ENTRIES} mục`, () => {
    const children = new Map<string, Set<string>>();
    for (const file of FILES) {
      const parts = file.split('/');
      for (let i = 0; i < parts.length; i++) {
        const dir = parts.slice(0, i).join('/');
        if (!children.has(dir)) children.set(dir, new Set());
        children.get(dir)!.add(parts[i]);
      }
    }
    const crowded = [...children]
      .filter(([, entries]) => entries.size > MAX_ENTRIES)
      .map(([dir, entries]) => `tests/${dir} — ${entries.size} mục: ${[...entries].join(', ')}`);
    expect(crowded, `Chia nhóm con (folder-structure.md §2):\n  ${crowded.join('\n  ')}`).toEqual(
      [],
    );
  });
});
