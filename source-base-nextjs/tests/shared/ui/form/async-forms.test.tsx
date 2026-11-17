/**
 * Form bất đồng bộ — CHỈ lượt MỚI NHẤT được ghi state, lượt cũ về muộn bị bỏ qua.
 *
 * Ba chỗ từng để lượt cũ đè lượt mới:
 *  - `useAsyncValidation`: A chậm + không hợp lệ về SAU B nhanh + hợp lệ → ô báo lỗi của A;
 *  - `AsyncSelectField`: danh sách của từ khoá cũ đè từ khoá mới; API từ chối thành unhandled rejection;
 *  - `CascadeSelectField`: huyện của tỉnh cũ đè huyện của tỉnh mới; option cấp sâu không bị xoá.
 *
 * Thứ tự hoàn thành dựng bằng `createDeferred`, thời gian bằng fake timers — không ngủ thật.
 */

import { act, fireEvent, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createGate } from '@tests/helpers/deferred';
import { renderInRouter } from '@tests/helpers/render';
import type { DropdownOption } from '@/shared/ui';
import { AsyncSelectField, CascadeSelectField, Form, useAsyncValidation } from '@/shared/ui';
import type { AsyncOption, CascadeLevel } from '@/shared/ui';

const noop = () => {};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useAsyncValidation — chỉ lượt mới nhất được ghi state', () => {
  const MESSAGE = 'Mã đã tồn tại';

  interface Props {
    fn: (value: string) => Promise<boolean>;
    errorMessage: string;
    debounceMs?: number;
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  function setup(extra: Partial<Props> = {}) {
    const gate = createGate<boolean>();
    const fn = vi.fn((value: string) => gate.request(value));
    const hook = renderHook((props: Props) => useAsyncValidation(props), {
      initialProps: { fn, errorMessage: MESSAGE, ...extra },
    });
    const call = (value: string) => act(() => hook.result.current.validate(value));
    const fire = (ms = 500) => act(() => void vi.advanceTimersByTime(ms));
    const blur = (value: string) => {
      call(value);
      fire();
    };
    return { ...hook, fn, gate, call, fire, blur };
  }

  it('lượt hợp lệ → không lỗi; lượt không hợp lệ → có lỗi (đường chạy bình thường)', async () => {
    const t = setup();
    t.blur('a');
    expect(t.result.current.isValidating).toBe(true);
    await t.gate.resolve('a', false);
    expect(t.result.current.asyncError).toBe(MESSAGE);
    expect(t.result.current.isValidating).toBe(false);

    t.blur('b');
    await t.gate.resolve('b', true);
    expect(t.result.current.asyncError).toBeUndefined();
  });

  it('A chậm + không hợp lệ, B nhanh + hợp lệ: lỗi về muộn của A không hiện', async () => {
    const t = setup();
    t.blur('a');
    t.blur('b');

    await t.gate.resolve('b', true);
    await t.gate.resolve('a', false);

    expect(t.result.current.asyncError).toBeUndefined();
    expect(t.result.current.isValidating).toBe(false);
  });

  it('A chậm + hợp lệ, B nhanh + không hợp lệ: kết quả hợp lệ về muộn của A không xoá lỗi của B', async () => {
    const t = setup();
    t.blur('a');
    t.blur('b');

    await t.gate.resolve('b', false);
    await t.gate.resolve('a', true);

    expect(t.result.current.asyncError).toBe(MESSAGE);
  });

  it('đã yêu cầu kiểm giá trị mới (còn đang debounce) thì kết quả của giá trị cũ không còn hiện', async () => {
    const t = setup();
    t.blur('a');
    t.call('b');

    await t.gate.resolve('a', false);
    expect(t.result.current.asyncError).toBeUndefined();

    t.fire();
    await t.gate.resolve('b', false);
    expect(t.result.current.asyncError).toBe(MESSAGE);
  });

  it('isValidating chỉ tắt khi lượt MỚI NHẤT xong, lượt cũ xong trước không làm nó tắt sớm', async () => {
    const t = setup();
    t.blur('a');
    t.blur('b');
    expect(t.result.current.isValidating).toBe(true);

    await t.gate.resolve('a', true);
    expect(t.result.current.isValidating).toBe(true);

    await t.gate.resolve('b', true);
    expect(t.result.current.isValidating).toBe(false);
  });

  it('reset() khi đang chờ API: xoá lỗi, tắt isValidating, kết quả về muộn không hiện lại', async () => {
    const t = setup();
    t.blur('a');

    act(() => t.result.current.reset());
    expect(t.result.current.isValidating).toBe(false);

    await t.gate.resolve('a', false);
    expect(t.result.current.asyncError).toBeUndefined();
    expect(t.result.current.isValidating).toBe(false);
  });

  it('validate("") khi đang chờ API: xoá lỗi và vô hiệu lượt đang chạy', async () => {
    const t = setup();
    t.blur('a');
    await t.gate.resolve('a', false);
    expect(t.result.current.asyncError).toBe(MESSAGE);

    t.blur('b');
    t.call('');
    expect(t.result.current.asyncError).toBeUndefined();
    expect(t.result.current.isValidating).toBe(false);

    await t.gate.resolve('b', false);
    expect(t.result.current.asyncError).toBeUndefined();
  });

  it('validate("") huỷ luôn lượt đang chờ debounce — ô đã xoá trắng không bị kiểm theo giá trị cũ', () => {
    const t = setup();
    t.call('a');
    t.call('');
    t.fire(2000);
    expect(t.fn).not.toHaveBeenCalled();
  });

  it('unmount khi đang chờ debounce: không còn gọi API', () => {
    const t = setup();
    t.call('a');
    t.unmount();
    t.fire(2000);
    expect(t.fn).not.toHaveBeenCalled();
  });

  it('unmount khi đang chờ API: kết quả về sau không gây cảnh báo hay lỗi', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(noop);
    const t = setup();
    t.blur('a');
    t.unmount();

    await t.gate.resolve('a', false);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('errorMessage đổi giữa các lần render: lượt kiểm sau dùng câu mới', async () => {
    const t = setup();
    t.rerender({ fn: t.fn, errorMessage: 'Email đã được dùng' });

    t.blur('a');
    await t.gate.resolve('a', false);
    expect(t.result.current.asyncError).toBe('Email đã được dùng');
  });

  it('fn đổi giữa các lần render: lượt kiểm sau gọi bản mới, không gọi bản cũ', async () => {
    const t = setup();
    const next = vi.fn(async (value: string) => value !== 'taken');
    t.rerender({ fn: next, errorMessage: MESSAGE });

    t.blur('taken');
    await act(async () => {});

    expect(next).toHaveBeenCalledExactlyOnceWith('taken');
    expect(t.fn).not.toHaveBeenCalled();
    expect(t.result.current.asyncError).toBe(MESSAGE);
  });

  it('debounceMs đổi giữa các lần render: độ trễ mới có hiệu lực', () => {
    const t = setup({ debounceMs: 1000 });
    t.rerender({ fn: t.fn, errorMessage: MESSAGE, debounceMs: 50 });

    t.call('a');
    t.fire(49);
    expect(t.fn).not.toHaveBeenCalled();
    t.fire(1);
    expect(t.fn).toHaveBeenCalledExactlyOnceWith('a');
  });

  it('fn từ chối → coi như không có lỗi và tắt isValidating (hành vi hiện có giữ nguyên)', async () => {
    const t = setup();
    t.blur('a');
    await t.gate.reject('a');

    expect(t.result.current.asyncError).toBeUndefined();
    expect(t.result.current.isValidating).toBe(false);
  });

  it('StrictMode (effect mount → unmount giả → mount): vẫn kiểm được và ghi được kết quả', async () => {
    const gate = createGate<boolean>();
    const { result } = renderHook(
      () => useAsyncValidation({ fn: (value) => gate.request(value), errorMessage: MESSAGE }),
      { wrapper: StrictMode },
    );

    act(() => result.current.validate('a'));
    act(() => void vi.advanceTimersByTime(500));
    await gate.resolve('a', false);

    expect(result.current.asyncError).toBe(MESSAGE);
  });

  it('validate / reset giữ nguyên identity qua các lần render', () => {
    const t = setup();
    const { validate, reset } = t.result.current;
    t.rerender({ fn: t.fn, errorMessage: 'Câu khác' });
    expect(t.result.current.validate).toBe(validate);
    expect(t.result.current.reset).toBe(reset);
  });
});

