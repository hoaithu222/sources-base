/**
 * Store zustand có `persist` — `docs/rules/data/state-management.md` §"persist middleware",
 * `docs/rules/structure/widget-composition.md §10`, `docs/rules/data/async-safety.md §6`.
 *
 * Dữ liệu trong localStorage là đầu vào KHÔNG tin cậy và sống lâu hơn mọi bản phát hành:
 *   1. `name` / `version` lấy từ MỘT hằng `XXX_STORAGE = { key, version }` — đổi khoá đã phát hành là
 *      mất dữ liệu của mọi người dùng, nên khoá không được viết tay rải rác; khoá không trùng nhau.
 *   2. `storage: createSafeJSONStorage()` — localStorage hỏng (hết quota, bị chặn) không làm `set()` ném.
 *   3. `migrate` VÀ `merge` gọi cùng một hàm thuần `sanitizeXxx` — `migrate` chỉ chạy khi lệch
 *      version; dữ liệu CÙNG version mà sai giá trị đi thẳng vào store nếu `merge` không kiểm lại.
 *   4. `partialize` — chỉ lưu field cần lưu, không cả object state (gồm cả action).
 */

import { describe, expect, it } from 'vitest';

import { HANDWRITTEN_CODE, stripComments } from '@tests/helpers/source-files';

const CODE = Object.fromEntries(
  Object.entries(HANDWRITTEN_CODE).map(([path, text]) => [path, stripComments(text)]),
);

/** File gọi `persist(` của zustand. */
const STORES = Object.keys(CODE).filter(
  (path) => /from 'zustand\/middleware'/.test(CODE[path]) && /\bpersist\s*\(/.test(CODE[path]),
);

/** Mọi hằng `XXX_STORAGE = { key: '…', version: N }` trong src → khoá lưu trữ. */
const STORAGE_CONSTANTS = new Map(
  Object.values(CODE).flatMap((text) =>
    [
      ...text.matchAll(
        /\bconst ([A-Z][A-Z0-9_]*_STORAGE) = \{\s*key: '([^']+)',\s*version: \d+\s*\} as const/g,
      ),
    ].map((m) => [m[1], m[2]] as const),
  ),
);

/** Phần tuỳ chọn của `persist(…)` — từ chỗ gọi tới hết file (mỗi file một store). */
const optionsOf = (path: string) => CODE[path].slice(CODE[path].search(/\bpersist\s*\(/));

function problemsOf(path: string): string[] {
  const options = optionsOf(path);
  const out: string[] = [];
  const name = options.match(/\bname:\s*([A-Z][A-Z0-9_]*_STORAGE)\.key\b/)?.[1];
  if (!name) out.push('`name` phải là `XXX_STORAGE.key`');
  else if (!STORAGE_CONSTANTS.has(name)) {
    out.push(`\`${name}\` phải khai \`const ${name} = { key: '…', version: N } as const\``);
  }
  if (!name || !new RegExp(String.raw`\bversion:\s*${name}\.version\b`).test(options)) {
    out.push('`version` phải là `XXX_STORAGE.version` (cùng hằng với `name`)');
  }
  if (!/\bstorage:\s*createSafeJSONStorage\(/.test(options)) {
    out.push('`storage: createSafeJSONStorage()`');
  }
  const sanitize = options.match(/\bmigrate:\s*(sanitize\w+)\b/)?.[1];
  if (!sanitize) out.push('`migrate: sanitizeXxx` (nắn dữ liệu bản cũ bằng hàm thuần)');
  const merge = options.match(/\bmerge:[^\n]*/)?.[0];
  if (!merge) out.push('thiếu `merge` (kiểm dữ liệu cùng version)');
  else if (sanitize && !merge.includes(`${sanitize}(`)) {
    out.push(`\`merge\` phải gọi cùng \`${sanitize}\` với \`migrate\``);
  }
  if (!/\bpartialize\s*[:(]/.test(options)) out.push('thiếu `partialize` (chỉ lưu field cần lưu)');
  return out;
}

describe('store persist', () => {
  it('có store để kiểm', () => {
    expect(STORES.length).toBeGreaterThanOrEqual(5);
  });

  it('mọi `persist(` khai đủ name/version từ XXX_STORAGE, storage an toàn, migrate + merge, partialize', () => {
    const bad = STORES.flatMap((path) => problemsOf(path).map((problem) => `${path} — ${problem}`));
    expect(bad, `Store persist chưa đạt (state-management.md):\n  ${bad.join('\n  ')}`).toEqual([]);
  });

  it('khoá localStorage không trùng giữa các store', () => {
    const keys = [...STORAGE_CONSTANTS.values()];
    const duplicated = keys.filter((key, i) => keys.indexOf(key) !== i);
    expect(duplicated, 'Hai store cùng khoá sẽ ghi đè dữ liệu của nhau').toEqual([]);
  });
});
