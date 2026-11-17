/**
 * API công khai của UI kit — đọc từ CHUỖI BARREL bắt đầu ở `src/shared/ui/index.ts`.
 *
 * Nguồn duy nhất cho mọi bài kiểm cần "danh sách component UI kit" (render, props-types, khối tài
 * liệu, trang demo): thêm component vào barrel là nó tự vào phạm vi, không phải nhớ sửa danh sách nào.
 * Chỉ đọc GIÁ TRỊ (`export { … } from`); `export type { … }` tra riêng bằng `barrelTypes()`.
 * `barrelExports(<index.ts>)` đọc được barrel bất kỳ (widget, charts) theo cùng cách.
 */

import { SOURCE_CODE, dirOf } from './source-files';

export interface BarrelExport {
  name: string;
  /** `component` = tên PascalCase · `hook` = `useXxx` · `value` = hàm / hằng còn lại. */
  kind: 'component' | 'hook' | 'value';
  /** Folder cấp 1 tính từ barrel gốc — với UI kit là nhóm chức năng (`actions`, `form`…). */
  group: string;
  /** Barrel khai báo export, vd `src/shared/ui/actions/index.ts`. */
  barrel: string;
  /** File nguồn barrel trỏ tới, vd `src/shared/ui/actions/Button.tsx`. */
  file: string;
  /** `export { default as X }` — X là component chính (default export) của `file`. */
  isDefault: boolean;
}

const UI_ROOT = 'src/shared/ui';

/** Giải `./x` từ một thư mục thành khoá của `SOURCE_CODE` — cùng thứ tự với bundler. */
function resolveSpec(fromDir: string, spec: string): string | undefined {
  const parts = fromDir.split('/');
  for (const segment of spec.split('/')) {
    if (segment === '..') parts.pop();
    else if (segment !== '.') parts.push(segment);
  }
  const base = parts.join('/');
  return ['.tsx', '.ts', '/index.ts', '/index.tsx']
    .map((ext) => `${base}${ext}`)
    .find((candidate) => candidate in SOURCE_CODE);
}

const kindOf = (name: string): BarrelExport['kind'] => {
  if (/^use[A-Z]/.test(name)) return 'hook';
  if (/^[A-Z]/.test(name) && /[a-z]/.test(name)) return 'component';
  return 'value';
};

/** Folder cấp 1 của barrel tính từ thư mục gốc; barrel gốc → `''`. */
const groupOf = (root: string, barrel: string) => {
  const rel = barrel.slice(root.length + 1);
  return rel.includes('/') ? rel.split('/')[0] : '';
};

/** `export { a, default as B } from './x'` của một file → `[tên gốc, tên xuất, file nguồn]`. */
function namedReExports(barrel: string): [original: string, alias: string, file: string][] {
  const dir = dirOf(barrel);
  const out: [string, string, string][] = [];
  for (const m of (SOURCE_CODE[barrel] ?? '').matchAll(
    /export\s+(?!type\b)\{([^}]+)\}\s*from\s*'(\.[^']+)'/g,
  )) {
    const file = resolveSpec(dir, m[2]) ?? `${dir}/${m[2]}`;
    for (const raw of m[1].split(',')) {
      const item = raw.trim();
      if (!item || item.startsWith('type ')) continue;
      const [original, alias] = item.includes(' as ') ? item.split(/\s+as\s+/) : [item, item];
      out.push([original, alias, file]);
    }
  }
  return out;
}

/** Lần qua barrel trung gian (`export { X } from './sub'` mà `sub` là `index.ts`) tới file khai báo. */
function origin(file: string, name: string, depth = 0): { file: string; isDefault: boolean } {
  if (depth > 5 || !/\/index\.tsx?$/.test(file)) return { file, isDefault: false };
  const hop = namedReExports(file).find(([, alias]) => alias === name);
  if (!hop) return { file, isDefault: false };
  return hop[0] === 'default'
    ? { file: hop[2], isDefault: true }
    : origin(hop[2], hop[0], depth + 1);
}

function collect(root: string, barrel: string, seen: Set<string>, out: BarrelExport[]): void {
  if (seen.has(barrel)) return;
  seen.add(barrel);
  const text = SOURCE_CODE[barrel];
  if (text === undefined) return;

  for (const m of text.matchAll(/export \* from '(\.[^']+)'/g)) {
    const target = resolveSpec(dirOf(barrel), m[1]);
    if (target) collect(root, target, seen, out);
  }

  for (const [original, alias, file] of namedReExports(barrel)) {
    const source = original === 'default' ? { file, isDefault: true } : origin(file, original);
    out.push({
      name: alias,
      kind: kindOf(alias),
      group: groupOf(root, barrel),
      barrel,
      ...source,
    });
  }
}

/** Mọi giá trị với tới được từ một barrel (đi theo `export * from`), theo thứ tự khai. */
export function barrelExports(rootBarrel: string): BarrelExport[] {
  const out: BarrelExport[] = [];
  collect(dirOf(rootBarrel), rootBarrel, new Set(), out);
  return out;
}

/** Mọi giá trị đi qua `@/shared/ui`. */
export const UI_KIT_EXPORTS: readonly BarrelExport[] = barrelExports(`${UI_ROOT}/index.ts`);

/** Component công khai (PascalCase) của UI kit. */
export const UI_KIT_COMPONENTS: readonly BarrelExport[] = UI_KIT_EXPORTS.filter(
  (entry) => entry.kind === 'component',
);

/** Nhóm chức năng có component công khai (`actions`, `data-display`…). */
export const UI_KIT_GROUPS: readonly string[] = [
  ...new Set(UI_KIT_COMPONENTS.map((entry) => entry.group)),
];

/** Tên kiểu mà một barrel xuất (`export type { A, B } from …`). */
export function barrelTypes(barrel: string): Set<string> {
  const out = new Set<string>();
  for (const m of (SOURCE_CODE[barrel] ?? '').matchAll(/export type \{([^}]+)\} from '[^']+';/g)) {
    for (const raw of m[1].split(',')) {
      const name = raw.trim();
      if (name) out.add(name);
    }
  }
  return out;
}
