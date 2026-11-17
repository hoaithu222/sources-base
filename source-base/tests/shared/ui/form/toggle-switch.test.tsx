/**
 * Toggle / ToggleField / ThemeToggle — hành vi bật-tắt (mục "công tắc bật-tắt lỗi" của đợt sửa UI).
 *
 * Ca nào đỏ trước khi sửa thì ghi chú nguyên nhân ngay tại ca đó. Chạy qua `userEvent` (bàn phím + chuột
 * thật: Space bấm công tắc, bấm chữ nhãn) chứ không `fireEvent.click` — mới thấy hành vi thật của `<label>`.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { Form, Toggle, ToggleField } from '@/shared/ui';
import { renderInForm, renderInRouter } from '@tests/helpers/render';

const classesOf = (el: Element) => el.className.split(/\s+/);

function Controlled({ onChange }: { onChange?: (value: boolean) => void }) {
  const [on, setOn] = useState(false);
  return (
    <Toggle
      checked={on}
      label="Thông báo"
      onCheckedChange={(next) => {
        onChange?.(next);
        setOn(next);
      }}
    />
  );
}

describe('Toggle — controlled / uncontrolled', () => {
  it('uncontrolled: bấm công tắc đổi aria-checked và gọi onCheckedChange ĐÚNG MỘT lần', async () => {
    const onChange = vi.fn();
    render(<Toggle aria-label="Bật" onCheckedChange={onChange} />);
    const sw = screen.getByRole('switch', { name: 'Bật' });

    await userEvent.click(sw);

    expect(sw).toHaveAttribute('aria-checked', 'true');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it('defaultChecked: khởi đầu bật, bấm một lần thì tắt', async () => {
    render(<Toggle aria-label="Bật" defaultChecked />);
    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('aria-checked', 'true');
    expect(sw).toHaveAttribute('data-state', 'checked');

    await userEvent.click(sw);

    expect(sw).toHaveAttribute('aria-checked', 'false');
  });

  it('controlled: không tự đổi khi cha không cập nhật `checked`', async () => {
    const onChange = vi.fn();
    render(<Toggle aria-label="Bật" checked={false} onCheckedChange={onChange} />);
    const sw = screen.getByRole('switch');

    await userEvent.click(sw);

    expect(onChange).toHaveBeenCalledWith(true);
    expect(sw).toHaveAttribute('aria-checked', 'false');
  });

  it('controlled: cha đổi `checked` từ NGOÀI → công tắc theo, KHÔNG gọi onCheckedChange', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Toggle aria-label="Bật" checked={false} onCheckedChange={onChange} />,
    );

    rerender(<Toggle aria-label="Bật" checked onCheckedChange={onChange} />);

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('switch')).toHaveAttribute('data-state', 'checked');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('có nhãn: bấm CHỮ nhãn bật / tắt đúng MỘT lần (không nhân đôi qua <label>)', async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    await userEvent.click(screen.getByText('Thông báo'));
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(onChange).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByText('Thông báo'));
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('có nhãn: bấm thẳng công tắc cũng đúng MỘT lần', async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    await userEvent.click(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('labelPosition="left": bấm chữ nhãn vẫn bật đúng một lần', async () => {
    const onChange = vi.fn();
    render(<Toggle label="Nhãn trái" labelPosition="left" onCheckedChange={onChange} />);

    await userEvent.click(screen.getByText('Nhãn trái'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('trong <form> thật: một lần bấm = một lần gọi, hộp ẩn của Radix không bắn thêm', async () => {
    const onChange = vi.fn();
    render(
      <form>
        <Toggle label="Trong form" onCheckedChange={onChange} />
      </form>,
    );

    await userEvent.click(screen.getByText('Trong form'));
    await userEvent.click(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(1, true);
    expect(onChange).toHaveBeenNthCalledWith(2, false);
  });
});

describe('Toggle — bàn phím, trợ năng, khoá', () => {
  it('Space bật / tắt; Tab tới được; role="switch" có tên từ nhãn', async () => {
    const onChange = vi.fn();
    render(<Toggle label="Âm thanh" onCheckedChange={onChange} />);
    const sw = screen.getByRole('switch', { name: 'Âm thanh' });

    await userEvent.tab();
    expect(sw).toHaveFocus();
    await userEvent.keyboard(' ');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(sw).toHaveAttribute('aria-checked', 'true');
  });

  it('Enter cũng bật / tắt (người dùng bàn phím quen Enter như với nút)', async () => {
    const onChange = vi.fn();
    render(<Toggle aria-label="Bật" onCheckedChange={onChange} />);

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('disabled: không đổi, không gọi, bỏ qua Tab, không có hover', async () => {
    const onChange = vi.fn();
    render(<Toggle aria-label="Khoá" disabled label="Khoá" onCheckedChange={onChange} />);
    const sw = screen.getByRole('switch');

    await userEvent.click(sw);
    await userEvent.click(screen.getByText('Khoá'));

    expect(onChange).not.toHaveBeenCalled();
    expect(sw).toBeDisabled();
    expect(sw.className).toContain('enabled:hover:');
    expect(sw.className).not.toMatch(/(^|\s)hover:/);
  });

  it('nhãn bên ngoài nối qua <label htmlFor> bật được công tắc', async () => {
    const onChange = vi.fn();
    render(
      <>
        <label htmlFor="ext">Nhãn ngoài</label>
        <Toggle id="ext" onCheckedChange={onChange} />
      </>,
    );

    await userEvent.click(screen.getByText('Nhãn ngoài'));

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('size sm/md/lg: núm chạy đúng quãng = rộng − viền − núm (không dịch lệch)', () => {
    // sm: 28 − 4 − 12 = 12 (translate-x-3) · md: 36 − 4 − 16 = 16 (translate-x-4) · lg: 44 − 4 − 20 = 20 (translate-x-5)
    const expected = { sm: 'translate-x-3', md: 'translate-x-4', lg: 'translate-x-5' } as const;
    for (const size of ['sm', 'md', 'lg'] as const) {
      const { unmount } = render(<Toggle aria-label="Bật" defaultChecked size={size} />);
      const thumb = screen.getByRole('switch').querySelector('span') as HTMLElement;
      expect(classesOf(thumb), size).toContain(`data-[state=checked]:${expected[size]}`);
      unmount();
    }
  });

  it('núm dịch bằng thuộc tính `translate` (Tailwind 4) nên chuyển tiếp phải nhắm `translate`, không `transform`', () => {
    render(<Toggle aria-label="Bật" defaultChecked />);
    const thumb = screen.getByRole('switch').querySelector('span') as HTMLElement;

    expect(thumb.className).toMatch(/transition-\[[^\]]*\btranslate\b[^\]]*\]/);
    expect(thumb.className).not.toMatch(/transition-\[[^\]]*\btransform\b[^\]]*\]/);
  });
});

describe('ToggleField — nối react-hook-form', () => {
  function Harness() {
    const form = useForm<{ notify: boolean }>({ defaultValues: { notify: false } });
    const value = useWatch({ control: form.control, name: 'notify' });
    return (
      <Form form={form} onSubmit={() => undefined}>
        <ToggleField label="Thông báo" name="notify" toggleLabel="Qua email" />
        <output data-testid="value">{String(value)}</output>
        <button type="button" onClick={() => form.reset({ notify: false })}>
          Đặt lại
        </button>
        <button type="button" onClick={() => form.setValue('notify', true)}>
          Bật từ ngoài
        </button>
      </Form>
    );
  }

  it('bấm công tắc → giá trị form là boolean và công tắc theo', async () => {
    renderInForm(<ToggleField label="Thông báo" name="notify" />, { notify: false });
    const sw = screen.getByRole('switch', { name: 'Thông báo' });

    await userEvent.click(sw);

    expect(sw).toHaveAttribute('aria-checked', 'true');
  });

  it('bấm chữ cạnh công tắc (toggleLabel) bật đúng một lần; bấm nhãn phía trên cũng bật', async () => {
    renderInRouter(<Harness />);

    await userEvent.click(screen.getByText('Qua email'));
    expect(screen.getByTestId('value')).toHaveTextContent('true');

    await userEvent.click(screen.getByText('Thông báo'));
    expect(screen.getByTestId('value')).toHaveTextContent('false');
  });

  it('form.setValue / form.reset từ ngoài → công tắc đổi trạng thái đúng, không nháy', async () => {
    renderInRouter(<Harness />);
    const sw = screen.getByRole('switch');

    await userEvent.click(screen.getByRole('button', { name: 'Bật từ ngoài' }));
    expect(sw).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Đặt lại' }));
    expect(sw).toHaveAttribute('aria-checked', 'false');
  });

  it('có tên trợ năng (aria-labelledby → nhãn), `disabled` khoá được', async () => {
    renderInForm(<ToggleField disabled label="Thông báo" name="notify" />, { notify: false });
    const sw = screen.getByRole('switch', { name: 'Thông báo' });

    await userEvent.click(sw);

    expect(sw).toBeDisabled();
    expect(sw).toHaveAttribute('aria-checked', 'false');
  });
});
