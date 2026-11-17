/**
 * `color.utils` — có trong catalog `reuse-first.md` nhưng base chưa có màn nào gọi (API dọn sẵn cho
 * dự án kế thừa). Test vừa giữ hành vi, vừa là "nơi dùng" để knip không báo file mồ côi.
 */

import { afterEach, describe, expect, it } from 'vitest';

import { getCssVariable, getThemeColor } from '@/shared/utils/style/color.utils';

describe('color.utils', () => {
  afterEach(() => document.documentElement.style.removeProperty('--color-primary-5'));

  it('đọc giá trị đã tính của token màu trên :root', () => {
    document.documentElement.style.setProperty('--color-primary-5', ' #22c55e ');
    expect(getCssVariable('--color-primary-5')).toBe('#22c55e');
    expect(getThemeColor('primary-5')).toBe('#22c55e');
  });

  it('biến CSS không tồn tại → chuỗi rỗng', () => {
    expect(getCssVariable('--bien-khong-co')).toBe('');
  });
});
