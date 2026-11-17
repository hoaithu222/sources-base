/**
 * Nhóm pickers (UI kit: ngày, giờ, tháng) — hành vi đã sửa trong đợt tối ưu UI kit. Selects ở
 * `selects.test.tsx`.
 *
 * Mỗi `describe` ứng với một lỗi đã ghi (docs/known-issues.md) hoặc tìm thấy khi rà soát;
 * test viết để ĐỎ trên code cũ và XANH sau khi sửa.
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  DateTimePicker,
  MonthYearRangePicker,
  RangeDatePicker,
  SingleDatePicker,
  TimePicker,
} from '@/shared/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.useRealTimers();
});

const qa = <T extends Element = HTMLElement>(sel: string) =>
  Array.from(document.body.querySelectorAll<T>(sel));

/** Giả lập "hôm nay" = 15/06/2026 10:30 mà không đụng hẹn giờ của Radix. */
const freezeToday = () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 5, 15, 10, 30));
};

const dayButton = (ddmmyyyy: string) => screen.getByRole('button', { name: ddmmyyyy });

describe('PickerTrigger — ô không gõ tay vẫn dùng được bằng bàn phím', () => {
  it('DateTimePicker: ô là role="button", Tab tới được, Enter mở panel', () => {
    render(<DateTimePicker />);
    const trigger = screen.getByText('DD/MM/YYYY HH:mm').closest('[role="button"]') as HTMLElement;
    expect(trigger).not.toBeNull();
    expect(trigger.tabIndex).toBe(0);
    act(() => trigger.focus());
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByRole('button', { name: 'Xác nhận' })).toBeInTheDocument();
  });

  it('disabled: không vào bằng Tab, gắn aria-disabled, Enter không mở', () => {
    render(<TimePicker allowManualInput={false} disabled />);
    const trigger = screen.getByText('HH:mm').closest('[role="button"]') as HTMLElement;
    expect(trigger.tabIndex).toBe(-1);
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.queryByText('Giờ')).toBeNull();
  });
});

describe('DateTimePicker — không chốt ngày ngoài khoảng', () => {
  it('chưa có value, hôm nay < minDate: "Xác nhận" / "Bây giờ" khoá tới khi chọn ngày hợp lệ', () => {
    freezeToday();
    const fn = vi.fn();
    render(<DateTimePicker minDate={new Date(2026, 5, 20)} onChange={fn} />);
    fireEvent.click(screen.getByText('DD/MM/YYYY HH:mm'));

    const confirm = screen.getByRole('button', { name: 'Xác nhận' }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Bây giờ' }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    fireEvent.click(confirm);
    expect(fn).not.toHaveBeenCalled();

    fireEvent.click(dayButton('22/06/2026'));
    expect(confirm.disabled).toBe(false);
    fireEvent.click(confirm);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][0]).toEqual(new Date(2026, 5, 22, 10, 30));
  });
});

describe('Cột giờ / phút — lăn chuột chỉ cuộn MỘT lần', () => {
  it('TimePicker: listener wheel non-passive chặn cuộn mặc định (không cuộn đôi)', () => {
    render(<TimePicker />);
    fireEvent.focus(screen.getByPlaceholderText('HH:mm'));
    const lists = qa('.max-h-\\[200px\\]');
    expect(lists).toHaveLength(2);
    expect(fireEvent.wheel(lists[0], { deltaY: 40 })).toBe(false);
  });

  it('DateTimePicker: cột Giờ / Phút cũng vậy', () => {
    render(<DateTimePicker />);
    fireEvent.click(screen.getByText('DD/MM/YYYY HH:mm'));
    const columns = qa('.scrollbar-hidden');
    expect(columns).toHaveLength(2);
    expect(fireEvent.wheel(columns[1], { deltaY: 40 })).toBe(false);
  });
});

describe('RangeDatePicker — mốc đang chờ đồng bộ theo range mỗi lần mở', () => {
  const input = () => screen.getByPlaceholderText('DD/MM/YYYY - DD/MM/YYYY');
  const close = () => fireEvent.keyDown(document.body, { key: 'Escape' });

  it('range bị đặt lại từ ngoài khi panel đóng → lần mở sau bắt đầu khoảng MỚI', () => {
    freezeToday();
    const fn = vi.fn();
    const { rerender } = render(
      <RangeDatePicker range={{ from: null, to: null }} onRangeChange={fn} />,
    );
    fireEvent.focus(input());
    fireEvent.click(dayButton('10/06/2026'));
    expect(fn).toHaveBeenLastCalledWith({ from: new Date(2026, 5, 10), to: null });
    close();

    rerender(<RangeDatePicker range={{ from: null, to: null }} onRangeChange={fn} />);
    fireEvent.focus(input());
    fireEvent.click(dayButton('20/06/2026'));
    expect(fn).toHaveBeenLastCalledWith({ from: new Date(2026, 5, 20), to: null });
  });

  it('range còn dở (có from, chưa có to) → mở lại vẫn chọn tiếp mốc cuối', () => {
    freezeToday();
    const fn = vi.fn();
    render(
      <RangeDatePicker range={{ from: new Date(2026, 5, 10), to: null }} onRangeChange={fn} />,
    );
    fireEvent.focus(input());
    fireEvent.click(dayButton('20/06/2026'));
    expect(fn).toHaveBeenLastCalledWith({
      from: new Date(2026, 5, 10),
      to: new Date(2026, 5, 20),
    });
  });

  it('mở panel nhảy lịch về tháng của range.from', () => {
    freezeToday();
    render(<RangeDatePicker range={{ from: new Date(2026, 0, 5), to: null }} />);
    fireEvent.focus(input());
    expect(dayButton('05/01/2026')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tháng sau' }));
    close();
    fireEvent.focus(input());
    expect(dayButton('05/01/2026')).toBeInTheDocument();
  });
});

describe('SingleDatePicker — "Hôm nay"', () => {
  it('trả 00:00 của hôm nay, giống chọn trên lịch', () => {
    freezeToday();
    const fn = vi.fn();
    render(<SingleDatePicker onChange={fn} />);
    fireEvent.focus(screen.getByPlaceholderText('DD/MM/YYYY'));
    fireEvent.click(screen.getByRole('button', { name: 'Hôm nay' }));
    expect(fn).toHaveBeenCalledWith(new Date(2026, 5, 15));
  });
});

describe('MonthYearRangePicker — xem trước khi chờ mốc cuối', () => {
  const VALUE = { from: { month: 1, year: 2026 }, to: { month: 2, year: 2026 } };
  const cell = (label: string) => screen.getByRole('button', { name: label });

  it('rê NGƯỢC lên trước mốc đầu không tô khoảng (bấm vào đó là bắt đầu lại)', () => {
    render(<MonthYearRangePicker value={VALUE} onChange={vi.fn()} />);
    fireEvent.click(screen.getByText('T1/2026 – T2/2026'));
    fireEvent.click(cell('Th.6'));
    fireEvent.mouseEnter(cell('Th.3'));
    expect(cell('Th.3').className).not.toContain('bg-primary-6');
    expect(cell('Th.4').className).not.toContain('bg-primary-5/15');

    fireEvent.mouseEnter(cell('Th.9'));
    expect(cell('Th.9').className).toContain('bg-primary-6');
    expect(cell('Th.7').className).toContain('bg-primary-5/15');
  });
});
