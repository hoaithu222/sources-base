---
name: fix
description: Sửa bug / lỗi type / lỗi lint / CI / test đỏ / hydration mismatch / route bị động / lỗi env / hành vi lạ / chậm trong base-project (Next.js) một cách có hệ thống — điều tra gốc rễ trước, không vá triệu chứng; kèm kỹ thuật thoát bế tắc khi đã thử vài cách không tiến triển. Dùng khi có một lỗi cụ thể cần sửa hoặc đang loanh quanh chưa tìm ra nguyên nhân.
---

# Fix — Scout → Diagnose → Fix → Verify + Prevent

**Không đề xuất sửa trước khi điều tra xong gốc rễ.** "Chắc là do X, thử sửa X xem" không phải điều tra — đó là đoán.
Vá triệu chứng (che lỗi mà không hiểu vì sao xảy ra) tính là THẤT BẠI của quy trình này.

## 0. Chọn chế độ

| Trường hợp                                | Chế độ                                                                |
| ----------------------------------------- | --------------------------------------------------------------------- |
| Lỗi type / lint rõ ràng một dòng          | **quick** — sửa thẳng, kiểm bằng `npm run typecheck` / `npm run lint` |
| Bug nghiệp vụ, chưa rõ nguyên nhân        | **auto** (mặc định) — đủ các bước dưới                                |
| Bug nhạy cảm (auth, mất dữ liệu, bảo mật) | **review** — dừng xác nhận với user sau mỗi bước lớn                  |
| Nhiều lỗi độc lập                         | **parallel** — xử lý từng lỗi riêng, không gộp một commit lớn         |

Trước khi sửa: xem `docs/known-issues.md` — hiện tượng có thể đã được ghi kèm hướng / quyết định chờ chủ repo.

## 1. Scout — định vị

File nào, phụ thuộc nào, test nào đang (hoặc KHÔNG) phủ vùng lỗi; `git log -p --follow <file>` có thay đổi nào gần
thời điểm lỗi xuất hiện không.

## 2. Diagnose — tìm gốc rễ

1. **Tái hiện** — chạy lệnh / thao tác gây lỗi, đọc log / console / network thật, ghi output GỐC làm mốc so sánh.
   Chưa tái hiện được thì chưa sang bước sau.
2. **Trace ngược tới nguồn** — lỗi lộ ở component A không có nghĩa lỗi nằm ở A: lần theo luồng dữ liệu tới nơi giá
   trị sai XUẤT HIỆN LẦN ĐẦU (field hiện `NaN` → thường ở tầng parse / format, không ở JSX).
3. **Kiểm theo tầng:** đầu vào (API / người dùng) → logic (biến đổi, tính toán) → môi trường (`next dev` vs `next build` + `next start`;
   `NEXT_PUBLIC_APP_MODE` demo / app; StrictMode chạy effect hai lần ở dev; **server hay client** — code chạy ở đâu?) →
   công cụ quan sát (log có đặt đúng chỗ không; log ở Server Component ra TERMINAL, không ra console trình duyệt).
4. **Kiểm giả thuyết bằng cách nhỏ nhất** (log tạm, test cô lập) — KHÔNG sửa code chính rồi "thử xem hết chưa".
5. **Tìm cùng pattern ở chỗ khác** — vd một ô tìm kiếm quên `useImeSafeSearchInput` → grep xem còn chỗ nào quên.

≥ 2 giả thuyết đều sai → dừng, trình bày lại vấn đề với user thay vì thử giả thuyết thứ 3 một mình.

## 2b. Lỗi đặc thù Next.js — triệu chứng → nơi nhìn

