/**
 * Định dạng số / ngày.
 *
 * Vì sao có bài kiểm này: `format.utils.ts` từng import `numeral` — một gói
 * KHÔNG có trong `package.json` và chưa từng được cài. `tsc` vẫn xanh vì
 * `vite-env.d.ts` có một dòng `declare module 'numeral'` viết tay chép từ dự án
 * nguồn, và build cũng không đỏ vì lúc đó chưa file nào import tới. Gọi
 * `formatCurrency()` một phát là nổ.
 *
 * Không có test thì loại lỗi đó nằm im tới khi ra sản phẩm. Nay dùng
 * `Intl.NumberFormat` gốc của trình duyệt, và đây là bằng chứng nó chạy thật.
 */

import { describe, expect, it } from 'vitest';

import {
  formatCurrency,
  formatDate,
  formatNow,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from '@/shared/utils/format/format.utils';

/** Locale vi-VN dùng dấu chấm ngăn hàng nghìn và dấu phẩy cho phần lẻ. */
const NBSP_OR_SPACE = /\s/g;
const norm = (s: string) => s.replace(NBSP_OR_SPACE, ' ');

describe('formatCurrency', () => {
  it('VND: ngăn hàng nghìn, không phần lẻ', () => {
    expect(norm(formatCurrency(1234567))).toBe('1.234.567 ₫');
  });

  it('USD: luôn 2 chữ số lẻ', () => {
    expect(formatCurrency(1234.5, 'USD')).toBe('$1,234.50');
  });

  it('số âm giữ nguyên dấu', () => {
    expect(norm(formatCurrency(-1000))).toBe('-1.000 ₫');
  });

  it('NaN KHÔNG được lọt ra màn hình', () => {
    expect(norm(formatCurrency(Number.NaN))).toBe('0 ₫');
    expect(norm(formatCurrency(Number.POSITIVE_INFINITY))).toBe('0 ₫');
  });
});

describe('formatNumber', () => {
  it('mặc định không phần lẻ', () => {
    expect(formatNumber(1234567)).toBe('1.234.567');
  });

  it('làm tròn đúng số chữ số yêu cầu', () => {
    expect(formatNumber(1234.567, 2)).toBe('1.234,57');
  });

  it('NaN → 0', () => {
    expect(formatNumber(Number.NaN, 2)).toBe('0,00');
  });
});

describe('formatPercent', () => {
  it('nhận thang 100, in ra 1 chữ số lẻ', () => {
    expect(formatPercent(12.34)).toBe('12,3%');
  });

  it('0 và 100 ra đúng', () => {
    expect(formatPercent(0)).toBe('0,0%');
    expect(formatPercent(100)).toBe('100,0%');
  });

  it('`decimals` đổi số chữ số lẻ (thay cho tự ghép `${formatNumber(n)}%`)', () => {
    expect(formatPercent(72.46, 0)).toBe('72%');
    expect(formatPercent(72.46, 2)).toBe('72,46%');
    expect(formatPercent(Number.NaN, 0)).toBe('0%');
  });
});

describe('formatDate & formatRelativeTime', () => {
  it('mặc định DD/MM/YYYY', () => {
    expect(formatDate('2026-08-31T10:00:00')).toBe('31/08/2026');
  });

  it('nhận format tuỳ ý', () => {
    expect(formatDate('2026-08-31T10:05:00', 'HH:mm')).toBe('10:05');
  });

  it('mốc thời gian tương đối theo bậc phút / giờ / ngày', () => {
    const now = Date.now();
    expect(formatRelativeTime(new Date(now - 30 * 1000))).toBe('Vừa xong');
    expect(formatRelativeTime(new Date(now - 5 * 60 * 1000))).toBe('5 phút trước');
    expect(formatRelativeTime(new Date(now - 3 * 3600 * 1000))).toBe('3 giờ trước');
    expect(formatRelativeTime(new Date(now - 2 * 86400 * 1000))).toBe('2 ngày trước');
  });
});

describe('formatRelativeTime với mốc TƯƠNG LAI', () => {
  it('không đọc hạn còn 3 ngày thành "Vừa xong"', () => {
    const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(future)).not.toBe('Vừa xong');
  });

  it('mốc vừa xảy ra vẫn là "Vừa xong"', () => {
    expect(formatRelativeTime(new Date())).toBe('Vừa xong');
  });
});

