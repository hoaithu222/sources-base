/**
 * Màu "chrome" của chart (`CHART_CHROME*`) — khoá khai mà không ai đọc thì người sửa màu sửa nhầm chỗ: từng có
 * `axis` / `track` khai trong bảng mà `buildChartStyles` lại tô đường trục bằng `grid`, và "track" mang 3 giá trị
 * khác nhau ở 3 nơi. Bài kiểm này giữ: MỌI khoá đều có nơi đọc, và đường trục đọc đúng khoá `axis`.
 */

import { describe, expect, it } from 'vitest';

import {
  CHART_CHROME,
  CHART_CHROME_TV,
  CHART_TOOLTIP_SURFACE,
  buildChartStyles,
  tokenVar,
} from '@/shared/charts';
import { SOURCE_CODE } from '@tests/helpers/source-files';

const ALL_CODE = Object.values(SOURCE_CODE).join('\n');

/** `CHART_CHROME.x` · `CHART_CHROME_TV.x` · `chrome.x` (biến chọn bảng theo chế độ trong `buildChartStyles`). */
const readsOf = (key: string) =>
  new RegExp(String.raw`(?:CHART_CHROME(?:_TV)?|chrome)\.${key}\b`).test(ALL_CODE);

describe('CHART_CHROME* — mọi khoá đều có nơi đọc', () => {
  it.each([
    ['CHART_CHROME', CHART_CHROME],
    ['CHART_CHROME_TV', CHART_CHROME_TV],
  ] as const)('%s', (_, table) => {
    const unread = Object.keys(table).filter((key) => !readsOf(key));
    expect(unread, 'Khoá khai mà không ai đọc — xoá, hoặc nối vào nơi dùng').toEqual([]);
  });
});

describe('buildChartStyles đọc đúng khoá', () => {
  it.each([
    ['thường', 1, CHART_CHROME],
    ['TV', 1.2, CHART_CHROME_TV],
  ] as const)(
    'chế độ %s: trục ← `axis`, lưới ← `grid`, nhãn trục ← `axisLabel`',
    (_, scale, chrome) => {
      const m = buildChartStyles('base', scale);
      expect(m.axisLine.stroke).toBe(tokenVar(chrome.axis));
      expect(m.grid.stroke).toBe(tokenVar(chrome.grid));
      expect(m.axisTick.fill).toBe(tokenVar(chrome.axisLabel));
    },
  );

  it('tooltip dùng `CHART_TOOLTIP_SURFACE`, bóng theo token (không rgba cứng)', () => {
    const { tooltip } = buildChartStyles('base');
    expect(tooltip).toMatchObject(CHART_TOOLTIP_SURFACE);
    expect(CHART_TOOLTIP_SURFACE.boxShadow).toContain('var(--color-shadow-popup)');
    expect(JSON.stringify(tooltip)).not.toMatch(/rgba?\(/);
  });
});
