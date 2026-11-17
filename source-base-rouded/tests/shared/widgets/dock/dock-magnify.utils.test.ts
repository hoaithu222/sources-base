/**
 * Toán phóng lân cận của Dock (`dock-magnify.utils.ts`) — phần quyết định ô có CHỒNG lên nhau hay không.
 *
 * Lỗi cần chặn: bản phóng theo bậc cũ đẩy ô kề 8px trong khi ô giữa nở thêm ~18px mỗi bên → ô lớn đè lên hai ô kề,
 * và vòng sáng của vỏ cắt ngang ô. Bất biến giữ ở đây: với MỌI vị trí con trỏ và MỌI bộ hệ số đang trôi, khe giữa
 * hai phần tử liền nhau giữ nguyên bề rộng gốc (không bao giờ âm) và mép ngoài cùng nằm đúng mép vỏ đã nở.
 */

import { describe, expect, it } from 'vitest';

import {
  DOCK_MAGNIFY,
  dockMagnifyEase,
  dockMagnifyFalloff,
  dockMagnifyFit,
  dockMagnifyLayout,
  dockMagnifyRadius,
  dockMagnifyTargets,
  type DockMagnifySlot,
} from '@/shared/widgets/dock/utils/dock-magnify.utils';

const EPS = 1e-6;

interface SlotSpec {
  size: number;
  magnifies?: boolean;
}

/** Dựng dãy phần tử xếp liền nhau (khe `gap` px), căn giữa quanh 0 như `<nav>` thật. */
function buildSlots(specs: readonly SlotSpec[], gap: number): DockMagnifySlot[] {
  const total = specs.reduce((sum, spec) => sum + spec.size, 0) + gap * (specs.length - 1);
  let cursor = -total / 2;
  return specs.map(({ size, magnifies = true }) => {
    const slot = { center: cursor + size / 2, size, magnifies };
    cursor += size + gap;
    return slot;
  });
}

/** Mép đầu / cuối của từng phần tử SAU khi phóng + dời (phóng quanh tâm dọc trục như `transform-origin`). */
function visualSpans(slots: readonly DockMagnifySlot[], scales: readonly number[]) {
  const { shifts, grow } = dockMagnifyLayout(slots, scales);
  const spans = slots.map((slot, i) => {
    const center = slot.center + shifts[i];
    const half = (slot.size * scales[i]) / 2;
    return [center - half, center + half] as const;
  });
  return { spans, grow };
}

/** Dock đáy thật: 7 mục 44px · vạch ngăn 1px (+ lề 2px mỗi bên → khe 8) · nút cài đặt 44px, khe 6px. */
const DOCK_SPECS: SlotSpec[] = [
  ...Array.from({ length: 7 }, () => ({ size: 44 })),
  { size: 1, magnifies: false },
  { size: 44 },
];
const DOCK_GAP = 6;

function expectNoOverlap(slots: readonly DockMagnifySlot[], scales: readonly number[]) {
  const { spans, grow } = visualSpans(slots, scales);
  for (let i = 0; i + 1 < slots.length; i++) {
    const baseGap =
      slots[i + 1].center - slots[i + 1].size / 2 - (slots[i].center + slots[i].size / 2);
    const gap = spans[i + 1][0] - spans[i][1];
    expect(gap).toBeGreaterThanOrEqual(-EPS);
    expect(gap).toBeCloseTo(baseGap, 6);
  }
  const baseStart = slots[0].center - slots[0].size / 2;
  const last = slots[slots.length - 1];
  const baseEnd = last.center + last.size / 2;
  expect(spans[0][0]).toBeCloseTo(baseStart - grow / 2, 6);
  expect(spans[spans.length - 1][1]).toBeCloseTo(baseEnd + grow / 2, 6);
}

describe('dockMagnifyFalloff — mức ảnh hưởng theo khoảng cách', () => {
  it('bằng 1 ngay dưới con trỏ, 0 từ mép bán kính trở ra, đối xứng hai phía', () => {
    expect(dockMagnifyFalloff(0, 100)).toBe(1);
    expect(dockMagnifyFalloff(100, 100)).toBe(0);
    expect(dockMagnifyFalloff(-250, 100)).toBe(0);
    expect(dockMagnifyFalloff(-37, 100)).toBeCloseTo(dockMagnifyFalloff(37, 100), 12);
  });

  it('giảm đều (không bậc thang) khi xa dần', () => {
    let previous = Infinity;
    for (let d = 0; d <= 100; d += 0.5) {
      const value = dockMagnifyFalloff(d, 100);
      expect(value).toBeLessThanOrEqual(previous);
      previous = value;
    }
  });

  it('bán kính ≤ 0 → không phóng gì', () => {
    expect(dockMagnifyFalloff(0, 0)).toBe(0);
  });
});

