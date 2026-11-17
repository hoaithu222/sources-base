# Security Checklist — bảo mật & non-functional trước khi ship (BẮT BUỘC)

> Biến checklist QA thành luật code ngay từ đầu — rẻ hơn nhiều so với để QA
> tìm ra sau. Bổ sung `form-validation.md` (validate) và `api-patterns.md`
> (URL-synced state) — file này tập trung phần BẢO MẬT/NON-FUNCTIONAL chưa
> có rule riêng. Bản Next có thêm ranh giới server / client (§10–§15): thứ nào nằm ở bundle trình duyệt thì coi như công khai.

## 1. Validate ở biên — Zod cho MỌI input người dùng

Mọi form field bắt buộc dùng Zod schema (`docs/rules/data/form-validation.md`).
Không tin dữ liệu từ URL query param / localStorage / postMessage mà không
validate lại — đây đều là biên mà người dùng (hoặc extension độc hại) có thể
thao túng trực tiếp. Từ Next trở đi thêm hai biên nữa: **`params` / `searchParams` của route** và **body của Server Action / route handler**
— cũng là input người dùng, kiểm hình dạng trước khi dùng (`requireLocale(params.locale)` là mẫu: giá trị lạ → `notFound()`).

## 2. Upload — guard TRƯỚC khi gửi lên server

```ts
import { validateFile } from '@/shared/utils/validation/file.utils';
```

Kiểm dung lượng + định dạng (`accept`) TRƯỚC khi gọi API upload — không dựa
hoàn toàn vào validate phía server (UX tệ khi phải chờ round-trip mới biết
file sai, và server có thể không tồn tại trong 1 base template). UI kit
`useUpload` / `useUploadPicker` đã gọi sẵn; luật riêng (độ dài tên, đuôi nguy
hiểm, kích thước ảnh) viết ở feature khi có nhu cầu thật — chặn đuôi nguy hiểm
là việc BẮT BUỘC của server.

## 3. XSS — `dangerouslySetInnerHTML` chỉ ở hai chỗ đã kiểm soát

Codebase chỉ dùng `dangerouslySetInnerHTML` ở HAI nơi, cả hai nhận chuỗi do CODE dựng, không phải dữ liệu người dùng:

| Nơi | Nhúng gì | Vì sao an toàn |
|---|---|---|
| `app/[locale]/layout.tsx` | `appearanceInitScript()` — script áp theme trước lần vẽ đầu | Chuỗi dựng từ hằng của repo (`JSON.stringify(config)`), không có input ngoài |
| `core/seo/JsonLd.tsx` | JSON-LD qua `serializeJsonLd(data)` | `serializeJsonLd` thay mọi `<` bằng `<` → chuỗi do người dùng nhập (tên sản phẩm, mô tả) chứa `</script>` KHÔNG thoát được thẻ `<script>` |

- ⛔ JSON-LD LUÔN đi qua `<JsonLd>` / `serializeJsonLd`; KHÔNG tự `JSON.stringify` rồi nhét vào `<script>`.
- Cần render HTML động khác (rich text, nội dung API bên thứ 3...) → PHẢI sanitize qua thư viện chuyên dụng (vd. DOMPurify) trước khi
  render, không render thẳng chuỗi HTML từ API. Thêm một chỗ `dangerouslySetInnerHTML` mới = nêu lý do trong review.

## 4. Token/phiên đăng nhập — đã đúng chuẩn, đừng đổi ngược

Refresh token đã lưu qua **cookie HttpOnly** (BE đặt; `src/domains/session/`) —
JS phía client KHÔNG đọc/ghi trực tiếp được, chống XSS đánh cắp token. Access
token ngắn hạn ở BỘ NHỚ client (không persist: `session.store.ts` chỉ persist `user`). **KHÔNG** chuyển token
sang `localStorage`/`sessionStorage` dù để "tiện debug" — đây là hồi quy bảo
mật thật, không phải style choice.

