/**
 * Tài liệu trỏ ĐÚNG chỗ — `docs/rules/foundations/documentation-management.md`,
 * `docs/rules/foundations/quality-gates.md §2`, `docs/rules/foundations/folder-structure.md §6`.
 * Phạm vi: `docs/**\/*.md`, `README.md`, `.claude/**\/*.md`.
 *
 *   1. Link markdown tương đối (`[x](../y.md)`) trỏ tới file / folder có thật.
 *   2. Đường `@/…` · `src/…` · `tests/…` · `e2e/…` nhắc trong backtick có thật — đổi tên / dời file mà quên
 *      sửa docs là đỏ (`tests/x/y` được phép thiếu đuôi `.test.ts`, `e2e/x` thiếu `.e2e.ts`).
 *      Khối code rào (```) là VÍ DỤ nên không soi; phần mẫu (`{id}`, `*`, `<nhóm>`, `…`) chỉ kiểm
 *      tới trước ký tự mẫu. Nhắc CỐ Ý một đường không tồn tại → khai ở `INTENTIONAL_PATHS`.
 *   3. Không `tsc … --noEmit` đơn lẻ: kiểu route (`PageProps` / `LayoutProps`) do `next typegen` sinh vào
 *      `.next/types`, thiếu bước đó `tsc` báo thiếu kiểu toàn cục — dùng `npm run typecheck` (lệnh có `next typegen`).
 *   Luật 3: câu cảnh báo có ⛔ ở cùng dòng hoặc dòng kề (câu xuống dòng) thì được nhắc lệnh.
 *   4. Không còn chữ "kit2" — bộ UI duy nhất tên là "UI kit" (`src/shared/ui`).
 *   6. Chiều ngược lại: code / CSS / test nhắc `docs/….md` hoặc `rules|notes|guides/….md` (vd
 *      `Lý do thiết kế: notes/…`) thì file đó phải có thật.
 */

import { describe, expect, it } from 'vitest';

import {
  DOC_FILES,
  REPO_PATHS,
  SOURCE_CODE,
  SOURCE_CSS,
  TEST_FILES,
  dirOf,
} from '@tests/helpers/source-files';

const DOCS = Object.entries(DOC_FILES);

/** Đường cố ý nhắc dù không tồn tại (tài liệu → đường → lý do). */
const INTENTIONAL_PATHS: Record<string, Record<string, string>> = {
  'docs/rules/styling/css-architecture.md': {
    'src/index.css': 'Nhắc để CẤM tạo entry CSS thứ hai.',
  },
};

