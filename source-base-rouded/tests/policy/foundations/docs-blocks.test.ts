/**
 * Khối tài liệu component NGOÀI UI kit — `docs/rules/foundations/comment-policy.md §1`,
 * `docs/rules/structure/component-structure.md §4`, `docs/rules/structure/widget-composition.md`.
 * (UI kit do `ui-kit-docs.test.ts` giữ — cùng lõi `tests/helpers/doc-blocks.ts`.)
 *
 *   1. Component CÔNG KHAI của `src/shared/widgets/**` và `src/shared/charts/**` (đi qua barrel):
 *      khối sát khai báo, dòng đầu `Tên — mô tả`, `@param props.<tên>` khớp ĐÚNG tập prop thật
 *      (không thiếu, không thừa), có `@example` — như UI kit.
 *   2. Component (`PascalCase.tsx`) của `src/app/**` và `src/features/**`: khối sát khai báo, không
 *      khối hướng dẫn đứng riêng đầu file, `@param props.<tên>` cho từng prop (và không thừa).
 */

import { describe, expect, it } from 'vitest';

import { createDocProgram, type DocTarget } from '@tests/helpers/doc-blocks';
import { SOURCE_CODE, baseName } from '@tests/helpers/source-files';
import { barrelExports } from '@tests/helpers/ui-kit-exports';

const SHARED_BARRELS = Object.keys(SOURCE_CODE).filter(
  (path) =>
    /^src\/shared\/widgets\/[^/]+\/index\.ts$/.test(path) || path === 'src/shared/charts/index.ts',
);

/** Component công khai của widgets / charts, mỗi component một lần. */
const SHARED_TARGETS: DocTarget[] = [
  ...new Map(
    SHARED_BARRELS.flatMap(barrelExports)
      .filter((entry) => entry.kind === 'component' && entry.file.endsWith('.tsx'))
      .map((entry) => [entry.name, { name: entry.name, file: entry.file }] as const),
  ).values(),
];

/** Mọi component (`PascalCase.tsx`) của tầng app / features. */
const APP_TARGETS: DocTarget[] = Object.keys(SOURCE_CODE)
  .filter((path) => /^src\/(app|features)\//.test(path) && /^[A-Z]\w*\.tsx$/.test(baseName(path)))
  .map((file) => ({ name: baseName(file).replace(/\.tsx$/, ''), file }));

describe('khối tài liệu component ngoài UI kit', () => {
  const docs = createDocProgram([...SHARED_TARGETS, ...APP_TARGETS].map((t) => t.file));

  it('widgets / charts: component công khai có mô tả, @param khớp props, @example', () => {
    expect(SHARED_TARGETS.length).toBeGreaterThan(8);
    const problems = SHARED_TARGETS.flatMap((target) =>
      docs.problemsOf(target, { summaryAndExample: true }),
    );
    expect(problems, `Khối tài liệu chưa đạt:\n  ${problems.join('\n  ')}`).toEqual([]);
  }, 120_000);

  it('app / features: khối sát khai báo, @param cho từng prop, không khối đứng riêng', () => {
    expect(APP_TARGETS.length).toBeGreaterThan(50);
    const problems = APP_TARGETS.flatMap((target) =>
      docs.problemsOf(target, { summaryAndExample: false }),
    );
    expect(problems, `Khối tài liệu chưa đạt:\n  ${problems.join('\n  ')}`).toEqual([]);
  }, 120_000);
});
