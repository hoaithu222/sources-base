/**
 * `useDisclosure().onOpenChange` đặt đúng trạng thái được yêu cầu.
 *
 * Lỗi cũ ở trang demo: `onOpenChange={x.toggle}` + `onConfirm={() => x.close()}` — FormModal gửi xong
 * tự báo `onOpenChange(false)`, `toggle` lật trạng thái đã đóng thành MỞ lại, modal không bao giờ đóng.
 */

import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { z } from 'zod';

import { useDisclosure } from '@/shared/hooks/state/useDisclosure';
import { FormModal, TextField, useZodForm } from '@/shared/ui';

const schema = z.object({ name: z.string() });

function ConfirmThenClose() {
  const modal = useDisclosure(true);
  const form = useZodForm(schema, { defaultValues: { name: 'Hạng mục A' } });
  return (
    <FormModal
      form={form}
      open={modal.isOpen}
      title="Thông tin hạng mục"
      onConfirm={() => modal.close()}
      onOpenChange={modal.onOpenChange}
    >
      <TextField label="Tên" name="name" />
    </FormModal>
  );
}

describe('useDisclosure', () => {
  it('onOpenChange(false) gọi lặp vẫn giữ trạng thái đóng (khác toggle)', () => {
    const { result } = renderHook(() => useDisclosure(true));
    act(() => result.current.onOpenChange(false));
    act(() => result.current.onOpenChange(false));
    expect(result.current.isOpen).toBe(false);
    act(() => result.current.onOpenChange(true));
    expect(result.current.isOpen).toBe(true);
  });

  it('FormModal: onConfirm tự close() rồi modal báo đóng — modal vẫn đóng', async () => {
    const user = userEvent.setup();
    render(<ConfirmThenClose />);

    await user.click(screen.getByRole('button', { name: /xác nhận|lưu|thêm/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
