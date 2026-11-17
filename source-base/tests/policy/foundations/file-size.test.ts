/**
 * Giới hạn độ dài file — `docs/rules/foundations/clean-code-standards.md §3`,
 * bảng §1 của `docs/rules/foundations/folder-structure.md`.
 *
 * Vùng chặt (tsx ≤ 200, ts ≤ 250): `app/ core/ domains/ features/` và phần `shared/` ngoài UI kit
 * (`hooks/ utils/ widgets/ charts/ constants/`). Một rule chỉ nằm trong tài liệu là một rule sẽ bị quên.
 *
 * `src/shared/ui/**` (primitive của design system) có trần riêng 300 dòng CODE: một primitive như
 * `Table` gói trọn đổi bề rộng cột, đóng băng cột, kéo-thả và phân trang trong MỘT hợp đồng API — xé
 * ra chỉ bắt người đọc nhảy file.
 */

import { describe, expect, it } from 'vitest';

import { HANDWRITTEN_CODE, lineCount } from '@tests/helpers/source-files';

/** Vùng áp giới hạn cứng. `shared/ui` cố ý KHÔNG có trong danh sách (trần riêng bên dưới). */
const STRICT_DIRS = [
  'src/app/',
  'src/core/',
  'src/domains/',
  'src/features/',
  'src/shared/hooks/',
  'src/shared/utils/',
  'src/shared/widgets/',
  'src/shared/charts/',
  'src/shared/constants/',
];

const LIMITS: Record<string, number> = { tsx: 200, ts: 250 };

/** Dòng CODE: bỏ mọi khối JSDoc — chú thích props đầy đủ không được ép xé file. */
const codeLineCount = (text: string) => lineCount(text.replace(/\/\*\*[\s\S]*?\*\/\n?/g, ''));
const extOf = (path: string) => (path.endsWith('.tsx') ? 'tsx' : 'ts');

describe('giới hạn độ dài file', () => {
  it('app/ · core/ · domains/ · features/ · shared/{hooks,utils,widgets,charts,constants} không file nào vượt giới hạn', () => {
    const offenders = Object.entries(HANDWRITTEN_CODE)
      .filter(([path]) => STRICT_DIRS.some((dir) => path.startsWith(dir)))
      .map(([path, text]) => [path, lineCount(text), LIMITS[extOf(path)]] as const)
      .filter(([, lines, limit]) => lines > limit)
      .map(([path, lines, limit]) => `${path} — ${lines}/${limit}`);

    expect(offenders, `Vượt giới hạn:\n  ${offenders.join('\n  ')}`).toEqual([]);
  });

  it('UI kit: mỗi file ≤ 300 dòng code (không tính khối JSDoc) — vượt thì tách types / theme / hook / utils / phần con', () => {
    // component-structure.md §6: mục tiêu ≤ 250, > 300 phải tách.
    const CEILING = 300;
    const over = Object.entries(HANDWRITTEN_CODE)
      .filter(([path]) => path.startsWith('src/shared/ui/'))
      .map(([path, text]) => [path, codeLineCount(text)] as const)
      .filter(([, lines]) => lines > CEILING)
      .map(([path, lines]) => `${path} — ${lines}`);

    expect(
      over,
      `Vượt trần ${CEILING} dòng code (component-structure.md §6):\n  ${over.join('\n  ')}`,
    ).toEqual([]);
  });
});
