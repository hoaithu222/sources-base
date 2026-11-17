/**
 * UI kit nhóm actions + inputs — hành vi đã sửa trong đợt tối ưu UI kit.
 *
 *  - `Input` / `NumberInput` `border="none" | "bottomLine"` + `invalid`: trước đây bảng viền xoá sạch viền
 *    đỏ của `fieldSurface` nên ô lỗi trông y hệt ô đúng; nay có gạch chân đỏ + `aria-invalid`.
 *  - `FIELD_CONTROL_CLASS` không còn utility `autofill:` (nhất là `box-shadow` phủ `bg-input`) — đã có
 *    `src/styles/overrides/autofill.css`.
 *  - `SegmentToggle`: `size` đổi được chiều cao `pill` / `glass` (không còn `h-*` cố định đè lên).
 *  - Bỏ `forwardRef` (React 19): `ref` vẫn tới đúng phần tử DOM, kể cả qua `field.ref` của react-hook-form.
 *  - Các lỗi nhỏ: Checkbox giữ `indeterminate` khi cha không đổi `checked`, nối dòng lỗi qua
 *    `aria-describedby`; NumberInput tự quản + `thousandSeparator` cập nhật số khi bấm +/-;
 *    ColorPalettePanel theo `value` đổi từ ngoài; Input `readOnly` không hiện nút ✕.
 */

