# Hướng dẫn cho AI agent — Base Android (React Native)

Đọc `README.md` trước. File này chỉ nêu những gì hay bị làm sai.

## Trước khi sửa

1. Đọc quy tắc tương ứng trong `docs/rules/`:

| Sắp sửa gì                 | Đọc                                                           |
| -------------------------- | ------------------------------------------------------------- |
| Bất kỳ JSX nào             | `ui-components.md` · `styling-nativewind.md` · `mobile-ux.md` |
| **Dùng** component có sẵn  | `ui-components.md`                                            |
| Lưới màn, định dạng tiền/ngày | `screen-layout.md`                       |
| Bố cục, tablet, xoay ngang | `responsive.md`                                               |
| Cấu trúc thư mục, đặt tên  | `feature-structure.md` · `code-style.md`                      |
| Gọi API                    | `api-patterns.md`                                             |
| Route, guard, thanh tab    | `navigation.md`                                               |
| Form                       | `form-validation.md`                                          |
| Viết test                  | `testing.md`                                                  |
| Màn hình webview           | `webview.md`                                                  |

2. Ưu tiên **sửa file có sẵn**, đừng tạo file mới nếu không cần.
3. Sau khi sửa: `npm run check` phải sạch (typecheck → lint → kiểm import →
   **kiểm class** → test). ⛔ Đừng bỏ `check:classes` — nó là thứ DUY NHẤT bắt
   được class Tailwind đã chết (`text-body`, `rounded-2xl`): NativeWind bỏ qua
   class lạ trong im lặng, `tsc` và ESLint đều không thấy.

## Tech stack

| Tầng           | Công nghệ                                                             |
| -------------- | --------------------------------------------------------------------- |
| Nền            | React Native 0.86 · Expo SDK 57 · TypeScript strict                   |
| Điều hướng     | **Expo Router** (file-based, typed routes)                            |
| Style          | **NativeWind 4** (Tailwind **3.4**) + `tailwind-variants`             |
| Dữ liệu server | TanStack React Query 5                                                |
| State client   | Zustand 5                                                             |
| HTTP           | Axios (`@/core/api`)                                                  |
| Form           | React Hook Form + Zod 4                                               |
| Icon           | Bộ icon BIDV xuất từ Figma — `<Icon name="…" />` (`@/shared/ui/icon`) |
| Test           | Jest (`jest-expo`) + `@testing-library/react-native`                  |

## ⛔ Bảy điều KHÔNG được làm

1. **KHÔNG tạo `src/app/`.** Expo Router ưu tiên nó hơn `app/` ở gốc → toàn bộ
   cây route bị bỏ qua, build vẫn xanh, app hiện màn trống. Vỏ ứng dụng ở
   `src/shell/`. Có test chặn.

2. **KHÔNG sửa file `*.generated.*`.** Sửa file JSON nguồn trong
   `src/styles/` rồi `npm run generate:styles`. Icon thì sửa file `.svg`
   trong `assets/icons/` rồi `npm run generate:icons`.

3. **KHÔNG viết màu/cỡ chữ thô.** `bg-white`, `text-[17px]`,
   `style={{ color: '#fff' }}` đều sai. Dùng token. ESLint chặn một phần, phần
   còn lại người review phải bắt.

4. **KHÔNG đọc biến môi trường động.** `process.env[key]` luôn ra `undefined` —
   Metro thay chuỗi lúc build. Viết đủ tên tại chỗ đọc; thêm biến mới thì thêm
   một dòng vào `RAW` (`env.config.ts`) và một dòng vào `types/env.d.ts`.

5. **KHÔNG để refresh token ra ngoài kho khoá.** `expo-secure-store`, không phải
   `AsyncStorage`.

6. **KHÔNG gộp `unavailable` với `unauthenticated`** khi làm mới token. Mất sóng
   ≠ phiên chết. Xem `src/core/api/session.ts`.

7. **KHÔNG `expect(el).toHaveStyle(...)`** trong test — NativeWind không biên
   dịch trong Jest, `style` luôn rỗng. Test hành vi.

## Quen tay từ base web (`base-projects`) — khác chỗ nào

