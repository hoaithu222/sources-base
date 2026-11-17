import { fireEvent, render, userEvent } from '@testing-library/react-native';

import { Tabs, type TabItemData } from '@/shared/ui/tab';

import { settle, touch } from './press-test-utils';

/**
 * ⚠️ Chỉ test HÀNH VI — style của NativeWind không có trong Jest
 * (`docs/rules/testing.md`). ⚠️ `render()` của RNTL 14 phải `await`.
 */
const ITEMS: TabItemData[] = [
  { key: 'in', label: 'Tiền vào' },
  { key: 'out', label: 'Tiền ra' },
  { badge: 3, key: 'wait', label: 'Chờ duyệt' },
];

describe('Tabs', () => {
  it('bấm một tab thì báo về đúng khoá của nó', async () => {
    const onChange = jest.fn();
    const screen = await render(<Tabs items={ITEMS} value="in" onChange={onChange} />);

    await userEvent.press(screen.getByText('Tiền ra'));

    expect(onChange).toHaveBeenCalledWith('out');
  });

  /**
   * ⛔ Chỉ MỘT tab ở trạng thái đang chọn, và tín hiệu đó phải nằm ở
   * `accessibilityState.selected` chứ không chỉ ở màu chữ — trình đọc màn hình
   * không thấy màu, mà tab là chỗ người dùng dễ lạc nhất khi không thấy mình
   * đang ở đâu.
   */
  it('chỉ một tab ở trạng thái đang chọn', async () => {
    const screen = await render(<Tabs items={ITEMS} value="out" onChange={jest.fn()} />);

    const tabs = screen.getAllByRole('tab');

    expect(tabs).toHaveLength(3);
    expect(tabs.filter((tab) => tab.props.accessibilityState?.selected)).toHaveLength(1);
    expect(screen.getByRole('tab', { name: 'Tiền ra' })).toBeSelected();
  });

  it('bấm lại tab đang chọn vẫn báo về (nơi gọi tự lọc nếu cần)', async () => {
    const onChange = jest.fn();
    const screen = await render(<Tabs items={ITEMS} value="in" onChange={onChange} />);

    await userEvent.press(screen.getByText('Tiền vào'));

    expect(onChange).toHaveBeenCalledWith('in');
  });

  it('hiện badge của tab', async () => {
    const screen = await render(<Tabs items={ITEMS} value="in" onChange={jest.fn()} />);

    expect(screen.getByText('3')).toBeOnTheScreen();
  });

  /**
   * `badge: 0` VẪN hiện — "0 hồ sơ chờ duyệt" và "chưa biết có bao nhiêu" là hai
   * chuyện khác nhau; chỉ `undefined` mới ẩn badge.
   */
  it('badge bằng 0 vẫn hiện, không có badge thì không', async () => {
    const withZero = await render(
      <Tabs items={[{ badge: 0, key: 'a', label: 'A' }]} value="a" onChange={jest.fn()} />,
    );
    expect(withZero.getByText('0')).toBeOnTheScreen();

    const without = await render(
      <Tabs items={[{ key: 'a', label: 'A' }]} value="a" onChange={jest.fn()} />,
    );
    expect(without.queryByText('0')).toBeNull();
  });

  it('kiểu gạch chân vẫn đủ tab và vẫn bấm được', async () => {
    const onChange = jest.fn();
    const screen = await render(
      <Tabs items={ITEMS} value="in" variant="underline" onChange={onChange} />,
    );

    expect(screen.getAllByRole('tab')).toHaveLength(3);

    await userEvent.press(screen.getByText('Chờ duyệt'));

    expect(onChange).toHaveBeenCalledWith('wait');
  });

  /**
   * ⛔ Vùng chạm không nhìn thấy được nên không ai bắt được bằng mắt, mà tab hay
   * nằm sát ngay trên một danh sách — bấm trượt là bấm vào dòng bên dưới.
   * Tab viên nén cao đúng 40dp theo Figma (`259:93807`), thiếu 4dp so với ngưỡng
   * 44dp của `docs/rules/mobile-ux.md` ⇒ phải nới 2dp trên/dưới. Kiểu gạch chân
   * đã cao 48dp nên KHÔNG nới, nới thêm là ăn sang nội dung phía dưới.
   */
  it('tab viên nén nới vùng chạm cho đủ 44dp, kiểu gạch chân thì không', async () => {
    const pill = await render(<Tabs items={ITEMS} value="in" onChange={jest.fn()} />);

    for (const tab of pill.getAllByRole('tab')) {
      expect(tab.props.hitSlop).toEqual({ bottom: 2, top: 2 });
    }

    const underline = await render(
      <Tabs items={ITEMS} value="in" variant="underline" onChange={jest.fn()} />,
    );

    for (const tab of underline.getAllByRole('tab')) {
      expect(tab.props.hitSlop).toBeUndefined();
    }
  });

  /**
   * ⚠️ Không kiểm `getByRole('tablist')` được: RNTL chỉ tìm thấy phần tử có cờ
   * `accessible`, mà cờ đó cố ý KHÔNG đặt cho hàng tab — đặt vào là nó gộp mọi
   * tab con thành một phần tử và người dùng khiếm thị hết đường bấm từng tab.
   * Vai `tablist` vẫn được khai cho TalkBack; ở đây kiểm cái quan trọng hơn là
   * bọc trong `ScrollView` rồi thì tab vẫn đủ và vẫn bấm được.
   */
  it('bật cuộn ngang thì vẫn dựng đủ tab và vẫn bấm được', async () => {
    const onChange = jest.fn();
    const screen = await render(<Tabs items={ITEMS} scrollable value="in" onChange={onChange} />);

    expect(screen.getAllByRole('tab')).toHaveLength(3);

    await userEvent.press(screen.getByText('Chờ duyệt'));

    expect(onChange).toHaveBeenCalledWith('wait');
  });
});

