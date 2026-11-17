/**
 * Phân nhóm màn của Responsive lab (`classifyViewport`) khớp thang chuẩn `responsive-screens.md §1`.
 *
 * Đi qua CHÍNH bảng thiết bị mà lab hiển thị (`DEMO_DEVICE_GROUPS`): mỗi viewport phải rơi đúng nhóm khi
 * `phone:` / `touch:` được tính như CSS thật. Hai ca lệch nhóm trong bảng là có chủ ý và được khoá riêng ở
 * dưới — lỗi ở đó nghĩa là cổng của code đổi, không phải bảng sai.
 */

import { describe, expect, it } from 'vitest';

import { DEMO_DEVICE_GROUPS } from '@/features/demo/library/constants/foundations/responsive-lab.constants';
import { classifyViewport } from '@/features/demo/library/utils/viewport-group.utils';

/** `phone:` đúng như `variants.css`: rộng < 768 HOẶC (cao ≤ 540 và rộng < 1024). */
const isPhone = (w: number, h: number) => w < 768 || (h <= 540 && w < 1024);

/** Nhóm nào được coi là chạm ngón tay (iPad, điện thoại) — laptop / màn ngoài dùng chuột. */
const TOUCH_GROUPS = new Set([
  'phone-portrait',
  'phone-landscape',
  'tablet-portrait',
  'tablet-landscape',
]);

/** Viewport trong bảng nhưng theo cổng của code thuộc nhóm khác tên nhóm hiển thị. */
const GATE_EXCEPTIONS: Record<string, string> = {
  '744x1133': 'phone-portrait',
  '1536x864': 'laptop-16',
};

describe('classifyViewport — mọi viewport của bảng thiết bị', () => {
  const rows = DEMO_DEVICE_GROUPS.flatMap((group) =>
    group.viewports.map((v) => ({ group, ...v, key: `${v.width}x${v.height}` })),
  );

  it('bảng có đủ thiết bị để kiểm', () => {
    expect(rows.length).toBeGreaterThan(30);
  });

  it.each(rows)('$width×$height ($group.label) rơi đúng nhóm', ({ group, width, height, key }) => {
    const result = classifyViewport({
      width,
      height,
      isPhone: isPhone(width, height),
      isTouch: TOUCH_GROUPS.has(group.id),
    });
    expect(result.id).toBe(GATE_EXCEPTIONS[key] ?? group.id);
  });

  it('iPad Pro ngang 1366 (chạm) là tablet, laptop 14" 1366 (chuột) là laptop — chỉ `touch:` tách được', () => {
    expect(classifyViewport({ width: 1366, height: 1024, isPhone: false, isTouch: true }).id).toBe(
      'tablet-landscape',
    );
    expect(classifyViewport({ width: 1366, height: 768, isPhone: false, isTouch: false }).id).toBe(
      'laptop-14',
    );
  });

  it('màn ngoài ≥ 1800 luôn là màn ngoài, kể cả khi trình duyệt TV báo cảm ứng', () => {
    expect(classifyViewport({ width: 1920, height: 1080, isPhone: false, isTouch: true }).id).toBe(
      'external',
    );
  });
});
