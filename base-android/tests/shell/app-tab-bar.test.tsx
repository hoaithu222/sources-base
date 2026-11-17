import { fireEvent, render, userEvent } from '@testing-library/react-native';
import { BottomTabBarHeightCallbackContext, type BottomTabBarProps } from 'expo-router/js-tabs';
import type { ReactElement } from 'react';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

import { AppTabBar } from '@/shell/navigation/AppTabBar';
import { MODULE_REGISTRY } from '@/shell/navigation/module-registry';

/**
 * ⛔ `BottomNav` gọi `useSafeAreaInsets()`, mà hook đó NÉM LỖI khi không có
 * `SafeAreaProvider` bọc ngoài. `initialMetrics` là bắt buộc: trong Jest không
 * có tầng native nào đo được, thiếu nó thì provider chờ `onLayout` mãi mãi.
 */
const METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

function renderInSafeArea(ui: ReactElement) {
  return render(<SafeAreaProvider initialMetrics={METRICS}>{ui}</SafeAreaProvider>);
}

/**
 * Dựng bộ prop mà React Navigation truyền cho `tabBar`.
 *
 * ⚠️ Ép kiểu MỘT lần ở đây, và chỉ ở đây. `BottomTabBarProps` kéo theo cả cây
 * kiểu của navigator (`TabNavigationState`, `Descriptor`, `NavigationHelpers`);
 * dựng bản đầy đủ chỉ để test là chép lại nội bộ thư viện, mà bản chép đó sẽ
 * mục đi ở lần nâng SDK kế tiếp. Thứ đang test là LOGIC ánh xạ route → mục, và
 * nó chỉ đụng tới bốn trường dưới đây.
 */
function makeProps({
  hiddenRouteNames = [],
  index = 0,
  navigate = jest.fn(),
  emit = jest.fn(() => ({ defaultPrevented: false })),
}: {
  emit?: jest.Mock;
  hiddenRouteNames?: string[];
  index?: number;
  navigate?: jest.Mock;
} = {}): BottomTabBarProps {
  const routes = MODULE_REGISTRY.map((module) => ({
    key: `${module.name}-key`,
    name: module.name,
    params: undefined,
  }));

  const descriptors = Object.fromEntries(
    routes.map((route) => [
      route.key,
      {
        options: {
          title: MODULE_REGISTRY.find((m) => m.name === route.name)?.title,
          href: hiddenRouteNames.includes(route.name) ? null : undefined,
        },
      },
    ]),
  );

  return {
    descriptors,
    insets: METRICS.insets,
    navigation: { emit, navigate },
    state: { index, routes },
  } as unknown as BottomTabBarProps;
}

/**
 * Lấy phân hệ thứ `index`, ném lỗi nếu registry ngắn hơn.
 *
 * ⚠️ `MODULE_REGISTRY[1]` có kiểu `ModuleConfig | undefined` vì
 * `noUncheckedIndexedAccess` đang bật. ⛔ Đừng dập bằng `!`: nếu ai đó xoá bớt
 * một phân hệ thì test sẽ đỏ ở một dòng `expect` khó hiểu, còn ở đây nó đỏ kèm
 * câu nói đúng chuyện gì đã xảy ra.
 */
function moduleAt(index: number) {
  const module = MODULE_REGISTRY[index];
  if (!module) throw new Error(`MODULE_REGISTRY không có mục thứ ${String(index)}`);
  return module;
}

