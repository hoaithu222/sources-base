import { render, userEvent } from '@testing-library/react-native';
import { BottomTabBarHeightContext } from 'expo-router/js-tabs';
import { type ReactElement } from 'react';
import { Platform, processColor, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

import { LIGHT_COLORS } from '@/shared/theme/colors.generated';
import { BottomActionBar, BottomNav, type BottomNavItem } from '@/shared/ui/navigation';
import { bottomNav } from '@/shared/ui/navigation/bottom-nav.styles';

/**
 * ⚠️ Chỉ test HÀNH VI. `className` KHÔNG thành `style` trong Jest — xem
 * `docs/rules/testing.md`. ⛔ Đệm đáy theo vùng an toàn (`insets.bottom`) là
 * thứ quan trọng nhất của cả hai component này, nhưng nó là một con số trong
 * `style` nội tuyến nên kiểm ở đây chỉ là chép lại hằng số; nó phải nghiệm thu
 * trên máy có vạch gạt ngang.
 *
 * ⚠️ `render()` của RNTL 14 là BẤT ĐỒNG BỘ, phải `await`.
 *
 * ⛔ Cả hai component gọi `useSafeAreaInsets()`, mà hook đó NÉM LỖI khi không
 * có `SafeAreaProvider` bọc ngoài. `initialMetrics` là bắt buộc: trong Jest
 * không có tầng native nào đo được, thiếu nó thì provider chờ `onLayout` mãi
 * mãi. Số đo iPhone X — đúng ca mà đệm đáy phải cộng thêm.
 */
const METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 375, height: 812 },
  insets: { top: 44, left: 0, right: 0, bottom: 34 },
};

function renderInSafeArea(ui: ReactElement, metrics: Metrics = METRICS) {
  return render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);
}

/** Xoay ngang: tai thỏ / camera đục lỗ ăn vào hai mép bên. */
const LANDSCAPE_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 812, height: 375 },
  insets: { top: 0, left: 44, right: 44, bottom: 21 },
};

/** RNTL 14 đã bỏ `UNSAFE_getAllByProps`, nên tự duyệt cây JSON đã render. */
type JsonNode = { children?: unknown[] | null; props?: Record<string, unknown> } | null;

function findByProp(node: unknown, key: string, value: unknown): JsonNode {
  if (!node || typeof node !== 'object') return null;
  const current = node as { children?: unknown[] | null; props?: Record<string, unknown> };
  if (current.props?.[key] === value) return current;
  for (const child of current.children ?? []) {
    const found = findByProp(child, key, value);
    if (found) return found;
  }
  return null;
}

const ITEMS: BottomNavItem[] = [
  { icon: <Text>🏠</Text>, key: 'home', label: 'Trang chủ' },
  { badge: 3, icon: <Text>🔔</Text>, key: 'alerts', label: 'Thông báo' },
  { icon: <Text>👤</Text>, key: 'profile', label: 'Cá nhân' },
];

