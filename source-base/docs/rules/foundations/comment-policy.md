# Comment Policy — mặc định KHÔNG comment

> Code đọc được nhờ **tên** và **cấu trúc** (bảng `*_CLASSES`, thứ tự file cố định,
> hàm nhỏ — `component-structure.md`). **Mặc định là không có comment.**
>
> Comment chỉ có MỘT mục đích: **hướng dẫn sử dụng** — nói người dùng file / prop /
> biến / hàm này dùng thế nào. Không giải thích code làm gì, không giải thích vì sao,
> không kể lịch sử.
>
> Trước khi viết comment, hỏi: *đổi tên biến / tách hàm / thêm một khoá vào bảng có
> làm comment này thừa không?* Có thì làm việc đó.

---

## 1. Được phép — và CHỈ bốn loại này

| # | Loại | Đặt ở | Giới hạn |
|---|------|-------|----------|
| 1 | **Khối tài liệu component / hook** (`component-structure.md §4`): mô tả · hướng dẫn · `@param props.<tên>` cho từng prop · `@example` | NGAY TRÊN dòng khai báo component (`function Xxx` / `const Xxx = memo(…)`) hoặc hook `useXxx`, không dòng trống ở giữa | 1 khối / component, ≤ 100 dòng tính cả `/**` `*/` |
| 2 | **Khối hướng dẫn đầu file** — chỉ cho file KHÔNG phải component (`*.theme.ts`, `*.utils.ts`, store, barrel) | đầu file, sau imports, có dòng trống phía sau | 1 khối / file, ≤ 12 dòng nội dung |
| 3 | **JSDoc hướng dẫn dùng** một biến / hằng / hàm / kiểu / thuộc tính của kiểu dữ liệu (`DropdownOption.meta`…): giá trị hợp lệ, đơn vị, mặc định | NGAY TRÊN khai báo, dạng `/** … */` | ≤ 3 dòng |
| 4 | **Chỉ thị công cụ bắt buộc**: `eslint-disable-next-line <rule> -- lý do`, `@ts-expect-error <lý do>`, `/* @vite-ignore */`, `// prettier-ignore`, `/// <reference … />`, cờ `font-guard-quote` | tại chỗ | 1 dòng |

Không có loại thứ năm.

**Prop của component chỉ giải thích MỘT chỗ** — dòng `@param props.<tên>` trong khối tài liệu
component. KHÔNG lặp lại bằng JSDoc trên từng dòng của `XxxProps` (hai chỗ là hai bản sẽ lệch nhau).
Kiểu dữ liệu không phải props (`DropdownOption`, `TableColumn`…) vẫn dùng loại 3 trên từng thuộc tính.

```tsx
/**
 * Button — nút bấm chuẩn của UI kit; mọi chỗ cần "bấm để làm một việc" đều dùng nút này.
 *
 * Nhận thêm mọi thuộc tính của `<button>` (`onClick`, `disabled`, `aria-*`…).
 * Sửa giao diện: màu → `BUTTON_SKIN_CLASSES[skin][variant]` · cỡ → `BUTTON_SIZE_CLASSES`.
 * Lưu ý: stroke / ghost dùng token semantic (`action-*`, `error`), KHÔNG dùng bậc số `-7`.
 *
 * @param props.variant - Kiểu tô: `primary` | `secondary` | `stroke` | `ghost`. Mặc định `primary`.
 * @param props.loading - `true` → hiện spinner, chặn bấm, gắn `aria-busy`. Mặc định `false`.
 * @param props.asChild - `true` → render phần tử con (vd `<Link>`) thay cho `<button>`.
 *
 * @example
 * <Button variant="stroke" startIcon={<SystemIcon name="trash-outline" />}>Xoá</Button>
 */
function Button({ variant = 'primary', loading = false, asChild = false, ...props }: ButtonProps) {

/** Chiều cao chuẩn theo `FieldSize`, dùng chung cho mọi control một dòng. */
export const FIELD_HEIGHT = { sm: 'h-8', md: 'h-9', lg: 'h-10' } as const;
```

Rê chuột lên `<Button` ở bất kỳ đâu trong VS Code là thấy nguyên khối này. TypeScript gắn khối vào
khai báo NGAY SAU nó — đặt khối ở đầu file thì nó gắn vào `XxxProps` / hằng đứng kế, hover component
trống trơn. Quy ước thêm "không dòng trống ở giữa" để mắt người cũng thấy khối thuộc về component nào.

---

## 2. Cấm — mọi thứ còn lại

