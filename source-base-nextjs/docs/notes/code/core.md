# Ghi chú code — core (`src/core/`)

> Lý do thiết kế KHÔNG hiển nhiên của `src/core/`, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có. Cách DÙNG tầng này: `api-patterns.md`.

## config/env.schema · app-config · server-config

- **Một schema, ba nơi dùng**: `next.config.ts` (Node), `server-config.ts` (server) và `app-config.ts` (trình duyệt) cùng gọi `parseAppEnv` / `parseServerEnv` nên `.env` sai là đỏ ngay ở terminal
  lúc `npm run dev` / `npm run build`. Vì thế `env.schema.ts` KHÔNG đọc `process.env` — nhận `rawEnv` qua tham số, chỉ import `zod`.
- **Tách hai khối: `NEXT_PUBLIC_*` (`parseAppEnv` → `appConfig`) và biến server-only (`parseServerEnv` → `serverConfig`).** `NEXT_PUBLIC_*` nằm trong bundle gửi trình duyệt nên không đặt secret; biến server
  (`API_PROXY_TARGET`, `AUTH_SESSION_COOKIE`, `SEO_ALLOW_INDEXING`, mã xác minh công cụ tìm kiếm…) chỉ `server-config.ts` đọc, và file đó có `import 'server-only'` — Client Component lỡ import là build đỏ.
- **`app-config.ts` liệt kê TỪNG biến `process.env.NEXT_PUBLIC_X`**: Next chỉ nhúng giá trị lúc build khi truy cập THẲNG theo tên; đổi thành `parseAppEnv(process.env)` thì ở trình duyệt `process.env` rỗng và mọi cấu hình về mặc định
  mà không báo gì. `proxy.ts` cũng truyền tường minh từng biến, và đọc env server bằng `parseServerEnv(process.env)` (không `server-config`: proxy không chạy ở điều kiện `react-server`).
- **Chuỗi rỗng = "không khai".** Chép `.env.example` cho ra `NEXT_PUBLIC_APP_NAME=` (rỗng, không phải thiếu);
  `??` không bắt được ca đó nên mọi biến đi qua `blankToUndefined` trước khi áp mặc định.
- **Số và cờ kiểm chặt.** `parseInt('30000abc')` ra 30000 và `'ture'` thành `false` (tức TẮT kiểm đăng
  nhập) đều chạy êm — schema từ chối cả hai và liệt kê MỌI biến sai trong một lần (`EnvValidationError`).

## config — mặc định theo chế độ

- **`NEXT_PUBLIC_APP_MODE` mặc định là `app`, không phải `demo`**: quên khai thì build production dừng
  (`findProductionIssues`: kiểm đăng nhập tắt, thiếu `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_SITE_URL`) thay vì âm thầm tắt kiểm đăng nhập. Code đọc chế độ qua MỘT cờ: `appConfig.isDemo`.
- **`authEnabled` mặc định theo chế độ:** bật ở `app`, tắt ở `demo` (demo không có backend).
- **`apiBaseUrl` mặc định `/api`** để khớp `rewrites()` của `next.config.ts` (proxy same-origin tới `API_PROXY_TARGET`, nên cookie refresh HttpOnly đi cùng origin); `apiBaseUrlExplicit` chỉ để build production đòi
  khai tường minh. Version của API (`/v1`) nằm trong biến này, không ở từng file `*.api.ts`.
- **`allowIndexing` tự suy từ môi trường triển khai** (production → bật, preview / staging → tắt) nếu không khai `SEO_ALLOW_INDEXING` — bản thử không lọt vào Google.

## http/api-client

- **Tầng HTTP không biết store, router hay toast** — được bơm qua `configureHttp()` ở `src/app/_providers/bootstrap.ts`. Client không
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

## http/errors — app-error · to-app-error · error-messages

- **Một hàm ánh xạ thông điệp** (`resolveErrorMessage`). Hai hàm song song với thứ tự ưu tiên khác
  nhau khiến cùng một lỗi hiện hai câu khác nhau tuỳ đường đi.
- **Thứ tự ưu tiên:** `error.code` đã ánh xạ → `error.message` → `Message`/`message` → `errorCode` +
  `parameters` (.NET gateway) → lỗi trường đầu tiên → `title` → câu theo HTTP status.
- **Mã chưa ánh xạ không ra giao diện.** Chuỗi dạng `PROJECT_ALREADY_EXISTS` bị bỏ qua để rơi xuống
  câu theo status.
- **Chỉ `AppError.message` lên giao diện**: lỗi lạ là tiếng Anh kỹ thuật nên `toAppError` cho câu dự phòng (gốc ở
  `cause`). Màn hình muốn báo câu riêng thì ném `new AppError('business', …)` với chữ đã dịch.
