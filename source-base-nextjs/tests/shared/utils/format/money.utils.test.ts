/**
 * `money.utils` — tiền VND tự chọn đơn vị (tỷ / triệu / đồng), mọi hàm nhận `locale` cuối: bỏ trống = tiếng Việt (đầu ra như
 * trước khi có đa ngôn ngữ), `en` đổi số sang kiểu en-US và đơn vị sang B / M / ₫ (đầy đủ: billion / million / ₫).
 */

import { describe, expect, it } from 'vitest';

import {
  formatMoneyCompact,
  formatMoneyCompactInline,
  formatMoneyCompactRaw,
  formatMoneyDetail,
} from '@/shared/utils/format/money.utils';

describe('formatMoneyCompact', () => {
  it('vi: tự chọn tỷ / tr / đ theo độ lớn; floor, không làm tròn lên', () => {
    expect(formatMoneyCompact(12.999)).toEqual({ text: '12', suffix: 'tỷ', scale: 'ty' });
    expect(formatMoneyCompact(0.5)).toEqual({ text: '500', suffix: 'tr', scale: 'tr' });
    expect(formatMoneyCompact(0.0005)).toEqual({ text: '500.000', suffix: 'đ', scale: 'dong' });
    expect(formatMoneyCompact(-2.5)).toEqual({ text: '-2', suffix: 'tỷ', scale: 'ty' });
  });

  it('en: số kiểu en-US + hậu tố B / M / ₫', () => {
    expect(formatMoneyCompact(1234, undefined, 0, false, 'en')).toEqual({
      text: '1,234',
      suffix: 'B',
      scale: 'ty',
    });
    expect(formatMoneyCompact(0.5, undefined, 0, false, 'en')).toEqual({
      text: '500',
      suffix: 'M',
      scale: 'tr',
    });
    expect(formatMoneyCompact(0.0005, undefined, 0, false, 'en')).toEqual({
      text: '500,000',
      suffix: '₫',
      scale: 'dong',
    });
  });

  it('`fractionDigits` + `padFraction`: dấu thập phân theo ngôn ngữ', () => {
    expect(formatMoneyCompact(15, undefined, 1, true)).toMatchObject({ text: '15,0' });
    expect(formatMoneyCompact(15, undefined, 1, true, 'en')).toMatchObject({ text: '15.0' });
    expect(formatMoneyCompact(15.26, undefined, 1, false, 'en')).toMatchObject({ text: '15.2' });
  });

  it('`forceScale` ép đơn vị', () => {
    expect(formatMoneyCompact(2.446, 'tr')).toEqual({ text: '2.446', suffix: 'tr', scale: 'tr' });
    expect(formatMoneyCompact(2.446, 'tr', 0, false, 'en')).toEqual({
      text: '2,446',
      suffix: 'M',
      scale: 'tr',
    });
  });

  it('0 / null / NaN / Infinity → "0", KHÔNG in "NaN"; `padFraction` in đủ số lẻ theo ngôn ngữ', () => {
    for (const value of [0, null, undefined, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(formatMoneyCompact(value)).toEqual({ text: '0', suffix: '', scale: 'ty' });
      expect(formatMoneyCompact(value, undefined, 0, false, 'en')).toEqual({
        text: '0',
        suffix: '',
        scale: 'ty',
      });
    }
    expect(formatMoneyCompact(0, undefined, 2, true).text).toBe('0,00');
    expect(formatMoneyCompact(0, undefined, 2, true, 'en').text).toBe('0.00');
  });
});

describe('formatMoneyDetail', () => {
  it('vi: tối đa 3 số lẻ + "tỷ" / "triệu" / "đ"', () => {
    expect(formatMoneyDetail(12.3456)).toBe('12,346 tỷ');
    expect(formatMoneyDetail(0.5)).toBe('500 triệu');
    expect(formatMoneyDetail(0.0005)).toBe('500.000 đ');
    expect(formatMoneyDetail(null)).toBe('0 đ');
  });

  it('en: "billion" / "million" / "₫" và số en-US', () => {
    expect(formatMoneyDetail(12.3456, undefined, 'en')).toBe('12.346 billion');
    expect(formatMoneyDetail(0.5, undefined, 'en')).toBe('500 million');
    expect(formatMoneyDetail(0.0005, undefined, 'en')).toBe('500,000 ₫');
    expect(formatMoneyDetail(null, undefined, 'en')).toBe('0 ₫');
    expect(formatMoneyDetail(0, 'ty', 'en')).toBe('0 billion');
  });
});

describe('formatMoneyCompactInline / formatMoneyCompactRaw', () => {
  it('Inline gộp số + hậu tố theo ngôn ngữ; giá trị 0 chỉ có số', () => {
    expect(formatMoneyCompactInline(12)).toBe('12 tỷ');
    expect(formatMoneyCompactInline(12, 'en')).toBe('12 B');
    expect(formatMoneyCompactInline(0, 'en')).toBe('0');
  });

  it('Raw nhận số ĐỒNG, tự chia 1e9, giữ ngôn ngữ', () => {
    expect(formatMoneyCompactRaw(119_710_000_000, 1)).toEqual({
      text: '119,7',
      suffix: 'tỷ',
      scale: 'ty',
    });
    expect(formatMoneyCompactRaw(119_710_000_000, 1, false, 'en')).toEqual({
      text: '119.7',
      suffix: 'B',
      scale: 'ty',
    });
    expect(formatMoneyCompactRaw(Number.NaN, 0, false, 'en')).toEqual({
      text: '0',
      suffix: '',
      scale: 'ty',
    });
  });
});
