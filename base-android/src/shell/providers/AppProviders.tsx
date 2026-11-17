import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { warnOnRiskyConfig } from '@/core/config/env.config';
import { queryClient } from '@/core/config/query-client';
import { configureZodLocale } from '@/core/config/zod.config';
import { ToastHost } from '@/shared/ui/feedback/ToastHost';

import { ErrorBoundary } from './ErrorBoundary';
import { ThemeProvider } from './ThemeProvider';

/**
 * Đặt tiếng Việt cho Zod NGAY LÚC NẠP MODULE, không phải trong effect.
 *
 * ⛔ Phải chạy TRƯỚC khi bất kỳ schema nào được `parse`. Nếu để trong
 * `useEffect` thì effect chạy SAU lần render đầu, mà màn đăng nhập đã kịp dựng
 * schema và kiểm dữ liệu — lỗi đầu tiên người dùng thấy sẽ là tiếng Anh, các
 * lỗi sau mới tiếng Việt. Sai kiểu "chỉ lần đầu" là loại khó tái hiện nhất.
 */
configureZodLocale();

/** In cảnh báo cấu hình rủi ro MỘT lần lúc khởi động (chỉ ở bản dev). */
warnOnRiskyConfig();

/**
 * Toàn bộ provider của app, đúng thứ tự.
 *
 * ── Thứ tự KHÔNG tuỳ tiện ────────────────────────────────────────────────────
 *
 *  1. `GestureHandlerRootView` — PHẢI ngoài cùng và phải có `flex-1`. Đây là
 *     yêu cầu của thư viện: mọi cử chỉ nằm bên trong nó mới được nhận. Đặt sâu
 *     hơn thì vuốt-để-lùi và mọi cử chỉ tuỳ biến im lặng không hoạt động — không
 *     có lỗi nào báo, chỉ là "vuốt không ăn". Thiếu `flex-1` thì cây con cao 0.
 *
 *  2. `KeyboardProvider` — phải bọc ngoài mọi màn hình có ô nhập. Nó đo bàn phím
 *     ở tầng native và cấp số đo đó cho các hook bên dưới; đặt trong từng màn
 *     hình thì mỗi lần chuyển màn lại dựng lại phép đo và bàn phím nhảy giật.
 *
 *  3. `SafeAreaProvider` — phải trên mọi thứ đọc `useSafeAreaInsets()`, kể cả
 *     `ToastHost` bên dưới.
 *
 *  4. `QueryClientProvider` — trên mọi thứ gọi API.
 *
 *  5. `ThemeProvider` — cần store (không phải provider) nên đặt đâu cũng chạy,
 *     nhưng để sát trong cho gần nơi dùng. ⚠️ Nó KHÔNG còn là lớp trong cùng
 *     nữa kể từ khi có (6).
 *
 *  6. `ErrorBoundary` — TRONG CÙNG, và đó là lựa chọn có chủ đích:
 *     · phải nằm TRONG (1) và (3): màn hình lỗi dựng bằng `Screen`, mà `Screen`
 *       gọi `useSafeAreaInsets()` — hook đó NÉM LỖI khi không có
 *       `SafeAreaProvider`, tức là ranh giới lỗi tự nổ đúng lúc cần nó nhất.
 *       Không có vùng an toàn thì nút "Thử lại" còn nằm dưới vạch gạt ngang;
 *     · phải nằm TRONG (4) và (5) để màn hình lỗi có đủ theme và (về sau) có
 *       `queryClient` — `onReset` của nơi gọi thường là `queryClient.clear()`;
 *     · đặt sâu nhất KHÔNG mất phạm vi bắt lỗi đáng kể: bốn provider trên đều
 *       là vỏ vài dòng, gần như không có gì để ném. Thứ ném lỗi thật là cây
 *       route (`children`) và `ToastHost` — cả hai đều nằm trong nó.
 *
 * `ToastHost` nằm CUỐI, là anh em với `children`: nó phải vẽ ĐÈ lên mọi màn
 * hình. Đặt nó bọc ngoài `children` thì màn hình vẽ đè lên toast.
 *
 * ⚠️ `ToastHost` nằm BÊN TRONG `ErrorBoundary` chứ không phải bên cạnh: nó cũng
 * là component render được, cũng ném lỗi được. Để ngoài thì một lỗi trong chính
 * nó vẫn cho ra màn trắng — đúng thứ ranh giới lỗi sinh ra để chặn.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <ErrorBoundary>
                {children}
                <ToastHost />
              </ErrorBoundary>
            </ThemeProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