/**
 * Phản hồi nhấn của tab: nền NHẠT màu chủ đạo (không còn `opacity-60` làm cả tab — kể cả viên đang
 * chọn — nhạt hẳn đi). ⚠️ Màu là `className`, Jest không biên dịch NativeWind nên đọc thẳng chuỗi
 * class đã chuyền xuống cây (KHÔNG phải `toHaveStyle`): đủ để khoá việc `pressed` đi tới đúng slot
 * và nhả tay thì class về lại như cũ (không kẹt).
 */
describe('Tabs — phản hồi nhấn', () => {
  const classesOf = (screen: Awaited<ReturnType<typeof render>>) => JSON.stringify(screen.toJSON());

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it.each(['pill', 'underline'] as const)(
    '%s: nhấn tab KHÁC tab đang chọn ⇒ nền nhạt chủ đạo, nhả ⇒ trả lại',
    async (variant) => {
      const screen = await render(
        <Tabs items={ITEMS} value="in" variant={variant} onChange={jest.fn()} />,
      );
      expect(classesOf(screen)).not.toContain('bg-action-tint');
      const tab = screen.getByRole('tab', { name: 'Tiền ra' });

      await fireEvent(tab, 'responderGrant', touch());
      await settle(50);
      expect(classesOf(screen)).toContain('bg-action-tint');
      expect(classesOf(screen)).not.toContain('opacity-60');

      await fireEvent(tab, 'responderRelease', touch());
      await settle(400);
      expect(classesOf(screen)).not.toContain('bg-action-tint');
    },
  );

  it('pill: nhấn viên ĐANG CHỌN ⇒ nền `action-press`, không mờ đi', async () => {
    const screen = await render(<Tabs items={ITEMS} value="in" onChange={jest.fn()} />);

    await fireEvent(screen.getByRole('tab', { name: 'Tiền vào' }), 'responderGrant', touch());
    await settle(50);

    expect(classesOf(screen)).toContain('bg-action-press');
    expect(classesOf(screen)).not.toContain('opacity-60');
  });

  it('bị cuộn cướp cú chạm ⇒ trả lại như cũ, không kẹt', async () => {
    const screen = await render(<Tabs items={ITEMS} value="in" onChange={jest.fn()} />);
    const tab = screen.getByRole('tab', { name: 'Tiền ra' });

    await fireEvent(tab, 'responderGrant', touch());
    await settle(50);
    await fireEvent(tab, 'responderTerminate', touch());
    await settle(400);

    expect(classesOf(screen)).not.toContain('bg-action-tint');
  });
});
