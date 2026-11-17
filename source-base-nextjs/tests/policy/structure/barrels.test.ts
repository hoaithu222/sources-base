/**
 * Barrel (`index.ts`) — `docs/rules/foundations/folder-structure.md §5`.
 *
 * Barrel là cửa công khai của một vùng; để nó đúng chỗ và sạch thì mọi nơi ngoài vùng import ngắn (`@/shared/ui`, `@/domains/session`,
 * `@/app/_providers`) mà vẫn không với được ruột. Năm điều đo được bằng máy:
 *   1. Barrel CHỈ `export … from` — không logic, không `import`, không khai báo (file ghép thông điệp `messages/<locale>/index.ts` không
 *      phải barrel). Barrel không mang `'use client'`: từng file nó re-export tự có hoặc không (`server-client-boundary.md`).
 *   2. Chỗ BẮT BUỘC có barrel: gốc mỗi domain · mỗi module của `core/` · mỗi họ của `shared/hooks` · mỗi widget · gốc `shared/charts` ·
 *      các folder lắp ráp của `app/` mà nơi khác dùng.
 *   3. Chỗ CẤM barrel: `shared/utils` (import THEO FILE) · folder vai trò (`hooks/ parts/ utils/ types/ shared/`) trong một component /
 *      widget · folder mối quan tâm trong feature · `app/_views` và `app/_seo` (`page.tsx` import thẳng file).
 *   4. File BÊN TRONG một vùng không import lại barrel của chính vùng đó — vòng import (`npm run check:cycles`).
 *   5. Barrel phân biệt hai họ export: `export *` chỉ ở barrel nhóm / folder con; component phẳng dùng `export { default as X }`.
 */

import { describe, expect, it } from 'vitest';

import { HANDWRITTEN_CODE, baseName, dirOf, stripComments } from '@tests/helpers/source-files';

const FILES = Object.keys(HANDWRITTEN_CODE);
const BARRELS = FILES.filter(
  (path) => baseName(path) === 'index.ts' && !path.startsWith('src/messages/'),
);
const DIRS = new Set(FILES.map(dirOf));
const hasBarrel = (dir: string) => BARRELS.includes(`${dir}/index.ts`);
const childDirs = (dir: string) => [...DIRS].filter((d) => dirOf(d) === dir).sort();

const ROLE_DIRS = new Set(['hooks', 'parts', 'utils', 'types', 'shared']);
const depthIn = (path: string) => path.split('/').length - 1; // số cấp dưới `src/`

/** Folder vai trò: tên thuộc `ROLE_DIRS`, nằm sâu hơn tầng / vùng (`shared/hooks` là VÙNG, `shared/ui/form/hooks` là vai trò). */
const isRoleDir = (dir: string) => depthIn(dir) >= 3 && ROLE_DIRS.has(baseName(dir));

/** Ngoại lệ có lý do (đường tính từ gốc repo) — `form/hooks/` là folder NHÓM (hook công khai của nhóm `form`). */
const ROLE_BARREL_ALLOWED: Record<string, string> = {
  'src/shared/ui/form/hooks/index.ts':
    'folder-structure.md §5: hook công khai của nhóm `form`, không phải ruột của một component.',
};

/** Ngoại lệ của luật "`app/_views` không barrel" (đường tính từ gốc repo). */
const VIEWS_BARREL_ALLOWED: Record<string, string> = {
  'src/app/_views/status/index.ts':
    'Nhóm màn TRẠNG THÁI (403, 404, phiên không khả dụng) dùng chung bởi nhiều route ngoài một `page.tsx` — import `@/app/_views/status`.',
};

describe('barrel chỉ re-export', () => {
  const PURE = /^\s*export\s+(?:type\s+)?(?:\*(?:\s+as\s+\w+)?|\{[^}]*\})\s+from\s+'[^']+';?\s*$/gm;

  it('có barrel để kiểm', () => {
    expect(BARRELS.length).toBeGreaterThan(40);
  });

  it('chỉ gồm câu `export … from` — không import, không logic, không khai báo', () => {
    const impure = BARRELS.flatMap((path) => {
      const rest = stripComments(HANDWRITTEN_CODE[path]).replace(PURE, '').trim();
      return rest === '' ? [] : [`${path} — còn: ${rest.split('\n')[0].slice(0, 80)}`];
    });
    expect(
      impure,
      `Barrel chỉ \`export … from\` (folder-structure.md §5):\n  ${impure.join('\n  ')}`,
    ).toEqual([]);
  });

  it("không mang 'use client' — directive thuộc từng file được re-export", () => {
    const marked = BARRELS.filter((path) =>
      /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*(['"])use client\1/.test(HANDWRITTEN_CODE[path]),
    );
    expect(marked, `Bỏ 'use client' khỏi barrel:\n  ${marked.join('\n  ')}`).toEqual([]);
  });

  it('bộ nhận diện không mù: nhận ra logic lẫn trong barrel', () => {
    const rest = (text: string) => stripComments(text).replace(PURE, '').trim();
    expect(rest("export { default as A } from './A';\nexport * from './b';\n")).toBe('');
    expect(rest("export type { X } from './x';\nexport {\n  a,\n  b,\n} from './y';\n")).toBe('');
    expect(rest("import a from './a';\nexport { a };\n")).not.toBe('');
    expect(rest('export const X = 1;\n')).not.toBe('');
    expect(rest("export { default } from './A';\nfunction f() {}\n")).not.toBe('');
  });
});

