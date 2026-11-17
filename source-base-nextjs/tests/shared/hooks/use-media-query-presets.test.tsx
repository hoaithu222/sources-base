/**
 * Preset media query của `shared/hooks/browser` — `useIsPhone` · `useIsBelowWide` · `useIsCoarsePointer`.
 *
 * Mỗi preset là bản JS của một biến thể CSS (`phone:` · `max-wide:` · `touch:`): hook phải hỏi ĐÚNG chuỗi query
 * trong `media-query.constants.ts`, trả đúng ở khung hình đầu (không nháy bố cục desktop) và cập nhật khi
 * viewport đổi. Khớp từng chữ giữa hằng và CSS do `policy/display/responsive-foundation` giữ.
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BELOW_WIDE_QUERY,
  PHONE_MEDIA_QUERY,
  TOUCH_MEDIA_QUERY,
} from '@/shared/constants/media-query.constants';
import { useIsBelowWide, useIsCoarsePointer, useIsPhone, useMediaQuery } from '@/shared/hooks';

type Listener = (event: MediaQueryListEvent) => void;

/** `matchMedia` giả: query nằm trong `matching` thì khớp; `setMatching` bắn `change` cho mọi listener đã đăng ký. */
function installMatchMedia(initial: string[]) {
  let matching = new Set(initial);
  const listeners = new Map<string, Set<Listener>>();
  const asked: string[] = [];

  window.matchMedia = vi.fn((query: string) => {
    asked.push(query);
    return {
      get matches() {
        return matching.has(query);
      },
      media: query,
      onchange: null,
      addEventListener: (_: string, fn: Listener) => {
        listeners.set(query, (listeners.get(query) ?? new Set()).add(fn));
      },
      removeEventListener: (_: string, fn: Listener) => listeners.get(query)?.delete(fn),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;
  });

  return {
    asked,
    listenerCount: (query: string) => listeners.get(query)?.size ?? 0,
    setMatching(next: string[]) {
      matching = new Set(next);
      for (const [query, fns] of listeners) {
        fns.forEach((fn) =>
          fn({ matches: matching.has(query), media: query } as MediaQueryListEvent),
        );
      }
    },
  };
}

const original = window.matchMedia;

beforeEach(() => {
  window.matchMedia = original;
});

afterEach(() => {
  window.matchMedia = original;
  vi.restoreAllMocks();
});

describe('useIsPhone', () => {
  it('hỏi đúng PHONE_MEDIA_QUERY (cùng điều kiện biến thể `phone:`)', () => {
    const mq = installMatchMedia([]);
    renderHook(() => useIsPhone());
    expect(mq.asked).toContain(PHONE_MEDIA_QUERY);
  });

  it('khung hình đầu đã đúng: khớp → true ngay, không qua một lượt render sai', () => {
    installMatchMedia([PHONE_MEDIA_QUERY]);
    const seen: boolean[] = [];
    renderHook(() => {
      const value = useIsPhone();
      seen.push(value);
      return value;
    });
    expect(seen[0]).toBe(true);
  });

  it('không khớp (tablet / laptop) → false', () => {
    installMatchMedia([BELOW_WIDE_QUERY, TOUCH_MEDIA_QUERY]);
    expect(renderHook(() => useIsPhone()).result.current).toBe(false);
  });

  it('xoay máy / đổi cỡ cửa sổ: nhận `change` rồi cập nhật; gỡ listener khi unmount', () => {
    const mq = installMatchMedia([]);
    const { result, unmount } = renderHook(() => useIsPhone());
    expect(result.current).toBe(false);

    act(() => mq.setMatching([PHONE_MEDIA_QUERY]));
    expect(result.current).toBe(true);

    act(() => mq.setMatching([]));
    expect(result.current).toBe(false);

    unmount();
    expect(mq.listenerCount(PHONE_MEDIA_QUERY)).toBe(0);
  });
});

describe('useIsBelowWide', () => {
  it('hỏi đúng BELOW_WIDE_QUERY; laptop / tablet → true, màn ngoài ≥ 1800px → false', () => {
    const mq = installMatchMedia([BELOW_WIDE_QUERY]);
    const { result } = renderHook(() => useIsBelowWide());
    expect(mq.asked).toContain(BELOW_WIDE_QUERY);
    expect(result.current).toBe(true);

    act(() => mq.setMatching([]));
    expect(result.current).toBe(false);
  });
});

describe('useIsCoarsePointer', () => {
  it('hỏi đúng TOUCH_MEDIA_QUERY (cùng điều kiện biến thể `touch:`)', () => {
    const mq = installMatchMedia([TOUCH_MEDIA_QUERY]);
    const { result } = renderHook(() => useIsCoarsePointer());
    expect(mq.asked).toContain(TOUCH_MEDIA_QUERY);
    expect(result.current).toBe(true);
  });

  it('PC / iPad cắm bàn phím có con trỏ → false, dù màn hẹp (chạm ≠ hẹp)', () => {
    installMatchMedia([PHONE_MEDIA_QUERY, BELOW_WIDE_QUERY]);
    expect(renderHook(() => useIsCoarsePointer()).result.current).toBe(false);
  });
});

describe('useMediaQuery — phòng môi trường không có matchMedia', () => {
  it('thiếu `window.matchMedia` → false, không ném lỗi', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    const { result } = renderHook(() => useMediaQuery(PHONE_MEDIA_QUERY));
    expect(result.current).toBe(false);
  });
});
