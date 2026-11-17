/**
 * Nhóm form của UI kit — mỗi lỗi người dùng nhìn thấy được một ca kiểm.
 *
 *  - `AsyncSelectField`: nhãn của dòng đã chọn không gắn với giá trị → `form.reset()` từ ngoài vẫn hiện nhãn cũ.
 *  - `CascadeSelectField`: giá trị điền sẵn ở cấp ≥ 2 (kể cả qua `form.reset()` sau mount) không có option.
 *  - `DictionaryField`: nút "Thêm thuộc tính" không làm hiện dòng mới.
 *  - `FormSection`: tiêu đề thu gọn không mở được bằng bàn phím.
 *  - `FormStepper`: bấm "Tiếp theo" hai lần khi kiểm tra chậm thì nhảy cóc một bước; `onSubmit` ném lỗi
 *    thành unhandled rejection.
 *  - `useFormDraft`: nháp chứa field ngoài `fields` (mật khẩu) vẫn được đổ vào form.
 *  - `DateField` / `DateRangeField`: chuỗi `YYYY-MM-DD` bị hiểu là nửa đêm UTC → lùi một ngày ở múi giờ âm.
 */

import { act, fireEvent, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMemo } from 'react';
import { useForm, useWatch, type Resolver, type UseFormReturn } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createDeferred, createGate, type Deferred, type Gate } from '@tests/helpers/deferred';
import { renderInRouter, renderWithIntl } from '@tests/helpers/render';
import type { DropdownOption } from '@/shared/ui';
import {
  AsyncSelectField,
  CascadeSelectField,
  CheckboxField,
  ColorPickerField,
  DateField,
  DateRangeField,
  DictionaryField,
  Form,
  FormSection,
  FormStepper,
  IPAddressField,
  MultiSelectField,
  RadioGroupField,
  SelectField,
  TextField,
  ToggleField,
  useFormDraft,
} from '@/shared/ui';
import { ipv4Field } from '@/shared/utils/validation/validators.utils';
import type { AsyncOption, CascadeLevel, FormStep } from '@/shared/ui';

const noop = () => {};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AsyncSelectField — nhãn trên nút luôn khớp giá trị form đang giữ', () => {
  interface Values {
    unit: string;
  }

  const OPTIONS: AsyncOption[] = [
    { value: 'u1', label: 'Phòng Kỹ thuật' },
    { value: 'u2', label: 'Phòng Vận hành' },
  ];

  let form: UseFormReturn<Values>;

  function Harness({ valueLabel }: { valueLabel?: string }) {
    form = useForm<Values>({ defaultValues: { unit: 'u1' } });
    return (
      <Form form={form} onSubmit={noop}>
        <AsyncSelectField
          debounceMs={0}
          fetchOptions={async () => OPTIONS}
          label="Đơn vị"
          name="unit"
          placeholder="Chọn đơn vị"
          valueLabel={valueLabel}
        />
      </Form>
    );
  }

  async function chooseOperations() {
    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Đơn vị'));
    await user.click(await screen.findByText('Phòng Vận hành'));
    expect(screen.getByLabelText('Đơn vị')).toHaveTextContent('Phòng Vận hành');
  }

  it('chọn dòng khác rồi `form.reset()` từ ngoài → nút hiện lại `valueLabel`, không giữ nhãn cũ', async () => {
    renderInRouter(<Harness valueLabel="Phòng Kỹ thuật" />);
    await chooseOperations();

    act(() => form.reset());

    expect(screen.getByLabelText('Đơn vị')).toHaveTextContent('Phòng Kỹ thuật');
    expect(screen.getByLabelText('Đơn vị')).not.toHaveTextContent('Phòng Vận hành');
  });

  it('không có `valueLabel`: giá trị nằm trong danh sách đã tải thì hiện nhãn của dòng đó', async () => {
    renderInRouter(<Harness />);
    expect(screen.getByLabelText('Đơn vị')).toHaveTextContent('u1');
    await chooseOperations();

    act(() => form.reset());

    expect(screen.getByLabelText('Đơn vị')).toHaveTextContent('Phòng Kỹ thuật');
  });

  it('reset về rỗng → nút hiện placeholder', async () => {
    renderInRouter(<Harness valueLabel="Phòng Kỹ thuật" />);
    await chooseOperations();

    act(() => form.reset({ unit: '' }));

    expect(screen.getByLabelText('Đơn vị')).toHaveTextContent('Chọn đơn vị');
  });
});