- **Câu lỗi là registry, không phải hằng** (`errors/error-messages.ts`): nguồn là `messages/<locale>/errors.json` (khoá `http`: dự phòng, huỷ, timeout, mất mạng, sai hợp đồng, theo mã, theo status);
  `errorMessages()` trả câu theo ngôn ngữ đang chọn, `LocaleSync` (`app/_providers`) gọi `configureErrorMessages` khi ngôn ngữ đổi. `core` vẫn không biết React / next-intl — registry mặc định là tiếng Việt để
  test và code chạy trước khi provider đăng ký bản dịch vẫn có câu đọc được. Thêm mã lỗi nghiệp vụ → `errors.http.codes` ở MỌI ngôn ngữ; ESLint `guard/error-messages` chặn `new AppError(kind, "chuỗi cứng")` trong `core` (trừ chính registry).

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

## i18n

- **Điểm vào dùng được ở CẢ server lẫn client** (`@/core/i18n`: `Link`, `useRouter`, `usePathname`, `redirect`, `getPathname`, `routing`, `LOCALES`, `LOCALE_META`); thứ CHỈ server (`requireLocale`, `getTranslations`, `getMessages`, `loadMessages`,
  `pickClientMessages`) ở `@/core/i18n/server` — Client Component không import file đó. Thông điệp ở `src/messages/` (ngoài tầng), `core/i18n` chỉ giữ hình dạng (`Messages`) và cách nạp.
- **Ngôn ngữ đọc từ THAM SỐ GỐC của route bằng `next/root-params`** (`request.ts`), không từ header: nhờ vậy mọi Server Component dùng chữ dịch vẫn prerender TĨNH mà không phải gọi `setRequestLocale` (API next-intl đã đánh dấu
  deprecated; quên một chỗ là cả route thành động). Ngôn ngữ lạ (URL tay, bot) rơi về mặc định thay vì ném lỗi — root layout gọi `requireLocale` để trả 404 đúng chuẩn.
- **`localePrefix: 'as-needed'`**: `vi` không tiền tố (`/login`), ngôn ngữ khác có (`/en/login`) — URL tiếng Việt giữ nguyên, mỗi ngôn ngữ vẫn có địa chỉ riêng. `alternateLinks: false`: hreflang do Metadata API (`core/seo`) xuất MỘT lần có `x-default`,
  không để next-intl thêm header `Link` trùng.
- **Kiểu `Messages` suy từ bản tiếng Việt (nguồn)**; `en/index.ts` dùng `satisfies Messages` nên thiếu / thừa khoá là `tsc` đỏ. `next-intl.d.ts` đăng ký `Locale` + `Messages` cho next-intl (`t('khoá.sai')` báo đỏ).
- **`CLIENT_NAMESPACES` là danh sách trắng gửi xuống trình duyệt** (`common`, `errors`, `validation`, `ui`, `auth`, `shell`, `account`, `customers`, `demo`); `metadata`, `landing`, `about`, `site` ở lại server — bundle nhỏ hơn. View client dùng namespace ngoài danh sách là thiếu chuỗi.
- **`Link` / `useRouter` của `@/core/i18n` thay `next/link` / `next/navigation`** vì chúng tự thêm tiền tố ngôn ngữ; `useSearchParams` giữ ở `next/navigation` (không phụ thuộc ngôn ngữ).

## seo

- **CHỈ dùng ở server** (đọc `serverConfig`, `import 'server-only'` ở `site.config.ts`); hàm thuần như `localizedPath` / `absoluteUrl` / `buildAlternates` (`url.utils.ts`) không đọc cấu hình nên test được và dùng được ở mọi nơi — quy tắc tiền tố PHẢI khớp `routing.localePrefix`
  (test so với `getPathname`).
- **Next KHÔNG gộp sâu khối `openGraph` / `twitter` / `robots`**: trang khai `openGraph` là thay NGUYÊN khối của layout (kể cả ảnh từ file convention) — nên `buildPageMetadata` lặp lại siteName / locale / type / images ở mỗi trang, và khoá `robots` phải VẮNG MẶT (không phải
  `undefined`) khi cho lập chỉ mục.
- **Một nơi quyết "có được lập chỉ mục không"** (`isIndexingAllowed`, từ `SEO_ALLOW_INDEXING` hoặc môi trường triển khai): metadata `robots`, `robots.txt` và sitemap rỗng cùng đọc nó nên bản preview / staging tự chặn toàn bộ.
- **Gốc site: `NEXT_PUBLIC_SITE_URL` → host production do Vercel cấp → `http://localhost:3000`** (chỉ hợp lý lúc phát triển; build production bị chặn nếu thiếu). `THEME_COLOR` khớp token `bg-page` của `colors-theme.json` (test giữ khớp).
- **`JsonLd` escape `<`** trong JSON-LD (`serializeJsonLd`) để chuỗi dữ liệu không đóng thẻ `<script>` — chống XSS.
