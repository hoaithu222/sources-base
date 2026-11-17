import '@/styles/global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AppProviders } from '@/shell/providers/AppProviders';
import { useSessionBootstrap } from '@/shell/session/useSessionBootstrap';

/**
 * Giữ màn hình chờ hiện cho tới khi ta biết người dùng đã đăng nhập hay chưa.
 *
 * ⛔ Gọi ở TẦM MODULE, không phải trong effect. Effect chạy sau lần vẽ đầu, mà
 * hệ điều hành đã hạ màn hình chờ trước đó rồi — người dùng thấy một khung hình
 * trống nhấp nháy giữa màn hình chờ và màn hình thật.
 */
void SplashScreen.preventAutoHideAsync();

/**
 * Gốc của cây điều hướng.
 *
 * Hai nhóm route, cố ý tách rời:
 *
 *   `(auth)` — màn hình cho KHÁCH: đăng nhập, đăng ký, quên mật khẩu.
 *   `(app)`  — màn hình cho người ĐÃ đăng nhập, có thanh tab dưới.
 *
 * Dấu ngoặc đơn là "nhóm route" của Expo Router: nó gom file lại để dùng chung
 * một layout, nhưng KHÔNG hiện trong đường dẫn. Nên `app/(auth)/login.tsx` là
 * `/login`, không phải `/auth/login`. Nhờ vậy đổi cách nhóm về sau không làm
 * gãy deep link nào đã phát hành.
 */
export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

function RootNavigator() {
  const { isSessionReady } = useSessionBootstrap();

  useEffect(() => {
    if (isSessionReady) void SplashScreen.hideAsync();
  }, [isSessionReady]);

  /**
   * ⛔ Chưa biết trạng thái phiên thì KHÔNG vẽ gì cả.
   *
   * Vẽ sớm là guard của `(app)` chạy khi `status` còn `restoring`, kết luận
   * "chưa đăng nhập" và đẩy sang `/login` — rồi một nhịp sau token về và đẩy
   * ngược lại. Người dùng thấy màn đăng nhập chớp lên ở MỖI lần mở app.
   *
   * Trả `null` là an toàn vì màn hình chờ của hệ điều hành vẫn đang che, chưa
   * bị hạ (xem effect ngay trên).
   */
  if (!isSessionReady) return null;

  return (
    <>
      {/* `auto` = chữ thanh trạng thái tự đảo theo nền sáng/tối. Đặt cứng
          `light`/`dark` là một trong hai theme sẽ có chữ trắng trên nền trắng. */}
      <StatusBar style="auto" />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </>
  );
}