describe('tham số `locale` (en)', () => {
  it('formatCurrency: VND / USD theo kiểu Intl en-US; vi vẫn như cũ khi bỏ trống hoặc truyền `vi`', () => {
    expect(norm(formatCurrency(500000, 'VND', 'en'))).toBe('₫500,000');
    expect(formatCurrency(1234.5, 'USD', 'en')).toBe('$1,234.50');
    expect(formatCurrency(Number.NaN, 'USD', 'en')).toBe('$0.00');
    expect(norm(formatCurrency(500000, 'VND', 'vi'))).toBe(norm(formatCurrency(500000)));
    expect(norm(formatCurrency(500000))).toBe('500.000 ₫');
  });

  it('formatNumber: dấu phẩy ngăn hàng nghìn, dấu chấm thập phân; `minDecimals` vẫn có tác dụng', () => {
    expect(formatNumber(1234567, 0, 0, 'en')).toBe('1,234,567');
    expect(formatNumber(1234.567, 2, 2, 'en')).toBe('1,234.57');
    expect(formatNumber(1.5, 3, 0, 'en')).toBe('1.5');
    expect(formatNumber(Number.NaN, 2, 2, 'en')).toBe('0.00');
  });

  it('formatNumber: hai ngôn ngữ không dùng chung bộ nhớ đệm định dạng', () => {
    expect(formatNumber(1234.5, 1, 1, 'vi')).toBe('1.234,5');
    expect(formatNumber(1234.5, 1, 1, 'en')).toBe('1,234.5');
    expect(formatNumber(1234.5, 1, 1, 'vi')).toBe('1.234,5');
  });

  it('formatPercent: dấu thập phân theo ngôn ngữ', () => {
    expect(formatPercent(12.34, 1, 'en')).toBe('12.3%');
    expect(formatPercent(72.46, 2, 'en')).toBe('72.46%');
    expect(formatPercent(72.46, 0, 'en')).toBe('72%');
  });

  it('formatDate: mẫu mặc định en là MM/DD/YYYY; `format` tường minh thắng ở mọi ngôn ngữ', () => {
    expect(formatDate('2026-08-31T10:00:00', undefined, 'en')).toBe('08/31/2026');
    expect(formatDate('2026-08-31T10:00:00', undefined, 'vi')).toBe('31/08/2026');
    expect(formatDate('2026-08-31T10:05:00', 'HH:mm', 'en')).toBe('10:05');
  });

  it('formatNow: "HH:mm · <ngày theo ngôn ngữ>"', () => {
    expect(formatNow('2026-07-02T16:52:00')).toBe('16:52 · 02/07/2026');
    expect(formatNow('2026-07-02T16:52:00', 'en')).toBe('16:52 · 07/02/2026');
  });

  it('formatRelativeTime: en dùng "Just now" và Intl.RelativeTimeFormat', () => {
    const now = Date.now();
    expect(formatRelativeTime(new Date(now - 30 * 1000), 'en')).toBe('Just now');
    expect(formatRelativeTime(new Date(now - 5 * 60 * 1000), 'en')).toBe('5 minutes ago');
    expect(formatRelativeTime(new Date(now - 3 * 3600 * 1000), 'en')).toBe('3 hours ago');
    expect(formatRelativeTime(new Date(now - 2 * 86400 * 1000), 'en')).toBe('2 days ago');
  });

  it('formatRelativeTime: mốc tương lai hoặc từ 30 ngày trước → ngày theo mẫu của ngôn ngữ', () => {
    const future = new Date('2099-08-31T10:00:00');
    const old = new Date(Date.now() - 40 * 86400 * 1000);

    expect(formatRelativeTime(future, 'en')).toBe('08/31/2099');
    expect(formatRelativeTime(future, 'vi')).toBe('31/08/2099');
    expect(formatRelativeTime(old, 'en')).toBe(formatDate(old, undefined, 'en'));
  });
});
