/**
 * Bộ render phủ HẾT nhóm chức năng của UI kit: mỗi nhóm có component công khai thuộc đúng MỘT bộ
 * trong `RENDER_SUITES`, và mỗi bộ có file `tests/shared/ui/render/<bộ>.test.tsx` gọi
 * `describeRenderSuite('<bộ>', …)`. Thêm nhóm mới vào UI kit mà quên gán bộ là đỏ ở đây.
 */

import { describe, expect, it } from 'vitest';

import { RENDER_SUITES } from '@tests/helpers/render-suite';
import { TEST_FILES } from '@tests/helpers/source-files';
import { UI_KIT_GROUPS } from '@tests/helpers/ui-kit-exports';

const SUITE_GROUPS: string[] = Object.values(RENDER_SUITES).flat();

describe('bộ render của UI kit', () => {
  it('mọi nhóm có component công khai thuộc đúng một bộ', () => {
    const orphan = UI_KIT_GROUPS.filter((group) => !SUITE_GROUPS.includes(group));
    const twice = SUITE_GROUPS.filter((group, i) => SUITE_GROUPS.indexOf(group) !== i);
    const unknown = SUITE_GROUPS.filter((group) => !UI_KIT_GROUPS.includes(group));

    expect(orphan, `Gán nhóm vào một bộ trong RENDER_SUITES: ${orphan.join(', ')}`).toEqual([]);
    expect(twice, `Nhóm nằm ở hai bộ: ${twice.join(', ')}`).toEqual([]);
    expect(unknown, `Nhóm không còn trong UI kit: ${unknown.join(', ')}`).toEqual([]);
  });

  it.each(Object.keys(RENDER_SUITES))('bộ "%s" có file chạy nó', (suite) => {
    const file = TEST_FILES[`tests/shared/ui/render/${suite}.test.tsx`] ?? '';
    expect(file).toContain(`describeRenderSuite('${suite}'`);
  });
});