describe('AsyncSelectField — chỉ lượt tìm kiếm mới nhất được ghi state', () => {
  type FetchOptions = (search: string) => Promise<AsyncOption[]>;

  interface HarnessProps {
    sources: FetchOptions[];
    delays?: number[];
    defaultValue?: string;
    valueLabel?: string;
  }

  /** Nút "Đổi nguồn" chuyển `fetchOptions` / `debounceMs` sang phần tử thứ hai → kiểm giá trị đổi giữa các render. */
  function Harness({ sources, delays = [300], defaultValue = '', valueLabel }: HarnessProps) {
    const form = useForm({ defaultValues: { unit: defaultValue } });
    const unit = useWatch({ control: form.control, name: 'unit' });
    const [variant, setVariant] = useState(0);
    return (
      <>
        <Form form={form} onSubmit={noop}>
          <AsyncSelectField
            debounceMs={delays[variant] ?? delays[0]}
            fetchOptions={sources[variant] ?? sources[0]}
            label="Đơn vị"
            name="unit"
            valueLabel={valueLabel}
          />
        </Form>
        <output data-testid="unit-value">{unit}</output>
        <button type="button" onClick={() => setVariant(1)}>
          Đổi nguồn
        </button>
      </>
    );
  }

  const opt = (value: string, label: string): AsyncOption => ({ value, label });

  beforeEach(() => {
    vi.useFakeTimers();
    // RTL chỉ nhận ra fake timers qua global `jest`; thiếu nó thì `userEvent` treo ở lần chờ macrotask nội bộ.
    vi.stubGlobal('jest', { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) });
  });

  function setup(props: Partial<HarnessProps> = {}) {
    const gate = createGate<AsyncOption[]>();
    const fetchOptions = vi.fn<FetchOptions>((search) => gate.request(search));
    const view = renderInRouter(<Harness sources={[fetchOptions]} {...props} />);
    const user = userEvent.setup({
      advanceTimers: (ms) => {
        vi.advanceTimersByTime(ms);
      },
    });
    const trigger = () => screen.getByLabelText('Đơn vị');
    const advance = (ms = 300) => act(async () => void (await vi.advanceTimersByTimeAsync(ms)));
    const search = (text: string) =>
      fireEvent.change(screen.getByPlaceholderText('Tìm kiếm...'), { target: { value: text } });
    const spinner = () => document.body.querySelector('.animate-spin');
    return { ...view, gate, fetchOptions, user, trigger, advance, search, spinner };
  }

  it('mở → nạp danh sách sau debounce; chọn một dòng ghi giá trị vào form và hiện nhãn trên nút', async () => {
    const t = setup();
    await t.user.click(t.trigger());
    expect(t.fetchOptions).not.toHaveBeenCalled();

    await t.advance();
    expect(t.fetchOptions).toHaveBeenCalledExactlyOnceWith('');
    await t.gate.resolve('', [opt('u1', 'Phòng Kỹ thuật'), opt('u2', 'Phòng Vận hành')]);

    await t.user.click(screen.getByText('Phòng Vận hành'));
    expect(screen.getByTestId('unit-value')).toHaveTextContent('u2');
    expect(t.trigger()).toHaveTextContent('Phòng Vận hành');
  });

  it('API trả danh sách rỗng → "Không có kết quả"', async () => {
    const t = setup();
    await t.user.click(t.trigger());
    await t.advance();
    await t.gate.resolve('', []);

    expect(screen.getByText('Không có kết quả')).toBeInTheDocument();
    expect(screen.queryByText('Không tải được danh sách')).not.toBeInTheDocument();
  });

  it('hai lượt tìm kiếm xong ngược thứ tự: danh sách là của lượt MỚI NHẤT', async () => {
    const t = setup();
    await t.user.click(t.trigger());
    await t.advance();
    await t.gate.resolve('', []);

    t.search('a');
    await t.advance();
    t.search('ab');
    await t.advance();

    await t.gate.resolve('ab', [opt('ab1', 'Kết quả AB')]);
    await t.gate.resolve('a', [opt('a1', 'Kết quả A')]);

    expect(screen.getByText('Kết quả AB')).toBeInTheDocument();
    expect(screen.queryByText('Kết quả A')).not.toBeInTheDocument();
  });

  it('lượt cũ xong trước KHÔNG tắt biểu tượng đang tải của lượt mới', async () => {
    const t = setup();
    await t.user.click(t.trigger());
    await t.advance();
    await t.gate.resolve('', []);

    t.search('a');
    await t.advance();
    t.search('ab');
    await t.advance();
    expect(t.spinner()).not.toBeNull();

    await t.gate.resolve('a', [opt('a1', 'Kết quả A')]);
    expect(t.spinner()).not.toBeNull();
    expect(screen.queryByText('Kết quả A')).not.toBeInTheDocument();

    await t.gate.resolve('ab', [opt('ab1', 'Kết quả AB')]);
    expect(t.spinner()).toBeNull();
  });

  it('API từ chối → hết đang tải, xoá danh sách cũ, hiện "Không tải được danh sách" thay "Không có kết quả"', async () => {
    const t = setup();
    await t.user.click(t.trigger());
    await t.advance();
    await t.gate.resolve('', [opt('u1', 'Phòng Kỹ thuật')]);

    t.search('x');
    await t.advance();
    await t.gate.reject('x');

    expect(screen.getByText('Không tải được danh sách')).toBeInTheDocument();
    expect(screen.queryByText('Không có kết quả')).not.toBeInTheDocument();
    expect(screen.queryByText('Phòng Kỹ thuật')).not.toBeInTheDocument();
    expect(t.spinner()).toBeNull();
  });

  it('sau khi lỗi, lượt tìm kiếm kế tiếp chạy bình thường và dòng lỗi biến mất', async () => {
    const t = setup();
    await t.user.click(t.trigger());
    await t.advance();
    await t.gate.reject('');
    expect(screen.getByText('Không tải được danh sách')).toBeInTheDocument();

    t.search('kt');
    await t.advance();
    expect(screen.queryByText('Không tải được danh sách')).not.toBeInTheDocument();
    await t.gate.resolve('kt', [opt('u1', 'Phòng Kỹ thuật')]);

    expect(screen.getByText('Phòng Kỹ thuật')).toBeInTheDocument();
    expect(screen.queryByText('Không tải được danh sách')).not.toBeInTheDocument();
  });

  it('unmount khi đang chờ debounce: không còn gọi API', async () => {
    const t = setup();
    await t.user.click(t.trigger());
    t.unmount();

    await t.advance(1000);
    expect(t.fetchOptions).not.toHaveBeenCalled();
  });

  it('unmount khi đang tải: kết quả về sau không gây cảnh báo hay lỗi', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(noop);
    const t = setup();
    await t.user.click(t.trigger());
    await t.advance();
    t.unmount();

    await t.gate.resolve('', [opt('u1', 'Phòng Kỹ thuật')]);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('fetchOptions đổi giữa các lần render: lượt nạp sau gọi bản mới, không gọi bản cũ', async () => {
    const fetchOlder = vi.fn<FetchOptions>(async () => []);
    const fetchNewer = vi.fn<FetchOptions>(async () => []);
    const t = setup({ sources: [fetchOlder, fetchNewer] });

    await t.user.click(screen.getByRole('button', { name: 'Đổi nguồn' }));
    await t.user.click(t.trigger());
    await t.advance();

    expect(fetchNewer).toHaveBeenCalledExactlyOnceWith('');
    expect(fetchOlder).not.toHaveBeenCalled();
  });

  it('debounceMs đổi giữa các lần render: độ trễ mới có hiệu lực', async () => {
    const fetchOptions = vi.fn<FetchOptions>(async () => []);
    const t = setup({ delays: [1000, 50], sources: [fetchOptions, fetchOptions] });

    await t.user.click(screen.getByRole('button', { name: 'Đổi nguồn' }));
    await t.user.click(t.trigger());
    await t.advance(49);
    expect(fetchOptions).not.toHaveBeenCalled();

    await t.advance(1);
    expect(fetchOptions).toHaveBeenCalledExactlyOnceWith('');
  });

  it('valueLabel: giá trị điền sẵn hiện nhãn thay vì giá trị thô, tới khi người dùng chọn dòng khác', async () => {
    const t = setup({ defaultValue: 'u1', valueLabel: 'Phòng Kỹ thuật' });
    expect(t.trigger()).toHaveTextContent('Phòng Kỹ thuật');
    expect(t.trigger()).not.toHaveTextContent('u1');

    await t.user.click(t.trigger());
    await t.advance();
    await t.gate.resolve('', [opt('u2', 'Phòng Vận hành')]);
    await t.user.click(screen.getByText('Phòng Vận hành'));

    expect(t.trigger()).toHaveTextContent('Phòng Vận hành');
  });

  it('không có valueLabel: giá trị điền sẵn hiện nguyên giá trị (hành vi hiện có giữ nguyên)', () => {
    const t = setup({ defaultValue: 'u1' });
    expect(t.trigger()).toHaveTextContent('u1');
  });
});