| ❌ Cấm | Thay bằng |
|---|---|
| `//` giải thích bên trong hàm, JSX, bảng class, object | Đặt tên tốt hơn / tách hàm / để code tự nói |
| `{/* … */}` trong JSX (kể cả "đánh dấu vùng") | Tách sub-component — tên của nó là nhãn |
| Giải thích "VÌ SAO", cảnh báo `⛔` / `⚠️` đặt rải trong code | Bẫy ảnh hưởng cách dùng → dòng `Lưu ý:` của khối tài liệu component (§1.1). Lý do thiết kế → docs (§3) |
| Con trỏ docs rải trong code (`// xem docs/rules/…`) | Gộp vào `Lưu ý:` của khối tài liệu component |
| Kể lại code (`// tăng i`, `// render danh sách`) | Xoá |
| Banner / ngăn cách (`// ── skin=accent ──`, `// ====`) | Khoá của bảng đã là nhãn |
| Code bị comment-out | `git` giữ lịch sử |
| Lịch sử & thay đổi: "trước đây…", "bản cũ…", tên người báo lỗi, "lỗi ở trang X", số đo đã đo | Commit message / PR |
| Chép nội dung đã có trong `docs/rules/` | Trỏ tới một lần, đừng lặp |
| `TODO` / `FIXME` không có người nhận | Mở issue hoặc sửa luôn |
| JSDoc kể code làm gì / ví dụ sai-đúng dài | Xoá, hoặc rút còn ≤ 3 dòng hướng dẫn dùng |
| JSDoc trên từng dòng của `XxxProps` (component) | Một dòng `@param props.<tên>` trong khối tài liệu component |
| Khối hướng dẫn đứng riêng đầu file component (kiểu cũ: `Dùng:` / `Trục:`) | Chuyển xuống thành khối tài liệu ngay trên component |

---

## 3. Lý do thiết kế đi đâu?

Có quyết định thật sự cần giải thích dài (vì sao `touch:` chứ không `max-xl:`, vì sao
chữ phải là token semantic, vì sao `type` mặc định `'button'`…). Chúng **không bị xoá** —
chỉ chuyển khỏi code:

| Lý do thuộc về… | Đặt ở |
|---|---|
| Quy ước chung (màu, chữ, responsive, form…) | rule tương ứng trong `docs/rules/<nhóm>/*.md` |
| Một component / nhóm component trong `shared/ui` | `docs/notes/components/<nhóm>[-<nhóm-con>].md`, mục `## Tên component` |
| Một module khác (widget, hook, util, app, core, feature) | `docs/notes/code/<tên folder>.md`, mục `## Tên file hoặc module` |
| Một lần đổi duy nhất (bug đã sửa, PR) | commit message / PR description |

Chọn đúng file note: quy tắc tra ở `docs/README.md` §"Ba loại tài liệu". Mục ghi chú viết ngắn: ≤ 6 gạch đầu
dòng, mỗi gạch ≤ 2 dòng, chỉ ghi điều **không hiển nhiên từ code** và **chưa có trong rule nào**; không kể lịch sử.
Khối tài liệu trỏ tới note bằng một cụm cuối dòng `Lưu ý:` / mô tả: `Lý do thiết kế: notes/components/<file>.md`.

---

## 4. Kiểm tra tự động

Rule ESLint `local/comment-policy` (`scripts/eslint/rules/comment-policy.mjs`, khai trong
`eslint.config.js`) đọc danh sách comment thật của parser nên bắt cả comment cuối dòng và
comment JSX. Chạy trong `npm run lint` và `lint-staged` khi commit:

- không `//` comment nào ngoài chỉ thị công cụ (§1.4) và comment bên trong khối RỖNG
  (`catch {}` — `no-empty` bắt buộc);
- không comment JSX `{/* … */}`, không comment khối thường;
- khối sát khai báo component (PascalCase) / hook (`useXxx`) ≤ 100 dòng kể cả `/**` `*/`;
- một khối hướng dẫn đứng riêng (có dòng trống phía sau) ≤ 14 dòng kể cả `/**` `*/`; mọi JSDoc
  khác phải sát khai báo và ≤ 5 dòng kể cả `/**` `*/` (= 3 dòng nội dung).

Bài kiểm `tests/policy/foundations/ui-kit-docs.test.ts` (đọc KIỂU props thật bằng TypeScript compiler API) giữ
nội dung khối tài liệu của MỌI component đi qua barrel `@/shared/ui`:

- khối sát dòng khai báo tên mà file `export default`; dòng đầu `Tên — mô tả`; có `@example`;
- mỗi prop do UI kit tự khai (kể cả kế thừa từ kiểu của UI kit, không tính prop của React / Radix) có
  `@param props.<tên>`; mỗi `@param props.<tên>` phải là prop có thật — đổi tên / bỏ prop mà quên
  sửa chú thích là đỏ;
- file component không còn khối hướng dẫn đứng riêng kiểu cũ.

Mức độ: `error` ở toàn `src/`, trừ hai file TS do script sinh ra (`GENERATED_SOURCES` trong
`eslint.config.js`). `tests/`, `scripts/`, CSS (`src/styles`, `*.css`) và các file cấu hình gốc (`vite.config.ts`,
`eslint.config.js`…) không áp — ở đó comment đầu file là phần hướng dẫn dùng của chính cấu hình,
và với CSS (không có test đọc hiểu như TS) comment là chỗ duy nhất giữ lý do (`css-architecture.md`). Một rule chỉ nằm
trong tài liệu là một rule sẽ bị quên.

---

## 5. Checklist

- [ ] Trong thân hàm / JSX / bảng class không còn comment nào
- [ ] Component: một khối tài liệu ngay trên khai báo — mô tả, `@param props.<tên>` đủ từng prop, `@example`
- [ ] File không phải component: một khối hướng dẫn đầu file (nếu cần) + JSDoc ngắn trên API công khai
- [ ] Bẫy ảnh hưởng cách dùng đã nằm ở dòng `Lưu ý:`; lý do dài đã chuyển vào docs
- [ ] `eslint-disable` / `@ts-expect-error` đều có lý do một dòng
