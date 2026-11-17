/**
 * Toast — kho (`toast.store`) và API gọi (`toast.api`).
 *
 *  - Kho không được phụ thuộc `crypto.randomUUID`: API này chỉ có ở ngữ cảnh an toàn (https hoặc
 *    localhost). Màn TV / kiosk mở app qua `http://<IP LAN>` thì `crypto.randomUUID` là `undefined`
 *    và mọi `showToast()` ném `TypeError` — lỗi báo lỗi.
 *  - `showErrorToast` với lỗi KHÔNG phải của axios: không đọc nhầm thành "lỗi mạng", không lộ câu
 *    thô ra giao diện, không ném ngay trong lúc xử lý lỗi.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/core/http';
import { showErrorToast } from '@/shared/ui/overlays/toast/toast.api';
import { useToastStore } from '@/shared/ui/overlays/toast/toast.store';

afterEach(() => {
  vi.unstubAllGlobals();
  useToastStore.setState({ toasts: [] });
});

describe('toast-store: id không phụ thuộc crypto.randomUUID', () => {
  it('ngữ cảnh không an toàn (không có randomUUID) vẫn thêm được toast', () => {
    vi.stubGlobal('crypto', {});

    const id = useToastStore.getState().add({ type: 'info', title: 'a' });

    expect(id).not.toBe('');
    expect(useToastStore.getState().toasts.map((t) => t.id)).toEqual([id]);
  });

  it('mỗi toast có id riêng', () => {
    vi.stubGlobal('crypto', {});

    const first = useToastStore.getState().add({ type: 'info', title: 'một' });
    const second = useToastStore.getState().add({ type: 'info', title: 'hai' });

    expect(first).not.toBe(second);
  });

  it('dismiss / update theo id vẫn hoạt động', () => {
    vi.stubGlobal('crypto', {});
    const { add, update, remove } = useToastStore.getState();

    const id = add({ type: 'info', title: 'đang chạy' });
    update(id, { title: 'xong' });
    expect(useToastStore.getState().toasts[0].title).toBe('xong');

    remove(id);
    expect(useToastStore.getState().toasts).toEqual([]);
  });
});

describe('showErrorToast với lỗi KHÔNG phải của axios', () => {
  it('lỗi ném tay không thành "lỗi mạng", và không lộ câu thô ra giao diện', () => {
    useToastStore.setState({ toasts: [] });
    // Bản trước ép kiểu thẳng sang `AxiosError`, mà `Error` thường không có
    // `.response` → hiểu nhầm là đứt mạng và hiện "Không thể kết nối đến máy chủ".
    // Nay chỉ câu của `AppError` lên giao diện: màn hình muốn báo câu riêng thì ném
    // `new AppError('business', '…')`; `Error` thường hiện câu dự phòng.
    showErrorToast(new Error('duplicate_code'));
    showErrorToast(new AppError('business', 'Mã đã được sử dụng'));

    const messages = useToastStore.getState().toasts.map((t) => t.title);
    expect(messages).toEqual(['Đã xảy ra lỗi', 'Mã đã được sử dụng']);
    expect(messages.join(' ')).not.toContain('kết nối');
  });

  it('null / chuỗi không làm ném lỗi ngay trong lúc xử lý lỗi', () => {
    // `error.response` trên `null` ném TypeError — tức là hỏng khi đang chữa hỏng.
    expect(() => showErrorToast(null, { fallback: 'Dự phòng' })).not.toThrow();
    expect(() => showErrorToast('Câu lỗi dạng chuỗi')).not.toThrow();
  });
});
