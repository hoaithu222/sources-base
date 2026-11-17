/**
 * Chart responsive — mật độ nhãn trục theo BỀ RỘNG, legend gọn ở khung hẹp, tooltip an toàn cảm ứng, sàn kích thước.
 * Những thứ này hỏng ÂM THẦM: chart vẫn vẽ, chỉ là nhãn đè nhau ở 360px hoặc tooltip bỏ lần chạm đầu.
 */

import { describe, expect, it } from 'vitest';

import {
  CHART_CONTAINER_PROPS,
  CHART_DENSITY_SCALE,
  CHART_INTERACTION_PROPS,
  CHART_MIN_SIZE,
  CHART_TOOLTIP_SURFACE,
  CHART_WIDTH_BREAKPOINTS,
  buildChartStyles,
  isNarrowChart,
  xAxisLayout,
  yAxisWidthFor,
} from '@/shared/charts';

const FONT = CHART_DENSITY_SCALE.base.axis;

describe('isNarrowChart', () => {
  it('dưới ngưỡng = hẹp; chưa đo (0) hoặc từ ngưỡng trở lên = không hẹp', () => {
    expect(isNarrowChart(312)).toBe(true);
    expect(isNarrowChart(CHART_WIDTH_BREAKPOINTS.narrow - 1)).toBe(true);
    expect(isNarrowChart(CHART_WIDTH_BREAKPOINTS.narrow)).toBe(false);
    expect(isNarrowChart(0)).toBe(false);
  });
});

describe('xAxisLayout — mật độ nhãn trục X theo bề rộng thực', () => {
  const MONTHS = 12;

  it('đủ chỗ → hiện hết, không nghiêng', () => {
    const layout = xAxisLayout({ count: 8, plotWidth: 900, fontSize: FONT, labelChars: 5 });
    expect(layout).toMatchObject({ interval: 0, angle: 0, textAnchor: 'middle' });
  });

  it('chưa đo được (plotWidth ≤ 0) hoặc ≤ 1 điểm → hiện hết, đợi lần đo sau', () => {
    expect(xAxisLayout({ count: 30, plotWidth: 0, fontSize: FONT, labelChars: 6 }).interval).toBe(
      0,
    );
    expect(xAxisLayout({ count: 1, plotWidth: 100, fontSize: FONT, labelChars: 6 }).interval).toBe(
      0,
    );
  });

  it('hẹp + nhãn dài → nghiêng -35°, neo đuôi, dải trục cao thêm để không cắt', () => {
    const layout = xAxisLayout({ count: 6, plotWidth: 270, fontSize: FONT, labelChars: 8 });
    expect(layout.angle).toBe(-35);
    expect(layout.textAnchor).toBe('end');
    expect(layout.height).toBeGreaterThan(30);
  });

  it('hẹp mà nghiêng cũng không vừa → THƯA đều, không nhãn nào đè nhau', () => {
    const plotWidth = 270;
    const layout = xAxisLayout({ count: 30, plotWidth, fontSize: FONT, labelChars: 5 });
    expect(layout.angle).toBe(0);
    expect(layout.interval).toBeGreaterThan(0);
    const shown = Math.ceil(30 / (layout.interval + 1));
    expect(shown).toBeGreaterThanOrEqual(2);
    expect(shown * (5 * FONT * 0.6)).toBeLessThanOrEqual(plotWidth);
  });

  it('càng hẹp càng thưa (đơn điệu theo bề rộng)', () => {
    const at = (plotWidth: number) =>
      xAxisLayout({ count: 30, plotWidth, fontSize: FONT, labelChars: 5 }).interval;
    expect(at(280)).toBeGreaterThanOrEqual(at(560));
    expect(at(560)).toBeGreaterThanOrEqual(at(1100));
  });

  it('nhãn ngắn ở 360px (12 tháng "T1…") vẫn hiện hết hoặc thưa nhẹ, luôn ≥ 2 nhãn', () => {
    const layout = xAxisLayout({ count: MONTHS, plotWidth: 272, fontSize: FONT, labelChars: 3 });
    expect(Math.ceil(MONTHS / (layout.interval + 1))).toBeGreaterThanOrEqual(2);
  });
});

describe('legend gọn ở khung hẹp', () => {
  it('khung thường: legend không cuộn; khung hẹp: dãn dòng + trần chiều cao + cuộn dọc', () => {
    const wide = buildChartStyles('base', 1, false).legend;
    const narrow = buildChartStyles('base', 1, true).legend;
    expect(wide.overflowY).toBeUndefined();
    expect(narrow.overflowY).toBe('auto');
    expect(narrow.maxHeight).toBeGreaterThan(Number(FONT));
  });
});

describe('cảm ứng + sàn kích thước', () => {
  it('tắt rAF-throttle của Recharts 3: chạm đầu tiên hiện tooltip / bắn onClick', () => {
    expect(CHART_INTERACTION_PROPS.throttledEvents).toEqual([]);
  });

  it('khung chart có sàn chiều cao > 0 và lấp khung cha — cha không có chiều cao cũng không về 0', () => {
    expect(CHART_CONTAINER_PROPS).toMatchObject({ width: '100%', height: '100%' });
    expect(CHART_CONTAINER_PROPS.minHeight).toBe(CHART_MIN_SIZE.height);
    expect(CHART_MIN_SIZE.height).toBeGreaterThan(0);
  });

  it('tooltip không rộng quá màn: trần theo viewport', () => {
    expect(CHART_TOOLTIP_SURFACE.maxWidth).toContain('100vw');
  });
});

describe('yAxisWidthFor — trục Y đủ chỗ cho nhãn dài, không cắt mép trái', () => {
  it('nhãn ngắn giữ sàn của bậc mật độ; nhãn 4+ ký tự (`100%`) rộng hơn sàn', () => {
    const { axis, yAxisWidth } = CHART_DENSITY_SCALE.base;
    expect(yAxisWidthFor(2, axis, yAxisWidth)).toBe(yAxisWidth);
    expect(yAxisWidthFor(4, axis, yAxisWidth)).toBeGreaterThan(yAxisWidth);
  });

  it('`100%` ở cỡ chữ base cần ≥ 44px (chữ đo được ≈ 35px + lề tick 8px)', () => {
    const { axis, yAxisWidth } = CHART_DENSITY_SCALE.base;
    expect(yAxisWidthFor(4, axis, yAxisWidth)).toBeGreaterThanOrEqual(44);
  });
});
