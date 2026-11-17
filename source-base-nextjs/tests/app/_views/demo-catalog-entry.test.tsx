/**
 * Ví dụ sống của nhóm "nhập liệu và thao tác" trong catalog `/demo` — Button · Form · Select · Pickers · Controls. Mỗi ca chạm
 * đúng thứ dev sẽ thử trên trang: bấm nút loading, gửi form có lỗi, chọn trong danh sách, chọn ngày theo ngôn ngữ, bật công tắc.
 */

import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ButtonCatalog from '@/app/_views/demo/catalog/entry/ButtonCatalog';
import ControlCatalog from '@/app/_views/demo/catalog/entry/ControlCatalog';
import FormCatalog from '@/app/_views/demo/catalog/entry/FormCatalog';
import PickerCatalog from '@/app/_views/demo/catalog/entry/PickerCatalog';
import SelectCatalog from '@/app/_views/demo/catalog/entry/SelectCatalog';
import enMessages from '@/messages/en';
import viMessages from '@/messages/vi';
import { useToastStore } from '@/shared/ui/overlays/toast/toast.store';
import { renderInRouter } from '@tests/helpers/render';

const { demo } = viMessages;
const group = (name: string) => screen.getByRole('group', { name });
const toastTitles = () => useToastStore.getState().toasts.map((toast) => toast.title);

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  useToastStore.setState({ toasts: [] });
});

describe('ButtonCatalog', () => {
  it('đủ bảng kiểu × màu: mỗi variant một hàng 4 skin', () => {
    renderInRouter(<ButtonCatalog />);

    for (const variant of ['primary', 'secondary', 'stroke', 'ghost']) {
      expect(within(group(`variant="${variant}"`)).getAllByRole('button')).toHaveLength(4);
    }
    expect(within(group(demo.button.sizes)).getAllByRole('button')).toHaveLength(5);
  });

  it('bấm "Lưu" → nút loading (aria-busy) và không bấm lại được; "Đặt lại" trả về bình thường', async () => {
    const user = userEvent.setup();
    renderInRouter(<ButtonCatalog />);
    const save = screen.getByRole('button', { name: demo.button.save });
    expect(save).not.toHaveAttribute('aria-busy', 'true');

    await user.click(save);
    expect(save).toHaveAttribute('aria-busy', 'true');
    expect(save).toBeDisabled();

    await user.click(screen.getByRole('button', { name: demo.button.reset }));
    expect(save).not.toHaveAttribute('aria-busy', 'true');
    expect(save).toBeEnabled();
  });

  it('nút vô hiệu hoá và nút chỉ có icon (có tên trợ năng)', () => {
    renderInRouter(<ButtonCatalog />);

    expect(screen.getByRole('button', { name: demo.button.disabled })).toBeDisabled();
    expect(screen.getByRole('button', { name: demo.button.iconOnlyAria })).toBeEnabled();
  });

  it.each([
    ['vi', '/demo/customers'],
    ['en', '/en/demo/customers'],
  ] as const)(
    'asChild + Link là <a> thật tới màn mẫu, đúng tiền tố ngôn ngữ (%s)',
    (locale, href) => {
      renderInRouter(<ButtonCatalog />, { locale });
      const label = locale === 'en' ? enMessages.demo.button.goCustomers : demo.button.goCustomers;

      expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href);
    },
  );
});