import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { createRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import {
  Button,
  Checkbox,
  ColorPalettePanel,
  Input,
  Menu,
  NumberInput,
  Radio,
  RadioGroup,
  SegmentToggle,
  Textarea,
  ThemeToggle,
} from '@/shared/ui';
import { FIELD_CONTROL_CLASS } from '@/shared/ui/inputs/field.theme';
import { renderWithIntl } from '@tests/helpers/render';

const noop = () => {};

const frameOf = (el: HTMLElement) => el.closest('div') as HTMLDivElement;
const classesOf = (el: Element) => el.className.split(/\s+/);

describe('Input / NumberInput — border none | bottomLine vẫn báo lỗi', () => {
  it.each(['none', 'bottomLine'] as const)(
    'Input border="%s" + invalid có gạch chân đỏ',
    (border) => {
      const { rerender } = renderWithIntl(<Input aria-label="Mã" border={border} />);
      expect(classesOf(frameOf(screen.getByLabelText('Mã')))).not.toContain('border-b-error');

      rerender(<Input aria-label="Mã" border={border} invalid />);
      const input = screen.getByLabelText('Mã');
      const frame = classesOf(frameOf(input));
      expect(frame).toContain('border-b-error');
      expect(frame).toContain('focus-within:border-b-error');
      expect(frame).not.toContain('focus-within:border-b-primary-5');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    },
  );

  it.each(['none', 'bottomLine'] as const)(
    'NumberInput border="%s" + invalid có gạch chân đỏ',
    (border) => {
      renderWithIntl(
        <NumberInput aria-label="Số lượng" border={border} invalid value={1} onChange={noop} />,
      );
      const input = screen.getByLabelText('Số lượng');
      const frame = input.parentElement?.parentElement as HTMLElement;
      expect(classesOf(frame)).toContain('border-b-error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    },
  );

  it('border="default" + invalid giữ viền đỏ đủ 4 cạnh của fieldSurface', () => {
    renderWithIntl(<Input aria-label="Mã" invalid />);
    expect(classesOf(frameOf(screen.getByLabelText('Mã')))).toContain('border-error');
  });

  it('aria-invalid của nơi gọi thắng `invalid`', () => {
    renderWithIntl(<Input aria-invalid={false} aria-label="Mã" invalid />);
    expect(screen.getByLabelText('Mã')).toHaveAttribute('aria-invalid', 'false');
  });

  it('Textarea invalid gắn aria-invalid', () => {
    renderWithIntl(<Textarea aria-label="Ghi chú" invalid />);
    expect(screen.getByLabelText('Ghi chú')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('field.theme — autofill do overrides/autofill.css lo', () => {
  it('FIELD_CONTROL_CLASS không mang utility autofill: nào', () => {
    expect(FIELD_CONTROL_CLASS).not.toMatch(/autofill:/);
  });
});

describe('SegmentToggle — size đổi chiều cao pill / glass', () => {
  const PADDING_BY_SIZE = { sm: 'py-1', md: 'py-1.5', lg: 'py-2' } as const;

  it.each(['pill', 'glass'] as const)(
    '%s: mỗi size một đệm dọc, không có h-* cố định',
    (variant) => {
      for (const [size, padding] of Object.entries(PADDING_BY_SIZE)) {
        const { unmount } = renderWithIntl(
          <SegmentToggle
            options={[{ key: 'a', label: 'A' }]}
            size={size as keyof typeof PADDING_BY_SIZE}
            variant={variant}
          />,
        );
        const segment = classesOf(screen.getByRole('button', { name: 'A' }));
        expect(segment).toContain(padding);
        expect(segment.filter((c) => /^h-\d/.test(c))).toEqual([]);
        unmount();
      }
    },
  );

  it('đoạn chỉ có icon lấy `title` làm tên trợ năng; đoạn đang chọn có aria-pressed', () => {
    renderWithIntl(
      <SegmentToggle
        defaultValue="grid"
        options={[
          { key: 'grid', icon: <span />, title: 'Dạng lưới' },
          { key: 'list', icon: <span />, title: 'Dạng danh sách' },
        ]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Dạng lưới' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dạng danh sách' }));
    expect(screen.getByRole('button', { name: 'Dạng danh sách' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

describe('SegmentToggle — phím, mặt trượt, đoạn khoá, badge', () => {
  const OPTIONS = [
    { key: 'day', label: 'Ngày' },
    { key: 'week', label: 'Tuần', badge: 6 },
    { key: 'year', label: 'Năm', badge: 3, disabled: true },
    { key: 'month', label: 'Tháng', badge: 0 },
  ];
  const button = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name}`) });

  it('một điểm Tab; ←/→ đi vòng bỏ qua đoạn khoá, Home/End, chọn theo focus', () => {
    renderWithIntl(<SegmentToggle defaultValue="week" options={OPTIONS} />);
    expect(OPTIONS.map((o) => button(o.label).tabIndex)).toEqual([-1, 0, -1, -1]);

    fireEvent.keyDown(button('Tuần'), { key: 'ArrowRight' });
    expect(button('Tháng')).toHaveFocus();
    expect(button('Tháng')).toHaveAttribute('aria-pressed', 'true');
    expect(button('Tháng').tabIndex).toBe(0);

    fireEvent.keyDown(button('Tháng'), { key: 'ArrowRight' });
    expect(button('Ngày')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(button('Ngày'), { key: 'ArrowLeft' });
    expect(button('Tháng')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(button('Tháng'), { key: 'Home' });
    expect(button('Ngày')).toHaveFocus();
    fireEvent.keyDown(button('Ngày'), { key: 'End' });
    expect(button('Tháng')).toHaveFocus();
  });

  it('pill / solid / glass / underline / wave có mặt trượt; subtle / tab không — đoạn active chỉ đổi chữ', () => {
    for (const variant of [
      'pill',
      'solid',
      'glass',
      'underline',
      'wave',
      'subtle',
      'tab',
    ] as const) {
      const { unmount } = renderWithIntl(<SegmentToggle options={OPTIONS} variant={variant} />);
      const glide = screen.getByRole('group').querySelector(':scope > span[aria-hidden]');
      const hasGlide = ['pill', 'solid', 'glass', 'underline', 'wave'].includes(variant);
      expect(Boolean(glide), variant).toBe(hasGlide);
      if (hasGlide)
        expect(
          classesOf(button('Ngày')).filter((c) => /^bg-/.test(c)),
          variant,
        ).toEqual([]);
      unmount();
    }
  });

  it('đoạn khoá riêng mờ + badge chìm; cả nhóm khoá thì khung mờ, đoạn không mờ riêng', () => {
    const { rerender } = renderWithIntl(<SegmentToggle options={OPTIONS} />);
    expect(button('Năm')).toBeDisabled();
    expect(classesOf(button('Năm'))).toContain('opacity-50');
    expect(button('Năm').className).not.toContain('repeating-linear-gradient');
    expect(within(button('Năm')).getByText('3').className).toContain('text-fg-body/55');
    expect(within(button('Tháng')).getByText('0').className).toContain('text-fg-body/55');
    expect(within(button('Tuần')).getByText('6').className).not.toContain('text-fg-body/55');

    rerender(<SegmentToggle disabled options={OPTIONS} />);
    expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true');
    expect(classesOf(screen.getByRole('group'))).toContain('opacity-50');
    expect(classesOf(button('Ngày'))).not.toContain('opacity-50');
    expect(OPTIONS.map((o) => button(o.label).tabIndex)).toEqual([-1, -1, -1, -1]);
  });

  it('nhãn chuỗi có data-label (bóng ma giữ chỗ nét đậm), nhãn JSX thì không; tên trợ năng không lặp', () => {
    renderWithIntl(
      <SegmentToggle
        options={[
          { key: 'day', label: 'Ngày' },
          { key: 'node', label: <em>Tuần</em> },
        ]}
      />,
    );
    const label = within(button('Ngày')).getByText('Ngày');
    expect(label).toHaveAttribute('data-label', 'Ngày');
    expect(label.className).toContain('after:content-[attr(data-label)]');
    expect(within(button('Tuần')).getByText('Tuần').parentElement).not.toHaveAttribute(
      'data-label',
    );
    expect(button('Ngày')).toHaveAccessibleName('Ngày');
  });
});

describe('SegmentToggle — variant wave (tab uốn lượn)', () => {
  const OPTIONS = [
    { key: 'all', label: 'Tất cả', badge: 9 },
    { key: 'draft', label: 'Nháp', badge: 0 },
    { key: 'done', label: 'Đã duyệt' },
  ];

  it('mặt trượt chứa dải sóng SVG; dốc màu trỏ đúng id riêng của từng nhóm', () => {
    renderWithIntl(
      <>
        <SegmentToggle options={OPTIONS} variant="wave" />
        <SegmentToggle options={OPTIONS} variant="wave" />
      </>,
    );
    const ids = screen.getAllByRole('group').map((group) => {
      const glide = group.querySelector(':scope > span[aria-hidden]');
      const gradient = glide?.querySelector('svg linearGradient');
      const path = glide?.querySelector('svg path');
      expect(gradient?.id).toMatch(/^seg-wave-[\w-]+$/);
      expect(path).toHaveAttribute('fill', `url(#${gradient?.id})`);
      return gradient?.id;
    });
    expect(new Set(ids).size).toBe(2);
  });

  it('khung khai biến --sw-* đọc --seg-wave-* → --hdr-* → token, cắt ngang để vạch nền liền một đường', () => {
    renderWithIntl(<SegmentToggle options={OPTIONS} variant="wave" />);
    const root = classesOf(screen.getByRole('group'));
    expect(root).toContain('overflow-x-clip');
    expect(root).toContain('[--sw-color:var(--seg-wave-color,var(--hdr-pill,var(--sw-tone)))]');
    expect(root).toContain(
      '[--sw-track:var(--seg-wave-track,var(--hdr-divider,var(--color-divider-strong)))]',
    );
    expect(root.join(' ')).toMatch(/--seg-wave-fg-muted,var\(--hdr-fg-muted/);
  });

  it('size đổi chiều cao đoạn (28 · 32 · 36px); chữ / nền rê / chip đếm đọc biến --sw-*', () => {
    for (const [size, height] of [
      ['sm', 'h-7'],
      ['md', 'h-8'],
      ['lg', 'h-9'],
    ] as const) {
      const { unmount } = renderWithIntl(
        <SegmentToggle defaultValue="all" options={OPTIONS} size={size} variant="wave" />,
      );
      expect(classesOf(screen.getByRole('button', { name: /^Tất cả/ }))).toContain(height);
      unmount();
    }

    renderWithIntl(<SegmentToggle defaultValue="all" options={OPTIONS} variant="wave" />);
    const active = screen.getByRole('button', { name: /^Tất cả/ });
    const idle = screen.getByRole('button', { name: /^Đã duyệt/ });
    expect(classesOf(active)).toContain('text-(--sw-fg)');
    expect(classesOf(idle)).toContain('enabled:hover:bg-(--sw-hover)');
    expect(within(active).getByText('9').className).toContain('bg-(--sw-badge)');
    expect(
      within(screen.getByRole('button', { name: /^Nháp/ })).getByText('0').className,
    ).toContain('var(--sw-fg-muted)_9%');
  });
});

describe('ref là prop thường (React 19) — tới đúng phần tử DOM', () => {
  it('Input / Textarea / Checkbox / Radio / NumberInput / SegmentToggle', () => {
    const inputRef = createRef<HTMLInputElement>();
    const textareaRef = createRef<HTMLTextAreaElement>();
    const checkboxRef = createRef<HTMLInputElement>();
    const radioRef = createRef<HTMLButtonElement>();
    const numberRef = createRef<HTMLInputElement>();
    const formattedRef = createRef<HTMLInputElement>();
    const segmentRef = createRef<HTMLDivElement>();

    renderWithIntl(
      <>
        <Input ref={inputRef} aria-label="Tên" />
        <Textarea ref={textareaRef} aria-label="Ghi chú" />
        <Checkbox ref={checkboxRef} label="Đồng ý" />
        <RadioGroup defaultValue="a">
          <Radio ref={radioRef} label="Một" value="a" />
        </RadioGroup>
        <NumberInput ref={numberRef} aria-label="Số" value={1} onChange={noop} />
        <NumberInput
          ref={formattedRef}
          aria-label="Tiền"
          thousandSeparator
          value={1000}
          onChange={noop}
        />
        <SegmentToggle ref={segmentRef} options={[{ key: 'a', label: 'A' }]} />
      </>,
    );

    expect(inputRef.current).toBe(screen.getByLabelText('Tên'));
    expect(textareaRef.current).toBe(screen.getByLabelText('Ghi chú'));
    expect(checkboxRef.current).toBe(screen.getByRole('checkbox', { name: 'Đồng ý' }));
    expect(radioRef.current).toBe(screen.getByRole('radio', { name: 'Một' }));
    expect(numberRef.current).toBe(screen.getByLabelText('Số'));
    expect(formattedRef.current).toBe(screen.getByLabelText('Tiền'));
    expect(segmentRef.current).toBe(screen.getByRole('group'));
  });

  it('Menu: ref trỏ tới khung role="menu" khi đang mở', () => {
    const menuRef = createRef<HTMLDivElement>();
    renderWithIntl(
      <Menu
        ref={menuRef}
        modal={false}
        open
        options={[{ key: 'a', label: 'Sửa' }]}
        trigger={<button type="button">Thao tác</button>}
      />,
    );
    expect(menuRef.current).toBe(screen.getByRole('menu'));
  });

  it('field.ref của react-hook-form tới <input> thật: setFocus focus đúng ô', async () => {
    let setFocus: (name: 'name' | 'qty') => void = noop;

    function Harness() {
      const form = useForm<{ name: string; qty: number | null }>({
        defaultValues: { name: '', qty: null },
      });
      setFocus = form.setFocus;
      return (
        <>
          <Controller
            control={form.control}
            name="name"
            render={({ field }) => <Input {...field} aria-label="Tên" />}
          />
          <Controller
            control={form.control}
            name="qty"
            render={({ field }) => <NumberInput {...field} aria-label="Số lượng" />}
          />
        </>
      );
    }

    renderWithIntl(<Harness />);
    act(() => setFocus('name'));
    await waitFor(() => expect(screen.getByLabelText('Tên')).toHaveFocus());
    act(() => setFocus('qty'));
    await waitFor(() => expect(screen.getByLabelText('Số lượng')).toHaveFocus());
  });
});

describe('Checkbox', () => {
  it('cha giữ checked="indeterminate" thì bấm xong vẫn indeterminate', () => {
    renderWithIntl(<Checkbox checked="indeterminate" label="Chọn tất cả" />);
    const box = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Chọn tất cả' });
    expect(box.indeterminate).toBe(true);

    fireEvent.click(box);
    expect(box.indeterminate).toBe(true);
    expect(box.checked).toBe(false);
  });

  it('cha đổi indeterminate → true sau cú bấm thì hết indeterminate', () => {
    function Harness() {
      const [checked, setChecked] = useState<boolean | 'indeterminate'>('indeterminate');
      return <Checkbox checked={checked} label="Chọn tất cả" onCheckedChange={setChecked} />;
    }
    renderWithIntl(<Harness />);
    const box = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Chọn tất cả' });

    fireEvent.click(box);
    expect(box.indeterminate).toBe(false);
    expect(box.checked).toBe(true);
  });

  it('dòng lỗi được nối vào ô qua aria-describedby (giữ cả id mô tả của nơi gọi)', () => {
    renderWithIntl(
      <Checkbox aria-describedby="goi-y" error="Bắt buộc tích ô này" label="Đồng ý" />,
    );
    const box = screen.getByRole('checkbox', { name: 'Đồng ý' });
    const errorId = screen.getByText('Bắt buộc tích ô này').id;

    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box.getAttribute('aria-describedby')?.split(' ')).toEqual(['goi-y', errorId]);
  });
});

describe('NumberInput — thousandSeparator khi tự quản', () => {
  it('bấm + / ↑ cập nhật số đang hiển thị', () => {
    renderWithIntl(
      <NumberInput aria-label="Tiền" defaultValue={1000} step={500} thousandSeparator />,
    );
    const input = screen.getByLabelText<HTMLInputElement>('Tiền');
    expect(input.value).toBe('1.000');

    fireEvent.click(screen.getByRole('button', { name: 'Tăng' }));
    expect(input.value).toBe('1.500');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('2.000');
  });

  it('rời ô kẹp về max và hiển thị số đã kẹp', () => {
    renderWithIntl(
      <NumberInput aria-label="Tiền" defaultValue={5000} max={2000} thousandSeparator />,
    );
    const input = screen.getByLabelText<HTMLInputElement>('Tiền');

    fireEvent.blur(input);
    expect(input.value).toBe('2.000');
  });
});

describe('ColorPalettePanel', () => {
  it('ô hex theo `value` đổi từ ngoài; ô màu đang chọn có aria-pressed', () => {
    const { rerender } = renderWithIntl(<ColorPalettePanel value="#22C55E" onChange={noop} />);
    const hexInput = screen.getByLabelText<HTMLInputElement>('Mã màu hex');
    expect(hexInput.value).toBe('#22C55E');
    expect(screen.getByRole('button', { name: '#22C55E' })).toHaveAttribute('aria-pressed', 'true');

    rerender(<ColorPalettePanel value="#3B82F6" onChange={noop} />);
    expect(hexInput.value).toBe('#3B82F6');
    expect(screen.getByRole('button', { name: '#22C55E' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});

describe('Input clearable', () => {
  it('readOnly / disabled thì không hiện nút ✕', () => {
    const { rerender } = renderWithIntl(
      <Input aria-label="Mã" clearable value="AB" onChange={noop} />,
    );
    expect(screen.getByRole('button', { name: 'Xóa' })).toBeInTheDocument();

    rerender(<Input aria-label="Mã" clearable readOnly value="AB" onChange={noop} />);
    expect(screen.queryByRole('button', { name: 'Xóa' })).toBeNull();

    rerender(<Input aria-label="Mã" clearable disabled value="AB" onChange={noop} />);
    expect(screen.queryByRole('button', { name: 'Xóa' })).toBeNull();
  });
});

describe('ThemeToggle', () => {
  it('tên trợ năng nêu chế độ đích, không kèm aria-pressed mâu thuẫn', () => {
    renderWithIntl(<ThemeToggle showTooltip={false} theme="dark" onToggle={noop} />);
    const button = screen.getByRole('button', { name: 'Chuyển sang chế độ sáng' });
    expect(button).not.toHaveAttribute('aria-pressed');
  });
});

describe('Button loading — spinner giữa nút, nội dung giữ chỗ', () => {
  it('giữ icon đầu + chữ (bề ngang không đổi), thêm spinner, khoá nút, tên vẫn đọc được', () => {
    renderWithIntl(
      <Button loading startIcon={<svg data-testid="start-icon" />}>
        Lưu
      </Button>,
    );
    const button = screen.getByRole('button', { name: /Lưu/ });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('[data-button-spinner]')).not.toBeNull();
    expect(within(button).getByTestId('start-icon')).toBeInTheDocument();
    expect(classesOf(button)).toContain('[&>:not([data-button-spinner])]:opacity-0');
    expect(classesOf(screen.getByTestId('start-icon').parentElement as Element)).not.toContain(
      'dark:hidden',
    );
  });

  it('hết loading: không còn spinner, không còn lớp trong suốt', () => {
    renderWithIntl(<Button>Lưu</Button>);
    const button = screen.getByRole('button', { name: 'Lưu' });

    expect(button.querySelector('[data-button-spinner]')).toBeNull();
    expect(button.className).not.toContain('opacity-0');
  });
});