describe('CascadeSelectField — giá trị điền sẵn ở cấp sâu có option ngay', () => {
  type Options = DropdownOption[];

  interface Values {
    province: string;
    district: string;
    ward: string;
  }

  interface Gates {
    province: Gate<Options>;
    district: Gate<Options>;
    ward: Gate<Options>;
  }

  const EMPTY: Values = { province: '', district: '', ward: '' };
  const opt = (value: string, label: string): DropdownOption => ({ value, label });

  let form: UseFormReturn<Values>;

  function Harness({ gates, defaults }: { gates: Gates; defaults: Values }) {
    form = useForm<Values>({ defaultValues: defaults });
    const levels = useMemo<CascadeLevel[]>(
      () => [
        { name: 'province', label: 'Tỉnh/thành', fetch: () => gates.province.request('all') },
        { name: 'district', label: 'Quận/huyện', fetch: (p) => gates.district.request(p) },
        { name: 'ward', label: 'Phường/xã', fetch: (_p, d) => gates.ward.request(d) },
      ],
      [gates],
    );
    return (
      <Form form={form} onSubmit={noop}>
        <CascadeSelectField levels={levels} />
      </Form>
    );
  }

  function setup(defaults: Values) {
    const gates: Gates = {
      province: createGate<Options>(),
      district: createGate<Options>(),
      ward: createGate<Options>(),
    };
    renderInRouter(<Harness defaults={defaults} gates={gates} />);
    const dropdown = (label: string) => screen.getByLabelText(label);
    const listed = (label: string) => {
      fireEvent.keyDown(dropdown(label), { key: 'Enter' });
      const texts = screen.queryAllByRole('option').map((o) => o.textContent);
      fireEvent.keyDown(document.body, { key: 'Escape' });
      return texts;
    };
    return { gates, dropdown, listed };
  }

  it('mount với tỉnh + huyện điền sẵn → nạp luôn huyện và xã, hiện nhãn đã chọn', async () => {
    const t = setup({ province: 'a', district: 'a1', ward: '' });

    expect(t.gates.district.request).toHaveBeenCalledWith('a');
    expect(t.gates.ward.request).toHaveBeenCalledWith('a1');
    expect(t.dropdown('Quận/huyện')).toHaveTextContent('Đang tải...');

    await t.gates.province.resolve('all', [opt('a', 'Tỉnh A')]);
    await t.gates.district.resolve('a', [opt('a1', 'Huyện A1'), opt('a2', 'Huyện A2')]);
    await t.gates.ward.resolve('a1', [opt('w1', 'Xã W1')]);

    expect(t.dropdown('Quận/huyện')).toHaveTextContent('Huyện A1');
    expect(t.listed('Quận/huyện')).toEqual(['Huyện A1', 'Huyện A2']);
    expect(t.listed('Phường/xã')).toEqual(['Xã W1']);
  });

  it('`form.reset()` điền giá trị sau khi mount (form sửa mở trong modal) → cấp sâu được nạp', async () => {
    const t = setup(EMPTY);
    await t.gates.province.resolve('all', [opt('b', 'Tỉnh B')]);
    expect(t.gates.district.request).not.toHaveBeenCalled();

    act(() => form.reset({ province: 'b', district: 'b1', ward: '' }));

    expect(t.gates.district.request).toHaveBeenCalledWith('b');
    await t.gates.district.resolve('b', [opt('b1', 'Huyện B1')]);
    expect(t.dropdown('Quận/huyện')).toHaveTextContent('Huyện B1');
  });

  it('cấp đầu chậm, cấp hai về trước: cả hai đều thoát "Đang tải..."', async () => {
    const t = setup({ province: 'a', district: 'a1', ward: '' });

    await t.gates.district.resolve('a', [opt('a1', 'Huyện A1')]);
    await t.gates.ward.resolve('a1', []);
    await t.gates.province.resolve('all', [opt('a', 'Tỉnh A')]);

    expect(t.dropdown('Tỉnh/thành')).toHaveTextContent('Tỉnh A');
    expect(t.dropdown('Quận/huyện')).toHaveTextContent('Huyện A1');
    expect(t.dropdown('Phường/xã')).toHaveTextContent('Chọn');
  });
});

