/**
 * `useLatestRequest` — hợp đồng "chỉ lượt MỚI NHẤT được ghi state":
 * `begin()` vô hiệu mọi lượt cũ, `invalidate()` vô hiệu tất cả, unmount tự vô hiệu.
 */

import { renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, expect, it } from 'vitest';

import { useLatestRequest } from '@/shared/hooks';

describe('useLatestRequest', () => {
  it('lượt vừa bắt đầu là lượt hiện tại', () => {
    const { result } = renderHook(() => useLatestRequest());
    const isCurrent = result.current.begin();
    expect(isCurrent()).toBe(true);
  });

  it('bắt đầu lượt mới thì lượt cũ hết hiệu lực, lượt mới còn hiệu lực', () => {
    const { result } = renderHook(() => useLatestRequest());
    const first = result.current.begin();
    const second = result.current.begin();
    expect(first()).toBe(false);
    expect(second()).toBe(true);
  });

  it('lượt cũ về sau lượt mới vẫn bị bỏ qua (thứ tự hoàn thành không đổi kết quả)', () => {
    const { result } = renderHook(() => useLatestRequest());
    const slow = result.current.begin();
    const fast = result.current.begin();
    expect([fast(), slow()]).toEqual([true, false]);
  });

  it('invalidate() vô hiệu mọi lượt đang chờ, lượt bắt đầu SAU đó vẫn dùng được', () => {
    const { result } = renderHook(() => useLatestRequest());
    const a = result.current.begin();
    result.current.invalidate();
    const b = result.current.begin();
    expect(a()).toBe(false);
    expect(b()).toBe(true);
    result.current.invalidate();
    expect(b()).toBe(false);
  });

  it('unmount vô hiệu mọi lượt đang chờ', () => {
    const { result, unmount } = renderHook(() => useLatestRequest());
    const pending = result.current.begin();
    unmount();
    expect(pending()).toBe(false);
  });

  it('begin() gọi sau khi đã unmount trả về checker luôn false', () => {
    const { result, unmount } = renderHook(() => useLatestRequest());
    const { begin } = result.current;
    unmount();
    expect(begin()()).toBe(false);
  });

  it('begin / invalidate giữ nguyên identity qua các lần render', () => {
    const { result, rerender } = renderHook(() => useLatestRequest());
    const { begin, invalidate } = result.current;
    rerender();
    expect(result.current.begin).toBe(begin);
    expect(result.current.invalidate).toBe(invalidate);
  });

  it('StrictMode (mount → unmount giả → mount) không làm hỏng hook', () => {
    const { result } = renderHook(() => useLatestRequest(), { wrapper: StrictMode });
    const isCurrent = result.current.begin();
    expect(isCurrent()).toBe(true);
  });
});