describe('chỗ BẮT BUỘC có barrel', () => {
  const required = (label: string, dirs: string[]) =>
    it(label, () => {
      expect(dirs.length, 'không tìm thấy folder nào để kiểm').toBeGreaterThan(0);
      const missing = dirs.filter((dir) => !hasBarrel(dir)).map((dir) => `${dir}/index.ts`);
      expect(missing, `Thiếu barrel (folder-structure.md §5):\n  ${missing.join('\n  ')}`).toEqual(
        [],
      );
    });

  required('gốc mỗi domain', childDirs('src/domains'));
  required('gốc mỗi module của core/', childDirs('src/core'));
  required('shared/hooks và mỗi họ hook', ['src/shared/hooks', ...childDirs('src/shared/hooks')]);
  required('mỗi widget và gốc shared/charts', [
    ...childDirs('src/shared/widgets'),
    'src/shared/charts',
  ]);
  required(
    'folder lắp ráp của app/ mà nơi khác dùng',
    ['_providers', '_guards', '_layouts', '_shell', '_navigation', '_components'].map(
      (name) => `src/app/${name}`,
    ),
  );
});

describe('chỗ CẤM barrel', () => {
  it('shared/utils — import THEO FILE, không barrel ở bất kỳ cấp nào', () => {
    const found = BARRELS.filter((path) => path.startsWith('src/shared/utils/'));
    expect(found, `Bỏ barrel, import thẳng file:\n  ${found.join('\n  ')}`).toEqual([]);
  });

  it('folder vai trò (hooks/ parts/ utils/ types/ shared/) bên trong component / widget không có barrel', () => {
    const found = BARRELS.filter(
      (path) => isRoleDir(dirOf(path)) && !(path in ROLE_BARREL_ALLOWED),
    );
    expect(found, `Import thẳng file bằng đường tương đối:\n  ${found.join('\n  ')}`).toEqual([]);
  });

  it('danh sách ngoại lệ vai trò không chứa barrel đã biến mất', () => {
    const stale = Object.keys(ROLE_BARREL_ALLOWED).filter((path) => !BARRELS.includes(path));
    expect(stale, `Xoá khỏi ROLE_BARREL_ALLOWED:\n  ${stale.join('\n  ')}`).toEqual([]);
  });

  it('app/_views và app/_seo — `page.tsx` import thẳng file view / hàm', () => {
    const found = BARRELS.filter(
      (path) => /^src\/app\/_(?:views|seo)(?:\/|$)/.test(path) && !(path in VIEWS_BARREL_ALLOWED),
    );
    expect(found, `Bỏ barrel:\n  ${found.join('\n  ')}`).toEqual([]);
  });

  it('danh sách ngoại lệ của app/_views không chứa barrel đã biến mất', () => {
    const stale = Object.keys(VIEWS_BARREL_ALLOWED).filter((path) => !BARRELS.includes(path));
    expect(stale, `Xoá khỏi VIEWS_BARREL_ALLOWED:\n  ${stale.join('\n  ')}`).toEqual([]);
  });

  it('feature chỉ có barrel ở GỐC (`features/<f>/index.ts`), folder mối quan tâm thì không', () => {
    const found = BARRELS.filter((path) => /^src\/features\/[^/]+\/.+\/index\.ts$/.test(path));
    expect(found, `Bỏ barrel, import thẳng file:\n  ${found.join('\n  ')}`).toEqual([]);
  });
});

describe('vòng import: file trong vùng không nạp lại barrel của chính vùng', () => {
  /** Alias public → folder nó đại diện. */
  const ZONES = BARRELS.map((path) => ({
    dir: dirOf(path),
    alias: dirOf(path).replace(/^src\//, '@/'),
  })).filter(({ dir }) => dir !== 'src');

  it('có vùng để kiểm', () => {
    expect(ZONES.length).toBeGreaterThan(40);
  });

  it('không file nào import `from "<alias của barrel chứa nó>"`', () => {
    const loops = FILES.flatMap((path) => {
      const code = stripComments(HANDWRITTEN_CODE[path]);
      return ZONES.filter(({ dir }) => path.startsWith(`${dir}/`))
        .filter(({ alias }) =>
          new RegExp(`from\\s+'${alias.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&')}'`).test(code),
        )
        .map(({ alias }) => `${path} — import '${alias}' (barrel của chính vùng chứa nó)`);
    });
    expect(
      loops,
      `Import theo đường file / tương đối trong cùng vùng:\n  ${loops.join('\n  ')}`,
    ).toEqual([]);
  });
});

describe('họ export của barrel nhóm UI kit', () => {
  it('barrel của folder con dùng `export *`; barrel phẳng chỉ liệt kê `export { default as X }`', () => {
    const uiGroups = BARRELS.filter((path) => /^src\/shared\/ui\/[^/]+\/index\.ts$/.test(path));
    expect(uiGroups.length).toBeGreaterThanOrEqual(10);

    const mixed = uiGroups.flatMap((path) => {
      const code = stripComments(HANDWRITTEN_CODE[path]);
      const star = /^export\s+\*\s+from\s+'\.\/[^']+';/m.test(code);
      const defaults = /^export\s+\{\s*default as \w+/m.test(code);
      // `export *` cho folder con có barrel, `export { default as X }` cho file component phẳng — dòng nào trỏ nhầm họ là lỗi.
      const bad = [...code.matchAll(/^export\s+\*\s+from\s+'\.\/([^'/]+)';/gm)]
        .filter((m) => !hasBarrel(`${dirOf(path)}/${m[1]}`))
        .map((m) => `${path} — \`export * from './${m[1]}'\` nhưng ${m[1]} không có index.ts`);
      return star || defaults ? bad : [`${path} — không có dòng export nào`];
    });
    expect(mixed).toEqual([]);
  });
});
