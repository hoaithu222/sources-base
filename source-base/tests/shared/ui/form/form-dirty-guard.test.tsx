/**
 * `<Form dirtyGuard>` — form nhập dở không mất âm thầm.
 *
 * Hai đường mất dữ liệu: đổi trang trong app (router, có hộp "Bỏ thay đổi?") và đóng tab / F5 (trình duyệt tự hỏi
 * qua `beforeunload`). Bản cũ chỉ chặn đường thứ nhất. Form sạch thì không chặn gì.
 */

import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { Form, TextField } from '@/shared/ui';
import { renderInRouter } from '@tests/helpers/render';

function DraftForm({ guarded = true }: { guarded?: boolean }) {
  const form = useForm({ defaultValues: { ten: '' } });
  return (
    <Form dirtyGuard={guarded} form={form} onSubmit={() => undefined}>
      <TextField label="Tên" name="ten" />
    </Form>
  );
}

const fireBeforeUnload = () => {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
};

describe('<Form dirtyGuard> — đóng tab / tải lại', () => {
  it('form sạch → trình duyệt không bị yêu cầu hỏi', () => {
    renderInRouter(<DraftForm />);
    expect(fireBeforeUnload()).toBe(false);
  });

  it('⛔ đã gõ dở → `beforeunload` bị chặn (trình duyệt hỏi trước khi đóng tab / F5)', async () => {
    renderInRouter(<DraftForm />);

    await userEvent.type(screen.getByLabelText('Tên'), 'Cầu vượt');

    expect(fireBeforeUnload()).toBe(true);
  });

  it('không bật `dirtyGuard` → không chặn dù đã gõ', async () => {
    renderInRouter(<DraftForm guarded={false} />);

    await userEvent.type(screen.getByLabelText('Tên'), 'Cầu vượt');

    expect(fireBeforeUnload()).toBe(false);
  });

  it('đổi trang trong app khi đang dở → hiện hộp "Bỏ thay đổi?" (đường cũ giữ nguyên)', async () => {
    const { router } = renderInRouter(<DraftForm />, { paths: ['/form', '/khac'] });
    await userEvent.type(screen.getByLabelText('Tên'), 'Cầu vượt');

    await act(() => router.navigate('/khac'));

    expect(await screen.findByText('Bỏ thay đổi?')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/form');
  });
});