describe('CascadeSelectField — mỗi cấp chỉ nhận kết quả của lượt nạp mới nhất', () => {
  type Options = DropdownOption[];

  interface Gates {
    province: ReturnType<typeof createGate<Options>>;
    district: ReturnType<typeof createGate<Options>>;
    ward: ReturnType<typeof createGate<Options>>;
  }

  function Harness({ gates }: { gates: Gates }) {
    const form = useForm({ defaultValues: { province: '', district: '', ward: '' } });
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

  const opt = (value: string, label: string): DropdownOption => ({ value, label });
  const PROVINCES = [opt('a', 'Tỉnh A'), opt('b', 'Tỉnh B'), opt('c', 'Tỉnh C')];

  async function setup() {
    const gates: Gates = {
      province: createGate<Options>(),
      district: createGate<Options>(),
      ward: createGate<Options>(),
    };
    const view = renderInRouter(<Harness gates={gates} />);
    const dropdown = (label: string) => screen.getByLabelText(label);
    const open = (label: string) => fireEvent.keyDown(dropdown(label), { key: 'Enter' });
    const choose = (label: string, option: string) => {
      open(label);
      fireEvent.keyDown(screen.getByRole('option', { name: option }), { key: 'Enter' });
    };
    const listed = (label: string) => {
      open(label);
      const texts = screen.queryAllByRole('option').map((o) => o.textContent);
      fireEvent.keyDown(document.body, { key: 'Escape' });
      return texts;
    };
    await gates.province.resolve('all', PROVINCES);
    return { ...view, gates, dropdown, choose, listed };
  }

  it('mở → nạp cấp đầu; chọn tỉnh → nạp huyện của tỉnh đó (đường chạy bình thường)', async () => {
    const t = await setup();
    expect(t.listed('Tỉnh/thành')).toEqual(['Tỉnh A', 'Tỉnh B', 'Tỉnh C']);

    t.choose('Tỉnh/thành', 'Tỉnh A');
    expect(t.dropdown('Quận/huyện')).toHaveTextContent('Đang tải...');
    await t.gates.district.resolve('a', [opt('a1', 'Huyện A1')]);

    expect(t.dropdown('Quận/huyện')).toHaveTextContent('Chọn');
    expect(t.listed('Quận/huyện')).toEqual(['Huyện A1']);
  });

  it('đổi tỉnh hai lần liên tiếp, huyện của tỉnh CŨ về muộn không đè huyện của tỉnh mới', async () => {
    const t = await setup();
    t.choose('Tỉnh/thành', 'Tỉnh A');
    t.choose('Tỉnh/thành', 'Tỉnh B');

    await t.gates.district.resolve('b', [opt('b1', 'Huyện B1')]);
    await t.gates.district.resolve('a', [opt('a1', 'Huyện A1')]);

    expect(t.listed('Quận/huyện')).toEqual(['Huyện B1']);
  });

  it('huyện của tỉnh cũ về trước KHÔNG tắt trạng thái "Đang tải..." của tỉnh mới', async () => {
    const t = await setup();
    t.choose('Tỉnh/thành', 'Tỉnh A');
    t.choose('Tỉnh/thành', 'Tỉnh B');

    await t.gates.district.resolve('a', [opt('a1', 'Huyện A1')]);
    expect(t.dropdown('Quận/huyện')).toHaveTextContent('Đang tải...');

    await t.gates.district.resolve('b', [opt('b1', 'Huyện B1')]);
    expect(t.dropdown('Quận/huyện')).toHaveTextContent('Chọn');
  });

  it('đổi tỉnh xoá cả OPTION của cấp xã (cấp sâu hơn cấp kế tiếp), không chỉ giá trị', async () => {
    const t = await setup();
    t.choose('Tỉnh/thành', 'Tỉnh A');
    await t.gates.district.resolve('a', [opt('a1', 'Huyện A1')]);
    t.choose('Quận/huyện', 'Huyện A1');
    await t.gates.ward.resolve('a1', [opt('w1', 'Xã W1')]);

    t.choose('Tỉnh/thành', 'Tỉnh B');
    expect(t.dropdown('Quận/huyện')).toHaveTextContent('Đang tải...');
    await t.gates.district.resolve('b', [opt('b1', 'Huyện B1')]);
    t.choose('Quận/huyện', 'Huyện B1');

    expect(t.dropdown('Phường/xã')).toHaveTextContent('Đang tải...');
    expect(t.listed('Phường/xã')).toEqual([]);
  });

  it('lượt nạp cấp xã đang chạy bị huỷ khi đổi tỉnh: không treo "Đang tải..." và không đè option', async () => {
    const t = await setup();
    t.choose('Tỉnh/thành', 'Tỉnh A');
    await t.gates.district.resolve('a', [opt('a1', 'Huyện A1')]);
    t.choose('Quận/huyện', 'Huyện A1');

    t.choose('Tỉnh/thành', 'Tỉnh B');
    expect(t.dropdown('Phường/xã')).toHaveTextContent('Chọn');

    await t.gates.ward.resolve('a1', [opt('w1', 'Xã W1')]);
    await t.gates.district.resolve('b', [opt('b1', 'Huyện B1')]);
    t.choose('Quận/huyện', 'Huyện B1');

    expect(t.listed('Phường/xã')).toEqual([]);
  });

  it('đổi tỉnh xoá giá trị của huyện và xã đã chọn', async () => {
    const t = await setup();
    t.choose('Tỉnh/thành', 'Tỉnh A');
    await t.gates.district.resolve('a', [opt('a1', 'Huyện A1')]);
    t.choose('Quận/huyện', 'Huyện A1');
    await t.gates.ward.resolve('a1', [opt('w1', 'Xã W1')]);
    t.choose('Phường/xã', 'Xã W1');
    expect(t.dropdown('Phường/xã')).toHaveTextContent('Xã W1');

    t.choose('Tỉnh/thành', 'Tỉnh B');

    expect(t.dropdown('Quận/huyện')).not.toHaveTextContent('Huyện A1');
    expect(t.dropdown('Phường/xã')).not.toHaveTextContent('Xã W1');
  });

  it('nạp huyện bị từ chối: huyện rỗng + "Chọn" (không giữ huyện của tỉnh cũ); đổi tỉnh khác nạp lại bình thường', async () => {
    const t = await setup();
    t.choose('Tỉnh/thành', 'Tỉnh A');
    await t.gates.district.resolve('a', [opt('a1', 'Huyện A1')]);

    t.choose('Tỉnh/thành', 'Tỉnh B');
    await t.gates.district.reject('b');
    expect(t.dropdown('Quận/huyện')).toHaveTextContent('Chọn');
    expect(t.listed('Quận/huyện')).toEqual([]);

    t.choose('Tỉnh/thành', 'Tỉnh C');
    await t.gates.district.resolve('c', [opt('c1', 'Huyện C1')]);
    expect(t.listed('Quận/huyện')).toEqual(['Huyện C1']);
  });

  it('nạp cấp đầu bị từ chối: danh sách rỗng, không treo "Đang tải..."', async () => {
    const gates: Gates = {
      province: createGate<Options>(),
      district: createGate<Options>(),
      ward: createGate<Options>(),
    };
    renderInRouter(<Harness gates={gates} />);
    expect(screen.getByLabelText('Tỉnh/thành')).toHaveTextContent('Đang tải...');

    await gates.province.reject('all');
    expect(screen.getByLabelText('Tỉnh/thành')).toHaveTextContent('Chọn');
  });

  it('StrictMode (effect mount chạy hai lần): cấp đầu vẫn nạp được', async () => {
    const gates: Gates = {
      province: createGate<Options>(),
      district: createGate<Options>(),
      ward: createGate<Options>(),
    };
    renderInRouter(
      <StrictMode>
        <Harness gates={gates} />
      </StrictMode>,
    );

    await gates.province.resolve('all', PROVINCES);
    expect(screen.getByLabelText('Tỉnh/thành')).toHaveTextContent('Chọn');
    fireEvent.keyDown(screen.getByLabelText('Tỉnh/thành'), { key: 'Enter' });
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('unmount khi đang tải: kết quả về sau không gây cảnh báo hay lỗi', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(noop);
    const t = await setup();
    t.choose('Tỉnh/thành', 'Tỉnh A');
    t.unmount();

    await t.gates.district.resolve('a', [opt('a1', 'Huyện A1')]);
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
