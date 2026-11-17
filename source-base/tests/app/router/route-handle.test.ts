/**
 * `resolvePageTitle` — tiêu đề của trang đang đứng lấy từ `meta` của route khớp sâu nhất có tiêu đề
 * (trang giữ chỗ của phân hệ dùng nó), không có bảng tiêu đề thứ hai.
 */

import { describe, expect, it } from 'vitest';

import { resolvePageTitle, type RouteMatchLike } from '@/app/router/definition';

const match = (handle: unknown): RouteMatchLike => ({ pathname: '/', params: {}, handle });

describe('resolvePageTitle', () => {
  it('lấy tiêu đề của route SÂU nhất có khai `title`', () => {
    expect(resolvePageTitle([match({ title: 'Báo cáo' }), match({ title: 'Tạo báo cáo' })])).toBe(
      'Tạo báo cáo',
    );
  });

  it('route con không khai `meta` (trang index) → dùng tiêu đề của route cha', () => {
    expect(resolvePageTitle([match({ title: 'Báo cáo' }), match({ id: 'report.index' })])).toBe(
      'Báo cáo',
    );
  });

  it('không route nào có tiêu đề (route gốc không có `handle`) → undefined', () => {
    expect(resolvePageTitle([match(undefined), match({})])).toBeUndefined();
  });
});
