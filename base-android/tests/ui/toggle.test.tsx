import { act, render, userEvent } from '@testing-library/react-native';

import { Toggle } from '@/shared/ui/toggle';

/**
 * `translateX` ĐÍCH hiện tại của lớp trượt (cha trực tiếp của núm). Đọc `jestAnimatedStyle.value` —
 * giá trị Reanimated cập nhật theo hoạt ảnh; `props.style` chỉ giữ ảnh chụp lúc dựng.
 */
const knobTranslateX = (knob: {
  parent: {
    props: { jestAnimatedStyle?: { value?: { transform?: { translateX?: number }[] } } };
  } | null;
}): unknown => knob.parent?.props.jestAnimatedStyle?.value?.transform?.[0]?.translateX;

/**
 * ⚠️ Chỉ test HÀNH VI — style của NativeWind không có trong Jest
 * (`docs/rules/testing.md`). ⚠️ `render()` của RNTL 14 phải `await`.
 *
 * ⚠️ Vị trí núm do Reanimated vẽ trên luồng UI nên KHÔNG kiểm được ở đây; cái
 * kiểm được (và cũng là cái hay hỏng) là công tắc báo về đúng giá trị và trình
 * đọc màn hình nghe đúng trạng thái.
 */
describe('Toggle', () => {
  it('bấm khi đang tắt thì báo về `true`', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <Toggle label="Nhận thông báo" value={false} onChange={onChange} />,
    );

    await userEvent.press(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('bấm khi đang bật thì báo về `false`', async () => {
    const onChange = jest.fn();
    const screen = await render(<Toggle label="Nhận thông báo" value onChange={onChange} />);

    await userEvent.press(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  /**
   * ⚠️ Vai `switch` đọc khoá `checked` (giống checkbox), KHÔNG phải `selected`.
   * Đặt nhầm khoá thì TalkBack đọc "công tắc" trống trơn và người dùng khiếm
   * thị không biết mình vừa bật hay vừa tắt.
   */
  it('trạng thái trợ năng bám theo `value`', async () => {
    const on = await render(<Toggle label="Nhận thông báo" value />);
    expect(on.getByRole('switch')).toBeChecked();

    const off = await render(<Toggle label="Nhận thông báo" value={false} />);
    expect(off.getByRole('switch')).not.toBeChecked();
  });

  it('bị khoá thì không bấm được và trình đọc màn hình biết', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <Toggle disabled label="Nhận thông báo" value={false} onChange={onChange} />,
    );

    await userEvent.press(screen.getByRole('switch'));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('hiện cả nhãn lẫn dòng mô tả', async () => {
    const screen = await render(
      <Toggle description="Áp dụng cho mọi giao dịch" label="Nhận thông báo" value />,
    );

    expect(screen.getByText('Nhận thông báo')).toBeOnTheScreen();
    expect(screen.getByText('Áp dụng cho mọi giao dịch')).toBeOnTheScreen();
  });

  /**
   * Công tắc đứng một mình (trong một hàng cài đặt đã có chữ riêng) vẫn phải
   * đọc được — nếu không trình đọc màn hình chỉ nói "công tắc, đã bật".
   */
  it('nhận nhãn trợ năng riêng khi không có nhãn nhìn thấy được', async () => {
    const screen = await render(<Toggle accessibilityLabel="Bật sinh trắc học" value={false} />);

    expect(screen.getByLabelText('Bật sinh trắc học')).toBeOnTheScreen();
  });
  /**
   * ⛔ GỐC của lỗi "núm vô hình" trên máy thật: `Animated.View` mang `className` + `useAnimatedStyle`.
   * NativeWind gộp class và style hoạt ảnh vào MỘT object, Reanimated chỉ giữ phần `transform` và VỨT
   * `h-4 w-4 rounded-full bg-*` ⇒ núm 0×0. `cssInterop(Animated.View, { className: 'style' })` KHÔNG
   * cứu được (đã chạy thử với runtime NativeWind thật: style núm chỉ còn `{ transform }`).
   * Jest không có Tailwind nên test khoá bằng CẤU TRÚC: `className` của núm phải nằm trên một `View`
   * THƯỜNG; lớp trượt `Animated.View` bao ngoài chỉ mang `style`. (`react-native-css-interop` không
   * được khai trong `package.json` nên không dùng `registerCSS` được — `check:imports` chặn.)
   */
  describe('núm công tắc', () => {
    it('có đủ kích thước và màu (hình núm nằm ở View thường, không bị hoạt ảnh nuốt className)', async () => {
      const screen = await render(<Toggle label="Nhận thông báo" value={false} />);

      const knob = screen.getByTestId('toggle-knob');

      expect(knob.props.className).toEqual(
        expect.stringMatching(/\bh-4\b.*\bw-4\b|\bw-4\b.*\bh-4\b/),
      );
      expect(knob.props.className).toContain('bg-fg-brand');
      expect(knob.props.jestAnimatedStyle).toBeUndefined();
      // Lớp trượt bao ngoài mới mang hoạt ảnh, và KHÔNG mang class nào.
      expect(knob.parent?.props.jestAnimatedStyle).toBeDefined();
      expect(knob.parent?.props.className).toBeUndefined();
    });

    it('cỡ nhỏ: núm 12×12', async () => {
      const screen = await render(<Toggle label="Nhận thông báo" size="sm" value />);

      const knob = screen.getByTestId('toggle-knob');

      expect(knob.props.className).toContain('h-3');
      expect(knob.props.className).toContain('w-3');
      expect(knob.props.jestAnimatedStyle).toBeUndefined();
    });

    /** Đang BẬT sẵn lúc mở màn (dữ liệu về từ máy chủ) thì núm đứng đúng chỗ ngay, không trượt từ trái. */
    it('mở sẵn ở trạng thái bật: núm ở đầu phải ngay lập tức', async () => {
      const on = await render(<Toggle label="Nhận thông báo" value />);
      expect(knobTranslateX(on.getByTestId('toggle-knob'))).toBe(16);

      const small = await render(<Toggle label="Nhận thông báo" size="sm" value />);
      expect(knobTranslateX(small.getByTestId('toggle-knob'))).toBe(12);

      const off = await render(<Toggle label="Nhận thông báo" value={false} />);
      expect(knobTranslateX(off.getByTestId('toggle-knob'))).toBe(0);
    });

    /** `value` đổi từ NGOÀI (hoàn lại sau lỗi mạng, đồng bộ từ máy chủ) vẫn phải trượt tới đúng đích. */
    it('`value` đổi từ ngoài: núm kết thúc đúng ở trạng thái cuối, cả hai chiều', async () => {
      jest.useFakeTimers();
      try {
        const screen = await render(<Toggle label="Nhận thông báo" value={false} />);
        expect(knobTranslateX(screen.getByTestId('toggle-knob'))).toBe(0);

        await screen.rerender(<Toggle label="Nhận thông báo" value />);
        await act(async () => {
          jest.advanceTimersByTime(400);
        });
        expect(knobTranslateX(screen.getByTestId('toggle-knob'))).toBe(16);

        await screen.rerender(<Toggle label="Nhận thông báo" value={false} />);
        await act(async () => {
          jest.advanceTimersByTime(400);
        });
        expect(knobTranslateX(screen.getByTestId('toggle-knob'))).toBe(0);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  it('component KHÔNG tự đổi trạng thái: nơi gọi không cập nhật `value` thì vẫn tắt', async () => {
    const screen = await render(
      <Toggle label="Nhận thông báo" value={false} onChange={jest.fn()} />,
    );

    await userEvent.press(screen.getByRole('switch'));

    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('bấm đúng MỘT lần ⇒ `onChange` đúng một lần, và bấm lại theo giá trị mới', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <Toggle label="Nhận thông báo" value={false} onChange={onChange} />,
    );

    await userEvent.press(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(true);

    await screen.rerender(<Toggle label="Nhận thông báo" value onChange={onChange} />);
    expect(screen.getByRole('switch')).toBeChecked();

    await userEvent.press(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  /**
   * `busy` ≠ `disabled`: công tắc đang lưu GIỮ nguyên dáng (không xám, `accessibilityState.disabled`
   * vẫn false) nhưng chặn bấm đôi/đua và báo `busy` cho trình đọc màn hình.
   */
  describe('busy', () => {
    it('báo busy, KHÔNG disabled, và bấm không gọi onChange', async () => {
      const onChange = jest.fn();
      const screen = await render(
        <Toggle busy label="Nhận thông báo" value={false} onChange={onChange} />,
      );

      await userEvent.press(screen.getByRole('switch'));
      await userEvent.press(screen.getByRole('switch'));

      expect(screen.getByRole('switch')).toBeBusy();
      expect(screen.getByRole('switch')).toBeEnabled();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('mặc định không busy; hết busy thì bấm lại được', async () => {
      const onChange = jest.fn();
      const screen = await render(
        <Toggle busy label="Nhận thông báo" value={false} onChange={onChange} />,
      );
      await screen.rerender(<Toggle label="Nhận thông báo" value={false} onChange={onChange} />);

      await userEvent.press(screen.getByRole('switch'));

      expect(screen.getByRole('switch')).not.toBeBusy();
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('vẫn để `value` đổi từ ngoài (hoàn lại sau lỗi) hiện đúng', async () => {
      const screen = await render(<Toggle busy label="Nhận thông báo" value />);
      expect(screen.getByRole('switch')).toBeChecked();

      await screen.rerender(<Toggle busy label="Nhận thông báo" value={false} />);

      expect(screen.getByRole('switch')).not.toBeChecked();
    });
  });
});