describe('dockMagnifyTargets · dockMagnifyRadius', () => {
  const slots = buildSlots(DOCK_SPECS, DOCK_GAP);
  const radius = dockMagnifyRadius(slots);

  it('bán kính = reach × bước ô (44 + khe 6)', () => {
    expect(radius).toBeCloseTo(DOCK_MAGNIFY.reach * 50, 6);
  });

  it('con trỏ ngay tâm một ô → ô đó đạt đỉnh, hai ô kề nở ít hơn, vạch ngăn giữ 1', () => {
    const scales = dockMagnifyTargets(slots, slots[3].center, radius);
    expect(scales[3]).toBeCloseTo(DOCK_MAGNIFY.peak, 6);
    expect(scales[2]).toBeLessThan(scales[3]);
    expect(scales[2]).toBeCloseTo(scales[4], 6);
    expect(scales[2]).toBeGreaterThan(1);
    expect(scales[7]).toBe(1);
  });

  it('con trỏ xa hẳn dãy ô → mọi hệ số về 1', () => {
    expect(dockMagnifyTargets(slots, 10_000, radius).every((scale) => scale === 1)).toBe(true);
  });

  it('dời con trỏ 1px thì hệ số chỉ đổi rất ít — chuyển động liên tục, không nhảy bậc', () => {
    for (let p = -300; p < 300; p += 1) {
      const a = dockMagnifyTargets(slots, p, radius);
      const b = dockMagnifyTargets(slots, p + 1, radius);
      a.forEach((scale, i) => expect(Math.abs(scale - b[i])).toBeLessThan(0.02));
    }
  });
});

describe('dockMagnifyLayout — bất biến KHÔNG CHỒNG', () => {
  const slots = buildSlots(DOCK_SPECS, DOCK_GAP);
  const radius = dockMagnifyRadius(slots);

  it('mọi vị trí con trỏ dọc thanh (bước 1px, quá hai đầu một bán kính): khe giữ nguyên, mép ngoài = mép vỏ đã nở', () => {
    const start = slots[0].center - radius - 40;
    const end = slots[slots.length - 1].center + radius + 40;
    for (let p = start; p <= end; p += 1) {
      expectNoOverlap(slots, dockMagnifyTargets(slots, p, radius));
    }
  });

  it('mọi bộ hệ số ĐANG TRÔI (ngẫu nhiên 1…1,6, cỡ ô lẫn lộn) cũng không chồng', () => {
    let seed = 7;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let run = 0; run < 300; run++) {
      const specs = Array.from({ length: 3 + Math.floor(random() * 8) }, () => ({
        size: 20 + random() * 40,
        magnifies: random() > 0.15,
      }));
      const mixed = buildSlots(specs, random() * 10);
      const scales = mixed.map((slot) => (slot.magnifies ? 1 + random() * 0.6 : 1));
      expectNoOverlap(mixed, scales);
    }
  });

  it('nở chia đều hai đầu quanh tâm thanh: dời đầu = −grow/2 + nửa phần nở của nó, phần tử sau cùng không phóng dời +grow/2', () => {
    const scales = dockMagnifyTargets(slots, slots[1].center, radius);
    const { shifts, grow } = dockMagnifyLayout(slots, scales);
    expect(grow).toBeGreaterThan(0);
    expect(shifts[0]).toBeCloseTo(-grow / 2 + ((scales[0] - 1) * slots[0].size) / 2, 6);
    expect(shifts[7]).toBeCloseTo(grow / 2 - (scales[8] - 1) * slots[8].size, 6);
  });

  it('con trỏ ngay tâm ô (dãy đối xứng) → ô đó đứng yên dưới con trỏ', () => {
    const symmetric = buildSlots(
      Array.from({ length: 7 }, () => ({ size: 44 })),
      DOCK_GAP,
    );
    const scales = dockMagnifyTargets(symmetric, symmetric[3].center, dockMagnifyRadius(symmetric));
    expect(dockMagnifyLayout(symmetric, scales).shifts[3]).toBeCloseTo(0, 6);
  });

  it('hệ số toàn 1 → không dời, vỏ không nở', () => {
    const { shifts, grow } = dockMagnifyLayout(
      slots,
      slots.map(() => 1),
    );
    expect(grow).toBe(0);
    shifts.forEach((shift) => expect(shift).toBeCloseTo(0, 12));
  });
});

describe('dockMagnifyFit — vỏ không nở quá mép màn', () => {
  const slots = buildSlots(DOCK_SPECS, DOCK_GAP);
  const scales = dockMagnifyTargets(slots, slots[3].center, dockMagnifyRadius(slots));

  it('tổng nở vượt `maxGrow` → thu đều về đúng `maxGrow`, vẫn không chồng', () => {
    const fitted = dockMagnifyFit(scales, slots, 20);
    expect(dockMagnifyLayout(slots, fitted).grow).toBeCloseTo(20, 6);
    expect(fitted[3]).toBeGreaterThan(fitted[2]);
    expectNoOverlap(slots, fitted);
  });

  it('còn chỗ → giữ nguyên; hết chỗ (maxGrow ≤ 0) → về 1', () => {
    expect(dockMagnifyFit(scales, slots, 10_000)).toEqual(scales);
    expect(dockMagnifyFit(scales, slots, 0).every((scale) => scale === 1)).toBe(true);
  });
});

describe('dockMagnifyEase — trôi mượt, không vọt lố', () => {
  it('tiến dần về đích theo từng khung 16ms, không bao giờ vượt quá', () => {
    let value = 1;
    let steps = 0;
    while (value !== 1.5 && steps < 200) {
      const next = dockMagnifyEase(value, 1.5, 16);
      expect(next).toBeGreaterThan(value);
      expect(next).toBeLessThanOrEqual(1.5);
      value = next;
      steps++;
    }
    expect(value).toBe(1.5);
    expect(steps).toBeGreaterThan(5);
    expect(steps).toBeLessThan(40);
  });

  it('dt = 0 → đứng yên; đủ gần đích → chốt bằng đích', () => {
    expect(dockMagnifyEase(1.2, 1.5, 0)).toBe(1.2);
    expect(dockMagnifyEase(1.4999, 1.5, 16)).toBe(1.5);
  });
});
