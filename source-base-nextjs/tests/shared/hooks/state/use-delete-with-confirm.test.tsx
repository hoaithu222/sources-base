/**
 * `useDeleteWithConfirm` — hộp thoại xác nhận xoá.
 *
 * `confirm` chỉ chạy `onConfirm` MỘT lần dù bấm đúp (trước đây hai lần → hai request xoá); `onConfirm` ném thì hộp thoại vẫn mở và
 * `isDeleting` về `false` để thử lại.
 */

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDeleteWithConfirm } from '@/shared/hooks/state/useDeleteWithConfirm';
import { createDeferred } from '@tests/helpers/deferred';

describe('useDeleteWithConfirm', () => {
  it('requestDelete chụp id + tên và mở hộp thoại; cancel đóng và xoá chụp', () => {
    const { result } = renderHook(() => useDeleteWithConfirm({ onConfirm: vi.fn() }));

    act(() => result.current.requestDelete(7, 'Hạng mục A'));
    expect(result.current).toMatchObject({ isOpen: true, pendingId: 7, pendingName: 'Hạng mục A' });

    act(() => result.current.cancel());
    expect(result.current).toMatchObject({ isOpen: false, pendingId: null, pendingName: '' });
  });

  it('confirm → onConfirm nhận đúng id, xong thì đóng hộp thoại', async () => {
    const onConfirm = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() => useDeleteWithConfirm({ onConfirm }));

    act(() => result.current.requestDelete(7, 'Hạng mục A'));
    await act(() => result.current.confirm());

    expect(onConfirm).toHaveBeenCalledExactlyOnceWith(7);
    expect(result.current).toMatchObject({ isOpen: false, pendingId: null, isDeleting: false });
  });

  it('⛔ bấm đúp khi lượt đầu chưa xong → onConfirm chỉ chạy MỘT lần', async () => {
    const pending = createDeferred();
    const onConfirm = vi.fn(() => pending.promise);
    const { result } = renderHook(() => useDeleteWithConfirm({ onConfirm }));

    act(() => result.current.requestDelete(7, 'Hạng mục A'));
    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => {
      first = result.current.confirm();
      second = result.current.confirm();
    });
    expect(result.current.isDeleting).toBe(true);

    await act(async () => {
      pending.resolve();
      await Promise.all([first, second]);
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.isDeleting).toBe(false);
  });

  it('onConfirm ném → confirm ném lại, hộp thoại còn mở, isDeleting về false và bấm lại được', async () => {
    const onConfirm = vi
      .fn<(id: number) => Promise<void>>()
      .mockRejectedValueOnce(new Error('Máy chủ lỗi'))
      .mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useDeleteWithConfirm({ onConfirm }));

    act(() => result.current.requestDelete(7, 'Hạng mục A'));
    await act(async () => {
      await expect(result.current.confirm()).rejects.toThrow('Máy chủ lỗi');
    });
    expect(result.current).toMatchObject({ isOpen: true, pendingId: 7, isDeleting: false });

    await act(() => result.current.confirm());
    expect(onConfirm).toHaveBeenCalledTimes(2);
    expect(result.current.isOpen).toBe(false);
  });
});