| Triệu chứng                                                                              | Chẩn đoán                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Hydration mismatch** ("text content does not match", "Hydration failed")               | HTML server ≠ lần render đầu ở client. Thủ phạm: đọc `localStorage` / `window` / `matchMedia` / `Date.now()` / `Math.random()` LÚC RENDER → chuyển vào effect hoặc dùng CSS (`phone:`, `max-lg:`); store Zustand `persist` thiếu `skipHydration` + `registerPersistedStore`; theme áp bằng effect thay vì `appearanceInitScript`. Đọc diff ở console; nghi extension trình duyệt thì thử cửa sổ ẩn danh (`architecture.md` §4) |
| **Route bị `ƒ` (động)** trong bảng `Route (app)` của `npm run build`                     | Tìm `cookies()` / `headers()` / `draftMode()` / `searchParams` ở server, `useSearchParams` thiếu `<Suspense>`, `dynamic = 'force-dynamic'`, `fetch` `no-store`, thiếu `generateStaticParams`. Bisect: bỏ từng thứ đến khi route tĩnh lại. KHÔNG thêm `setRequestLocale` — ngôn ngữ đọc từ `next/root-params` (`architecture.md` §3)                                                                                            |
| Lỗi biên dịch "needs `useState` / … add `'use client'`"                                  | File chạm API chỉ-client thiếu directive — đọc `Import trace` của Next, file ở cuối chuỗi là file dùng API client; thêm `'use client'` vào đúng file đó (hook / store / context `.ts` cũng cần). Test luật `use-client` (ở `tests/policy/structure/`)                                                                                                                                                                          |
| "Functions cannot be passed…" / gọi hàm export từ file `'use client'` ở Server Component | Hằng / hàm thuần phải ở file riêng (`*.utils.ts` / `*.theme.ts` / `*.constants.ts`); prop Server → Client phải serialize được (`docs/rules/structure/server-client-boundary.md`)                                                                                                                                                                                                                                               |
| `EnvValidationError` lúc `npm run dev` / `build`                                         | In tên biến sai — schema `src/core/config/env.schema.ts`, nguồn `.env` / `.env.local`. Build chế độ `app` cần `NEXT_PUBLIC_API_BASE_URL` + `NEXT_PUBLIC_SITE_URL`, cấm `NEXT_PUBLIC_AUTH_ENABLED=false`. `NEXT_PUBLIC_*` nhúng LÚC BUILD (đổi → build lại) và phải truy cập THẲNG `process.env.NEXT_PUBLIC_X`                                                                                                                  |
| Khoá dịch hiện nguyên khoá / `MISSING_MESSAGE`                                           | Khoá thiếu ở `src/messages/vi` hoặc `en`; hoặc namespace chưa nằm trong `CLIENT_NAMESPACES` mà Client Component dùng. `npm run check:i18n` + `npm run typecheck`                                                                                                                                                                                                                                                               |
| Link mất tiền tố `/en`, đổi ngôn ngữ nhảy trang                                          | Dùng `next/link` / `next/navigation` thay vì `@/core/i18n` (`docs/rules/i18n/i18n.md`)                                                                                                                                                                                                                                                                                                                                         |
| Vòng redirect `/login` ⇄ `/dashboard`                                                    | `proxy.ts` cố ý chỉ chặn vùng riêng tư theo cookie phiên; việc đưa người đã đăng nhập khỏi trang khách là của `GuestGate` (`architecture.md` §3). Kiểm `AUTH_SESSION_COOKIE` có khớp tên cookie BE                                                                                                                                                                                                                             |
| `tsc` đỏ lạ / thiếu kiểu `PageProps`, `LayoutProps`                                      | Chạy `npm run typecheck` (có `next typegen`), không `tsc --noEmit` trần; kiểu route sinh lại ở `.next/types`                                                                                                                                                                                                                                                                                                                   |
| Đổi `next.config.ts` / route / env mà không ăn, lỗi "ma"                                 | Cache Turbopack: DỪNG dev server, xoá thư mục `.next/`, chạy lại `npm run dev` (thử bước này TRƯỚC khi nghi code)                                                                                                                                                                                                                                                                                                              |
| Chỉ lỗi ở production                                                                     | `npm run build && npm run start` để tái hiện (SSG, minify, React Compiler); dev có StrictMode và không prerender                                                                                                                                                                                                                                                                                                               |
| Hành vi memo lạ / component "không tối ưu"                                               | React Compiler bỏ qua component vi phạm Rules of React (đọc `ref.current` / mutate lúc render) — đọc cảnh báo ESLint `react-hooks`, đừng đoán                                                                                                                                                                                                                                                                                  |

## 3. Đánh giá độ phức tạp

Đơn giản (1 file, rõ nguyên nhân) / trung bình (vài file) / phức tạp (đụng kiến trúc → bàn với user trước, có thể
dùng skill `brainstorm`).

## 4. Sửa

Sửa tối thiểu, tại ĐÚNG NGUỒN, theo pattern có sẵn (UI kit, `docs/rules/`). Không nhân dịp "dọn luôn" phần không
liên quan. Không sửa tay file sinh (xem `.claude/CLAUDE.md` mục Design tokens).

