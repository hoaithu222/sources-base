# Ghi chú code — auth (`src/features/auth/`)

> Lý do thiết kế KHÔNG hiển nhiên của `src/features/auth/` (api, hook, view, component), tách khỏi
> code theo `comment-policy.md §3`. Mỗi mục ≤ 6 gạch. Cây feature: `feature-structure.md` (auth là feature mẫu).

## Chung

- **Hook (`service/auth.queries.ts`) chỉ lo dữ liệu + phiên; VIEW quyết mọi phản hồi** (Callout, toast, điều
  hướng): hai nơi cùng báo là ra hai phản hồi cho một kết quả.
- **`meta.silentError` cho cả bốn mutation** vì cả bốn view tự vẽ lỗi bằng `<Callout>`; để bộ báo
  lỗi tập trung chen vào là có thêm một toast lặp đúng câu đó.
- **Thành công rồi rời trang thì báo bằng toast** (đăng ký, đặt lại mật khẩu → `/login`): Callout mất
  theo trang. Ở lại trang (quên mật khẩu) thì Callout là đủ, không kèm toast.
- **Endpoint công khai đều bật `skipAuthRefresh`.** 401 ở đó là "sai email/mật khẩu", không phải
  token hết hạn.
- **Payload login không chứa refresh token** — nó nằm trong cookie HttpOnly.
- **`index.ts` export view cho `page.tsx`** (`import { LoginView } from '@/features/auth'`): mỗi trang là một `page.tsx` mỏng ở
  `src/app/[locale]/(workspace)/(auth)/<trang>/page.tsx` (`generateMetadata` + view); Next tự tách mã theo route nên không cần "lazy-load
  trang" — barrel không gom bốn view vào một chunk. View là Client Component (form, mutation), `page.tsx` là Server Component.

## LoginView

- **View không tự điều hướng sau khi đăng nhập**: `useLogin` chỉ xác lập phiên, `GuestGate` đưa người dùng tới đích
  (`?next=` qua `resolveReturnPath`, hoặc bảng điều khiển). Thêm `router.push` ở view là hai nơi cùng quyết định đích và sớm lệch nhau.
- **Chiều ngược lại cũng vậy:** nơi gọi `logout()` (menu tài khoản) không tự điều hướng — `AuthGate` thấy phiên
  kết thúc rồi đưa về `/login`, không kèm đích quay lại vì người dùng chủ động rời (`routing-conventions.md §10`).
- **Đích quay lại là `?next=`** (không còn `location.state`): `proxy.ts` và `AuthGate` ghi, `GuestGate` đọc; chỉ nhận đường NỘI BỘ nên view không cần (và không được) tự đọc `?next=`.
- **Trang khách hiện form ngay từ HTML server**: `GuestGate` không chặn lúc khôi phục phiên, nên view không được phụ thuộc vào phiên để render (người chưa có cookie — đa số — thấy form tức thì, LCP nhanh).

## useAuthSchemas · auth.schema

- **Schema Zod nhận thông báo qua tham số** (`createAuthSchemas(messages)`), `useAuthSchemas()` dịch bằng `useTranslations('auth.validation')` rồi `useMemo` theo ngôn ngữ: chữ lỗi
  đổi theo ngôn ngữ đang chọn mà `auth.schema.ts` vẫn là hàm thuần, test được không cần provider. Đổi ngôn ngữ → schema dựng lại → form hiện lại lỗi bằng ngôn ngữ mới.
- **Hook nằm cạnh schema trong `schemas/`** (không phải `hooks/`) vì nó chỉ phục vụ schema — tách ra một folder chỉ có một file là thừa.
- **Không có chuỗi tiếng Việt trong feature**: chữ view ở `messages/<locale>/auth.json` (`login`, `register`, `validation`, `brand`…); ESLint `guard/i18n-text` chặn chữ Việt cứng trong JSX / prop.

## AuthLink

- **Một liên kết chữ cho mọi trang xác thực** ("Quên mật khẩu?", "Đăng ký"): chữ giữ cỡ `text-caption-12`, hộp bấm nới ≥ 40px
  dọc bằng `::after` trên máy chạm — tự viết `<Link>` ở từng view là mỗi chỗ một vùng bấm 16px. `Link` lấy từ `@/core/i18n` (prop `href`) nên tự thêm `/en`.

## ForgotPasswordView

- **Luôn báo thành công** dù email có tồn tại hay không — phân biệt hai ca là để lộ danh sách email đã
  đăng ký.

## RegisterView · ResetPasswordView

- **Payload dựng tường minh, không gửi nguyên giá trị form.** `confirmPassword` là ràng buộc phía client, không
  phải dữ liệu của server; đặt lại mật khẩu còn đổi `password` → `newPassword` theo đúng tên trường của API.

## ResetPasswordView

- **Thiếu `token` thì hiện màn riêng, không hiện form.** Vào thẳng URL không có mã thì form vô nghĩa — nói rõ
  ngay thay vì để người dùng điền xong mới báo lỗi.
- **Đọc `?token=` bằng `useSearchParams` nên `page.tsx` PHẢI bọc `<Suspense>`** (`reset-password/page.tsx`): không bọc thì Next không prerender được route (thiếu ranh giới Suspense) và cả trang mất SSG.

## AuthPageFrame · AuthPageHeading

- **Một khung chung cho cả bốn view**: tiêu đề, gạch dọc nhấn và hàng liên kết cuối trang sửa một chỗ; chép inline
  ra từng view thì sót và ra hai mô-típ lệch nhau trong cùng tấm thẻ (`notes/code/constants.md`).
- **`footer` dựng ở view từ `auth.json`** (`footerPrefix`, `footerLabel`, `href: PATHS.…`) — khung nhận chữ ĐÃ DỊCH qua props, không tự gọi `useTranslations`.
- **Liên kết chữ (hàng cuối, "Quên mật khẩu?") mang `focus-visible:ring`** như `FileField`: `<Link>` trần chỉ có
  outline mặc định của trình duyệt, lệch vòng focus của mọi control khác trên cùng tấm thẻ.
