/**
 * `useLocalStorage` — ba lỗi của bản trước, mỗi lỗi một nhóm ca kiểm:
 *  - đổi `key` mà hook vẫn giữ giá trị của khoá CŨ (`useState` chỉ khởi tạo một lần);
 *  - `localStorage.setItem` nằm TRONG updater của `setState` — updater phải thuần, StrictMode gọi hai lần;
 *  - JSON đọc ra được ép kiểu `T` mà không kiểm (`options.parse` để caller tự kiểm).
 */

import { act, renderHook } from '@testing-library/react';
import { StrictMode, useEffect } from 'react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLocalStorage } from '@/shared/hooks';

const Strict = ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>;

const stored = (key: string) => localStorage.getItem(key);

/** jsdom: `Storage` thật chỉ chặn được ở prototype (gán lên instance rơi vào named setter); kho bộ nhớ của `setup.ts` thì chặn ở instance. */
const spyStorage = (method: 'getItem' | 'setItem' | 'removeItem') =>
  vi.spyOn(Object.hasOwn(localStorage, method) ? localStorage : Storage.prototype, method);

const failWith = (name: string) => () => {
  throw new DOMException('bị chặn', name);
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('đọc khi mount', () => {
  it('chưa có khoá → trả `initialValue`, không ghi gì xuống kho', () => {
    const setItem = spyStorage('setItem');
    const { result } = renderHook(() => useLocalStorage('k', 7));

    expect(result.current[0]).toBe(7);
    expect(setItem).not.toHaveBeenCalled();
  });

  it('có khoá → trả giá trị đã lưu', () => {
    localStorage.setItem('k', JSON.stringify({ n: 3 }));
    const { result } = renderHook(() => useLocalStorage('k', { n: 0 }));

    expect(result.current[0]).toEqual({ n: 3 });
  });

  it('JSON hỏng → `initialValue`, không ném lỗi', () => {
    localStorage.setItem('k', '{hỏng');
    const { result } = renderHook(() => useLocalStorage('k', 7));

    expect(result.current[0]).toBe(7);
  });

  it('⛔ kho chặn đọc (SecurityError) → `initialValue`, hook vẫn dựng được', () => {
    spyStorage('getItem').mockImplementation(failWith('SecurityError'));

    expect(() => renderHook(() => useLocalStorage('k', 7))).not.toThrow();
  });
});

describe('`options.parse` — kiểm giá trị đọc từ kho', () => {
  const asNumber = (raw: unknown) => (typeof raw === 'number' ? raw : undefined);

  it('⛔ `parse` trả `undefined` → `initialValue`, không dùng giá trị sai kiểu', () => {
    localStorage.setItem('k', JSON.stringify('không phải số'));
    const { result } = renderHook(() => useLocalStorage<number>('k', 7, { parse: asNumber }));

    expect(result.current[0]).toBe(7);
  });

  it('`parse` nhận giá trị đã `JSON.parse` và kết quả của nó được dùng (chuẩn hoá)', () => {
    localStorage.setItem('k', JSON.stringify(250));
    const parse = vi.fn((raw: unknown) =>
      typeof raw === 'number' ? Math.min(raw, 100) : undefined,
    );
    const { result } = renderHook(() => useLocalStorage<number>('k', 7, { parse }));

    expect(parse).toHaveBeenCalledWith(250);
    expect(result.current[0]).toBe(100);
  });

  it('`parse` ném lỗi → `initialValue`', () => {
    localStorage.setItem('k', JSON.stringify(1));
    const parse = () => {
      throw new Error('hỏng');
    };
    const { result } = renderHook(() => useLocalStorage<number>('k', 7, { parse }));

    expect(result.current[0]).toBe(7);
  });

  it('chưa có khoá → không gọi `parse`', () => {
    const parse = vi.fn(asNumber);
    renderHook(() => useLocalStorage<number>('k', 7, { parse }));

    expect(parse).not.toHaveBeenCalled();
  });

  it('`parse` cũng áp khi đổi key', () => {
    localStorage.setItem('a', JSON.stringify(1));
    localStorage.setItem('b', JSON.stringify('rác'));
    const { result, rerender } = renderHook(
      ({ k }) => useLocalStorage<number>(k, 7, { parse: asNumber }),
      { initialProps: { k: 'a' } },
    );
    expect(result.current[0]).toBe(1);

    rerender({ k: 'b' });
    expect(result.current[0]).toBe(7);
  });
});

describe('đổi key', () => {
  it('⛔ đổi key → đọc lại giá trị của khoá MỚI', () => {
    localStorage.setItem('a', JSON.stringify(1));
    localStorage.setItem('b', JSON.stringify(2));
    const { result, rerender } = renderHook(({ k }) => useLocalStorage(k, 0), {
      initialProps: { k: 'a' },
    });
    expect(result.current[0]).toBe(1);

    rerender({ k: 'b' });
    expect(result.current[0]).toBe(2);
  });

  it('⛔ đổi sang khoá chưa có → `initialValue`, không mang giá trị của khoá cũ', () => {
    localStorage.setItem('a', JSON.stringify(1));
    const { result, rerender } = renderHook(({ k }) => useLocalStorage(k, 0), {
      initialProps: { k: 'a' },
    });

    rerender({ k: 'chua-co' });
    expect(result.current[0]).toBe(0);
  });

  it('không có khung hình nào còn giá trị của khoá cũ sau khi đổi key', () => {
    localStorage.setItem('a', JSON.stringify('của-A'));
    localStorage.setItem('b', JSON.stringify('của-B'));
    const seen: string[] = [];
    const { rerender } = renderHook(
      ({ k }) => {
        const [value] = useLocalStorage(k, '');
        seen.push(value);
      },
      { initialProps: { k: 'a' } },
    );

    seen.length = 0;
    rerender({ k: 'b' });
    expect(seen.length).toBeGreaterThan(0);
    expect(seen).not.toContain('của-A');
  });

  it('⛔ `setValue` sau khi đổi key ghi vào khoá MỚI, không đụng khoá cũ', () => {
    localStorage.setItem('a', JSON.stringify(1));
    const { result, rerender } = renderHook(({ k }) => useLocalStorage(k, 0), {
      initialProps: { k: 'a' },
    });

    rerender({ k: 'b' });
    act(() => result.current[1](5));

    expect(stored('b')).toBe('5');
    expect(stored('a')).toBe('1');
  });

  it('đổi key rồi quay lại → thấy giá trị đã ghi ở khoá đó', () => {
    const { result, rerender } = renderHook(({ k }) => useLocalStorage(k, 0), {
      initialProps: { k: 'a' },
    });
    act(() => result.current[1](9));

    rerender({ k: 'b' });
    expect(result.current[0]).toBe(0);

    rerender({ k: 'a' });
    expect(result.current[0]).toBe(9);
  });

  it('đổi key không ghi gì xuống kho', () => {
    localStorage.setItem('a', JSON.stringify(1));
    const { rerender } = renderHook(({ k }) => useLocalStorage(k, 0), { initialProps: { k: 'a' } });
    const setItem = spyStorage('setItem');

    rerender({ k: 'b' });
    expect(setItem).not.toHaveBeenCalled();
  });
});

describe('ghi', () => {
  it('`setValue(giá trị)` đổi state và ghi JSON xuống khoá hiện tại', () => {
    const { result } = renderHook(() => useLocalStorage('k', { n: 0 }));

    act(() => result.current[1]({ n: 4 }));

    expect(result.current[0]).toEqual({ n: 4 });
    expect(stored('k')).toBe('{"n":4}');
  });

  it('⛔ hai `setValue((v) => v + 1)` cùng một tick → cộng dồn, hàm thứ hai thấy kết quả của hàm đầu', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0));

    act(() => {
      result.current[1]((v) => v + 1);
      result.current[1]((v) => v + 1);
    });

    expect(result.current[0]).toBe(2);
    expect(stored('k')).toBe('2');
  });

  it('`setValue((prev) => next)` thấy giá trị đã lưu từ phiên trước', () => {
    localStorage.setItem('k', JSON.stringify(10));
    const { result } = renderHook(() => useLocalStorage('k', 0));

    act(() => result.current[1]((v) => v + 1));

    expect(result.current[0]).toBe(11);
  });

  it('`setValue((prev) => next)` thấy giá trị mới nhất sau một lần đổi trước đó', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0));

    act(() => result.current[1](5));
    act(() => result.current[1]((v) => v * 2));

    expect(result.current[0]).toBe(10);
  });

  it('⛔ StrictMode: `setItem` chỉ chạy ĐÚNG MỘT lần cho mỗi `setValue`', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0), { wrapper: Strict });
    const setItem = spyStorage('setItem');

    act(() => result.current[1](1));
    expect(setItem).toHaveBeenCalledTimes(1);

    act(() => result.current[1]((v) => v + 1));
    expect(setItem).toHaveBeenCalledTimes(2);
    expect(stored('k')).toBe('2');
  });

  it('⛔ StrictMode: hàm `(prev) => next` của người dùng chỉ chạy một lần mỗi `setValue`', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0), { wrapper: Strict });
    const updater = vi.fn((v: number) => v + 1);

    act(() => result.current[1](updater));

    expect(updater).toHaveBeenCalledTimes(1);
    expect(result.current[0]).toBe(1);
  });

  it('StrictMode: hai `setValue(v => v + 1)` cùng tick vẫn ra 2, ghi hai lần', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0), { wrapper: Strict });
    const setItem = spyStorage('setItem');

    act(() => {
      result.current[1]((v) => v + 1);
      result.current[1]((v) => v + 1);
    });

    expect(result.current[0]).toBe(2);
    expect(setItem).toHaveBeenCalledTimes(2);
    expect(stored('k')).toBe('2');
  });

  it('⛔ hết quota (`setItem` ném) → giá trị trong bộ nhớ vẫn đổi, không ném lỗi', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0));
    spyStorage('setItem').mockImplementation(failWith('QuotaExceededError'));

    expect(() => act(() => result.current[1](5))).not.toThrow();
    expect(result.current[0]).toBe(5);

    act(() => result.current[1]((v) => v + 1));
    expect(result.current[0]).toBe(6);
  });

  it('giá trị không serialize được (vòng tham chiếu) → bộ nhớ vẫn đổi, không ném lỗi', () => {
    const { result } = renderHook(() => useLocalStorage<object>('k', {}));
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;

    expect(() => act(() => result.current[1](cyclic))).not.toThrow();
    expect(result.current[0]).toBe(cyclic);
  });

  it('`setValue` với giá trị y hệt giá trị hiện tại không gây vòng render (effect không deps vẫn dừng)', () => {
    const renders = vi.fn();
    renderHook(() => {
      const [, setValue] = useLocalStorage('k', 0);
      renders();
      useEffect(() => {
        if (renders.mock.calls.length < 30) setValue(1);
      });
    });

    expect(renders.mock.calls.length).toBeLessThan(10);
  });

  it('`setValue` giữ nguyên danh tính giữa các render (kể cả `initialValue` là literal mới mỗi lần)', () => {
    const { result, rerender } = renderHook(() => useLocalStorage('k', { n: 0 }));
    const [, setValue, removeValue] = result.current;

    act(() => setValue({ n: 1 }));
    rerender();

    expect(result.current[1]).toBe(setValue);
    expect(result.current[2]).toBe(removeValue);
  });
});