describe('BottomNav', () => {
  it('vẽ đủ nhãn của mọi mục', async () => {
    const screen = await renderInSafeArea(
      <BottomNav activeKey="home" items={ITEMS} onSelect={jest.fn()} />,
    );

    expect(screen.getByText('Trang chủ')).toBeOnTheScreen();
    expect(screen.getByText('Thông báo')).toBeOnTheScreen();
    expect(screen.getByText('Cá nhân')).toBeOnTheScreen();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('danh sách rỗng vẫn dựng được, không nổ', async () => {
    const screen = await renderInSafeArea(
      <BottomNav activeKey="home" items={[]} onSelect={jest.fn()} />,
    );

    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  it('bấm một mục thì báo về đúng KHOÁ của nó, đúng một lần', async () => {
    const onSelect = jest.fn();
    const screen = await renderInSafeArea(
      <BottomNav activeKey="home" items={ITEMS} onSelect={onSelect} />,
    );

    await userEvent.press(screen.getByRole('tab', { name: 'Cá nhân' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('profile');
  });

  /** Bấm lại mục đang mở vẫn báo về — nơi gọi tự lọc nếu muốn (cuộn lên đầu…). */
  it('bấm lại mục đang mở vẫn báo về', async () => {
    const onSelect = jest.fn();
    const screen = await renderInSafeArea(
      <BottomNav activeKey="home" items={ITEMS} onSelect={onSelect} />,
    );

    await userEvent.press(screen.getByRole('tab', { name: 'Trang chủ' }));

    expect(onSelect).toHaveBeenCalledWith('home');
  });

  /**
   * ⛔ Đúng MỘT mục ở trạng thái đang chọn, và tín hiệu đó phải nằm ở
   * `accessibilityState.selected` chứ không chỉ ở màu nền — trình đọc màn hình
   * không thấy màu, mà thanh dưới là chỗ người dùng dễ lạc nhất khi không biết
   * mình đang ở phân hệ nào.
   */
  it('chỉ một mục ở trạng thái đang chọn', async () => {
    const screen = await renderInSafeArea(
      <BottomNav activeKey="alerts" items={ITEMS} onSelect={jest.fn()} />,
    );

    const tabs = screen.getAllByRole('tab');

    expect(tabs.filter((tab) => tab.props.accessibilityState?.selected)).toHaveLength(1);
    expect(screen.getByRole('tab', { name: 'Thông báo, 3 mục chưa đọc' })).toBeSelected();
  });

  /**
   * ⛔ Đây là lý do huy hiệu phải được GỘP vào nhãn.
   *
   * Con số trong ô đỏ là hình ảnh — trình đọc màn hình không đọc nó, và ô đó
   * còn bị chủ động giấu đi để khỏi bị đọc tách rời thành "3". Không gộp thì
   * người dùng khiếm thị hoàn toàn không biết có thông báo chưa đọc.
   */
  it('gộp số chưa đọc vào nhãn trợ năng của mục', async () => {
    const screen = await renderInSafeArea(
      <BottomNav activeKey="home" items={ITEMS} onSelect={jest.fn()} />,
    );

    expect(screen.getByLabelText('Thông báo, 3 mục chưa đọc')).toBeOnTheScreen();
  });

  /**
   * ⚠️ RNTL mặc định BỎ QUA phần tử bị giấu khỏi trợ năng — nên "không thấy
   * theo cách thường, thấy khi bật `includeHiddenElements`" chính là bằng chứng
   * ô huy hiệu đã bị giấu đúng.
   */
  it('ô huy hiệu vẫn vẽ ra nhưng bị giấu khỏi trình đọc màn hình', async () => {
    const screen = await renderInSafeArea(
      <BottomNav activeKey="home" items={ITEMS} onSelect={jest.fn()} />,
    );

    expect(screen.queryByText('3')).toBeNull();
    expect(screen.getByText('3', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('không có huy hiệu thì nhãn chỉ còn tên mục', async () => {
    const screen = await renderInSafeArea(
      <BottomNav activeKey="home" items={ITEMS} onSelect={jest.fn()} />,
    );

    expect(screen.getByRole('tab', { name: 'Trang chủ' })).toBeOnTheScreen();
    expect(screen.queryByLabelText('Trang chủ, 0 mục chưa đọc')).toBeNull();
  });

  /** `badge: 0` = "không có gì chưa đọc" ⇒ KHÔNG vẽ ô đỏ, và nhãn cũng không nhắc tới. */
  it('huy hiệu bằng 0 thì không vẽ ô và không vào nhãn', async () => {
    const screen = await renderInSafeArea(
      <BottomNav
        activeKey="home"
        items={[{ badge: 0, key: 'alerts', label: 'Thông báo' }]}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.queryByText('0', { includeHiddenElements: true })).toBeNull();
    expect(screen.getByRole('tab', { name: 'Thông báo' })).toBeOnTheScreen();
  });

  /**
   * ⛔ Ô đỏ cắt ở "99+" vì không đủ chỗ, nhưng nhãn trợ năng phải đọc SỐ THẬT.
   * Cắt cả ở nhãn thì người dùng khiếm thị mất hẳn thông tin, còn người sáng
   * mắt vẫn mở ra là thấy đủ — đúng kiểu bất công im lặng.
   */
  it('trên 99 thì ô đỏ cắt thành "99+" nhưng nhãn vẫn đọc số thật', async () => {
    const screen = await renderInSafeArea(
      <BottomNav
        activeKey="home"
        items={[{ badge: 128, key: 'alerts', label: 'Thông báo' }]}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByText('99+', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.queryByText('128', { includeHiddenElements: true })).toBeNull();
    expect(screen.getByLabelText('Thông báo, 128 mục chưa đọc')).toBeOnTheScreen();
  });

  it('mục đang mở dùng activeIcon, mục còn lại dùng icon thường', async () => {
    const items: BottomNavItem[] = [
      {
        activeIcon: <Text>Nhà đậm</Text>,
        icon: <Text>Nhà nhạt</Text>,
        key: 'home',
        label: 'Trang chủ',
      },
      {
        activeIcon: <Text>Chuông đậm</Text>,
        icon: <Text>Chuông nhạt</Text>,
        key: 'alerts',
        label: 'Thông báo',
      },
    ];

    const screen = await renderInSafeArea(
      <BottomNav activeKey="home" items={items} onSelect={jest.fn()} />,
    );

    expect(screen.getByText('Nhà đậm')).toBeOnTheScreen();
    expect(screen.queryByText('Nhà nhạt')).toBeNull();
    expect(screen.getByText('Chuông nhạt')).toBeOnTheScreen();
    expect(screen.queryByText('Chuông đậm')).toBeNull();
  });

  /** Không có `activeIcon` thì mục đang mở rơi về `icon` thường, không mất biểu tượng. */
  it('thiếu activeIcon thì mục đang mở vẫn giữ icon thường', async () => {
    const screen = await renderInSafeArea(
      <BottomNav
        activeKey="home"
        items={[{ icon: <Text>Nhà</Text>, key: 'home', label: 'Trang chủ' }]}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByText('Nhà')).toBeOnTheScreen();
  });

  /**
   * ⛔ Thanh tab của bản vẽ (`259:95676`, `Type=Menu`) có nền GRADIENT XANH ĐẬM
   * chứ không phải nền trắng — nền trắng là của component "bottom bar" nằm cùng
   * section. Màu thì không kiểm được trong Jest (`className` không thành `style`),
   * nhưng cái LỚP vẽ dải màu thì kiểm được: nó phải tồn tại, không ăn cú chạm
   * (nếu không thì phủ kín thanh và bấm tab không ăn), và im lặng với trình đọc
   * màn hình.
   */
  it('có lớp nền dải màu, không ăn cú chạm và im lặng với trình đọc màn hình', async () => {
    const screen = await renderInSafeArea(
      <BottomNav activeKey="home" items={ITEMS} onSelect={jest.fn()} />,
    );

    const decoration = findByProp(screen.toJSON(), 'pointerEvents', 'none');

    expect(decoration).not.toBeNull();
    expect(decoration?.props).toMatchObject({
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
    });
  });

  /** Nhãn tab là một dòng và cắt ở đuôi — thanh chia đều 5 cột, không có chỗ xuống dòng. */
  it('khoá nhãn ở một dòng và cắt ở đuôi', async () => {
    const screen = await renderInSafeArea(
      <BottomNav
        activeKey="home"
        items={[{ key: 'save', label: 'Tiết kiệm trực tuyến' }]}
        onSelect={jest.fn()}
      />,
    );

    const label = screen.getByText('Tiết kiệm trực tuyến');

    expect(label.props.numberOfLines).toBe(1);
    expect(label.props.ellipsizeMode).toBe('tail');
  });

  /**
   * ⛔ Lề ngang của hàng mục (16dp, class `px-md`) và vùng an toàn ngang (`insets.left/right`,
   * style nội tuyến) phải nằm ở HAI node khác nhau: style nội tuyến ĐÈ class chứ không cộng, nên
   * đặt cả hai lên một node là lề 16dp biến mất — các mục tab dính sát tai thỏ/mép màn khi xoay
   * ngang. Test khoá cấu trúc đó (cả hai đều cộng được vì lồng nhau).
   */
  it('vùng an toàn ngang ở khối ngoài, lề 16dp ở hàng mục — không đè lên nhau', async () => {
    const screen = await renderInSafeArea(
      <BottomNav activeKey="home" items={ITEMS} onSelect={jest.fn()} />,
      LANDSCAPE_METRICS,
    );

    const root = findByProp(screen.toJSON(), 'accessibilityRole', 'tablist');
    const rootStyle = StyleSheet.flatten(root?.props?.style as never) as Record<string, unknown>;
    expect(rootStyle.paddingLeft).toBe(LANDSCAPE_METRICS.insets.left);
    expect(rootStyle.paddingRight).toBe(LANDSCAPE_METRICS.insets.right);

    const row = screen.getAllByRole('tab')[0]?.parent;
    expect(String(row?.props.className)).toContain('px-md');
    const rowStyle = StyleSheet.flatten(row?.props.style as never) as
      Record<string, unknown> | undefined;
    expect(rowStyle?.paddingLeft).toBeUndefined();
    expect(rowStyle?.paddingRight).toBeUndefined();
    expect(bottomNav().row()).toContain('px-md');
  });

  /**
   * ⛔ Phản hồi chạm trên Android phải theo TOKEN của thanh (chữ trên nav, trắng ~12%), không phải
   * ripple mặc định của hệ điều hành: màu mặc định là xám/đen trong suốt, trên nền xanh đậm gần như
   * không thấy gì — người dùng bấm tab mà không có phản hồi nào.
   */
  describe('phản hồi chạm trên Android', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('ripple có màu lấy từ token chữ-trên-nav, trong suốt một phần', async () => {
      jest.replaceProperty(Platform, 'OS', 'android');
      const screen = await renderInSafeArea(
        <BottomNav activeKey="home" items={ITEMS} onSelect={jest.fn()} />,
      );

      const ripple = screen.getAllByRole('tab')[0]?.props.nativeBackgroundAndroid as {
        borderless: boolean;
        color?: number;
      };
      const expectedRgb = (processColor(LIGHT_COLORS['fg-on-nav-accent']) as number) & 0x00ffffff;

      expect(ripple.borderless).toBe(true);
      expect(ripple.color).toBeDefined();
      const alpha = (ripple.color as number) >>> 24;
      expect(alpha).toBeGreaterThan(0);
      expect(alpha).toBeLessThan(0xff);
      expect((ripple.color as number) & 0x00ffffff).toBe(expectedRgb);
    });
  });
});

describe('BottomActionBar', () => {
  it('vẽ nội dung được truyền vào', async () => {
    const screen = await renderInSafeArea(
      <BottomActionBar>
        <Text>Xác nhận</Text>
      </BottomActionBar>,
    );

    expect(screen.getByText('Xác nhận')).toBeOnTheScreen();
  });

  it('vẽ được nhiều nút và bấm được từng nút', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const screen = await renderInSafeArea(
      <BottomActionBar divider>
        <Text accessibilityRole="button" onPress={onCancel}>
          Huỷ
        </Text>
        <Text accessibilityRole="button" onPress={onConfirm}>
          Xác nhận
        </Text>
      </BottomActionBar>,
    );

    await userEvent.press(screen.getByRole('button', { name: 'Xác nhận' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  /**
   * ⛔ Vùng nút của một màn hình KHÔNG phải thanh tab. Gắn `tablist`/`tab` vào
   * đây thì trình đọc màn hình đọc nút "Xác nhận" thành một tab, và người dùng
   * chờ nó chuyển màn thay vì hiểu là mình vừa gửi giao dịch. Đó chính là lý do
   * component này tách khỏi `BottomNav`.
   */
  it('KHÔNG tự gắn vai điều hướng cho nội dung', async () => {
    const screen = await renderInSafeArea(
      <BottomActionBar>
        <Text>Xác nhận</Text>
      </BottomActionBar>,
    );

    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  /**
   * ⛔ Trong `<Tabs>`, thanh nav bên dưới đã ăn trọn vùng an toàn đáy (`BottomTabView` không ghi
   * đè `SafeAreaInsetsContext` của màn con nên `insets.bottom` vẫn là 34). Thanh hành động mà vẫn
   * cộng `insets.bottom` thì có dải trống 34dp giữa nút và nav (bản vẽ chỉ chừa 16).
   */
  describe('vùng an toàn đáy', () => {
    /** `paddingBottom` đầu tiên trong cây — chỉ `BottomActionBar` đặt nó (style nội tuyến). */
    function firstPaddingBottom(node: unknown): number | undefined {
      if (!node || typeof node !== 'object') return undefined;
      const current = node as { children?: unknown[] | null; props?: Record<string, unknown> };
      const style = StyleSheet.flatten(current.props?.style as never) as
        { paddingBottom?: number } | undefined;
      if (typeof style?.paddingBottom === 'number') return style.paddingBottom;
      for (const child of current.children ?? []) {
        const found = firstPaddingBottom(child);
        if (found !== undefined) return found;
      }
      return undefined;
    }

    it('ngoài thanh tab: cộng insets.bottom như cũ (vạch gạt ngang)', async () => {
      const screen = await renderInSafeArea(
        <BottomActionBar>
          <Text>Xác nhận</Text>
        </BottomActionBar>,
      );

      expect(firstPaddingBottom(screen.toJSON())).toBe(METRICS.insets.bottom);
    });

    it('trong thanh tab: chỉ chừa khe 16dp, không cộng insets.bottom lần nữa', async () => {
      const screen = await renderInSafeArea(
        <BottomTabBarHeightContext.Provider value={82}>
          <BottomActionBar>
            <Text>Xác nhận</Text>
          </BottomActionBar>
        </BottomTabBarHeightContext.Provider>,
      );

      expect(firstPaddingBottom(screen.toJSON())).toBe(16);
    });

    it('trong thanh tab, máy không có vạch gạt: vẫn khe 16dp', async () => {
      const screen = await renderInSafeArea(
        <BottomTabBarHeightContext.Provider value={56}>
          <BottomActionBar>
            <Text>Xác nhận</Text>
          </BottomActionBar>
        </BottomTabBarHeightContext.Provider>,
        { ...METRICS, insets: { ...METRICS.insets, bottom: 0 } },
      );

      expect(firstPaddingBottom(screen.toJSON())).toBe(16);
    });
  });
});