- Cookie đi **same-origin**: `next.config.ts` `rewrites()` proxy `/api/*` về `API_PROXY_TARGET`, nên trình duyệt coi cookie là first-party.
  Đừng gọi thẳng BE khác origin từ client để "bớt một hop" — cookie HttpOnly sẽ không đi / bị chặn như third-party.
- Cookie do BE đặt phải có `HttpOnly; Secure; SameSite=Lax|Strict` (cookie ngôn ngữ `NEXT_LOCALE` do next-intl ghi là ngoại lệ — nó không chứa bí mật).
- Server Component KHÔNG có access token (chỉ ở trình duyệt) — dữ liệu theo phiên lấy ở client (`api-patterns.md` §0).

## 5. Thông báo lỗi — không để lộ thông tin giúp dò user/email

Khi có tính năng đăng nhập/quên mật khẩu: thông báo sai username/password
PHẢI đồng nhất ("sai tài khoản hoặc mật khẩu", không phân biệt "user không
tồn tại" vs "sai mật khẩu"). Tương tự "quên mật khẩu": luôn trả lời kiểu "nếu
email tồn tại, chúng tôi đã gửi link" — không tiết lộ email có tồn tại trong
hệ thống hay không. (Câu nằm ở `messages/<locale>/*.json` — dịch cả hai ngôn ngữ cùng một ý, không để bản dịch lộ chi tiết mà bản gốc giấu.)

## 6. Console log — chỉ bật ở dev, không log token/PII

```ts
if (process.env.NODE_ENV !== 'production') console.log(...);
```

(Next thay `process.env.NODE_ENV` lúc build; không còn `import.meta.env.DEV`.) Log request / response của tầng HTTP đã có sẵn, tắt mặc định, bật bằng
`NEXT_PUBLIC_ENABLE_API_LOGGING=true` và luôn đi qua `redactSecrets` (`core/http/redact-secrets.ts`).

KHÔNG log token, mật khẩu, thông tin cá nhân nhạy cảm ra console dù chỉ ở
dev — dễ vô tình lọt vào screenshot/screen-share/bug report. Log phía server (Server Component, `proxy.ts`) vào log của host — càng không ghi PII.

## 7. Multi-tab & offline — đừng để user "fail âm thầm"

- Đăng xuất ở 1 tab → đồng bộ sang các tab khác (`startSessionSync` của
  `@/domains/session`, gắn ở `app/_providers/bootstrap.ts`; kênh chung: `useMultiTabSync` ở
  `@/shared/hooks`), không để tab khác tưởng vẫn còn phiên hợp lệ.
- Mất mạng khi đang thao tác → báo rõ (`useNetworkStatus` có `wasOffline`),
  không để form "gửi mà không biết có thành công hay không".
- Rời trang khi form đang dở (dirty) → `useBeforeUnload`/`useDirtyGuard`
  cảnh báo trước khi mất dữ liệu chưa lưu. **App Router không có `useBlocker`**: `useDirtyGuard` chặn được click vào `<Link>` / `<a>` nội bộ
  + đóng tab / tải lại (`beforeunload`); nút Back của trình duyệt và `router.push()` gọi tay KHÔNG bị chặn.

## 8. Checklist theo hành động nút bấm

| Hành động | Bắt buộc |
|---|---|
| Thêm/Sửa | Check trùng dữ liệu TRƯỚC khi gọi API mutate nếu có ràng buộc unique |
| Xoá | `ConfirmDialog variant="delete"`, KHÔNG `window.confirm()`. Autofocus **Cancel**, không autofocus nút xoá |
| Đóng modal khi đang dở form | `useDirtyGuard()` — hỏi xác nhận trước khi đóng nếu có thay đổi chưa lưu |
| Export file | Đặt tên file có timestamp, tránh ghi đè export cũ |
| Download file có tên tiếng Việt/ký tự đặc biệt | Encode UTF-8 đúng chuẩn `Content-Disposition` (nếu tự dựng response header) |

## 9. Trước khi coi 1 PR là xong — rà nhanh

- [ ] Input tự do đã qua Zod `.trim().min()` đúng (`form-validation.md`)
- [ ] Upload (nếu có) đã qua `validateFile` (UI kit upload đã gọi sẵn)
- [ ] Không `dangerouslySetInnerHTML` không sanitize; JSON-LD đi qua `<JsonLd>`
- [ ] Không token/secret log ra console ở production build
- [ ] Không secret trong biến `NEXT_PUBLIC_*` / file `'use client'` (§10)
- [ ] Filter/search/pagination sống trên URL (`api-patterns.md`), không
  `useState` cục bộ
- [ ] Xoá/hành động phá huỷ có `ConfirmDialog`, autofocus Cancel
- [ ] Rời trang/đóng modal khi dữ liệu chưa lưu có cảnh báo
- [ ] Đích redirect lấy từ input đi qua `resolveReturnPath` (§12); Server Action (nếu có) kiểm lại quyền (§14)

---

## 10. Biến môi trường: tách công khai / bí mật

| Khối | Tiền tố | Đọc qua | Nằm ở bundle trình duyệt? |
|---|---|---|---|
| Công khai | `NEXT_PUBLIC_*` | `appConfig` (`@/core/config`) | **CÓ** — Next nhúng giá trị lúc build; ai cũng đọc được |
| Server-only | không có tiền tố (`API_PROXY_TARGET`, `AUTH_SESSION_COOKIE`, `SEO_ALLOW_INDEXING`, `GOOGLE_SITE_VERIFICATION`…) | `serverConfig` (`@/core/config/server-config`) | KHÔNG |

- ⛔ **Không bao giờ** đặt secret (API key, chuỗi kết nối, private key) vào biến `NEXT_PUBLIC_*` — "đặt tiền tố cho chạy được" là cách rò secret phổ biến nhất.
- `server-config.ts` có `import 'server-only'`: Client Component lỡ import nó là **build đỏ** (không âm thầm đóng gói secret). File server mới đọc secret
  cũng `import 'server-only'` ở dòng đầu (mẫu: `core/seo/site.config.ts`).
- Mọi biến đi qua schema Zod (`core/config/env.schema.ts`): thêm biến = khai schema + interface + `.env.example`; `NEXT_PUBLIC_*` còn phải liệt kê
  tường minh ở `app-config.ts` (Next chỉ nhúng khi truy cập thẳng `process.env.NEXT_PUBLIC_X`).
- Ngoại lệ có lý do: `proxy.ts` không chạy dưới điều kiện `react-server` nên KHÔNG import `server-only` / `serverConfig` — nó đọc `parseServerEnv(process.env)` thuần. Giữ nguyên, đừng "sửa" cho đồng bộ.
- `NEXT_PUBLIC_AUTH_ENABLED=false` mở mọi route cho người chưa đăng nhập — `npm run build` ở chế độ `app` dừng nếu gặp nó (`findProductionIssues`).

## 11. Header bảo mật (`next.config.ts`)

`SECURITY_HEADERS` áp cho mọi route: `X-Content-Type-Options: nosniff` · `X-Frame-Options: SAMEORIGIN` · `Referrer-Policy: strict-origin-when-cross-origin` ·
`Permissions-Policy` (tắt camera / mic / geolocation) · `X-DNS-Prefetch-Control` · `Strict-Transport-Security` (CHỈ production). `poweredByHeader: false` bỏ
`X-Powered-By`. Đường `/api/*` thêm `X-Robots-Tag: noindex, nofollow` (API không phải nội dung để lập chỉ mục).

- Cần mở một quyền (vd camera cho quét QR) → sửa `Permissions-Policy` ở ĐÚNG chỗ này, kèm lý do; đừng tắt cả khối.
- Cần nhúng app vào iframe cùng origin: `SAMEORIGIN` đã đủ; khác origin → cân nhắc `frame-ancestors` của CSP thay vì bỏ header.
- **CSP đầy đủ là TUỲ CHỌN (opt-in), mặc định KHÔNG bật.** CSP chặt cần nonce cho script inline (`appearanceInitScript`, JSON-LD, script của Next); nonce
  sinh theo request ⇒ ép MỌI trang sang render động, mất SSG / cache CDN — đánh đổi lớn cho trang marketing. Bật khi có yêu cầu bảo mật cụ thể: cấp nonce ở `proxy.ts`, đọc ở
  root layout, truyền cho các `<script>`; đo lại bảng `Route (app)` của `npm run build`. Nếu chỉ cần một phần: CSP không nonce (`script-src 'self'` + hash cho script inline đã biết).

## 12. Open-redirect: chỉ nhận đường NỘI BỘ

Đích quay lại sau đăng nhập mang ở `?next=` — input người dùng. `resolveReturnPath(value, fallback?)` / `createReturnPath(pathname, search, hash)`
(`@/shared/utils/url/return-path.utils`) chỉ nhận đường nội bộ: `//evil.com`, `/\evil.com`, URL tuyệt đối đều bị bỏ → rơi về `PATHS.DASHBOARD`. Hàm thuần nên `proxy.ts`,
Server Component và client dùng chung. ⛔ Mọi `router.push` / `redirect` / `<Link href>` có đích lấy từ query / form / API đều đi qua hàm này hoặc một danh sách trắng.

## 13. `proxy.ts` là cổng NHANH, không phải phân quyền

`src/proxy.ts` chặn sớm: route cần đăng nhập mà không có cookie phiên → `/login?next=…` (người lạ không nhận HTML riêng tư). Nó chỉ kiểm cookie **CÓ TỒN TẠI**,
không giải mã, không kiểm chữ ký, không biết quyền. Vì vậy:

- ⛔ Đừng coi "đã qua proxy" là "được phép": cookie hết hạn / giả mạo vẫn lọt qua. Phiên thật do `AuthGate` (client) + BE kiểm; **quyền dữ liệu LUÔN do BE kiểm ở mỗi API**.
- Ẩn menu / chặn route phía FE (`canAccess`, `PermissionGate`) là UX, không phải bảo mật.
- Matcher của proxy bỏ qua `/api`, `_next`, file tĩnh — đường mới cần bỏ qua thì sửa matcher, không thêm `if` đầu hàm.

## 14. Server Actions / route handler: kiểm lại quyền

Base chưa có Server Action. Khi thêm: **mỗi Server Action là một endpoint HTTP công khai** (gọi được bằng `fetch` tay, không cần qua UI) —
- Kiểm xác thực + phân quyền BÊN TRONG action; đừng tin rằng "nút chỉ hiện cho người có quyền" hay "route nằm sau proxy".
- Validate input bằng Zod (§1) — tham số của action đến từ client, không có kiểu lúc chạy.
- `'use server'` file chỉ xuất hàm async; không trả secret / object nội bộ cho client.
- Route handler (`route.ts`) làm tương tự cho từng method; mặc định đặt `X-Robots-Tag: noindex` nếu nó nằm ngoài `/api`.

## 15. Nội dung SEO không được thành lỗ hổng

- Metadata / JSON-LD dựng từ DỮ LIỆU người dùng (tên sản phẩm, mô tả…) là input không tin cậy → đi qua `<JsonLd>` (§3), đừng nội suy vào chuỗi HTML tay.
- `SEO_ALLOW_INDEXING` mặc định TẮT ở preview / staging: bản thử có dữ liệu thật không được lọt vào kết quả tìm kiếm. `robots.txt` chỉ là lời mời, **không phải kiểm soát truy cập** —
  trang riêng tư cần `proxy.ts` + noindex, đừng chỉ `Disallow` (đường dẫn trong `robots.txt` còn lộ cấu trúc). Xem `rules/seo/seo.md`.

## Liên quan

`form-validation.md` · `api-patterns.md` · `ime-safe-input.md` ·
`search-matching.md` · `rules/seo/seo.md` · `rules/i18n/i18n.md` · skill `fix` (quy trình sửa khi phát hiện lỗ hổng) ·
agent `code-reviewer` (review theo checklist này).
