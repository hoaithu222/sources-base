# Hướng dẫn dùng màu — chọn token nào cho tình huống nào

> `color-system.md` cho biết token nào **tồn tại** (bảng tra + cấu trúc `colors-theme.json`).
> File này dạy **cách chọn**: đứng trước một phần tử cần màu thì dùng token nào, vì sao, và sai ở đâu
> thì máy báo. Mọi ví dụ lấy từ code thật của UI kit (kèm đường dẫn) — đọc code đó khi cần thêm ví dụ.
>
> Xem token trực quan, đổi light/dark ngay trên màn hình: trang `/demo` → mục **Màu sắc**.
> Theme SÁNG là mặc định (bộ màu logo VCI); ngôn ngữ của nó (nền, bo góc, độ nổi, header, Dock): `light-theme.md`.

---

## 1. Cây quyết định — bốn câu hỏi, theo thứ tự

```
Phần tử này cần màu để làm gì?
│
├─ 1. Nó báo TRẠNG THÁI (thành công / cảnh báo / lỗi / thông tin)?
│     → mục 6: `success` `warning` `error` `info` (chữ, viền) hoặc thang `success-N`… (nền, badge)
│
├─ 2. Nó là NỀN / CHỮ / VIỀN của giao diện (card, ô nhập, bảng, popup, đường kẻ)?
│     → mục 2–4: token theo vai trò `bg-*` · `fg-*` · `border-*` · `divider-*`. TỰ ĐỔI theo theme.
│
├─ 3. Nó là điểm NHẤN thương hiệu (focus, đang chọn, nút chính, link)?
│     → mục 7: `primary-5/6` (xanh thương hiệu VCI), `ring-focus`, `link`, `action-base`
│
└─ 4. Nó chỉ để PHÂN BIỆT (tone của KPI, series chart, khu vực) — không mang nghĩa?
      → mục 8: họ màu trang trí (`teal`, `indigo`, `pink`…), bậc `-5`; CHART → mục 10 (series lấy từ `@/shared/charts`, KHÔNG tự chọn bậc)
```

Bảng tra nhanh:

| Tôi cần… | Dùng | Không dùng |
|---|---|---|
| Nền trang | `bg-bg-page` | `bg-white`, `bg-[#F1F5F4]` |
| Nền card / panel | `bg-bg-surface` | `bg-neutral-0` (không lật theme) |
| Nền hover của dòng / mục | `hover:bg-bg-nav-hover` (nút trung tính: `hover:bg-bg-pressed`) | `hover:bg-gray-100`; `hover:bg-bg-subtle` trong hộp thoại (tối: trùng `bg-dialog`) |
| Nền đang nhấn / đang chọn | `active:bg-bg-pressed` · mục đang chọn: `bg-primary-5/15 text-link` | `bg-neutral-3` |
| Chữ tiêu đề / số KPI | `text-fg-heading` | `text-black`, `text-neutral-9` |
| Chữ nội dung | `text-fg-body` | `text-neutral-7` |
| Chữ mờ / gợi ý | `text-fg-muted` | `text-neutral-5`, `text-gray-400` |
| Chữ trên nút / badge **đặc** | `text-neutral-0` | `text-fg-heading` (đen ở theme sáng) |
| Viền mặc định | `border-border-default` | `border-gray-200` |
| Viền khi hover / nhấn mạnh | `hover:border-border-strong` · ô nhập: `hover:border-primary-5/60` | `border-2` để "đậm hơn" (đó là bề dày) |
| Đường kẻ phân vùng | `border-divider-default` | `border-border-default` cho `<hr>` |
| Lỗi (chữ / viền) | `text-error` · `border-error` | `text-red-500` |
| Vòng focus | `ring-ring-focus` | `ring-blue-500` |
| Màu cho chart | `tokenVar(seriesTokenAt(i))` · `tokenVar(CHART_STATUS.late)` | `'#2DD4BF'`, `tokenVar('teal-5')` (bậc chưa qua validator) |

---

## 2. Bề mặt — xếp lớp từ xa tới gần người dùng

Các token `bg-*` là **một chồng lớp**. Mỗi lớp nằm trên lớp trước nó:

```
bg-page        nền trang (AppShellLayout · (public)/layout.tsx)
  └ bg-surface   card / panel / thân bảng            ← mặt phẳng làm việc
      └ bg-subtle  vùng CHÌM trong card · header bảng · callout   (hover dòng → bg-nav-hover)
          └ bg-pressed  đang nhấn / đang chọn · hàng tổng · avatar mặc định
              └ bg-track  rãnh thanh tiến độ
bg-popup       dropdown · tooltip · popover (lớp NỔI, tách riêng)
bg-input       ô nhập        bg-input-hover  ô nhập khi rê chuột
bg-dialog      hộp thoại     bg-dialog-raised  đầu / chân hộp thoại
```

Ví dụ thật:

