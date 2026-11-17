/**
 * ⛔ `@react-navigation/bottom-tabs` KHÔNG phải một gói riêng ở đây.
 *
 * Expo SDK 57 đóng gói React Navigation vào TRONG `expo-router`
 * (`expo-router/build/react-navigation/*`). Thêm `@react-navigation/bottom-tabs`
 * vào `package.json` là kéo về một BẢN SAO THỨ HAI của thư viện: hai
 * `NavigationContainer`, hai bộ context, và triệu chứng là hook điều hướng trả
 * `undefined` ở một màn hình không liên quan.
 *
 * Đường nhập đúng là `expo-router/js-tabs` — cũng chính là chỗ `Tabs` chuyển
 * tới, vì `import { Tabs } from 'expo-router'` đã bị đánh dấu deprecated ở SDK 57.
 */
import { BottomTabBarHeightCallbackContext, type BottomTabBarProps } from 'expo-router/js-tabs';
import { useContext, useMemo } from 'react';
import { View } from 'react-native';

import { Icon } from '@/shared/ui/icon';
import { BottomNav, type BottomNavItem } from '@/shared/ui/navigation';

import { MODULE_REGISTRY } from './module-registry';

/**
 * Thanh tab dưới của app — nối `<Tabs>` của Expo Router vào `BottomNav` của bộ
 * component dùng chung.
 *
 * ── Vì sao KHÔNG dùng thanh tab mặc định của React Navigation ────────────────
 * Thanh mặc định không đi qua NativeWind, nên mọi thứ về hình thức phải khai
 * lại bằng style nội tuyến: màu nền, màu chữ, và cả `fontFamily` (quên dòng đó
 * là nhãn tab lặng lẽ rơi về font hệ thống trong khi cả app dùng font thương
 * hiệu). Tức là hai hệ style song song cho cùng một thứ, và cái ở thanh tab
 * luôn là cái bị quên khi đổi token.
 *
 * `BottomNav` đã dựng theo đúng bản thiết kế, ăn token, tự cộng vùng an toàn
 * đáy và có sẵn huy hiệu số chưa đọc. Nối vào đây thì thanh tab của app và
 * thanh tab trong bộ component là MỘT — sửa một chỗ, đổi cả hai.
 *
 * ── Chia việc ───────────────────────────────────────────────────────────────
 * `BottomNav` thuần trình bày (nhận `items` + `onSelect`). Phần "bấm thì đi
 * đâu" là việc của navigator, và nó nằm ở đây.
 */
export function AppTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  /**
   * Chỉ lấy route CÓ hiện tab.
   *
   * `href: null` trong `app/(app)/_layout.tsx` giấu tab của phân hệ không đủ
   * quyền, nhưng route vẫn nằm trong `state.routes` — không lọc thì thanh dưới
   * vẫn vẽ đủ mục và người dùng bấm được vào phân hệ họ không được vào.
   * Dấu hiệu nhận biết: `options.href === null`.
   */
  const visibleRoutes = useMemo(
    () =>
      state.routes.filter((route) => {
        /**
         * ⚠️ `descriptors[key]` khai kiểu là `| undefined` vì
         * `noUncheckedIndexedAccess` đang bật. Không phải lo hão: trong nhịp vẽ
         * đầu sau khi một route bị gỡ, `state.routes` và `descriptors` có thể
         * lệch nhau đúng một nhịp.
         */
        const options = descriptors[route.key]?.options as { href?: string | null } | undefined;
        return options?.href !== null;
      }),
    [descriptors, state.routes],
  );

  const items = useMemo<BottomNavItem[]>(
    () =>
      visibleRoutes.map((route) => {
        const module = MODULE_REGISTRY.find((entry) => entry.name === route.name);
        const focused = state.routes[state.index]?.key === route.key;
        const options = descriptors[route.key]?.options;

        return {
          key: route.key,
          label: module?.title ?? options?.title ?? route.name,
          icon: module ? (
            <Icon
              /**
               * ⛔ Màu icon phải đi CÙNG CẶP với màu nhãn của `BottomNav`.
               *
               * Nền thanh tab là dải gradient xanh đậm (`nav-from` → `nav-to`)
               * ở CẢ HAI chế độ sáng/tối, nên họ `fg-on-nav*` là màu trắng ở cả
               * hai: `fg-on-nav-accent` = trắng 100% (đang mở),
               * `fg-on-nav-muted` = trắng 80% (không). Ghép chéo sang `fg-1`
               * hay `primary-*` là icon mực trên nền xanh đậm — chìm hẳn.
               *
               * ⚠️ Figma `State=Active` (`259:95709`) dùng icon **solid**, nhưng
               * `assets/icons/system` mới có `linear` + `twotone` nên
               * `activeVariant` mặc định là `twotone` — xấp xỉ gần nhất.
               */
              accentColor={focused ? 'fg-on-nav-accent' : 'fg-on-nav-muted'}
              color={focused ? 'fg-on-nav-accent' : 'fg-on-nav-muted'}
              name={module.icon}
              variant={focused ? (module.activeVariant ?? 'twotone') : 'linear'}
            />
          ) : undefined,
        };
      }),
    [descriptors, state.index, state.routes, visibleRoutes],
  );

  const activeKey = state.routes[state.index]?.key ?? '';

  /**
   * ⛔ Thanh tab tự dựng PHẢI tự báo chiều cao THẬT cho `BottomTabView`.
   *
   * `BottomTabBar` mặc định báo trong `onLayout`; `BottomNav` thuần trình bày nên không. Không báo
   * thì `BottomTabBarHeightContext` — cấp cho MỌI màn con, và là tín hiệu "đang trên thanh tab"
   * của `Screen`/`BottomActionBar` — mãi là số ƯỚC LƯỢNG lúc khởi tạo (`49 + insets.bottom`),
   * thấp hơn thanh thật vài dp. Dự án nào tính vị trí nút nổi / thanh cố định trên bàn phím từ
   * số đó sẽ lệch bấy nhiêu, và `tsc` lẫn test bố cục đều mù với chuyện này. `View` bọc chỉ để
   * có `onLayout` (không style ⇒ không đổi bố cục). Ngoài `<Tabs>` không có callback ⇒ no-op.
   */
  const reportHeight = useContext(BottomTabBarHeightCallbackContext);

  return (
    <View
      testID="app-tab-bar"
      onLayout={(event) => reportHeight?.(event.nativeEvent.layout.height)}
    >
      <BottomNav
        activeKey={activeKey}
        items={items}
        onSelect={(key) => {
          const route = state.routes.find((entry) => entry.key === key);
          if (!route) return;

          /**
           * ⛔ Phải phát `tabPress` rồi mới điều hướng, và phải tôn trọng
           * `preventDefault()`.
           *
           * Đây là sự kiện mà React Navigation dùng cho hai hành vi người dùng đã
           * quen: bấm lại tab đang mở thì cuộn danh sách lên đầu, và màn hình có
           * việc đang dở (form chưa lưu) chặn được cú chuyển tab. Gọi thẳng
           * `navigate()` là bỏ qua cả hai — không lỗi nào báo, chỉ là app cư xử
           * khác mọi app khác.
           */
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          const focused = state.routes[state.index]?.key === route.key;
          if (focused || event.defaultPrevented) return;

          // `merge: true` giữ lại tham số của route đích — quay lại tab cũ thì về
          // đúng chỗ đang đứng chứ không nhảy về màn gốc của tab đó.
          navigation.navigate({ name: route.name, params: route.params, merge: true });
        }}
      />
    </View>
  );
}
