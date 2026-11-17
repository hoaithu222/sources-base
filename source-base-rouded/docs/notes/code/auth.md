# Ghi chú code — auth (`src/features/auth/`)

> Lý do thiết kế KHÔNG hiển nhiên của `src/features/auth/` (api, hook, trang, component), tách khỏi
> code theo `comment-policy.md §3`. Mỗi mục ≤ 6 gạch.

## Chung

- **Hook (`service/auth.queries.ts`) chỉ lo dữ liệu + phiên; TRANG quyết mọi phản hồi** (Callout, toast, điều
  hướng): hai nơi cùng báo là ra hai phản hồi cho một kết quả.
- **`meta.silentError` cho cả bốn mutation** vì cả bốn trang tự vẽ lỗi bằng `<Callout>`; để bộ báo
  lỗi tập trung chen vào là có thêm một toast lặp đúng câu đó.
- **Thành công rồi rời trang thì báo bằng toast** (đăng ký, đặt lại mật khẩu → `/login`): Callout mất
  theo trang. Ở lại trang (quên mật khẩu) thì Callout là đủ, không kèm toast.
- **Endpoint công khai đều bật `skipAuthRefresh`.** 401 ở đó là "sai email/mật khẩu", không phải
  token hết hạn.
- **Payload login không chứa refresh token** — nó nằm trong cookie HttpOnly.
- **Trang không export ở `index.ts`:** router lazy-load thẳng từng file; đưa vào barrel là gom cả bốn
  trang vào một chunk.

## LoginPage

- **Trang không tự điều hướng sau khi đăng nhập**: `useLogin` chỉ xác lập phiên, `GuestGuard` đưa người dùng tới đích
  (`resolveReturnPath`). Thêm `navigate` ở trang là hai nơi cùng quyết định đích và sớm lệch nhau.
- **Chiều ngược lại cũng vậy:** nơi gọi `logout()` (menu tài khoản) không tự `navigate` — `AuthGuard` thấy phiên
  kết thúc rồi đưa về `/login`, không kèm đích quay lại vì người dùng chủ động rời (routing-conventions.md §10).

## AuthLink

- **Một liên kết chữ cho mọi trang xác thực** ("Quên mật khẩu?", "Đăng ký"): chữ giữ cỡ `text-caption-12`, hộp bấm nới ≥ 40px
  dọc bằng `::after` trên máy chạm — tự viết `<Link>` ở từng trang là mỗi chỗ một vùng bấm 16px.

## ForgotPasswordPage

- **Luôn báo thành công** dù email có tồn tại hay không — phân biệt hai ca là để lộ danh sách email đã
  đăng ký.

## RegisterPage · ResetPasswordPage

- **Payload dựng tường minh, không gửi nguyên giá trị form.** `confirmPassword` là ràng buộc phía client, không
  phải dữ liệu của server; đặt lại mật khẩu còn đổi `password` → `newPassword` theo đúng tên trường của API.

## ResetPasswordPage

- **Thiếu `token` thì hiện màn riêng, không hiện form.** Vào thẳng URL không có mã thì form vô nghĩa — nói rõ
  ngay thay vì để người dùng điền xong mới báo lỗi.

## AuthPageFrame · AuthPageHeading

- **Một khung chung cho cả bốn trang**: tiêu đề, gạch dọc nhấn và hàng liên kết cuối trang sửa một chỗ; chép inline
  ra từng trang thì sót và ra hai mô-típ lệch nhau trong cùng tấm thẻ (`notes/code/constants.md`).
- **Liên kết chữ (hàng cuối, "Quên mật khẩu?") mang `focus-visible:ring`** như `FileField`: `<Link>` trần chỉ có
  outline mặc định của trình duyệt, lệch vòng focus của mọi control khác trên cùng tấm thẻ.