```tsx
// src/app/_layouts/AppShellLayout.tsx — nền khung ứng dụng (khoá viewport); trang công khai: `flex min-h-dvh flex-col bg-bg-page` ở `[locale]/(public)/layout.tsx`
const APP_SHELL_LAYOUT_SLOT_CLASSES = { root: 'app-background relative flex h-dvh w-full flex-col overflow-hidden', /* … */ };

// src/shared/ui/surfaces/panels/Surface.tsx — card và hộp chìm nằm TRONG card
const SURFACE_TONE_CLASSES = {
  base: 'bg-bg-surface',
  sunken: 'bg-bg-subtle', // dùng khi hộp nằm TRÊN một bg-surface khác, cần tách lớp
};

// src/shared/ui/data-display/table/table.theme.ts — footer bảng đậm hơn thân bảng
export const TABLE_FOOTER_ROW_CLASSES = 'bg-bg-pressed';

// src/shared/ui/feedback/Progress.tsx — rãnh + phần đã đạt
const PROGRESS_TRACK_BASE_CLASSES = 'min-w-0 flex-1 bg-bg-track';
```

Quy tắc:

1. **Đi từng bậc.** Card nằm trên trang: `bg-page → bg-surface`. Hộp chìm trong card: `bg-surface → bg-subtle`.
   Đừng nhảy `bg-page → bg-pressed` — ở theme tối nó sáng hơn hẳn các lớp quanh nó.
2. **Lớp nổi có token riêng** (`bg-popup`, `bg-dialog`, `bg-input`): đừng tự lấy `bg-surface` rồi chồng
   shadow lên. Các token này đã tính sẵn độ đục / blur cho từng theme.
3. **Cần đổi màu một component** → sửa trong bảng `*_CLASSES` của chính nó (xem `component-structure.md`),
   **không** thêm token mới cho một component (`color-system.md` §"Quy ước đặt tên").
4. Nền **đục** hay **trong suốt**? Nền mà các lớp khác chồng lên (hover dòng bảng, ruột HUD) phải là màu
   đục — dùng `color-mix` (mục 9), không dùng alpha, kẻo thấy xuyên.

---

## 3. Chữ

### 3.1. Thang `fg-*` — chọn theo VAI TRÒ, không theo độ đậm cảm tính

| Token | Vai trò | Ví dụ thật |
|---|---|---|
| `fg-heading` | Tiêu đề · số KPI · nhãn chính | `TABLE_CELL_CLASSES = '… text-fg-heading'` |
| `fg-subheading` | Tiêu đề phụ · **nhãn form** | `text-body-14-medium text-fg-subheading` |
| `fg-body` | Nội dung · mô tả | `TABLE_EMPTY_CELL_CLASSES = '… text-fg-body …'` |
| `fg-muted` | Gợi ý · metadata · nhãn trục chart | nhãn `Kết quả:` của `Pagination`: `text-fg-muted` |
| `fg-faint` | Rất mờ · placeholder · caption phụ | `FIELD_CONTROL_CLASS`: `placeholder:text-fg-faint` |

⛔ Không dùng `fg-muted` cho nội dung chính, không dùng `fg-faint` cho nhãn form (mờ quá — chi tiết
`text-contrast.md` §1.1).

Ưu tiên `<Text skin>` khi có thể (`<Text skin="muted">`, `skin="error"`, `skin="disabled"`) — nó truyền ý
định rõ hơn `className="text-fg-muted"` (`text-contrast.md` §2.3).

### 3.2. Chữ nằm trên nền ĐẶC → `text-neutral-0` (ngoại lệ duy nhất của `neutral-*`)

Nền đặc (`bg-primary-6`, `bg-error-6`, `bg-neutral-6`) **không lật theo theme**, nên chữ trên nó cũng không được
lật. `fg-heading` là **mực đậm** ở theme sáng → chữ mực trên nút xanh đậm.

```tsx
// ✅ src/shared/ui/actions/Button.tsx — nút primary
'border border-primary-6 bg-primary-6 text-neutral-0'
// ✅ src/shared/ui/actions/Button.tsx — nút danger
'border border-error-6 bg-error-6 text-neutral-0'
// ❌ 'bg-primary-6 text-fg-heading'
```

Header bảng KHÔNG còn là nền đặc: sáng `bg-bg-subtle`, tối pha `azure-8` với `bg-surface`, chữ `text-fg-subheading`
(`TABLE_HEADER_CELL_CLASSES`).

Dấu hiệu nhận biết: **cùng dòng class đã có một `bg-{màu}-{bậc}` đặc.** Không có nó thì không phải ngoại lệ,
và `neutral-*` **không** dùng cho chữ trên nền trang (nó đứng yên khi đổi theme nên sáng lên là mất hút).

### 3.3. Chữ trên khung nav / popup / dialog → `fg-on-chrome`

```tsx
// src/shared/ui/overlays/popup-surface.theme.ts
'relative flex items-center gap-3 px-3 py-2.5 text-body-14 text-fg-on-chrome'   // dòng menu
'… text-fg-on-chrome-muted'                                              // icon / phụ
```

`fg-on-nav-muted` / `fg-on-nav-subtle` chỉ dành cho header/nav.

