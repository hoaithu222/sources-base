/**
 * Mọi component UI kit đi qua barrel phải có KHỐI TÀI LIỆU ngay trên khai báo của nó —
 * `docs/rules/foundations/comment-policy.md §1` và `docs/rules/structure/component-structure.md §4`.
 *
 *   1. Khối JSDoc sát dòng khai báo tên mà file `export default` (không dòng trống ở giữa).
 *   2. Dòng đầu là `Tên — mô tả`; có `@example`.
 *   3. Mỗi prop do UI kit tự khai (không tính prop kế thừa từ React / Radix) có một dòng
 *      `@param props.<tên>`; và mỗi `@param props.<tên>` phải là prop có thật — đổi tên,
 *      bỏ prop mà quên sửa chú thích là đỏ.
 *   4. File component không còn khối hướng dẫn đứng riêng ở đầu file (kiểu cũ).
 *
 * Cùng lõi TypeScript compiler API với `docs-blocks.test.ts` (widgets, charts, app, features).
 */

import { describe, expect, it } from 'vitest';

import { createDocProgram } from '@tests/helpers/doc-blocks';
import { UI_KIT_COMPONENTS } from '@tests/helpers/ui-kit-exports';

describe('UI kit — khối tài liệu ngay trên component', () => {
  it('mọi component đi qua barrel có mô tả, @param cho từng prop và @example', () => {
    const entries = UI_KIT_COMPONENTS.filter((c) => c.isDefault).map((c) => ({
      name: c.name,
      file: c.file,
    }));
    expect(entries.length).toBeGreaterThan(100);

    const docs = createDocProgram(entries.map((e) => e.file));
    const problems = entries.flatMap((entry) =>
      docs.problemsOf(entry, { summaryAndExample: true }),
    );

    expect(problems, `Khối tài liệu chưa đạt:\n  ${problems.join('\n  ')}`).toEqual([]);
  }, 120_000);
});
