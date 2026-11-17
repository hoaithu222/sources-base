/**
 * `useFormDraft` — vòng đời bản nháp.
 *
 * Ba lỗi của bản trước, mỗi lỗi một ca kiểm:
 *  - đổi `key` mà vẫn ghi vào nháp của khoá CŨ;
 *  - `clear()` xong, lượt lưu đang chờ debounce chạy tiếp và tạo lại nháp;
 *  - storage ném lỗi (chặn lưu trữ / hết dung lượng) làm sập form.
 */

import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useFormDraft } from '@/shared/ui';
import type { UseFormDraftOptions } from '@/shared/ui';

interface Values {
  name: string;
  password: string;
}

const DEFAULTS: Values = { name: '', password: '' };
const DEBOUNCE = 3000;

type Extra = Partial<Omit<UseFormDraftOptions<Values>, 'form' | 'key'>>;

function renderDraft(initialKey: string, extra: Extra = {}) {
  return renderHook(
    ({ draftKey }: { draftKey: string }) => {
      const form = useForm<Values>({ defaultValues: DEFAULTS });
      // Đọc `isDirty` lúc render để react-hook-form theo dõi cờ này — giống mọi form thật.
      void form.formState.isDirty;
      const draft = useFormDraft({ key: draftKey, form, ...extra });
      return { form, draft };
    },
    { initialProps: { draftKey: initialKey } },
  );
}

const stored = (key: string): { v: number; t: number; data: Partial<Values> } | null => {
  const raw = localStorage.getItem(`form-draft:${key}`);
  return raw === null ? null : JSON.parse(raw);
};

const seed = (key: string, data: Partial<Values>, envelope: { v?: number; t?: number } = {}) =>
  localStorage.setItem(
    `form-draft:${key}`,
    JSON.stringify({ v: envelope.v ?? 1, t: envelope.t ?? Date.now(), data }),
  );

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('lưu', () => {
  it('ghi sau khi hết debounce, không ghi sớm hơn', () => {
    const { result } = renderDraft('a');

    act(() => result.current.form.setValue('name', 'An', { shouldDirty: true }));
    act(() => void vi.advanceTimersByTime(DEBOUNCE - 1));
    expect(stored('a')).toBeNull();

    act(() => void vi.advanceTimersByTime(1));
    expect(stored('a')?.data.name).toBe('An');
    expect(result.current.draft.hasDraft).toBe(true);
  });

  it('⛔ đổi key → ghi vào khoá MỚI, không đụng nháp của khoá cũ', () => {
    const { result, rerender } = renderDraft('ban-ghi-A');

    rerender({ draftKey: 'ban-ghi-B' });
    act(() => result.current.form.setValue('name', 'Của B', { shouldDirty: true }));
    act(() => void vi.advanceTimersByTime(DEBOUNCE));

    expect(stored('ban-ghi-B')?.data.name).toBe('Của B');
    expect(stored('ban-ghi-A')).toBeNull();
  });

  it('⛔ lượt lưu đang chờ của khoá cũ bị HUỶ khi đổi key', () => {
    const { result, rerender } = renderDraft('ban-ghi-A');

    act(() => result.current.form.setValue('name', 'Gõ dở ở A', { shouldDirty: true }));
    rerender({ draftKey: 'ban-ghi-B' });
    act(() => void vi.advanceTimersByTime(DEBOUNCE));

    expect(stored('ban-ghi-A')).toBeNull();
  });

  it('`fields` — chỉ lưu field được phép, mật khẩu không chạm ổ đĩa', () => {
    const { result } = renderDraft('a', { fields: ['name'] });

    act(() => {
      result.current.form.setValue('name', 'An', { shouldDirty: true });
      result.current.form.setValue('password', 'bí-mật', { shouldDirty: true });
    });
    act(() => void vi.advanceTimersByTime(DEBOUNCE));

    expect(stored('a')?.data).toEqual({ name: 'An' });
    expect(JSON.stringify(localStorage)).not.toContain('bí-mật');
  });

  it('⛔ storage ném lỗi (hết dung lượng) → form vẫn chạy', () => {
    const { result } = renderDraft('a');
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('đầy', 'QuotaExceededError');
    });

    act(() => result.current.form.setValue('name', 'An', { shouldDirty: true }));
    expect(() => act(() => void vi.advanceTimersByTime(DEBOUNCE))).not.toThrow();
    expect(result.current.form.getValues('name')).toBe('An');
  });
});

describe('xoá', () => {
  it('⛔ `clear()` huỷ lượt lưu đang chờ — nháp không tự mọc lại', () => {
    const { result } = renderDraft('a');

    act(() => result.current.form.setValue('name', 'An', { shouldDirty: true }));
    act(() => result.current.draft.clear());
    act(() => void vi.advanceTimersByTime(DEBOUNCE * 2));

    expect(stored('a')).toBeNull();
    expect(result.current.draft.hasDraft).toBe(false);
  });

  it('xoá nháp đã ghi', () => {
    seed('a', { name: 'Cũ' });
    const { result } = renderDraft('a');
    expect(result.current.draft.hasDraft).toBe(true);

    act(() => result.current.draft.clear());
    expect(stored('a')).toBeNull();
    expect(result.current.draft.hasDraft).toBe(false);
  });
});

describe('khôi phục', () => {
  it('đổ nháp vào form khi mount', () => {
    seed('a', { name: 'Nháp cũ' });
    const { result } = renderDraft('a');
    expect(result.current.form.getValues('name')).toBe('Nháp cũ');
  });

  it('đổi key → khôi phục nháp của khoá mới', () => {
    seed('ban-ghi-B', { name: 'Nháp của B' });
    const { result, rerender } = renderDraft('ban-ghi-A');
    expect(result.current.form.getValues('name')).toBe('');

    rerender({ draftKey: 'ban-ghi-B' });
    expect(result.current.form.getValues('name')).toBe('Nháp của B');
  });

  it.each([
    ['sai version', () => seed('a', { name: 'x' }, { v: 99 })],
    ['quá hạn', () => seed('a', { name: 'x' }, { t: Date.now() - 8 * 24 * 60 * 60 * 1000 })],
    ['JSON hỏng', () => localStorage.setItem('form-draft:a', '{hỏng')],
    ['không phải object', () => localStorage.setItem('form-draft:a', '"chuỗi"')],
  ])('nháp %s → bỏ qua và dọn khỏi storage', (_name, arrange) => {
    arrange();
    const { result } = renderDraft('a');

    expect(result.current.form.getValues('name')).toBe('');
    expect(result.current.draft.hasDraft).toBe(false);
    expect(localStorage.getItem('form-draft:a')).toBeNull();
  });

  it('`validate` trả false → không đổ vào form', () => {
    seed('a', { name: 'x' });
    const { result } = renderDraft('a', { validate: () => false });
    expect(result.current.form.getValues('name')).toBe('');
  });

  it('⛔ storage bị chặn đọc → form vẫn dựng được', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new DOMException('bị chặn', 'SecurityError');
    });
    expect(() => renderDraft('a')).not.toThrow();
  });
});