Thanh header máy tính KHÔNG gắn token chữ / nền trực tiếp: mỗi kiểu thanh (`brand` gradient VCI · `glass` kính trắng)
khai bộ biến `--hdr-*` (chữ, chữ mờ, nền rê / chọn, viên đang mở `--hdr-pill` / `--hdr-pill-fg`, ô tìm kiếm, vòng focus) trong
`HEADER_APPEARANCE_CLASSES` (`src/shared/widgets/header/header.theme.ts`); logo, bộ chọn phân hệ, dải điều hướng, menu
người dùng đọc biến. Nút / phần tử mới đặt lên header → `text-[var(--hdr-fg-muted)] hover:bg-[var(--hdr-hover)]` (hoặc
dùng `HEADER_ICON_BUTTON_CLASS`), KHÔNG `text-fg-*` (chữ mực trên gradient thương hiệu là mất hút).

### 3.4. Chữ link và chữ trạng thái

`text-link` cho hyperlink (`<Link className="text-link hover:underline">`, `FormItem`). Chữ trạng thái:
`text-success` · `text-warning` · `text-error` (mục 6).

---

## 4. Viền, vạch ngăn, vòng focus

| Cần | Token | Nhớ |
|---|---|---|
| Viền ô / card / toolbar | `border-border-default` | `Surface`: `'border border-border-default'` |
| Viền khi hover hoặc cần nổi hơn | `border-border-strong` | `hover:border-border-strong` · ô nhập: `hover:border-primary-5/60` |
| Đường kẻ giữa các vùng, dòng bảng | `border-divider-default` | `<Divider>`, `FormSection` |
| Đường kẻ đậm hơn | `border-divider-strong` | |
| Đường kẻ rất nhạt (viền ô bảng `soft`) | `border-divider-soft` | alpha 8% — **không** dùng cho lưới chart |
| Viền riêng của popup | `border-border-popup` | |
| Vòng focus bàn phím | `ring-ring-focus` | `focus-visible:ring-2 focus-visible:ring-ring-focus` (Button, upload) |

**Viền ≠ vạch ngăn.** `border-*` bao quanh một vật; `divider-*` tách hai vùng. Ở theme tối chúng khác màu
hẳn (`#1B4C83` so với `#0E3263`), nên dùng lẫn là thấy lệch.

Mẫu viền ô nhập (đủ trạng thái — `src/shared/ui/inputs/field.theme.ts`):

```tsx
valid:   'border-border-default hover:border-primary-5/60 focus-within:border-primary-5 focus-within:ring-1 focus-within:ring-primary-5 focus-within:hover:border-primary-5 dark:focus-within:shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary-5)_24%,transparent)]'
invalid: 'border-error hover:border-error focus-within:border-error focus-within:ring-1 focus-within:ring-error focus-within:hover:border-error dark:focus-within:shadow-[0_0_12px_color-mix(in_srgb,var(--color-error)_24%,transparent)]'
```

Muốn viền riêng cho ô nhập (tách khỏi viền card) → thêm `border-input` vào `theme` rồi đổi `field.theme.ts`;
hiện ô nhập **cố ý** dùng chung `border-default` với card (hover ngả `primary-5/60`, focus `primary-5`).

`border-2` / `border-1` là **bề dày** của Tailwind, không liên quan token. Muốn viền "đậm hơn" về màu thì
đổi sang `border-border-strong`; muốn dày hơn thì thêm `border-2` (xem `visual-hierarchy.md`).

---

## 5. Trạng thái tương tác — mẫu có sẵn, chép đúng bậc

| Trạng thái | Nền đặc (nút chính) | Nền trong (ghost / stroke) | Nền trung tính |
|---|---|---|---|
| mặc định | `bg-primary-6` | `bg-transparent` | `bg-transparent` |
| hover | `hover:bg-primary-7` | `hover:bg-primary-5/10` | `hover:bg-bg-pressed` |
| active | `active:bg-primary-8` | `active:bg-primary-5/20` | `active:bg-bg-track` |

Nguồn: `BUTTON_SKIN_CLASSES` trong `src/shared/ui/actions/Button.tsx`. Cột trung tính không dùng `bg-subtle`:
ở theme tối nó gần trùng `bg-dialog` (`#062649` / `#05223F`) nên hover trong hộp thoại vô hình.

- **Đặc: mỗi trạng thái xuống MỘT bậc** (`-6 → -7 → -8`), cả `border-` lẫn `bg-` cùng đổi.
- **Trong suốt: dùng modifier `/10` rồi `/20`** trên bậc `-5` của chính màu đó.
- **Disabled: không có token màu.** Dùng `opacity-50 cursor-not-allowed` (`fieldSurface` làm vậy). Đừng
  tự chế `text-disabled` / `bg-disabled`.
- **Highlight trong menu** (trỏ chuột / phím): `data-[highlighted]:bg-bg-nav-hover data-[highlighted]:text-fg-heading`
  (`POPUP_ITEM_CLASS` — sáng: dòng thụt bo `rounded-sm`; tối thêm vạch trái `before:bg-primary-5`); dòng `danger` của menu:
  `data-[highlighted]:bg-error/10 data-[highlighted]:text-error before:bg-error` (`MENU_ITEM_CLASSES`).
