/**
 * Chọn màu chart theo vai trò (`chart-color.utils`) và gradient mảng lớn (`chart-gradient.utils`) — hỏng
 * ÂM THẦM: token sai bậc vẫn vẽ ra một màu, chỉ là màu không qua validator hoặc không tồn tại (tô trong suốt).
 */

import { describe, expect, it } from 'vitest';

import {
  CHART_DIVERGING_MID_INDEX,
  CHART_DIVERGING_TOKENS,
  CHART_OTHER_TOKEN,
  CHART_SEQUENTIAL_TOKENS,
  CHART_SERIES_TOKENS,
  arcGradientStops,
  barGradient,
  columnGradientStops,
  divergingTokenAt,
  divergingTokenFor,
  sequentialScale,
  sequentialTokenAt,
  sequentialTokenForRatio,
  seriesTokenAt,
  tokenDarker,
  tokenStep,
  tokenVar,
} from '@/shared/charts';
import { THEME_COLOR_KEYS } from '@/shared/theme';

const KEYS = new Set<string>(THEME_COLOR_KEYS);

describe('series · "Khác"', () => {
  it('8 token series khác nhau, đều CÓ THẬT trong bảng màu', () => {
    expect(new Set(CHART_SERIES_TOKENS).size).toBe(8);
    expect(CHART_SERIES_TOKENS.filter((token) => !KEYS.has(token))).toEqual([]);
  });

  it('seriesTokenAt theo thứ tự cố định; quá 8 (hoặc chỉ số lạ) → "Khác", không quay vòng', () => {
    CHART_SERIES_TOKENS.forEach((token, i) => expect(seriesTokenAt(i)).toBe(token));
    expect(seriesTokenAt(8)).toBe(CHART_OTHER_TOKEN);
    expect(seriesTokenAt(40)).toBe(CHART_OTHER_TOKEN);
    expect(seriesTokenAt(-1)).toBe(CHART_OTHER_TOKEN);
  });
});

describe('sequential', () => {
  it('sequentialTokenAt kẹp biên, chỉ số lạ về bậc thấp nhất', () => {
    expect(sequentialTokenAt(0)).toBe(CHART_SEQUENTIAL_TOKENS[0]);
    expect(sequentialTokenAt(99)).toBe(CHART_SEQUENTIAL_TOKENS[CHART_SEQUENTIAL_TOKENS.length - 1]);
    expect(sequentialTokenAt(-3)).toBe(CHART_SEQUENTIAL_TOKENS[0]);
    expect(sequentialTokenAt(Number.NaN)).toBe(CHART_SEQUENTIAL_TOKENS[0]);
  });

  it('sequentialScale(n): n lớp cách đều, có cả hai đầu, không trùng, thấp → cao', () => {
    expect(sequentialScale(0)).toEqual([]);
    expect(sequentialScale(1)).toEqual([CHART_SEQUENTIAL_TOKENS[5]]);
    expect(sequentialScale(2)).toEqual([CHART_SEQUENTIAL_TOKENS[0], CHART_SEQUENTIAL_TOKENS[5]]);
    const five = sequentialScale(5);
    expect(new Set(five).size).toBe(5);
    expect(five[0]).toBe(CHART_SEQUENTIAL_TOKENS[0]);
    expect(five[4]).toBe(CHART_SEQUENTIAL_TOKENS[5]);
    expect(sequentialScale(6)).toEqual([...CHART_SEQUENTIAL_TOKENS]);
    expect(sequentialScale(99)).toHaveLength(6);
  });

  it('sequentialTokenForRatio: 6 thùng đều nhau, ngoài [0,1] kẹp biên', () => {
    expect(sequentialTokenForRatio(0)).toBe(CHART_SEQUENTIAL_TOKENS[0]);
    expect(sequentialTokenForRatio(0.16)).toBe(CHART_SEQUENTIAL_TOKENS[0]);
    expect(sequentialTokenForRatio(0.18)).toBe(CHART_SEQUENTIAL_TOKENS[1]);
    expect(sequentialTokenForRatio(1)).toBe(CHART_SEQUENTIAL_TOKENS[5]);
    expect(sequentialTokenForRatio(2)).toBe(CHART_SEQUENTIAL_TOKENS[5]);
    expect(sequentialTokenForRatio(-1)).toBe(CHART_SEQUENTIAL_TOKENS[0]);
  });
});