## 5. Verify + Prevent (bắt buộc)

- Chạy lại CHÍNH XÁC lệnh / thao tác tái hiện ban đầu, so với mốc ở bước 2 — đọc output thật, không suy luận.
- Thêm regression test khi hợp lý: test phải ĐỎ khi bỏ bản sửa, XANH khi có (skill `web-testing`).
- Sửa hiển thị (`.tsx` / `.css`): chạy `npm run dev` (http://localhost:3000), xem trang thật + console không có lỗi mới (cả `/en/…`).
- Sửa route / layout / provider / dữ liệu server: `npm run build` và đọc lại bảng `Route (app)` — không `ƒ` mới.
- `npm run check` xanh (`docs/rules/foundations/quality-gates.md`).

## 6. Kết thúc

Báo: nguyên nhân gốc, sửa ở đâu, kiểm bằng gì. Đề xuất commit theo skill `git` nếu user muốn.

## Công cụ điều tra

| Cần gì                         | Dùng                                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Lỗi type                       | `npm run typecheck` (= `next typegen && tsc --noEmit`) — đọc HẾT danh sách (⛔ không `tsc --noEmit` trần) |
| Lint                           | `npm run lint` · `npm run check:eslint-config` (cấu hình ESLint lệch)                                     |
| Khoá dịch vi ↔ en              | `npm run check:i18n`                                                                                      |
| Test một file / một tên        | `npm run test:unit -- <tên>` · smoke: `npm run test:smoke`                                                |
| Import vòng · gói chưa khai    | `npm run check:cycles` · `npm run check:imports`                                                          |
| File / export thừa             | `npm run check:unused-files` · `npm run report:unused-exports`                                            |
| Route tĩnh hay động · build vỡ | `npm run build` — bảng `Route (app)`, `ƒ` = động                                                          |
| Bundle phình                   | `npm run analyze` (`next experimental-analyze`)                                                           |
| UI có đúng không               | `npm run dev`, xem trực tiếp — đừng kết luận từ code khi xem thật được                                    |

## Red flags — tự bắt mình

| Câu tự nhủ                                                     | Nghĩa thật                                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| "Thấy vấn đề rồi, sửa luôn" / "Chắc là do X"                   | Thấy TRIỆU CHỨNG ≠ hiểu gốc rễ — kiểm giả thuyết trước                                                  |
| "Sửa tạm đã, điều tra sau"                                     | Quay lại bước 2                                                                                         |
| "Thử đổi X xem sao"                                            | Đang đoán, chưa có giả thuyết đã kiểm                                                                   |
| "Thêm `'use client'` / `suppressHydrationWarning` cho hết lỗi" | Che triệu chứng — tìm xem VÌ SAO server và client khác nhau, hoặc VÌ SAO file kéo API client vào server |
| "Test pass rồi, xong" / "Chắc giờ ổn rồi"                      | Chưa chạy lại tái hiện; chưa có guard chặn lớp bug này tái diễn                                         |

## Khi bế tắc (đã sửa cùng vùng ≥ 3 lần, giải pháp phình dần, không giải thích được vì sao cách hiện tại đúng)

1. **Thu nhỏ** tới mức tối thiểu còn tái hiện được — phần còn lại thường chỉ thẳng gốc rễ.
2. **Nói lại vấn đề bằng 1–2 câu, không nhìn code** — không nói được là chưa hiểu, quay lại bước 2.
3. **Đảo câu hỏi:** "điều kiện nào khiến X KHÔNG chạy" thay vì "làm sao cho X chạy".
4. **Tìm pattern có sẵn** — grep `src/` và `docs/rules/` trước khi nghĩ giải pháp mới.
5. **Hỏi lại đúng bài toán** — có cách đơn giản hơn đạt cùng mục tiêu mà bỏ qua chỗ đang kẹt (YAGNI / KISS,
   `docs/rules/foundations/development-rules.md`)?
6. **Dừng và hỏi user** — tóm tắt đã thử gì / kết quả gì, thay vì thử lần thứ 4 cùng hướng; nghi giả định nền tảng.

## Liên quan

`brainstorm` (chọn giữa nhiều phương án) · `web-testing` (regression test) · `ui-kit-component-picker` (sửa xong cần
đổi component nào) · agent `code-reviewer` (rà lại trước khi coi là xong).