/** Thay nội dung khối code rào bằng dòng trống (giữ số dòng). */
const withoutFences = (text: string) =>
  text.replace(/^(\s*)(```|~~~)[\s\S]*?^\1\2[^\n]*$/gm, (block) => block.replace(/[^\n]/g, ''));

/** Chuẩn hoá `a/./b/../c` → `a/c`. */
function normalize(path: string): string {
  const out: string[] = [];
  for (const part of path.split('/')) {
    if (part === '..') out.pop();
    else if (part !== '.' && part !== '') out.push(part);
  }
  return out.join('/');
}

const REPO_DIRS = new Set(
  [...REPO_PATHS].flatMap((path) => {
    const parts = dirOf(path).split('/');
    return parts.map((_, i) => parts.slice(0, i + 1).join('/'));
  }),
);

/** File / folder có thật; đường không đuôi thử thêm đuôi như bundler (`@/x/y` → `y.ts`, `y/index.ts`). */
function exists(path: string): boolean {
  const clean = normalize(path);
  if (clean === '' || REPO_PATHS.has(clean) || REPO_DIRS.has(clean)) return true;
  const extensions = ['.ts', '.tsx', '.css', '.json', '/index.ts', '/index.tsx'];
  return [...extensions, '.test.ts', '.test.tsx', '.e2e.ts'].some((ext) =>
    REPO_PATHS.has(`${clean}${ext}`),
  );
}

interface Hit {
  doc: string;
  line: number;
  text: string;
}

type Pick = (line: string, context: { doc: string; lines: string[]; index: number }) => string[];

const hitsOf = (pick: Pick, { fenced = false } = {}): Hit[] =>
  DOCS.flatMap(([doc, raw]) => {
    const lines = (fenced ? raw : withoutFences(raw)).split('\n');
    return lines.flatMap((line, index) =>
      pick(line, { doc, lines, index }).map((text) => ({ doc, line: index + 1, text })),
    );
  });

const fmt = (hits: Hit[]) => hits.map((h) => `${h.doc}:${h.line} — ${h.text}`);

/** Có ⛔ ở dòng này hoặc dòng kề (câu cảnh báo xuống dòng giữa chừng). */
const warned = (lines: string[], index: number) =>
  lines.slice(Math.max(index - 1, 0), index + 2).some((line) => line.includes('⛔'));

const excerpt = (line: string) => [line.trim().slice(0, 100)];

describe('tài liệu trỏ đúng chỗ', () => {
  it('có tài liệu để kiểm', () => {
    expect(DOCS.length).toBeGreaterThan(50);
    expect(REPO_PATHS.size).toBeGreaterThan(500);
  });

  it('link markdown tương đối trỏ tới file có thật', () => {
    const broken = hitsOf((line, { doc }) =>
      [...line.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)]
        .map((m) => m[1])
        .filter((target) => !/^(?:[a-z]+:|#)/i.test(target) && !/[{<*]/.test(target))
        .filter((target) => {
          const path = target.replace(/[#?].*$/, '');
          return !exists(path.startsWith('/') ? path : `${dirOf(doc)}/${path}`);
        }),
    );
    expect(fmt(broken), 'Link hỏng — sửa đường dẫn hoặc bỏ link').toEqual([]);
  });

  it('đường `@/…` · `src/…` · `tests/…` · `e2e/…` trong backtick có thật', () => {
    const missing = hitsOf((line, { doc }) =>
      [...line.matchAll(/`([^`]+)`/g)].flatMap((code) =>
        [...code[1].matchAll(/(?:@\/|(?<![\w./@-])(?:src|tests|e2e)\/)[\w./-]*/g)]
          .map((m) => {
            const path = m[0].replace(/^@\//, 'src/');
            // Ký tự mẫu (`src/app/_*`, `tests/x/{a,b}`, `<nhóm>`, `…`) ngay sau đường: phần dở dang trước nó không phải tên thật.
            const next = code[1][(m.index ?? 0) + m[0].length];
            const cut =
              next && /[*{<…[]/.test(next) ? path.slice(0, path.lastIndexOf('/') + 1) : path;
            return cut.replace(/[./]+$/, '');
          })
          .filter((path) => !exists(path) && !(path in (INTENTIONAL_PATHS[doc] ?? {}))),
      ),
    );
    expect(
      fmt(missing),
      'Đường dẫn không còn — sửa docs theo cây src/ · tests/ · e2e/ hiện tại',
    ).toEqual([]);
  });

  it('danh sách INTENTIONAL_PATHS không có dòng thừa', () => {
    const stale = Object.entries(INTENTIONAL_PATHS).flatMap(([doc, paths]) =>
      Object.keys(paths)
        .filter((path) => exists(path) || !(DOC_FILES[doc] ?? '').includes(path))
        .map((path) => `${doc} — ${path}`),
    );
    expect(stale, 'Xoá khỏi INTENTIONAL_PATHS').toEqual([]);
  });

  it('không `tsc … --noEmit` đơn lẻ (thiếu `next typegen`)', () => {
    const bad = hitsOf(
      (line, { lines, index }) =>
        /\btsc\b[^\n]*--noEmit/.test(line) &&
        !/\bnext typegen\b/.test(line) &&
        !warned(lines, index)
          ? excerpt(line)
          : [],
      { fenced: true },
    );
    expect(
      fmt(bad),
      'Dùng `npm run typecheck` (`next typegen && tsc --noEmit`) — quality-gates.md §2',
    ).toEqual([]);
  });

  it('không còn chữ "kit2"', () => {
    const bad = hitsOf((line) => (/kit2/i.test(line) ? excerpt(line) : []), { fenced: true });
    expect(fmt(bad), 'Bộ UI duy nhất tên là "UI kit" (`src/shared/ui`)').toEqual([]);
  });

  it('code / CSS / test trỏ tới tài liệu có thật', () => {
    const files = Object.entries({ ...SOURCE_CODE, ...SOURCE_CSS, ...TEST_FILES });
    const broken = files.flatMap(([file, text]) =>
      text.split('\n').flatMap((line, index) =>
        [...line.matchAll(/(?<![\w/.-])(?:docs\/[\w/.-]+|(?:rules|notes|guides)\/[\w/.-]+)\.md/g)]
          .map((m) => (m[0].startsWith('docs/') ? m[0] : `docs/${m[0]}`))
          .filter((path) => !REPO_PATHS.has(path))
          .map((path) => `${file}:${index + 1} — ${path}`),
      ),
    );
    expect(broken, 'Tài liệu không còn — sửa đường trong comment theo cây docs/').toEqual([]);
  });
});