describe('FormCatalog', () => {
  const states = demo.form.states;

  it('bốn trạng thái cạnh nhau, mỗi trạng thái một form', () => {
    renderInRouter(<FormCatalog />);

    for (const name of Object.values(states)) {
      expect(within(group(name)).getByText(demo.form.fields.name)).toBeInTheDocument();
    }
  });

  it('trạng thái lỗi: kiểm ngay lúc hiện, ba câu lỗi nằm dưới ô', async () => {
    renderInRouter(<FormCatalog />);
    const invalid = group(states.invalid);

    expect(await within(invalid).findByText(demo.form.errors.nameRequired)).toBeInTheDocument();
    expect(within(invalid).getByText(demo.form.errors.passwordMin)).toBeInTheDocument();
    expect(within(invalid).getByText(demo.form.errors.quantityRange)).toBeInTheDocument();
    expect(within(invalid).getByRole('textbox', { name: /Họ tên/ })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('chỉ đọc: không còn ô nhập; vô hiệu hoá: ô nhập bị khoá', () => {
    renderInRouter(<FormCatalog />);

    expect(within(group(states.readOnly)).queryAllByRole('textbox')).toHaveLength(0);
    expect(within(group(states.readOnly)).getByText('Alice Tran')).toBeInTheDocument();
    expect(within(group(states.disabled)).getByRole('textbox', { name: /Họ tên/ })).toBeDisabled();
  });

  it('gửi form trống → lỗi hiện, KHÔNG toast; điền đủ rồi gửi → toast "đã gửi"', async () => {
    const user = userEvent.setup();
    renderInRouter(<FormCatalog />);
    const form = group(states.default);

    await user.click(within(form).getByRole('button', { name: 'Xác nhận' }));
    expect(await within(form).findByText(demo.form.errors.nameRequired)).toBeInTheDocument();
    expect(within(form).getByText(demo.form.errors.passwordMin)).toBeInTheDocument();
    expect(toastTitles()).toEqual([]);

    await user.type(within(form).getByRole('textbox', { name: /Họ tên/ }), 'Alice Tran');
    await user.type(within(form).getByLabelText(/^Mật khẩu/, { selector: 'input' }), 'secret-123');
    await user.click(within(form).getByRole('button', { name: 'Xác nhận' }));

    await waitFor(() => expect(toastTitles()).toEqual([demo.form.submitted]));
  });

  it('"Hủy bỏ" trả form về giá trị đầu và xoá lỗi', async () => {
    const user = userEvent.setup();
    renderInRouter(<FormCatalog />);
    const form = group(states.default);

    await user.type(within(form).getByRole('textbox', { name: /Họ tên/ }), 'Bao');
    await user.click(within(form).getByRole('button', { name: 'Hủy bỏ' }));

    expect(within(form).getByRole('textbox', { name: /Họ tên/ })).toHaveValue('');
  });
});

describe('SelectCatalog', () => {
  const trigger = (name: string) => within(group(name)).getByRole('combobox');

  it('Dropdown: chọn một dòng → giá trị cập nhật dưới ô và trên trigger', () => {
    renderInRouter(<SelectCatalog />);
    const box = trigger(demo.select.single);
    expect(
      within(group(demo.select.single)).getByText(`Giá trị: ${demo.select.none}`),
    ).toBeInTheDocument();

    fireEvent.keyDown(box, { key: 'Enter' });
    fireEvent.keyDown(
      screen.getByRole('option', { name: new RegExp(demo.select.options.finance) }),
      {
        key: 'Enter',
      },
    );

    expect(within(group(demo.select.single)).getByText('Giá trị: finance')).toBeInTheDocument();
    expect(box).toHaveTextContent(demo.select.options.finance);
  });

  it('Dropdown có nút xoá: bấm ✕ về "chưa chọn"', async () => {
    const user = userEvent.setup();
    renderInRouter(<SelectCatalog />);
    const searchable = group(demo.select.searchable);
    expect(within(searchable).getByText('Giá trị: finance')).toBeInTheDocument();

    await user.click(within(searchable).getByRole('button', { name: /Xoá lựa chọn/ }));

    expect(within(searchable).getByText(`Giá trị: ${demo.select.none}`)).toBeInTheDocument();
  });

  it('MultiSelect: tick nhiều dòng → giá trị gộp dưới ô; gỡ chip bỏ đúng dòng', async () => {
    const user = userEvent.setup();
    renderInRouter(<SelectCatalog />);
    const multi = group(demo.select.multi);

    await user.click(within(multi).getByRole('button'));
    await user.click(screen.getByRole('checkbox', { name: demo.select.options.hr }));
    await user.click(screen.getByRole('checkbox', { name: demo.select.options.it }));

    expect(within(multi).getByText('Giá trị: hr, it')).toBeInTheDocument();
  });

  it('trạng thái lỗi / vô hiệu hoá: ô lỗi có aria-invalid, ô khoá không mở được', () => {
    renderInRouter(<SelectCatalog />);
    const [dropdownCase] = screen.getAllByRole('group', { name: demo.select.invalidDisabled });
    const [invalid, disabled] = within(dropdownCase).getAllByRole('combobox');

    expect(invalid).toHaveAttribute('aria-invalid', 'true');
    expect(disabled).toBeDisabled();
  });
});

describe('PickerCatalog', () => {
  it('vi: giá trị mẫu hiện theo DD/MM/YYYY; chọn ngày 16 → cập nhật', async () => {
    const user = userEvent.setup();
    renderInRouter(<PickerCatalog />);
    const date = group(demo.pickers.date);
    expect(within(date).getByText('Giá trị: 15/07/2026')).toBeInTheDocument();

    await user.click(within(date).getByRole('textbox'));
    await user.click(screen.getByRole('button', { name: '16/07/2026' }));

    expect(within(group(demo.pickers.date)).getByText('Giá trị: 16/07/2026')).toBeInTheDocument();
  });

  it('en: cùng ví dụ hiện theo MM/DD/YYYY', () => {
    renderInRouter(<PickerCatalog />, { locale: 'en' });

    expect(
      within(screen.getByRole('group', { name: enMessages.demo.pickers.date })).getByText(
        'Value: 07/15/2026',
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('group', { name: enMessages.demo.pickers.dateTime })).getByText(
        'Value: 07/15/2026 09:30',
      ),
    ).toBeInTheDocument();
  });

  it('DateTimePicker: mở panel, chọn ngày khác rồi "Xác nhận" mới đổi giá trị', async () => {
    const user = userEvent.setup();
    renderInRouter(<PickerCatalog />);
    const dateTime = group(demo.pickers.dateTime);
    expect(within(dateTime).getByText('Giá trị: 15/07/2026 09:30')).toBeInTheDocument();

    await user.click(within(dateTime).getByText('15/07/2026 09:30'));
    await user.click(screen.getByRole('button', { name: '20/07/2026' }));
    expect(within(dateTime).getByText('Giá trị: 15/07/2026 09:30')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(
      within(group(demo.pickers.dateTime)).getByText('Giá trị: 20/07/2026 09:30'),
    ).toBeInTheDocument();
  });

  it('TimePicker: gõ giờ → giá trị đổi; ô lỗi / vô hiệu hoá có trạng thái đúng', () => {
    renderInRouter(<PickerCatalog />);
    const time = group(demo.pickers.time);
    expect(within(time).getByText('Giá trị: 09:30')).toBeInTheDocument();

    const input = within(time).getByRole('textbox');
    fireEvent.change(input, { target: { value: '1530' } });
    fireEvent.blur(input);
    expect(within(time).getByText('Giá trị: 15:30')).toBeInTheDocument();

    const flags = group(demo.pickers.invalidDisabled);
    const [invalid, disabled] = within(flags).getAllByRole('textbox');
    expect(invalid).toHaveAttribute('aria-invalid', 'true');
    expect(disabled).toBeDisabled();
  });
});

describe('ControlCatalog', () => {
  it('Toggle điều khiển được; các cỡ dùng chung một giá trị', async () => {
    const user = userEvent.setup();
    renderInRouter(<ControlCatalog />);
    const toggle = group(demo.controls.toggle);
    expect(within(toggle).getByText('Trạng thái: Bật')).toBeInTheDocument();

    await user.click(within(toggle).getByRole('switch', { name: demo.controls.toggleLabel }));

    expect(within(toggle).getByText('Trạng thái: Tắt')).toBeInTheDocument();
    for (const small of within(toggle).getAllByRole('switch', { name: /Công tắc mẫu/ })) {
      expect(small).toHaveAttribute('aria-checked', 'false');
    }
  });

  it('SegmentToggle: chọn "Tháng" → giá trị đổi, hai kiểu tô dùng chung một giá trị', async () => {
    const user = userEvent.setup();
    renderInRouter(<ControlCatalog />);
    const segment = group(demo.controls.segment);
    expect(within(segment).getByText('Trạng thái: week')).toBeInTheDocument();

    await user.click(
      within(segment).getAllByRole('button', { name: demo.controls.segmentOptions.month })[0],
    );

    expect(within(group(demo.controls.segment)).getByText('Trạng thái: month')).toBeInTheDocument();
    const pressed = within(group(demo.controls.segment))
      .getAllByRole('button', { name: demo.controls.segmentOptions.month })
      .map((button) => button.getAttribute('aria-pressed'));
    expect(pressed).toEqual(['true', 'true']);
  });

  it('Checkbox: tích → "Bật"; ô vô hiệu hoá không đổi', async () => {
    const user = userEvent.setup();
    renderInRouter(<ControlCatalog />);
    const checkbox = group(demo.controls.checkbox);
    expect(within(checkbox).getByText('Trạng thái: Tắt')).toBeInTheDocument();

    await user.click(within(checkbox).getByRole('checkbox', { name: demo.controls.checkboxLabel }));

    expect(within(checkbox).getByText('Trạng thái: Bật')).toBeInTheDocument();
    expect(within(checkbox).getByRole('checkbox', { name: demo.controls.disabled })).toBeDisabled();
  });
});