- **Mục đang chọn** (đã tick): `data-[state=checked]:bg-primary-5/15 data-[state=checked]:text-link` + chữ
  `-semibold` (`DROPDOWN_ITEM_CLASSES`).
- **Card bấm được**: `hover:border-primary-5/60` + bóng mềm, nhấn `active:border-primary-5` (`Surface interactive`).
- **Focus**: viền `border-primary-5` + `ring-1 ring-primary-5` cho ô nhập (dark thêm quầng 24%); `ring-2 ring-ring-focus`
  cho nút / checkbox / radio / toggle. Không `ring-offset-*` — quy ước chung ở `visual-hierarchy.md` §0b.

---

## 6. Màu trạng thái — hai cách dùng, hai mục đích

Họ trạng thái có **hai dạng** cùng một ý nghĩa; chọn theo chỗ đặt:

| Dạng | Class | Khi nào | Vì sao |
|---|---|---|---|
| **Token đơn** | `text-error` · `border-error` · `bg-error/10` | Chữ / viền / nền nhạt đặt trên **nền trang** | **Tự đổi theo theme**: light `#DC2A38`, dark `#FF424E` — đủ tương phản ở cả hai |
| **Thang** | `bg-success-5/12` · `text-success-8 dark:text-success-5` · `ring-success-5/30` | Badge, nút đặc — nơi nền cũng là màu | Bậc **cố định** ở cả hai theme, ghép cặp nền/chữ tự quyết |

⚠️ Đừng dùng `text-success-5` (`#00E676`) làm chữ trên nền sáng — tương phản 1,67:1
(`chart-conventions.md` §1.7). Chữ trạng thái trên nền trang → `text-success`. Chữ trạng thái cỡ nhỏ mà token đơn
ở theme sáng chưa đủ tương phản → bậc `-7` cho sáng + token đơn cho tối: `text-success-7 dark:text-success`
(`file-list/file-card.theme.ts`). Cảnh báo luôn là `warning` (cam), không dùng vàng.

**Công thức badge** (lấy từ `Badge.tsx`; Callout dùng token đơn `border-{intent}/25 border-l-{intent} bg-{intent}/8`,
chữ `fg-*`) — dùng lại, đừng chế bậc khác:

| Kiểu | Công thức | Ví dụ thật |
|---|---|---|
| tinted (nền nhạt) | `bg-{màu}-5/12 ring-1 ring-{màu}-5/30 text-{màu}-7 dark:text-{màu}-4` (họ không có bậc 4 → `dark:-5`; success / accent chữ `-8`) | `'bg-success-5/12 text-success-8 ring-1 ring-success-5/30'` + `'dark:text-success-5'` |
| solid (đặc) | `bg-{màu}-7` / `-6` `text-neutral-0` (chỉ khi ≥ 4.3:1); accent `bg-accent-5 text-accent-9` | `'bg-success-7 text-neutral-0'` |
| outline | `bg-transparent ring-1 ring-{màu}-6 text-{màu}-7 dark:ring-{màu}-5 dark:text-{màu}-4` | `'bg-transparent text-success-8 ring-1 ring-success-6'` + `'dark:text-success-5 dark:ring-success-5'` |
| disabled | `bg-{màu}-5/6 ring-1 ring-{màu}-5/15 text-{màu}-8/50` | `'bg-success-5/6 text-success-8/50 ring-1 ring-success-5/15'` |

Muốn một badge/callout mới: **thêm khoá vào bảng `*_CLASSES` của component** (`color="…"` / `intent="…"`),
không viết class màu rải trong trang.

Tiến độ theo % có sẵn bộ đổi màu, đừng tự đặt ngưỡng: MỘT việc → `taskProgressVariant(pct)`, `taskProgressTextClass(pct)`
(`src/shared/utils/style/task-progress.utils.ts`, 100 / 70 / 30); sức khoẻ CHỈ TIÊU trên chart → `kpiHealthToken(pct)`
(`@/shared/charts`, 90 / 60 / 30).

Họ nào là họ nào: `success`=`green`, `error`=`red`, `info`=`blue`, `accent`=`yellow` (alias — cùng mã hex), `warning`≈`orange`.
Dùng **tên trạng thái** khi nghĩa là trạng thái, **tên sắc** khi chỉ chọn màu trang trí (mục 8).

---

## 7. Thương hiệu và điểm nhấn

