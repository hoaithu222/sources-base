/**
 * `entry-grid.utils` — Enter / Shift+Enter đi DỌC theo cột trong bảng nhập (kiểu bảng tính). Lỗi cần chặn: chặn Enter
 * lúc đang gõ IME (Telex chốt chữ bằng Enter → mất dấu) và nhảy sang sai cột khi dòng có ô không phải ô nhập.
 */

import { afterEach, describe, expect, it } from 'vitest';
import type { KeyboardEvent } from 'react';

import { focusEntryCell, handleEntryGridKeyDown } from '@/shared/utils/browser/entry-grid.utils';

function mountTable() {
  document.body.innerHTML = `
    <table><tbody>
      <tr><td>1</td><td><input data-id="a1" /></td><td><input data-id="b1" /></td></tr>
      <tr><td>2</td><td><input data-id="a2" /></td><td><button data-id="b2">ĐVT</button></td></tr>
      <tr><td>3</td><td><input data-id="a3" disabled /></td><td><input data-id="b3" /></td></tr>
    </tbody></table>`;
  const get = (id: string) => document.querySelector<HTMLElement>(`[data-id="${id}"]`)!;
  return get;
}

const keyEvent = (target: HTMLElement, init: Partial<KeyboardEvent> & { composing?: boolean }) => {
  let prevented = false;
  const event = {
    key: 'Enter',
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    ...init,
    target,
    nativeEvent: { isComposing: init.composing ?? false, keyCode: 13 },
    preventDefault: () => {
      prevented = true;
    },
  } as unknown as KeyboardEvent;
  return { event, isPrevented: () => prevented };
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('focusEntryCell', () => {
  it('xuống ô CÙNG CỘT dòng dưới (input) và trả true', () => {
    const get = mountTable();
    expect(focusEntryCell(get('a1'), 1)).toBe(true);
    expect(document.activeElement).toBe(get('a2'));
  });

  it('ô dòng dưới là trigger (button) vẫn nhận focus — Dropdown / DatePicker', () => {
    const get = mountTable();
    focusEntryCell(get('b1'), 1);
    expect(document.activeElement).toBe(get('b2'));
  });

  it('ô bị khoá (disabled) không nhận focus → false, focus giữ nguyên', () => {
    const get = mountTable();
    get('a2').focus();
    expect(focusEntryCell(get('a2'), 1)).toBe(false);
    expect(document.activeElement).toBe(get('a2'));
  });

  it('dòng đầu / dòng cuối → false', () => {
    const get = mountTable();
    expect(focusEntryCell(get('a1'), -1)).toBe(false);
    expect(focusEntryCell(get('b3'), 1)).toBe(false);
  });
});

describe('handleEntryGridKeyDown', () => {
  it('Enter ↓ · Shift+Enter ↑ và chặn mặc định khi đã chuyển', () => {
    const get = mountTable();
    const down = keyEvent(get('b1'), {});
    handleEntryGridKeyDown(down.event);
    expect(document.activeElement).toBe(get('b2'));
    expect(down.isPrevented()).toBe(true);

    const up = keyEvent(get('a2'), { shiftKey: true });
    handleEntryGridKeyDown(up.event);
    expect(document.activeElement).toBe(get('a1'));
  });

  it('⛔ đang gõ IME (Telex) → KHÔNG đụng tới phím Enter', () => {
    const get = mountTable();
    get('a1').focus();
    const ime = keyEvent(get('a1'), { composing: true });
    handleEntryGridKeyDown(ime.event);
    expect(document.activeElement).toBe(get('a1'));
    expect(ime.isPrevented()).toBe(false);
  });

  it('Ctrl+Enter (lưu dòng) và phím khác không bị bắt', () => {
    const get = mountTable();
    get('a1').focus();
    handleEntryGridKeyDown(keyEvent(get('a1'), { ctrlKey: true }).event);
    handleEntryGridKeyDown(keyEvent(get('a1'), { key: 'Tab' }).event);
    expect(document.activeElement).toBe(get('a1'));
  });
});
