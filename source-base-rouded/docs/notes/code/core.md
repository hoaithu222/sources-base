# Ghi chú code — core (`src/core/`)

> Lý do thiết kế KHÔNG hiển nhiên của `src/core/`, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có. Cách DÙNG tầng này: `api-patterns.md`.

## config/env.schema · app-config

- **Một schema cho hai môi trường**: `app-config.ts` (trình duyệt) và `vite.config.ts` (Node) cùng gọi `parseAppEnv`
  nên `.env` sai là đỏ ngay ở terminal. Vì thế `env.schema.ts` KHÔNG đọc `import.meta.env` / `process.env`.
- **Chuỗi rỗng = "không khai".** Chép `.env.example` cho ra `VITE_APP_NAME=` (rỗng, không phải thiếu);
  `??` không bắt được ca đó nên mọi biến đi qua `blankToUndefined` trước khi áp mặc định.
- **Số và cờ kiểm chặt.** `parseInt('30000abc')` ra 30000 và `'ture'` thành `false` (tức TẮT kiểm đăng
  nhập) đều chạy êm — schema từ chối cả hai và liệt kê MỌI biến sai trong một lần.
- **`VITE_APP_MODE` mặc định là `app`, không phải `demo`**: quên khai thì build production dừng
  (`findProductionIssues`) thay vì âm thầm tắt kiểm đăng nhập. Code đọc chế độ qua MỘT cờ: `appConfig.isDemo`.
- **`authEnabled` mặc định theo chế độ:** bật ở `app`, tắt ở `demo` (demo không có backend).
- **`apiBaseUrl` mặc định `/api`** để khớp proxy của dev server; `apiBaseUrlExplicit` chỉ để build production đòi
  khai tường minh. Version của API (`/v1`) nằm trong biến này, không ở từng file `*.api.ts`.

## http/api-client

- **Tầng HTTP không biết store, router hay toast** — được bơm qua `configureHttp()` ở `app/bootstrap.ts`. Client không
  tự báo lỗi vì interceptor chạy theo TỪNG LƯỢT gọi (báo trước khi `retry` xong); `observeError` chỉ để log.
- **Single-flight là hợp đồng của `HttpAuthAdapter.refreshAccessToken`** (domain phiên giữ promise chung): refresh
  token xoay vòng ở BE nên hai lời gọi song song thì lời thứ hai mang cookie vừa bị vô hiệu, phiên chết oan.
- **So token trước khi refresh**: request ăn 401 mà token trong store đã KHÁC token nó gửi thì lượt refresh khác
  vừa xong — phát lại luôn (nhiều request cùng hết hạn nhưng 401 về lệch nhau).
- **Lượt phát lại mang `skipAuthRefresh: true`** nên 401 dai dẳng (sai audience / scope) không refresh lặp. Cờ nằm
  TRONG config vì axios gộp config thành object MỚI mỗi lượt — đánh dấu theo danh tính object thì mất.
- **Request bị huỷ trong lúc chờ refresh không được phát lại**, và `canceled` không bao giờ đi qua
  `observeError`.
- **`paramsSerializer` lặp key cho mảng** (`ids=1&ids=2`): model binder của .NET không nhận `ids[]=`.

## http/errors — app-error · to-app-error · error-messages.constants

- **Một hàm ánh xạ thông điệp** (`resolveErrorMessage`). Hai hàm song song với thứ tự ưu tiên khác
  nhau khiến cùng một lỗi hiện hai câu khác nhau tuỳ đường đi.
- **Thứ tự ưu tiên:** `error.code` đã ánh xạ → `error.message` → `Message`/`message` → `errorCode` +
  `parameters` (.NET gateway) → lỗi trường đầu tiên → `title` → câu theo HTTP status.
- **Mã chưa ánh xạ không ra giao diện.** Chuỗi dạng `PROJECT_ALREADY_EXISTS` bị bỏ qua để rơi xuống
  câu theo status.
- **Chỉ `AppError.message` lên giao diện**: lỗi lạ là tiếng Anh kỹ thuật nên `toAppError` cho câu dự phòng (gốc ở
  `cause`). Màn hình muốn báo câu riêng thì ném `new AppError('business', '…')`.
- **Mọi câu lỗi ở `error-messages.constants.ts`** (dự phòng, huỷ, timeout, mất mạng, sai hợp đồng, theo mã, theo status):
  một câu chép ở nhiều file thì sớm lệch chữ.

## http/errors/claim-error-message

- **Một chỗ quyết "lỗi này có báo người dùng không"**, dùng chung bởi `createQueryClient` và `showErrorToast`;
  cũng là nơi DUY NHẤT đọc / ghi cờ `notified`.
- **Bỏ qua 401**: phiên chết thì chỉ có MỘT thông báo "phiên hết hạn" ở `onSessionEnd('expired')`. Lọc ở đây (không
  ở app) để `showErrorToast` trong `onError` của một mutation cũng không thành toast thứ hai.

## http/http.types · axios.d.ts

- **Cờ request khai bằng module augmentation của axios** (`axios.d.ts`) nên `{ skipAuthRefresh: true }` được kiểm
  kiểu mà không ép kiểu (ép kiểu thì gõ sai tên cờ cũng lọt).
- **Chỉ một `ApiResponse`** (`http.types.ts`): định nghĩa thứ hai ở nơi khác làm `res.data` mang kiểu khác nhau
  tuỳ import.

## query/create-query-client

- **Báo lỗi ở `QueryCache` / `MutationCache`** vì chúng chạy MỘT lần sau khi đã thử lại xong. Core chỉ
  nhận `notifyUser(message)` + `enabled`; câu nào, lỗi nào do `claimErrorMessage` quyết.
- **Chỉ báo `AppError`**: lỗi màn hình tự ném để giữ modal mở và `CancelledError` của React Query cũng tới
  `QueryCache.onError` — đổi chúng sang câu dự phòng là hiện toast "Đã xảy ra lỗi" vô cớ.
- **`MutationCache.onError` chạy TRƯỚC `onError` của từng mutation**, nên câu riêng trong `onError`
  chỉ hiện khi mutation khai `meta.silentError` — không thì lỗi đã được báo và đánh dấu từ trước.
- **`retry` chỉ cho lỗi hạ tầng** (mạng, timeout, 5xx, 429): 4xx thử lại vẫn ra đúng câu trả lời đó.
- **Khai báo `meta` (`react-query.d.ts`)** đăng ký `silentError` vào kiểu `Register` của React Query nên
  `meta: { silentError: true }` được kiểm kiểu ở mọi `useQuery` / `useMutation`.
