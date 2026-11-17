/**
 * Trang `/demo` được nối ĐÚNG và cấu trúc demo giữ được MỘT trục phân loại.
 *
 * ── Vì sao ────────────────────────────────────────────────────────────────────
 * Viết xong một section rồi quên nối là lỗi IM LẶNG hoàn hảo: file biên dịch sạch, lint sạch, `tsc`
 * không thấy gì — nhưng không có gì hiện lên màn hình. Mục lục `DEMO_SECTIONS`
 * (`library/sections.constants.ts`) là nơi DUY NHẤT nối section vào trang, nên bài kiểm khép:
 *   sections/<nhóm>/<Tên>Section.tsx  ⟷  DEMO_SECTIONS { id = kebab(Tên), group = <nhóm> }
 *   nhóm trong DEMO_SECTIONS          ⟷  DEMO_GROUP_LABELS (thứ tự trang = thứ tự mục lục)
 *   constants/<nhóm>/*                ⟶  chỉ section cùng nhóm được import
 *   library / composed / dashboard   ⟶  không import lẫn nhau (dùng chung thì đặt ở `demo/shared/`)
 * Lệch bất kỳ chiều nào cũng đỏ.
 */

import { describe, expect, it } from 'vitest';

import { getRoutePath } from '@/app/router/modules';
import { DEMO_SCREEN_PATHS } from '@/features/demo/shared/constants/screens.constants';
import {
  DEMO_GROUP_LABELS,
  DEMO_SECTIONS,
  type DemoSectionGroup,
} from '@/features/demo/library/sections.constants';
import { SOURCE_CODE } from '@tests/helpers/source-files';

const ROOT = 'src/features/demo/';

/** Đường dẫn tính từ `src/features/demo/` → nội dung. */
const FILES = new Map(
  Object.entries(SOURCE_CODE)
    .filter(([p]) => p.startsWith(ROOT))
    .map(([p, src]) => [p.slice(ROOT.length), src]),
);

const SECTION_FILES = [...FILES.keys()].filter((p) => /^library\/sections\/.+\.tsx$/.test(p));
const GROUPS = Object.keys(DEMO_GROUP_LABELS) as DemoSectionGroup[];

const baseName = (p: string) => p.slice(p.lastIndexOf('/') + 1).replace(/\.tsx?$/, '');
const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** Giải `../x/y` tính từ file `from` (cùng gốc `src/features/demo/`), bỏ đuôi. */
function resolveSpec(from: string, spec: string): string {
  const parts = from.split('/').slice(0, -1);
  for (const seg of spec.split('/')) {
    if (seg === '..') parts.pop();
    else if (seg !== '.') parts.push(seg);
  }
  return parts.join('/');
}

/** Mọi đường import tương đối của một file, đã giải về gốc demo (không đuôi). */
function relativeImports(file: string): string[] {
  const src = FILES.get(file) ?? '';
  return [...src.matchAll(/from\s+'(\.{1,2}\/[^']+)'/g)].map((m) => resolveSpec(file, m[1]));
}

/** `memo(function TênSection …)` → `TênSection` (test không minify nên tên hàm còn nguyên). */
function componentName(section: unknown): string | undefined {
  const c = section as { type?: { name?: string }; name?: string };
  return c.type?.name ?? c.name;
}

describe('section của trang demo được nối đầy đủ', () => {
  it('có đủ section để kiểm', () => {
    expect(SECTION_FILES.length).toBeGreaterThan(30);
    expect(DEMO_SECTIONS.length).toBe(SECTION_FILES.length);
  });

  it('mọi file trong sections/ đều có mặt trong DEMO_SECTIONS', () => {
    const registered = new Set(DEMO_SECTIONS.map((s) => componentName(s.Section)));
    const missing = SECTION_FILES.filter((p) => !registered.has(baseName(p)));

    expect(
      missing,
      `Có file nhưng KHÔNG có trong DEMO_SECTIONS (library/sections.constants.ts):\n  ${missing.join('\n  ')}`,
    ).toEqual([]);
  });

  it('id = kebab(tên file bỏ "Section"), group = folder chứa file', () => {
    const fileByName = new Map(SECTION_FILES.map((p) => [baseName(p), p]));
    const wrong = DEMO_SECTIONS.flatMap((s) => {
      const name = componentName(s.Section) ?? '?';
      const file = fileByName.get(name);
      if (!file) return [`${s.id}: không tìm thấy file của ${name}`];
      const expectedId = kebab(name.replace(/Section$/, ''));
      const folder = file.split('/')[2];
      const out: string[] = [];
      if (s.id !== expectedId) out.push(`${name}: id "${s.id}" → phải là "${expectedId}"`);
      if (s.group !== folder) out.push(`${name}: group "${s.group}" → phải là "${folder}"`);
      return out;
    });

    expect(wrong, wrong.join('\n')).toEqual([]);
  });

  it('id không trùng nhau', () => {
    const ids = DEMO_SECTIONS.map((s) => s.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it('section xếp liền theo nhóm, đúng thứ tự DEMO_GROUP_LABELS (thứ tự trang = thứ tự mục lục)', () => {
    const order = DEMO_SECTIONS.map((s) => s.group).filter((g, i, all) => all[i - 1] !== g);
    expect(order).toEqual(GROUPS);
  });

  it('folder trong sections/ và constants/ là đúng tên nhóm của mục lục', () => {
    const folders = (root: string) =>
      new Set(
        [...FILES.keys()]
          .filter((p) => p.startsWith(root) && p.slice(root.length).includes('/'))
          .map((p) => p.slice(root.length).split('/')[0]),
      );

    expect([...folders('library/sections/')].sort()).toEqual([...GROUPS].sort());
    const strayConstants = [...folders('library/constants/')].filter(
      (g) => !GROUPS.includes(g as DemoSectionGroup),
    );
    expect(strayConstants, 'constants/<nhóm>/ phải trùng tên một nhóm').toEqual([]);
  });
});

describe('cấu trúc demo giữ một trục', () => {
  it('constants/<nhóm>/* chỉ được import từ sections/<nhóm>/', () => {
    const leaks: string[] = [];
    for (const file of FILES.keys()) {
      for (const target of relativeImports(file)) {
        const hit = target.match(/^library\/constants\/([a-z-]+)\//);
        if (!hit) continue;
        if (!file.startsWith(`library/sections/${hit[1]}/`)) leaks.push(`${file} → ${target}`);
      }
    }

    expect(
      leaks,
      `Dữ liệu của một nhóm bị nhóm khác dùng — dời lên constants/samples.constants.ts:\n  ${leaks.join('\n  ')}`,
    ).toEqual([]);
  });

  it('library / composed / dashboard không import lẫn nhau', () => {
    const leaks: string[] = [];
    for (const file of FILES.keys()) {
      const own = file.split('/')[0];
      for (const target of relativeImports(file)) {
        const other = target.split('/')[0];
        if (other !== own && other !== 'shared') leaks.push(`${file} → ${target}`);
      }
    }

    expect(
      leaks,
      `Tính năng con import lẫn nhau — thứ dùng chung đặt ở demo/shared/:\n  ${leaks.join('\n  ')}`,
    ).toEqual([]);
  });

  it('đường dẫn giữa các màn khớp route đã đăng ký', () => {
    expect(DEMO_SCREEN_PATHS.library).toBe(getRoutePath('demo'));
    expect(DEMO_SCREEN_PATHS.composed).toBe(getRoutePath('demo.composed'));
    expect(DEMO_SCREEN_PATHS.dashboard).toBe(getRoutePath('demo.dashboard'));
  });
});