| Token | Màu | Dùng cho |
|---|---|---|
| `primary-5` | `#2FA562` xanh lá | Điểm nhấn KHÔNG phải chữ: viền focus, vạch / chấm chỉ báo, thanh tiến độ (3,14:1 — ⛔ không làm màu chữ) |
| `primary-6/7` | `#19825A` → `#14726E` | Mặt nút chính (đặc, rọi nhẹ `-6 → -7`), mục được chọn đặc (menu, lịch) |
| `primary-8` | `#0B5E74` lam sâu | Chữ viên đang mở trên header `brand`, cuối dốc ô `AppTile primary` |
| `ring-focus` | `#2FA562` | Vòng focus bàn phím (trên header `brand` đổi sang vàng kim qua `--hdr-ring`) |
| `link` | `#14726E` / `#6DC596` | Hyperlink; mục đang chọn trong nav; MỌI chữ màu thương hiệu (tự đổi theo theme) |
| `action-base` / `action-accent` | như `link` / vàng kim `#8A6420` | Chữ + viền của nút `stroke` / `ghost` |
| `accent-5` / `-6` / `-7` | vàng kim | Nút `skin="accent"`: nền `-5` + chữ mực, hover `-6`, active `-7`; vòng focus trên header `brand` |
| `icon-accent` | `#E33D40` đỏ logo | CHỈ chấm nhấn của icon VCI bản `duo` (`vci-icon-system.md`) — không phải màu lỗi |
| `bg-brand-from/via/to` | gradient VCI xanh lá → ngọc → lam | CHỈ thanh header kiểu `brand` — một màn một dải gradient (`light-theme.md` §1.4) |
| `secondary-N`, `sky`, `teal` | cyan / xanh trời | Vai trò "cyan" — `primary` là **dải logo VCI** (xanh lá → ngọc → lam), không phải cyan |

`primary` luôn là dải thương hiệu VCI. Đừng viết `bg-primary-5` mong ra xanh dương hay xanh lá TRẠNG THÁI (xanh lá trạng
thái = `green` / `success`). Chữ màu thương hiệu → `text-link`, không `text-primary-5`.

Theme sáng không có vầng sáng / quầng: điểm nhấn là nền đặc, vạch, viền (`light-theme.md` §4). Quầng màu chỉ qua `dark:`
và pha bằng `color-mix(…var(--color-primary-5)…)` tại chỗ — không còn token `bg-primary-soft`.

---

## 8. Tone trang trí — `tone` / `color` / `iconColor`

Nhiều component nhận một **tên sắc** để tô: `TitleScreen iconColor="sky"`, `PanelCard tone="azure"`,
`SummaryPill color="green"`, `CapsuleChart tone="teal"`…

- Đó là màu **phân biệt khu vực / chỉ số**, không mang nghĩa trạng thái. Trạng thái dùng `intent="error"` /
  `color="error"` ở component có prop đó (mục 6).
- Bên trong, component ghép tên lúc chạy: `var(--color-${tone}-5)`. Vì vậy **tone phải có đủ bậc mà
  component với tới**: `TitleScreen` dùng `-3…-6`, `BoxInfo` `-4…-6`, gradient chart `-5…-7`, `SummaryPill` `-5`.
- 12 tone dùng chung (`TitleIconColor`): `blue green yellow orange red purple sky teal indigo pink fuchsia azure`.
  Họ **không** nằm trong danh sách này (vd `secondary`, `primary`) không phải giá trị hợp lệ của `TitleIconColor`.

**Thêm một tone mới** — làm đủ 3 việc, thiếu việc nào thì test đỏ:
1. Thêm họ vào `ramps` với đủ các bậc component cần (bảng ở trên).
2. Thêm tên vào union `TitleIconColor` (`TitleScreen.tsx`) và `DEMO_TITLE_TONES`.
3. Nếu bậc nào chỉ được tới bằng ghép tên: cập nhật `dynamicReach()` trong `tests/policy/styling/color-tokens.test.ts`.

⛔ **Đừng ghép tên class**: `` className={`bg-${tone}-5`} `` không ra màu — Tailwind quét mã như văn bản và
không thấy chuỗi đó. Với màu phụ thuộc biến JS dùng `style={{ background: `var(--color-${tone}-5)` }}`
(như `SectionHeader`), hoặc bảng class viết LITERAL từng ô (như `SummaryPill`).

---

## 9. Độ trong suốt và trộn màu

### 9.1. Modifier `/NN` — cách mặc định

```tsx
'bg-primary-5/10'            // nền trong 10%
'border-teal-5/40'           // viền trong 40%
'hover:border-primary-5/60'  // viền hover của ô nhập / control viền
'bg-success-5/12 text-success-8 dark:text-success-5'
```

Không có key "nền nhạt" riêng cho từng họ (đã xoá `bg-success`, `bg-info`, `bg-primary-soft`…): viết modifier trên bậc
`-5`/`-6`. Màu trong suốt có tên chỉ còn `black-6` (đen 60%, lớp phủ lightbox) và bộ kính `bg-glass` / `border-glass`.

### 9.2. `color-mix` — khi cần nền ĐỤC hoặc pha hai token

```tsx
// src/shared/ui/data-display/table/table.theme.ts — hover dòng: tint primary TRÊN nền dòng, không xuyên
'hover:bg-[color-mix(in_srgb,var(--color-primary-5)_6%,var(--color-bg-surface))]'
```

⛔ **Class arbitrary phải LITERAL trong mã nguồn.** `` `hover:bg-[color-mix(…_${pct}%…)]` `` nội suy biến thì
Tailwind không sinh CSS và **lỗi im lặng** (`src/styles/theme/variants.css`). Phần trăm thay đổi → dùng
`style` hoặc `tokenVarAlpha()` / `tokenVarOver()` (mục 10).