describe('`removeValue`', () => {
  it('xoá khoá hiện tại và trả về `initialValue`', () => {
    localStorage.setItem('k', JSON.stringify(5));
    const { result } = renderHook(() => useLocalStorage('k', 0));

    act(() => result.current[2]());

    expect(result.current[0]).toBe(0);
    expect(stored('k')).toBeNull();
  });

  it('⛔ sau khi đổi key, xoá khoá MỚI và để nguyên khoá cũ', () => {
    localStorage.setItem('a', JSON.stringify(1));
    localStorage.setItem('b', JSON.stringify(2));
    const { result, rerender } = renderHook(({ k }) => useLocalStorage(k, 0), {
      initialProps: { k: 'a' },
    });

    rerender({ k: 'b' });
    act(() => result.current[2]());

    expect(stored('b')).toBeNull();
    expect(stored('a')).toBe('1');
    expect(result.current[0]).toBe(0);
  });

  it('`removeItem` ném lỗi → vẫn đưa state về `initialValue`, không ném', () => {
    localStorage.setItem('k', JSON.stringify(5));
    const { result } = renderHook(() => useLocalStorage('k', 0));
    spyStorage('removeItem').mockImplementation(failWith('SecurityError'));

    expect(() => act(() => result.current[2]())).not.toThrow();
    expect(result.current[0]).toBe(0);
  });

  it('sau `removeValue`, `setValue` ghi lại bình thường', () => {
    localStorage.setItem('k', JSON.stringify(5));
    const { result } = renderHook(() => useLocalStorage('k', 0));

    act(() => result.current[2]());
    act(() => result.current[1]((v) => v + 3));

    expect(result.current[0]).toBe(3);
    expect(stored('k')).toBe('3');
  });
});
