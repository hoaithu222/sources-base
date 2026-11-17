import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useMemo } from 'react';

import { appConfig } from '@/core/config/env.config';
import { PATHS } from '@/shell/config';
import { AppTabBar } from '@/shell/navigation/AppTabBar';
import { MODULE_REGISTRY } from '@/shell/navigation/module-registry';
import { useTabModules } from '@/shell/navigation/use-accessible-modules';
import { useAuthStore } from '@/shell/store/slices/auth';

/**
 * Layout của nhóm màn hình ĐÃ ĐĂNG NHẬP — vừa là hàng rào, vừa là thanh tab dưới.
 *
 * ⚠️ `Tabs` nhập từ `expo-router/js-tabs`, KHÔNG phải từ `expo-router`. Ở SDK 57
 * lối nhập cũ đã deprecated (nó nhường tên `Tabs` cho bộ tab NATIVE). Giữ lối
 * cũ thì hôm nay vẫn chạy, nhưng bản SDK sau gỡ đi là gãy cả cây route.
 */
export default function AppLayout() {
  const status = useAuthStore((state) => state.status);
  const visibleModules = useTabModules();

  /**
   * Phân hệ nào được hiện tab.
   *
   * ⛔ Phải duyệt TOÀN BỘ `MODULE_REGISTRY` chứ không chỉ danh sách đã lọc.
   *
   * Expo Router tự tạo một tab cho MỌI file trong thư mục này. Nếu ta chỉ khai
   * `<Tabs.Screen>` cho các phân hệ được phép, thì phân hệ bị chặn quyền vẫn
   * hiện ra một tab — do Expo Router tự sinh, với nhãn là tên file và không có
   * biểu tượng. Cách duy nhất để giấu nó là khai tường minh với `href: null`.
   */
  const visibleIds = useMemo(
    () => new Set(visibleModules.map((module) => module.id)),
    [visibleModules],
  );

  /**
   * Hàng rào: chưa đăng nhập thì về màn đăng nhập.
   *
   * Tới được đây nghĩa là `status` đã rời khỏi `restoring` — `app/_layout.tsx`
   * chặn không cho vẽ trước lúc đó. Nên `!== 'authenticated'` ở đây là kết luận
   * chắc chắn, không phải phỏng đoán trong lúc còn đang tải.
   */
  if (appConfig.authEnabled && status !== 'authenticated') {
    return <Redirect href={PATHS.LOGIN} />;
  }

  return (
    <Tabs
      screenOptions={{
        /**
         * ⛔ Tắt header của navigator. Mỗi màn hình tự dựng `<Screen header={<AppBar …>}>`
         * theo đúng bản thiết kế: thanh tiêu đề nằm TRÊN dải gradient của màn.
         * Bật cả hai là hai thanh tiêu đề chồng nhau — một của navigator (nền
         * đặc, font hệ thống), một của bộ component.
         */
        headerShown: false,
      }}
      /**
       * ⛔ Thanh tab là component của BỘ CHUNG (`BottomNav`), không phải thanh
       * mặc định của React Navigation — xem `AppTabBar.tsx` để biết vì sao.
       */
      tabBar={(props) => <AppTabBar {...props} />}
    >
      {MODULE_REGISTRY.map((module) => (
        <Tabs.Screen
          key={module.name}
          name={module.name}
          options={{
            title: module.title,
            // `href: null` = có route, vào được bằng đường dẫn, nhưng KHÔNG hiện tab.
            href: visibleIds.has(module.id) ? undefined : null,
          }}
        />
      ))}
    </Tabs>
  );
}