### 9.3. Bóng đổ có màu

```tsx
// src/shared/ui/overlays/Tooltip.tsx
'shadow-[0_8px_24px_var(--color-shadow-popup)]'
```

`shadow-popup` tự lật theo theme (đen navy 65% ở tối, mực sage 10% ở sáng). Bóng có màu (tone) pha bằng
`color-mix(in_srgb,var(--color-teal-5)_15%,transparent)` — **không** `rgba()` chép tay (`ui-kit-architecture.md` §5b).

---

## 10. Inline style, SVG, canvas và chart

| Nơi | Cách | Ví dụ |
|---|---|---|
| `style` / SVG attribute | `var(--color-<token>)` | `style={{ color: 'var(--color-primary-5)' }}` |
| Chart (Recharts) | `tokenVar('<token>')` | `fill={tokenVar('fg-heading')}` |
| Chart cần độ trong | `tokenVarAlpha(token, 0..1)` | `tokenVarAlpha('info-5', 0.3)` |
| Chart cần nền ĐỤC | `tokenVarOver(token, alpha, 'bg-surface')` | ruột khối "viền 2 lớp" |
| Hạ bậc cùng hue | `tokenAtStep('info-5', 6)` → `'info-6'` · `tokenDarker(token)` (kẹp ở bậc cuối còn có) | gradient: lõi tối hơn 1 bậc |
| Màu series thứ *i* | `seriesTokenAt(i)` | 8 slot cố định, quá 8 → `chart-other` |
| Độ lớn / lệch hai phía | `sequentialTokenForRatio(r)` · `divergingTokenFor(v, extent)` | heatmap, bản đồ nhiệt, lệch so với kế hoạch |
| Canvas 2D (cần mã hex) | `getThemeColor('<token>')` | `getThemeColor('primary-5')` |

Tất cả import từ `@/shared/charts` (trừ `getThemeColor` ở `@/shared/utils/style/color.utils`). Tham số là tên token
**không** có tiền tố `--color-`.

Chart có luật riêng — đọc `chart-conventions.md` trước khi dựng chart:
- Series lấy từ `seriesTokenAt(i)` (8 slot đã qua validator — bậc `-5` neon cũ KHÔNG còn dùng cho series); trạng thái từ `CHART_STATUS` (`done` `running` `slow` `late`), kế hoạch/thực tế từ `CHART_SEMANTIC`; độ lớn / lệch từ thang `chart-seq-*` / `chart-div-*` (có bản dark riêng).
- Lưới / trục / nhãn trục lấy từ `CHART_CHROME` (lưới `border-default`, trục `border-strong`, nhãn `fg-muted`) —
  **không** `divider-soft` (vô hình).
- **Không tô chữ bằng màu series** (kể cả chữ legend mặc định của Recharts): chữ dùng `fg-*`, danh tính màu nằm ở chấm / cung / nét.
- Bảng màu mới hoặc đổi bậc → chạy validator hai theme + sửa test `chart-palette-validator` (`chart-conventions.md` §1.2.1).
- Màu CHART KHÔNG phải màu UI: bậc `-5` neon vẫn đúng cho badge / nút / callout (nền tối), chỉ không dùng cho data series.

Hex trần chỉ hợp lệ ở ba ngoại lệ (dữ liệu người dùng chọn, canvas, scrim) — `color-system.md` §"Ngoại lệ".

---

## 11. Light / dark / TV

- Theme **SÁNG là mặc định** (`THEME_INITIAL_STATE`; `<html>` của root layout không có `class="dark"`, `appearanceInitScript` chỉ thêm khi người dùng đã chọn tối — `light-theme.md` §7.0b); chế độ TV ép tối.
- Token **theo vai trò** (`bg-*` `fg-*` `border-*` `divider-*` + `success error warning info link`) **tự đổi** theo
  theme qua class `.dark` trên `<html>`. Dùng chúng thì không viết `dark:` nữa.
- Thang **`ramps` KHÔNG đổi**: `teal-5` là cùng một màu ở cả hai theme. `-5` sáng rực hợp nền tối nhưng chữ `-5`
  trên nền sáng chỉ ~1.7:1 (`notes/code/utils.md`). Muốn tone trên nền sáng: dùng bậc đậm hơn (`-6`/`-7`), hoặc pha
  với `fg-heading` (`colorMix(tone, 0.6, 'var(--color-fg-heading)')`, `utils/style/color-mix.utils.ts`). Cách làm cho phép: `dark:` **chỉ khi buộc đổi hẳn class**, vd
  `'border border-teal-7/70 … dark:border-2 dark:border-teal-5/40'` (`CardScreenshot.tsx`) — tránh lạm dụng.
- **Trang trí HUD (quầng, ray phát sáng, sọc, ngoặc góc, dải gradient tiêu đề, dấu `//`) CHỈ qua `dark:`** — theme
  sáng có ngôn ngữ riêng (thẻ trắng bo mềm, bóng mảnh, một dải gradient ở header): `light-theme.md`. Bảng quy ước
  sáng ↔ tối (tiêu đề khối, focus, trạng thái, chuyển động): `visual-hierarchy.md` §0b.