describe('AppTabBar', () => {
  /**
   * ⛔ Thanh tab tự dựng PHẢI tự báo chiều cao THẬT. `BottomTabBar` mặc định làm việc này trong
   * `onLayout`, còn `BottomNav` thì không; không báo thì `BottomTabBarHeightContext` (cấp cho mọi
   * màn con) mãi là số ƯỚC LƯỢNG lúc khởi tạo (`49 + insets.bottom`) — lệch chiều cao thật, và mọi
   * thứ tính vị trí từ nó (nút nổi, thanh cố định trên bàn phím) hụt/dư bấy nhiêu.
   */
  it('báo chiều cao THẬT của thanh cho navigator khi đo xong bố cục', async () => {
    const report = jest.fn();
    const screen = await renderInSafeArea(
      <BottomTabBarHeightCallbackContext.Provider value={report}>
        <AppTabBar {...makeProps()} />
      </BottomTabBarHeightCallbackContext.Provider>,
    );

    await fireEvent(screen.getByTestId('app-tab-bar'), 'layout', {
      nativeEvent: { layout: { height: 88, width: 375, x: 0, y: 0 } },
    });

    expect(report).toHaveBeenCalledWith(88);
  });

  it('ngoài <Tabs> (không có callback) đo bố cục vẫn không nổ', async () => {
    const screen = await renderInSafeArea(<AppTabBar {...makeProps()} />);

    await fireEvent(screen.getByTestId('app-tab-bar'), 'layout', {
      nativeEvent: { layout: { height: 88, width: 375, x: 0, y: 0 } },
    });

    expect(screen.getAllByRole('tab').length).toBeGreaterThan(0);
  });

  it('vẽ đúng nhãn của mọi phân hệ trong MODULE_REGISTRY', async () => {
    const screen = await renderInSafeArea(<AppTabBar {...makeProps()} />);

    for (const module of MODULE_REGISTRY) {
      expect(screen.getByText(module.title)).toBeOnTheScreen();
    }
    expect(screen.getAllByRole('tab')).toHaveLength(MODULE_REGISTRY.length);
  });

  /**
   * ⛔ Ca này chặn một lỗ QUYỀN, không phải lỗi hiển thị.
   *
   * `href: null` là cách `app/(app)/_layout.tsx` giấu tab của phân hệ người dùng
   * không đủ quyền. Route vẫn nằm trong `state.routes`; thanh tab không lọc thì
   * mục đó vẫn hiện ra và bấm được.
   */
  it('KHÔNG vẽ mục của route bị giấu bằng `href: null`', async () => {
    const hidden = moduleAt(1);
    const screen = await renderInSafeArea(
      <AppTabBar {...makeProps({ hiddenRouteNames: [hidden.name] })} />,
    );

    expect(screen.queryByText(hidden.title)).not.toBeOnTheScreen();
    expect(screen.getAllByRole('tab')).toHaveLength(MODULE_REGISTRY.length - 1);
  });

  it('bấm tab khác thì phát `tabPress` rồi điều hướng tới đúng route', async () => {
    const navigate = jest.fn();
    const emit = jest.fn(() => ({ defaultPrevented: false }));
    const target = moduleAt(2);

    const screen = await renderInSafeArea(<AppTabBar {...makeProps({ emit, navigate })} />);
    await userEvent.press(screen.getByText(target.title));

    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: `${target.name}-key` }),
    );
    expect(navigate).toHaveBeenCalledWith(
      expect.objectContaining({ name: target.name, merge: true }),
    );
  });

  /**
   * Bấm lại tab ĐANG mở không được điều hướng: đó là cú "cuộn lên đầu" mà màn
   * hình tự xử qua sự kiện `tabPress`. Điều hướng thêm một lần nữa sẽ dựng lại
   * màn và người dùng mất vị trí cuộn.
   */
  it('bấm lại tab đang mở thì KHÔNG điều hướng', async () => {
    const navigate = jest.fn();
    const current = moduleAt(0);

    const screen = await renderInSafeArea(<AppTabBar {...makeProps({ index: 0, navigate })} />);
    await userEvent.press(screen.getByText(current.title));

    expect(navigate).not.toHaveBeenCalled();
  });

  /**
   * ⛔ `preventDefault()` phải được tôn trọng: đó là cách một màn hình có việc
   * đang dở (form chưa lưu) chặn cú chuyển tab. Bỏ qua nó thì người dùng mất
   * dữ liệu đang nhập mà không có cảnh báo nào.
   */
  it('tôn trọng `preventDefault()` của người nghe `tabPress`', async () => {
    const navigate = jest.fn();
    const emit = jest.fn(() => ({ defaultPrevented: true }));
    const target = moduleAt(1);

    const screen = await renderInSafeArea(<AppTabBar {...makeProps({ emit, navigate })} />);
    await userEvent.press(screen.getByText(target.title));

    expect(emit).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
