/**
 * Một trang có MỘT tầng tên — `docs/rules/structure/page-structure.md §3b`.
 *
 *  1. Trang đã dựng `<PageHeader>` (tên dự án + tên màn hình + tab nằm trên thanh header) thì KHÔNG dựng thêm
 *     `<TitleScreen>`: hai hàng tiêu đề chồng nhau là thừa, ăn chiều cao dọc của trang.
 *  2. Hành động của trang đi CÙNG HÀNG với dải thẻ KPI (`KpiActionRow`) — không nhét vào hàng tiêu đề.
 *
 * Soi file ngoài `src/shared/ui` (kit tự mô tả `TitleScreen` trong JSDoc / ví dụ, không phải trang).
 */

import { describe, expect, it } from 'vitest';

import { HANDWRITTEN_CODE, stripComments } from '@tests/helpers/source-files';

const KIT_PREFIX = 'src/shared/ui/';
const PAGE_HEADER = /<PageHeader[\s/>]/;
const TITLE_SCREEN = /<TitleScreen[\s/>]/;

const PAGE_FILES = Object.entries(HANDWRITTEN_CODE)
  .filter(([path]) => path.endsWith('.tsx') && !path.startsWith(KIT_PREFIX))
  .map(([path, text]) => [path, stripComments(text)] as const);

describe('tầng tên của trang', () => {
  it('có trang để kiểm', () => {
    expect(PAGE_FILES.some(([, code]) => PAGE_HEADER.test(code))).toBe(true);
  });

  it('trang đã có <PageHeader> thì KHÔNG có thêm <TitleScreen>', () => {
    const offenders = PAGE_FILES.filter(
      ([, code]) => PAGE_HEADER.test(code) && TITLE_SCREEN.test(code),
    ).map(([path]) => path);

    expect(offenders).toEqual([]);
  });
});
