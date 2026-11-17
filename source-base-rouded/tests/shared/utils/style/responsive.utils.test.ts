/**
 * `responsive.utils` — có trong catalog `reuse-first.md` nhưng base chưa có màn nào gọi (API dọn
 * sẵn cho dự án kế thừa). Test vừa giữ hành vi, vừa là "nơi dùng" để knip không báo file mồ côi.
 */

import { describe, expect, it } from 'vitest';

import { pxToRem, pxToRemString, tailwindSpacingToPx } from '@/shared/utils/style/responsive.utils';

describe('responsive.utils', () => {
  it('đổi px ↔ rem (gốc 16px) và bậc spacing Tailwind → px', () => {
    expect(pxToRem(24)).toBe(1.5);
    expect(pxToRemString(24)).toBe('1.5rem');
    expect(tailwindSpacingToPx(3)).toBe(12);
  });
});
