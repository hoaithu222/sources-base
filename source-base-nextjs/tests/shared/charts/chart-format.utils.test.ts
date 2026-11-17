/**
 * Nhãn biểu đồ (`chart-format.utils`) không được in ra chữ "NaN" — hỏng ÂM THẦM: Recharts vẫn vẽ,
 * chỉ có nhãn là sai.
 */

import { describe, expect, it } from 'vitest';

import { fmt3, labelInt } from '@/shared/charts';

describe('nhãn biểu đồ không được in ra chữ "NaN"', () => {
  it('labelInt', () => {
    // Guard cũ `v == null` KHÔNG bắt NaN: `NaN == null` là false. Nguồn phổ
    // biến nhất là Recharts gọi formatter lúc chưa có payload.
    expect(labelInt(Number.NaN)).toBe('');
    expect(labelInt(Number.POSITIVE_INFINITY)).toBe('');
    expect(labelInt(1234)).toBe('1.234'); // vi-VN dùng dấu chấm
  });

  it('fmt3', () => {
    expect(fmt3(Number.NaN)).toBe('');
    expect(fmt3(Number.NEGATIVE_INFINITY)).toBe('');
  });
});
