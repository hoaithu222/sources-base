# Ghi chú code — customers (`src/features/customers/`)

> Lý do thiết kế KHÔNG hiển nhiên của `src/features/customers/` (feature mẫu cho màn CRUD), tách khỏi code theo `comment-policy.md §3`.
> Mỗi mục ≤ 6 gạch. Làm từng bước: `guides/crud-feature.md`. Cây feature: `feature-structure.md`.

## Chung

- **Dữ liệu giả gắn THEO TỪNG REQUEST** (`adapter` của axios, chỉ khi `appConfig.isDemo`), không sửa `core/http` và không thêm
  dependency: interceptor, `readData`, `AppError`, React Query vẫn là bản thật nên màn chạy y như khi có backend.
- **Model giao diện ≠ DTO của BE**: `customer-mapping.utils.ts` là chỗ DUY NHẤT biết snake_case / tiền dạng chuỗi / `phone: null`;
  view và query chỉ thấy `Customer`. BE đổi hợp đồng thì sửa schema DTO + mapping, không đụng view.
- **View quyết phản hồi, hook chỉ lo dữ liệu**: tạo / sửa / đọc khai `silentError` (lỗi hiện trên form hoặc ở trạng thái lỗi của
  trang); xoá KHÔNG khai nên bộ báo lỗi tập trung toast — một lỗi, đúng một nơi hiện.
- **Route sửa là `/demo/customers/edit?id=…`**, không phải `[id]`: segment động không có danh sách id lúc build nên mất SSG và làm
  `check:static-routes` đỏ. `?id=` được kiểm (`parseCustomerId`) trước khi gọi API.
- **Mọi route trong `PROTECTED_PATH_PREFIXES` kể cả route con** (`/demo/customers/new`, `/edit`): `tests/app/seo-routes.test.ts`
  đòi từng giá trị `PATHS` của vùng riêng tư có mặt nguyên văn ở `PRIVATE_PATHS`, dù tiền tố `/demo` đã khớp.

## customers-demo-adapter

- **Ném `CanceledError` khi `signal` huỷ** (không phải `AxiosError` thường) để `toAppError` nhận là "bị huỷ" chứ không phải lỗi mạng.
- **Câu lỗi 422 lấy từ `validationMessages()`** (đã dịch theo ngôn ngữ đang chọn) — file không chứa câu lỗi cứng; 409 chỉ mang mã
  `CUSTOMER_001`, giao diện rẽ nhánh theo mã.
- **Sắp theo `updated_at` giảm dần**: bản ghi vừa tạo / sửa lên đầu nên "danh sách làm mới sau khi lưu" nhìn thấy ngay.
- **Trạng thái ở cấp module, `resetCustomersDemo()` đưa về seed**: tải lại trang là mất; test gọi nó (kèm `latencyMs: 0`) ở `beforeEach`.

## customers.queries

- **Key phân cấp** (`lists()` / `details()`): một lệnh invalidate `lists()` làm cũ mọi bộ lọc mà không đụng bản ghi đang mở.
- **`placeholderData: keepPreviousData` cho danh sách**: chuyển trang / đổi lọc giữ dữ liệu cũ tới khi có dữ liệu mới, bảng không nháy rỗng.
  `useCustomerList` dựa vào `isPlaceholderData` để không lùi trang theo số liệu của bộ lọc cũ.
- **`useCustomerQuery(null)` dùng `enabled: false` với id giả `0`** để giữ kiểu key `number`; id hợp lệ luôn ≥ 1 nên không trùng bản ghi nào.

## CustomerDeleteDialog

- **Không dùng `useDeleteWithConfirm`**: hook chỉ nhận id `number` và chụp tên lúc mở, còn ở đây hộp cần cả đối tượng khách hàng +
  trạng thái `isPending` của mutation đang có sẵn. Hộp dựa thẳng vào `ConfirmDialog closeOnConfirm={false} loading`. (Hook đã chặn bấm
  đúp; nơi chỉ cần "id + tên + xác nhận" vẫn nên dùng nó.)
- **Lỗi xoá không đóng hộp**: bộ báo lỗi tập trung toast, người dùng bấm lại để thử; thành công mới toast + đóng.

## useCustomerForm · CustomerForm

- **Lỗi không ném ra khỏi `onSubmit`**: `<Form>` chỉ `console.error` khi ném, nên hook tự phân loại (409 → ô `code`, `fieldErrors` → từng ô,
  còn lại → `rootError`) và để form GIỮ dữ liệu.
- **`form.reset(values)` trước `router.push`**: form hết "dirty" nên `dirtyGuard` không tự chặn chính cú điều hướng sau khi lưu.
- **Form chỉ đọc khi thiếu quyền ghi** (`readOnly` của `<Form>`) thay vì ẩn cả trang: người chỉ có `customer:view` vẫn xem được bản ghi.