describe('DictionaryField — thêm / sửa / xoá dòng', () => {
  interface Values {
    attrs: Record<string, string>;
  }

  let form: UseFormReturn<Values>;

  function Harness() {
    form = useForm<Values>({ defaultValues: { attrs: {} } });
    const attrs = useWatch({ control: form.control, name: 'attrs' });
    return (
      <>
        <Form form={form} onSubmit={noop}>
          <DictionaryField label="Thuộc tính" name="attrs" />
        </Form>
        <output data-testid="attrs">{JSON.stringify(attrs)}</output>
      </>
    );
  }

  const value = () => JSON.parse(screen.getByTestId('attrs').textContent ?? '{}');

  it('bấm "Thêm thuộc tính" → hiện ngay một dòng trống; gõ khoá + giá trị thì ghi vào form', async () => {
    const user = userEvent.setup();
    renderInRouter(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Thêm thuộc tính' }));
    expect(screen.getAllByPlaceholderText('key')).toHaveLength(1);
    expect(value()).toEqual({});

    await user.type(screen.getByRole('textbox', { name: 'Khoá dòng 1' }), 'mau');
    await user.type(screen.getByRole('textbox', { name: 'Giá trị dòng 1' }), 'xanh');
    expect(value()).toEqual({ mau: 'xanh' });

    await user.click(screen.getByRole('button', { name: 'Thêm thuộc tính' }));
    expect(screen.getAllByPlaceholderText('key')).toHaveLength(2);
    expect(value()).toEqual({ mau: 'xanh' });
  });

  it('xoá dòng gỡ khoá khỏi form; `form.reset()` từ ngoài dựng lại danh sách dòng', async () => {
    const user = userEvent.setup();
    renderInRouter(<Harness />);
    act(() => form.reset({ attrs: { a: '1', b: '2' } }));
    expect(screen.getAllByPlaceholderText('key')).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Xoá dòng a' }));
    expect(value()).toEqual({ b: '2' });
    expect(screen.getAllByPlaceholderText('key')).toHaveLength(1);
  });

  it('các ô nằm trong nhóm mang tên nhãn của field', () => {
    renderInRouter(<Harness />);
    expect(screen.getByRole('group', { name: 'Thuộc tính' })).toBeInTheDocument();
  });
});

describe('FormSection — thu gọn được bằng bàn phím', () => {
  function renderSection() {
    return renderWithIntl(
      <FormSection collapsible defaultOpen={false} description="Không bắt buộc" title="Tuỳ chọn">
        <p>Nội dung phần</p>
      </FormSection>,
    );
  }

  it('tiêu đề là nút có aria-expanded; Enter mở, Space đóng', async () => {
    const user = userEvent.setup();
    renderSection();
    const header = screen.getByRole('button', { name: 'Tuỳ chọn' });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Nội dung phần')).not.toBeInTheDocument();

    await user.tab();
    expect(header).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(header).toHaveAttribute('aria-expanded', 'true');
    const region = document.getElementById(header.getAttribute('aria-controls') ?? '');
    expect(region).toContainElement(screen.getByText('Nội dung phần'));

    await user.keyboard(' ');
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('không `collapsible` → tiêu đề là heading thường, không có nút', () => {
    renderWithIntl(
      <FormSection title="Thông tin chung">
        <p>Nội dung</p>
      </FormSection>,
    );
    expect(screen.getByRole('heading', { name: 'Thông tin chung' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('FormStepper — mỗi lần bấm "Tiếp theo" chỉ sang đúng một bước', () => {
  interface Values {
    a: string;
    b: string;
  }

  const STEPS: FormStep<Values>[] = [
    { title: 'Một', fields: ['a'], component: <p>Nội dung bước 1</p> },
    { title: 'Hai', fields: ['b'], component: <p>Nội dung bước 2</p> },
    { title: 'Ba', fields: [], component: <p>Nội dung bước 3</p> },
  ];

  let pending: Deferred<void>[] = [];

  beforeEach(() => {
    pending = [];
  });

  /** Resolver chậm: mỗi lần kiểm treo tới khi test gọi `settle()`. */
  const slowResolver: Resolver<Values> = async (values) => {
    const deferred = createDeferred<void>();
    pending.push(deferred);
    await deferred.promise;
    return { values, errors: {} };
  };

  const settle = () =>
    act(async () => {
      const batch = pending;
      pending = [];
      batch.forEach((d) => d.resolve());
    });

  function Harness({ onSubmit }: { onSubmit: (values: Values) => Promise<void> | void }) {
    const form = useForm<Values>({ defaultValues: { a: '', b: '' }, resolver: slowResolver });
    return <FormStepper form={form} steps={STEPS} onSubmit={onSubmit} />;
  }

  const next = () => fireEvent.click(screen.getByRole('button', { name: 'Tiếp theo' }));

  it('bấm hai lần liên tiếp khi kiểm tra còn chạy → chỉ sang bước 2, không nhảy cóc tới bước 3', async () => {
    renderWithIntl(<Harness onSubmit={noop} />);
    next();
    next();
    await settle();

    expect(screen.getByText('Nội dung bước 2')).toBeInTheDocument();
    expect(screen.queryByText('Nội dung bước 3')).not.toBeInTheDocument();
  });

  it('bấm "Quay lại" khi lượt kiểm còn chạy → kết quả về muộn không đẩy sang bước sau', async () => {
    renderWithIntl(<Harness onSubmit={noop} />);
    next();
    await settle();
    expect(screen.getByText('Nội dung bước 2')).toBeInTheDocument();

    next();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    await settle();

    expect(screen.getByText('Nội dung bước 1')).toBeInTheDocument();
  });

  it('`onSubmit` ném lỗi → ghi log, không thành unhandled rejection', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(noop);
    const onSubmit = vi.fn(async () => {
      throw new Error('API hỏng');
    });
    renderWithIntl(<Harness onSubmit={onSubmit} />);
    next();
    await settle();
    next();
    await settle();

    fireEvent.click(screen.getByRole('button', { name: 'Hoàn tất' }));
    await settle();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[FormStepper]'),
        expect.any(Error),
      ),
    );
  });
});

describe('useFormDraft — chỉ khôi phục field được phép', () => {
  interface Values {
    name: string;
    password: string;
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('nháp chứa field ngoài `fields` (mật khẩu) → field đó không được đổ vào form', () => {
    localStorage.setItem(
      'form-draft:ho-so',
      JSON.stringify({ v: 1, t: Date.now(), data: { name: 'Nháp', password: 'lộ' } }),
    );

    const { result } = renderHook(() => {
      const form = useForm<Values>({ defaultValues: { name: '', password: '' } });
      useFormDraft({ key: 'ho-so', form, fields: ['name'] });
      return form;
    });

    expect(result.current.getValues('name')).toBe('Nháp');
    expect(result.current.getValues('password')).toBe('');
  });
});

describe('DateField / DateRangeField — ngày ISO không lùi một ngày ở múi giờ âm', () => {
  beforeEach(() => {
    vi.stubEnv('TZ', 'America/New_York');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  interface Values {
    day: string;
    period: { from: string | null; to: string | null };
  }

  function Harness() {
    const form = useForm<Values>({
      defaultValues: { day: '2024-05-01', period: { from: '2024-05-01', to: '2024-05-03' } },
    });
    return (
      <Form form={form} readOnly onSubmit={noop}>
        <DateField label="Ngày" name="day" />
        <DateRangeField label="Kỳ" name="period" />
      </Form>
    );
  }

  it('hiện đúng ngày đã lưu', () => {
    expect(new Date('2024-05-01').getDate()).toBe(30);
    renderInRouter(<Harness />);

    expect(screen.getByText('01/05/2024')).toBeInTheDocument();
    expect(screen.getByText('01/05/2024 – 03/05/2024')).toBeInTheDocument();
  });
});

describe('field chọn nối `ref` của react-hook-form — `setFocus` / focus ô lỗi khi gửi tới được control', () => {
  interface Values {
    agree: boolean;
    notify: boolean;
    gender: string;
    dept: string;
    tags: string[];
    unit: string;
    color: string;
  }

  let form: UseFormReturn<Values>;

  const OPTIONS = [
    { value: 'eng', label: 'Kỹ thuật' },
    { value: 'ops', label: 'Vận hành' },
  ];

  function Harness() {
    form = useForm<Values>({
      defaultValues: {
        agree: false,
        notify: false,
        gender: 'f',
        dept: '',
        tags: [],
        unit: '',
        color: '#22C55E',
      },
    });
    return (
      <Form form={form} onSubmit={noop}>
        <CheckboxField label="Đồng ý" name="agree" />
        <ToggleField label="Nhận thông báo" name="notify" />
        <RadioGroupField
          label="Giới tính"
          name="gender"
          options={[
            { value: 'm', label: 'Nam' },
            { value: 'f', label: 'Nữ' },
          ]}
        />
        <SelectField label="Phòng ban" name="dept" options={OPTIONS} />
        <MultiSelectField label="Nhãn" name="tags" options={OPTIONS} />
        <AsyncSelectField fetchOptions={async () => []} label="Đơn vị" name="unit" />
        <ColorPickerField label="Màu" name="color" />
      </Form>
    );
  }

  it.each([
    ['agree', () => screen.getByLabelText('Đồng ý')],
    ['notify', () => screen.getByLabelText('Nhận thông báo')],
    ['gender', () => screen.getByRole('radio', { name: 'Nữ' })],
    ['dept', () => screen.getByLabelText('Phòng ban')],
    ['tags', () => screen.getByLabelText('Nhãn')],
    ['unit', () => screen.getByLabelText('Đơn vị')],
    ['color', () => screen.getByLabelText('Màu')],
  ] as const)('setFocus("%s") → control của field nhận focus', async (name, control) => {
    renderInRouter(<Harness />);
    act(() => form.setFocus(name));
    await waitFor(() => expect(control()).toHaveFocus());
  });
});

describe('IPAddressField — giá trị lưu đúng chuỗi IP người dùng gõ', () => {
  function Harness({ withPort = false }: { withPort?: boolean }) {
    const form = useForm<{ host: string }>({ defaultValues: { host: '' } });
    const host = useWatch({ control: form.control, name: 'host' });
    return (
      <>
        <Form form={form} onSubmit={noop}>
          <IPAddressField label="Địa chỉ IP" name="host" withPort={withPort} />
        </Form>
        <output data-testid="host">{host}</output>
      </>
    );
  }

  it('gõ `192.168.1.1` → form giữ `192.168.1.1` (khớp `ipv4Field()`), chữ cái bị lọc', async () => {
    const user = userEvent.setup();
    renderInRouter(<Harness />);

    await user.type(screen.getByLabelText('Địa chỉ IP'), '192.168.1.1x');

    expect(screen.getByTestId('host')).toHaveTextContent(/^192\.168\.1\.1$/);
    expect(ipv4Field().safeParse('192.168.1.1').success).toBe(true);
  });

  it('`withPort` → nhận cả `:cổng`', async () => {
    const user = userEvent.setup();
    renderInRouter(<Harness withPort />);

    await user.type(screen.getByLabelText('Địa chỉ IP'), '10.0.0.5:8080');

    expect(screen.getByTestId('host')).toHaveTextContent(/^10\.0\.0\.5:8080$/);
  });
});

describe('Form autoSave — gửi thành công thì xoá nháp', () => {
  interface Values {
    name: string;
  }

  function Harness({ onSubmit }: { onSubmit: (values: Values) => Promise<void> }) {
    const form = useForm<Values>({ defaultValues: { name: '' } });
    return (
      <Form autoSave={{ key: 'ho-so-1', debounceMs: 0 }} form={form} onSubmit={onSubmit}>
        <TextField label="Tên" name="name" />
        <button type="submit">Gửi</button>
      </Form>
    );
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('nháp đã lưu bị xoá sau khi `onSubmit` xong; `onSubmit` ném lỗi thì nháp còn nguyên', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<(values: Values) => Promise<void>>(async () => {});
    renderInRouter(<Harness onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Tên'), 'An');
    await waitFor(() => expect(localStorage.getItem('form-draft:ho-so-1')).not.toBeNull());

    vi.spyOn(console, 'error').mockImplementation(noop);
    onSubmit.mockRejectedValueOnce(new Error('API hỏng'));
    await user.click(screen.getByRole('button', { name: 'Gửi' }));
    expect(localStorage.getItem('form-draft:ho-so-1')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'Gửi' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(localStorage.getItem('form-draft:ho-so-1')).toBeNull();
  });
});