| Bên web                             | Ở đây                                                    |
| ----------------------------------- | -------------------------------------------------------- |
| `src/app/` = vỏ ứng dụng            | `src/shell/` (xem điều 1)                                |
| Tailwind 4, `@theme`, `oklch()`     | Tailwind **3.4** — không có                              |
| `import.meta.env.VITE_*`            | `process.env.EXPO_PUBLIC_*`, viết đủ tên                 |
| `localStorage` (đồng bộ)            | `AsyncStorage` (bất đồng bộ) + kho khoá OS               |
| Cookie `HttpOnly` cho refresh token | Kho khoá hệ điều hành                                    |
| `window.location.assign('/login')`  | Dọn store, guard tự điều hướng                           |
| Vitest                              | Jest (`jest-expo`)                                       |
| `<div>`, `<span>`                   | `<View>`, `<Text>` — **mọi chữ PHẢI nằm trong `<Text>`** |

## Skill — đọc skill trước, tài liệu sau

`.claude/skills/` có sẵn bảy skill. **`base-rules` là skill mặc định, đọc TRƯỚC
mọi việc**; sáu skill còn lại tuỳ loại việc:

| Việc                                              | Skill            |
| ------------------------------------------------- | ---------------- |
| Bất cứ việc gì (luật chung, quy trình, cổng kiểm) | `base-rules`     |
| Dựng/sửa component, sửa `className`, node Figma   | `ui-component`   |
| Bố cục co giãn, máy tính bảng, xoay ngang         | `responsive-ui`  |
| Đổi màu, thang chữ, bo góc, giãn cách, font       | `design-tokens`  |
| Thêm màn hình, feature, route, tab, guard         | `feature-screen` |
| Gọi API, React Query, 401/refresh                 | `api-data`       |
| Form + Zod, và viết test                          | `form-and-test`  |

## Trạng thái hiện tại

Nền, cấu hình chung, **hệ token** và **bộ component giao diện** đã dựng, lấy
design system **BIDV SmartBanking v2.0** làm **THAM CHIẾU** — đây là base dùng
lại, không phải app của một ngân hàng cụ thể. Cơ chế thì giữ, dữ liệu (tên
token, số đo, bộ icon) thì dự án mới thay theo bản vẽ của chính nó.

- Token: mỗi nhóm MỘT thư mục trong `src/styles/` — `colors/` · `typography/` ·
  `layout/`, mỗi thư mục có `<nhóm>.json` (sửa tay) và `<nhóm>.generated.js`
  (sinh ra). Sửa xong chạy `npm run generate:styles`.
  ⚠️ Thang chữ có **15 vai trò** và chỉ MỘT bộ tên. Tên cũ (`text-body`,
  `text-label`, `text-caption`, `text-title`, `text-heading`, `text-subheading`,
  `text-body-sm`) **đã bị gỡ** — chúng trùng số đo với vai trò chuẩn, để song
  song thì mỗi người viết một kiểu cho cùng một cỡ chữ.
- Icon: `assets/icons/{system,feature,bank}/**.svg` (xuất từ Figma) →
  `npm run generate:icons` → dùng qua `<Icon name="…" />`.
- Component: `src/shared/ui/` — đọc `src/shared/ui/AGENTS.md` TRƯỚC khi thêm
  hay sửa bất kỳ component nào ở đó.
- Thanh tab dưới của app dùng chính `BottomNav` của bộ chung, nối qua
  `src/shell/navigation/AppTabBar.tsx`.
- **Thư viện component chạy được trong app**: `/demo` (Cài đặt → Nhà phát triển
  → Thư viện component). Ba trang: token · component · mẫu bố cục.
  ⛔ Cả cụm `app/demo/` + `src/features/demo/` là ĐỒ BỎ ĐI khi giao dự án thật.

⛔ **Cần một control mới thì tìm trong `src/shared/ui/` trước** (và xem tận mắt
ở `/demo`). Viết cục bộ trong feature chỉ khi bộ chung thật sự không có, và phải
ghi rõ vì sao.

⛔ **`@expo/vector-icons` đã bị gỡ khỏi dự án.** Nét của Ionicons lệch hẳn với
bản thiết kế, và hai bộ icon song song thì thanh tab là chỗ lộ ra rõ nhất.
