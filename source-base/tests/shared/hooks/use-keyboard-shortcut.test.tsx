/**
 * `useKeyboardShortcut` — MỘT luật phím tắt cho mọi hook bàn phím (`useSaveShortcut`, `useTvEscapeHatch`,
 * `useCommandPaletteShortcut`, Esc của `useExpandToViewport`); trước đây mỗi hook một luật riêng (khớp `code` hay
 * `key`, nghe `window` hay `document`, có / không bỏ qua ô nhập).
 */

import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  useExpandToViewport,
  useKeyboardShortcut,
  useSaveShortcut,
  useTvEscapeHatch,
} from '@/shared/hooks';

afterEach(() => {
  document.body.innerHTML = '';
});

const press = (init: KeyboardEventInit, target: EventTarget = window) => {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
};

describe('useKeyboardShortcut — luật chung', () => {
  it('khớp ĐÚNG tổ hợp: thiếu hay thừa phím bổ trợ đều không chạy', () => {
    const onTrigger = vi.fn();
    renderHook(() => useKeyboardShortcut({ code: 'KeyK', mods: ['mod'], onTrigger }));

    press({ code: 'KeyK', key: 'k' });
    press({ code: 'KeyK', key: 'K', ctrlKey: true, shiftKey: true });
    expect(onTrigger).not.toHaveBeenCalled();

    press({ code: 'KeyK', key: 'k', ctrlKey: true });
    press({ code: 'KeyK', key: 'k', metaKey: true });
    expect(onTrigger).toHaveBeenCalledTimes(2);
  });

  it('chữ cái khớp cả `key` khi bàn phím không phát `code`; mặc định gọi `preventDefault()`', () => {
    const onTrigger = vi.fn();
    renderHook(() => useKeyboardShortcut({ code: 'KeyS', mods: ['mod'], onTrigger }));

    const event = press({ key: 's', ctrlKey: true });
    expect(onTrigger).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('`ignoreWhileTyping` bỏ qua khi tiêu điểm ở ô nhập', () => {
    const onTrigger = vi.fn();
    renderHook(() => useKeyboardShortcut({ code: 'KeyT', ignoreWhileTyping: true, onTrigger }));
    const input = document.body.appendChild(document.createElement('input'));

    press({ code: 'KeyT', key: 't' }, input);
    expect(onTrigger).not.toHaveBeenCalled();

    press({ code: 'KeyT', key: 't' }, document.body);
    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it('`capture` bắt cả khi phần tử con đã `stopPropagation()`', () => {
    const onTrigger = vi.fn();
    renderHook(() =>
      useKeyboardShortcut({ code: 'KeyS', mods: ['mod'], capture: true, onTrigger }),
    );
    const box = document.body.appendChild(document.createElement('div'));
    box.addEventListener('keydown', (e) => e.stopPropagation());

    press({ code: 'KeyS', key: 's', ctrlKey: true }, box);
    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it('`enabled: false` không gắn listener', () => {
    const onTrigger = vi.fn();
    renderHook(() => useKeyboardShortcut({ code: 'Escape', enabled: false, onTrigger }));
    press({ code: 'Escape', key: 'Escape' });
    expect(onTrigger).not.toHaveBeenCalled();
  });
});

describe('lớp bọc mỏng giữ hành vi cũ', () => {
  it('useSaveShortcut: Ctrl+S lưu kể cả khi đang gõ; `canSave=false` vẫn nuốt phím', () => {
    const onSave = vi.fn();
    const { rerender } = renderHook(({ canSave }) => useSaveShortcut(onSave, { canSave }), {
      initialProps: { canSave: true },
    });
    const input = document.body.appendChild(document.createElement('input'));

    press({ code: 'KeyS', key: 's', ctrlKey: true }, input);
    expect(onSave).toHaveBeenCalledTimes(1);

    rerender({ canSave: false });
    const event = press({ code: 'KeyS', key: 's', ctrlKey: true });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('useTvEscapeHatch: Ctrl/⌘ + Alt + Shift + T, bỏ qua khi đang gõ', () => {
    const onEscape = vi.fn();
    renderHook(() => useTvEscapeHatch(onEscape));
    const input = document.body.appendChild(document.createElement('textarea'));

    press({ code: 'KeyT', ctrlKey: true, altKey: true, shiftKey: true }, input);
    press({ code: 'KeyT', ctrlKey: true, altKey: true });
    expect(onEscape).not.toHaveBeenCalled();

    press({ code: 'KeyT', metaKey: true, altKey: true, shiftKey: true }, document.body);
    expect(onEscape).toHaveBeenCalledTimes(1);
  });
});

describe('useExpandToViewport — Esc thu nhỏ, nhường dialog đang mở', () => {
  it('Esc thu nhỏ khi đang phóng; dialog đang mở thì giữ nguyên', () => {
    const { result } = renderHook(() => useExpandToViewport());
    act(() => result.current.toggle());
    expect(result.current.expanded).toBe(true);

    const { unmount } = render(<div data-state="open" role="dialog" />);
    press({ code: 'Escape', key: 'Escape' });
    expect(result.current.expanded).toBe(true);

    unmount();
    fireEvent.keyDown(window, { code: 'Escape', key: 'Escape' });
    expect(result.current.expanded).toBe(false);
  });
});