- Muốn thử: bật `ThemeToggle`, xem cả hai theme. Một phần tử đúng ở tối mà mất hút ở sáng thường là dùng
  `neutral-*` cho chữ, hoặc `-5` làm chữ trên nền sáng.
- **Chế độ TV** (`tv-display-mode.md`): chrome chart nâng tương phản (`fg-muted → fg-subheading`,
  `border-default → border-strong`), **series giữ nguyên màu** (chống bloom). Không đổi màu series theo TV.

---

## 12. Thêm / sửa / xoá màu

Quy trình đầy đủ ở `color-system.md` §"Khi cần thêm / sửa / xoá màu". Tóm tắt thao tác:

```jsonc
// colors-theme.json
"ramps":  { "teal": [null, "#B0F1E7", …] },            // vị trí = bậc; thêm bậc ở giữa → dùng null, ĐỪNG chèn
"alias":  { "success": { "of": "green", "steps": [2, 5, 6, 7, 8] } },
"shared": { "ring-focus": "#2FA562" },                  // giống hệt hai theme
"theme":  { "bg-surface": ["#FFFFFF", "#021A36"] }      // [light, dark]
```

```bash
npm run generate:colors      # lỗi cấu trúc → dừng và nói rõ key nào sai
npm test -- tests/policy/styling/color-tokens.test.ts
```

Máy sẽ báo (không cần nhớ luật):

| Thông báo của `color-tokens.test.ts` | Nghĩa là | Sửa |
|---|---|---|
| `class màu … trỏ tới key có trong colors-theme.json` đỏ, liệt kê `file → token` | Gõ class màu không tồn tại (`text-fg-1`, `bg-primary-10`, typo) — Tailwind sẽ im lặng bỏ qua | Sửa tên theo `color-system.md` |
| `không còn tên token cũ` đỏ | Dùng tên đã đổi / xoá | Xem bảng "Đổi tên" ở `color-system.md` |
| `không token mồ côi` đỏ | Key nào đó không ai dùng | Xoá khỏi JSON, hoặc dùng nó, hoặc (nếu chỉ tới bằng ghép tên) thêm vào `dynamicReach()` |
| `hợp đồng ghép tên` đỏ | Component với tới `family-N` mà JSON không có bậc đó | Thêm bậc vào `ramps` |
| `token theo theme phải KHÁC nhau` đỏ | Key trong `theme` có `[light, dark]` giống hệt | Chuyển sang `shared` |
| `file sinh ra khớp` đỏ | Sửa JSON mà quên `npm run generate:colors` | Chạy lại |

---

## 13. Sai thường gặp

| ❌ Sai | ✅ Đúng | Vì sao |
|---|---|---|
| `text-fg-1`, `bg-bg-1`, `border-border-1` | `text-fg-heading`, `bg-bg-surface`, `border-border-default` | Tên cũ: Tailwind bỏ qua, phần tử mất màu, không có lỗi build |
| `bg-success` để lấy nền **nhạt** | `bg-success-6/15` | `bg-success` là màu ĐẶC `--color-success` |
| `bg-primary-10`, `text-gray-5`, `bg-lime-5` | bậc có thật (xem `color-system.md`) | Bậc / họ đó đã xoá |
| `text-neutral-6` cho chữ thường | `text-fg-muted` | `neutral-*` không lật theo theme |
| `bg-primary-6 text-fg-heading` | `bg-primary-6 text-neutral-0` | Chữ trên nền đặc phải cố định |
| `` className={`bg-${tone}-5`} `` | `style={{ background: `var(--color-${tone}-5)` }}` hoặc bảng class literal | Tailwind không quét được chuỗi ghép |
| `border-2` để "viền đậm hơn" | `border-border-strong` | `border-2` là bề dày, không đổi màu |
| `style={{ color: '#333' }}`, `bg-[#F8FAFC]` | token | Hex cứng không lật theo theme |
| `bg-white`, `text-gray-500` | `bg-bg-surface`, `text-fg-muted` | Màu mặc định của Tailwind, ngoài bảng token |
| `text-success-5` làm chữ trên nền sáng | `text-success` | `-5` quá sáng ở theme sáng (~1.5:1) |
| Chèn một phần tử vào giữa mảng `ramps` | Dùng `null` giữ chỗ | Dịch bậc của mọi phần tử phía sau |
| Sửa tay `generated-colors.css` / `colors.generated.ts` | Sửa JSON rồi `generate:colors` | Lần chạy sau ghi đè sạch |
| Thêm key riêng cho một component | Sửa bảng `*_CLASSES` của component | Một màu một nguồn; token là vai trò chung |
| Hai tên khác nhau cho cùng một hex (chép hex) | `alias` trong JSON | Sửa một chỗ, cả hai cùng đổi |

---

## 14. Tra nhanh