describe('diverging', () => {
  it('divergingTokenAt kẹp biên; điểm giữa là xám trung tính', () => {
    expect(divergingTokenAt(-5)).toBe(CHART_DIVERGING_TOKENS[0]);
    expect(divergingTokenAt(99)).toBe(CHART_DIVERGING_TOKENS[6]);
    expect(divergingTokenAt(CHART_DIVERGING_MID_INDEX)).toBe('chart-div-4');
  });

  it('divergingTokenFor: dấu quyết định phía, độ lớn quyết định bậc, lệch nhỏ → trung tính', () => {
    expect(divergingTokenFor(0, 10)).toBe('chart-div-4');
    expect(divergingTokenFor(1, 10)).toBe('chart-div-4');
    expect(divergingTokenFor(-10, 10)).toBe('chart-div-1');
    expect(divergingTokenFor(10, 10)).toBe('chart-div-7');
    expect(divergingTokenFor(-99, 10)).toBe('chart-div-1');
    expect(divergingTokenFor(4, 10)).toBe('chart-div-5');
    expect(divergingTokenFor(-7, 10)).toBe('chart-div-2');
  });

  it('extent không hợp lệ / giá trị NaN → trung tính, không ném', () => {
    expect(divergingTokenFor(5, 0)).toBe('chart-div-4');
    expect(divergingTokenFor(5, -1)).toBe('chart-div-4');
    expect(divergingTokenFor(Number.NaN, 10)).toBe('chart-div-4');
  });
});

describe('tokenDarker · tokenStep', () => {
  it('hạ bậc cùng hue, kẹp ở bậc cuối còn tồn tại (không sinh token ma)', () => {
    expect(tokenDarker('info-5')).toBe('info-6');
    expect(tokenDarker('teal-7', 2)).toBe('teal-8');
    expect(tokenDarker('teal-8')).toBe('teal-8');
    expect(KEYS.has(tokenDarker('purple-8', 3))).toBe(true);
  });

  it('token không có bậc, hoặc thang CHỈ SỐ (chart-seq / chart-div), trả nguyên', () => {
    expect(tokenDarker('chart-other')).toBe('chart-other');
    expect(tokenDarker('chart-seq-3')).toBe('chart-seq-3');
    expect(tokenDarker('chart-div-2', 2)).toBe('chart-div-2');
    expect(tokenDarker('fg-muted')).toBe('fg-muted');
    expect(tokenStep('teal-6')).toBe(6);
    expect(tokenStep('chart-other')).toBeNull();
  });
});

describe('gradient tương đối theo bậc của token', () => {
  const colorsOf = (stops: { color: string }[]) => stops.map((s) => s.color);

  it('token -5: giữ đúng hành vi cũ (-6 → -5, cột -7 → -6 → -5)', () => {
    expect(colorsOf(arcGradientStops('info-5'))).toEqual([tokenVar('info-6'), tokenVar('info-5')]);
    expect(colorsOf(columnGradientStops('info-5'))).toEqual([
      tokenVar('info-7'),
      tokenVar('info-6'),
      tokenVar('info-5'),
    ]);
  });

  it('token series -6 / -7: mép ngoài LUÔN là token series, lõi tối hơn — không bao giờ sáng hơn bậc đã chấm validator', () => {
    expect(colorsOf(arcGradientStops('secondary-6'))).toEqual([
      tokenVar('secondary-7'),
      tokenVar('secondary-6'),
    ]);
    const column = colorsOf(columnGradientStops('primary-7'));
    expect(column[column.length - 1]).toBe(tokenVar('primary-7'));
    expect(column[0]).toBe(tokenVar('primary-8')); // primary hết ở bậc 8 → kẹp, không sinh primary-9
  });

  it('mọi stop sinh ra đều là token CÓ THẬT, kể cả khi họ hết bậc', () => {
    for (const token of CHART_SERIES_TOKENS) {
      for (const stop of [...arcGradientStops(token), ...columnGradientStops(token)]) {
        const name = /var\(--color-(.+)\)/.exec(stop.color)?.[1] ?? '';
        expect(KEYS.has(name), `${token} → ${stop.color}`).toBe(true);
      }
    }
  });

  it('token không hạ bậc được (chrome, "Khác", thang chỉ số) → tô PHẲNG', () => {
    for (const token of ['chart-other', 'chart-seq-2', 'chart-div-6', 'fg-muted', 'neutral-5']) {
      const stops = colorsOf(arcGradientStops(token));
      expect(new Set(stops).size, token).toBe(1);
      // stop của SVG phải là màu CSS thật — tên token trần ("fg-muted") làm trình duyệt vẽ ĐEN.
      expect(stops[0], token).toBe(tokenVar(token));
      expect(colorsOf(columnGradientStops(token))[0], token).toBe(tokenVar(token));
    }
  });

  it('barGradient: mép trên = token series', () => {
    expect(barGradient('teal-6')).toContain(`${tokenVar('teal-6')} 0%`);
  });
});
