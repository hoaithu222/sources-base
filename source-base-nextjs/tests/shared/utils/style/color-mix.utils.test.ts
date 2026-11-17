/**
 * `colorMix` — hàm `color-mix()` DUY NHẤT (gộp 7 helper cũ với 3 quy ước: `tokenVarAlpha` 0–1, `hud*` 0–100,
 * `mixColors` oklab). Đổi đơn vị 0–100 → 0–1 dễ lệch chuỗi CSS (`0.29 * 100 = 28.999…`), nên khoá CHUỖI ĐẦU RA
 * của từng quy ước cũ bằng công thức của chính nó.
 */

import { describe, expect, it } from 'vitest';

import { tokenVarAlpha, tokenVarOver } from '@/shared/charts';
import { colorMix } from '@/shared/utils/style/color-mix.utils';

const TEAL = 'var(--color-teal-5)';

/** Công thức của các helper đã xoá — giữ ở đây làm chuẩn so chuỗi. */
const legacy = {
  hudMix: (tone: string, pct: number) => `color-mix(in srgb, ${tone} ${pct}%, transparent)`,
  hudBorder: (tone: string, pct: number) =>
    `color-mix(in srgb, ${tone} ${pct}%, var(--color-border-strong))`,
  hudInk: (tone: string, pct: number) =>
    `color-mix(in srgb, ${tone} ${pct}%, var(--color-fg-heading))`,
  mixColors: (a: string, b: string, weightA: number) =>
    `color-mix(in oklab, ${a} ${Math.round(weightA * 100)}%, ${b})`,
};

describe('colorMix — giữ nguyên chuỗi của các quy ước cũ', () => {
  it('mọi phần trăm nguyên 0–100 (thang cũ của `hud*`) ra đúng chuỗi khi đổi sang thang 0–1', () => {
    for (let pct = 0; pct <= 100; pct++) {
      expect(colorMix(TEAL, pct / 100)).toBe(legacy.hudMix(TEAL, pct));
      expect(colorMix(TEAL, pct / 100, 'var(--color-border-strong)')).toBe(
        legacy.hudBorder(TEAL, pct),
      );
      expect(colorMix(TEAL, pct / 100, 'var(--color-fg-heading)')).toBe(legacy.hudInk(TEAL, pct));
    }
  });

  it('trộn 2 màu bất kỳ trong oklab (`mixColors` cũ)', () => {
    expect(colorMix(TEAL, 0.88, '#ff0000', 'oklab')).toBe(legacy.mixColors(TEAL, '#ff0000', 0.88));
  });

  it('`tokenVarAlpha` / `tokenVarOver` đi qua `colorMix`, cùng chuỗi như trước', () => {
    expect(tokenVarAlpha('success-5', 0.08)).toBe(
      'color-mix(in srgb, var(--color-success-5) 8%, transparent)',
    );
    expect(tokenVarOver('info-5', 0.12)).toBe(
      'color-mix(in srgb, var(--color-info-5) 12%, var(--color-bg-surface))',
    );
    expect(tokenVarOver('info-5', 0.12, 'bg-subtle')).toBe(
      'color-mix(in srgb, var(--color-info-5) 12%, var(--color-bg-subtle))',
    );
  });

  it('kẹp `alpha` về [0, 1] và làm tròn phần trăm nguyên', () => {
    expect(colorMix(TEAL, 1.4)).toBe(legacy.hudMix(TEAL, 100));
    expect(colorMix(TEAL, -0.2)).toBe(legacy.hudMix(TEAL, 0));
    expect(colorMix(TEAL, 0.125)).toBe(legacy.hudMix(TEAL, 13));
  });
});
