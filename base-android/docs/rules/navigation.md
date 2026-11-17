# Điều hướng — Expo Router

## Cây route

```
app/
├── _layout.tsx        gốc: providers + chặn vẽ tới khi biết trạng thái phiên
├── (auth)/            nhóm KHÁCH   — guard: đã đăng nhập thì đá về trang chủ
├── (app)/             nhóm ĐÃ VÀO  — guard + thanh tab đọc MODULE_REGISTRY
├── demo/              THƯ VIỆN COMPONENT — ⛔ đồ bỏ đi khi giao dự án thật
└── +not-found.tsx
```

Dấu ngoặc đơn là **nhóm route**: gom file để dùng chung một layout, nhưng KHÔNG
xuất hiện trong đường dẫn. `app/(auth)/login.tsx` là `/login`, không phải
`/auth/login`. Nhờ vậy đổi cách nhóm về sau không làm gãy deep link đã phát hành.

## ⛔ KHÔNG được tạo `src/app/`

Expo Router ưu tiên `src/app` HƠN `app/` ở gốc. Tạo ra là toàn bộ `app/` bị bỏ
qua, build vẫn xanh, app hiện màn trống. Vỏ ứng dụng ở đây tên là `src/shell`
chính vì lý do đó. `tests/project-structure.test.ts` chốt cứng.

## File route giữ MỎNG

```tsx
import { LoginScreen } from '@/features/auth/screens/LoginScreen';

export default function LoginRoute() {
  return <LoginScreen />;
}
```

`app/` là **bản đồ đường dẫn** — đọc lướt là biết app có những màn nào. Nhét nội
dung vào thì bản đồ dài hàng nghìn dòng và mất tác dụng. Ngoài ra màn hình nằm
trong `features/` thì test được mà không cần dựng cả bộ điều hướng.

## Guard = `<Redirect>` trong layout của nhóm

```tsx
if (appConfig.authEnabled && status !== 'authenticated') {
  return <Redirect href={PATHS.LOGIN} />;
}
```

⛔ Guard chỉ được kết luận khi trạng thái phiên đã CHẮC CHẮN. `app/_layout.tsx`
không vẽ gì cho tới khi `isSessionReady` bật, nên tới được guard nghĩa là
`status` đã rời khỏi `restoring`. Bỏ lớp chặn đó thì người dùng thấy màn đăng
nhập chớp lên ở mỗi lần mở app — và họ đọc ra là "app hay tự đăng xuất".

## Điều hướng SAU khi đăng nhập/đăng xuất dùng `replace`

```ts
router.replace(PATHS.HOME); // ✅
router.push(PATHS.HOME); // ❌ nút Back trên Android quay lại màn đăng nhập
```

## Typed routes

`experiments.typedRoutes` bật sẵn: `router.push('/setting')` (thiếu chữ `s`) là
lỗi TypeScript chứ không phải màn hình trắng lúc chạy. Kiểu sinh vào `.expo/types`
ở lần `npx expo start` đầu tiên.

Vẫn giữ bảng `PATHS` (`src/shell/config/constants.ts`) để **đổi đường dẫn ở một
chỗ** — typed routes bắt lỗi gõ sai, nhưng không giúp đổi tên.

## Thanh tab

Đọc `MODULE_REGISTRY`. Thêm phân hệ = 1 file route + 1 dòng registry (xem README).

⛔ Phân hệ bị chặn quyền vẫn phải khai `<Tabs.Screen>` với `href: null`. Expo
Router tự tạo tab cho MỌI file trong thư mục; không khai tường minh thì tab vẫn
hiện, với nhãn là tên file và không có biểu tượng.

⚠️ Thanh tab VẼ bằng `BottomNav` của bộ component dùng chung, nối qua
`src/shell/navigation/AppTabBar.tsx` (`<Tabs tabBar={…}>`). ⛔ Đừng quay lại
thanh mặc định của React Navigation: nó không đi qua NativeWind nên màu, font và
vùng an toàn phải khai lại bằng style nội tuyến — và đó chính là chỗ luôn bị
quên khi đổi token.

⚠️ Thanh tab đo chiều cao THẬT của chính nó và cấp cho màn con qua
`BottomTabBarHeightContext` (`expo-router/js-tabs`). `Screen` và `BottomActionBar`
đọc tín hiệu đó để KHÔNG cộng `insets.bottom` lần nữa — ⛔ đừng hằng số hoá chiều
cao thanh tab, và đừng tự cộng vùng an toàn đáy cho màn nằm trong tab. Đổi tab là
điều hướng nên ⛔ không rung; phản hồi chạm là ripple theo token. Chi tiết:
`src/shared/ui/AGENTS.md` → "Khoảng cách đầu màn, vùng đáy, hàng lọc chip".

⚠️ `Tabs` nhập từ `expo-router/js-tabs`, KHÔNG phải từ `expo-router`: ở SDK 57
lối nhập cũ đã deprecated (tên `Tabs` nhường cho bộ tab NATIVE).

## Deep link

`scheme` khai trong `.env` (`APP_SCHEME`). Màn hình nhận tham số qua
`useLocalSearchParams()`.

⛔ Luôn có đường **nhập tay** song song với deep link. Ví dụ ở
`ResetPasswordScreen`: người dùng đọc e-mail trên máy tính, hoặc ứng dụng mail
mở liên kết trong trình duyệt nội bộ của nó — deep link không tới được app, và ô
nhập mã là đường duy nhất còn lại.