```
NỀN      bg-bg-page · bg-bg-surface · bg-bg-subtle · bg-bg-pressed · bg-bg-track
         bg-bg-popup · bg-bg-input(-hover) · bg-bg-dialog(-raised) · bg-bg-glass (Dock, header glass)
         from-bg-brand-from via-bg-brand-via to-bg-brand-to (CHỈ header kiểu brand)
CHỮ      text-fg-heading · -subheading · -body · -muted · -faint · -inverse
         text-fg-on-chrome(-muted) · text-fg-on-nav-muted/-subtle · text-neutral-0 (chỉ trên nền đặc)
VIỀN     border-border-default · border-border-strong · border-border-popup
KẺ       border-divider-default · -strong · -soft · -nav
VÒNG     ring-ring-focus
TRẠNG    text-success|warning|error|info · bg-{màu}-5/12 text-{màu}-7 dark:text-{màu}-4 (badge) · bg-{màu}-7 text-neutral-0 (đặc)
NHẤN     primary-5 (focus, vạch chỉ báo — không làm chữ) · primary-6/7 (nút) · link (chữ màu thương hiệu) · action-base · action-accent
TONE     var(--color-${tone}-5) — 12 tone; bậc component với tới: 3–6 · 4–6 · 5–7
CHART    tokenVar · tokenVarAlpha · tokenVarOver · tokenAtStep · tokenDarker · seriesTokenAt · sequentialTokenForRatio · divergingTokenFor · CHART_STATUS / CHART_SEMANTIC / CHART_CHROME
CANVAS   getThemeColor('primary-5')
```

Xem thêm: `color-system.md` (bảng token + cấu trúc JSON) · `text-contrast.md` (chữ) · `chart-conventions.md`
(chart) · `visual-hierarchy.md` (ngôn ngữ sáng / tối §0b, viền / bề dày / mật độ) · `tailwind-conventions.md` (thứ tự class, `cn()`).

---

## 15. Trang trông "nét" và nổi bật — công thức bố cục (đối chiếu với `vci-sun-pms-fe`)

Bảng màu của base lấy từ `vci-sun-pms-fe` (base chỉ gọn bớt key không ai dùng và đặt lại tên theo vai trò —
`color-system.md`), và UI kit dùng chung một nguồn. Nên một trang "nhạt" không do màu — do **cách ghép**: trang "nét" của dự án gốc luôn có ba
thứ, trang "nhạt" thiếu cả ba.

| # | Thứ làm trang nét | Cách làm trong base | Trang nhạt (đừng làm) |
|---|---|---|---|
| 1 | **Hàng tiêu đề có màu**: khối gem icon + tên trang + nhãn phụ chữ hoa (theme tối thêm nền + sọc chéo + chữ dốc màu) | `<TitleScreen icon="gear-bold" iconColor="sky" subtitle="…" title="Cài đặt" />` | `<Heading>` trần — chữ trắng trên nền tối, không có điểm nhấn |
| 2 | **Thanh tiêu đề khối có dấu theo tone** (sáng: vạch dọc 3px bo tròn · tối: `//` nghiêng + nền chuyển sắc) | `<SectionHeader accent icon="…-outline" iconColor="sky" title="…" />` | `<BoxPanel title="HIỂN THỊ">` cho khối cài đặt: chữ HOA tự gõ, theme sáng không nền màu (vạch `primary-6` / `//` của `BoxPanel` dành cho panel nghiệp vụ) |
| 3 | **Thân khối có viền thấy được**, các dòng ngăn bằng vạch | `<Surface>` (= `border border-border-default bg-bg-surface`) + `divide-y divide-divider-default` | `border="none"` (mặc định của `BoxPanel`) — `bg-surface` chỉ hơn `bg-page` một nấc nên khối gần như tàng hình |

Mẫu đầy đủ (rút gọn từ `src/app/_views/SettingsView.tsx`; chữ qua `useTranslations`, không viết cứng):

```tsx
<PageShell variant="flow">
  <TitleScreen icon="gear-bold" iconColor="sky" subtitle={t('subtitle')} title={t('title')} />

  <section className="flex max-w-2xl flex-col gap-2">
    <SectionHeader accent description={t('display.description')} icon="palette-outline" iconColor="sky" title={t('display.title')} />
    <Surface className="flex flex-col divide-y divide-divider-default">
      <SettingRow … /> {/* mỗi dòng p-3 */}
    </Surface>
  </section>
</PageShell>
```

Quy tắc đi kèm:

- **Một trang một tone.** `TitleScreen` và mọi `SectionHeader` trong trang dùng CÙNG `iconColor` (mặc định `sky`).
  Đổi tone theo phân hệ, không đổi theo từng khối.
- Cần khối **có header sắc nét hơn** (bảng, panel dày dữ liệu) → `BoxPanel variant="cyber"` hoặc `PanelCard`
  (xem `/demo/tong-quan`), kèm `border="hairline"`.
- Màu **trạng thái** vẫn dùng token trạng thái (mục 6) — tone của trang là màu nhận diện, không phải trạng thái.
- Kiểm cả hai theme: nền thanh `SectionHeader` đổi theo theme (`dark:`), đừng tự gán lại bằng `style`.

