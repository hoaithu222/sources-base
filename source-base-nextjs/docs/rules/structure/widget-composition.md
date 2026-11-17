# Widget Composition — khuôn widget `src/shared/widgets`

> Bổ sung cho `ui-kit-architecture.md` và `reuse-first.md` — tập trung vào widgets
> (Dock, Header, ProgressCenter, …). Mục tiêu: **sửa 1 chỗ → đồng bộ cả widget**, KHÔNG
> rải Tailwind chain ad-hoc trong JSX.
>
> Widget theo CÙNG khuôn với UI kit (`component-structure.md`): bảng `*_CLASSES` + `cn()`,
> KHÔNG `tv()` (đã gỡ khỏi repo — lý do ở `component-structure.md §2`). Thứ tự file, khối
> hướng dẫn, comment, folder ≤ 8 mục áp dụng nguyên.

---

## 1. Token Centralization — quy tắc 1-Source

Mỗi widget folder PHẢI có file `*.theme.ts` colocated chứa:

1. **Token constants** (cao, easing, duration, class dùng chung) — `export const X = '…'` hoặc `as const`
2. **Bảng class** cho mọi panel/control: mỗi slot một ô của `XXX_SLOT_CLASSES`; mỗi trục có ≥ 2
   trạng thái (`layout`, `at`, `active`, `collapsed`…) một bảng `XXX_{TRỤC}_CLASSES`
   `satisfies Record<Union, string>`, ghép bằng `cn()`. Mỗi ô tự đứng được (mang đủ class của
   tổ hợp đó).

```ts
// src/shared/widgets/header/header.theme.ts — bản THẬT trong repo
export const HEADER_CONTROL_HEIGHT = 'h-8 wide:h-9';

export const HEADER_SLOT_CLASSES = {
  root: cn('group/header relative z-30 flex shrink-0 items-center gap-2', SHELL_GUTTER_X, 'text-[var(--hdr-fg)]', …),
  left: 'relative flex min-w-0 flex-1 items-center gap-1 self-stretch',
  titleSlot: 'flex min-w-0 shrink-[4] items-center gap-1 self-stretch empty:hidden',
} satisfies Record<HeaderSlot, string>;

// Biến thể theo KIỂU thanh người dùng chọn (store cục bộ `chrome/header-appearance.store.ts`):
// mỗi kiểu chỉ khai biến `--hdr-*`, phần con đọc biến → thêm kiểu = thêm MỘT khoá.
export const HEADER_APPEARANCE_CLASSES = {
  brand: cn('bg-linear-to-r from-bg-brand-from via-bg-brand-via to-bg-brand-to rim-tile', '[--hdr-pill:var(--color-neutral-0)]', …),
  glass: cn('rim-glass bg-bg-glass backdrop-blur-xl', '[--hdr-pill:var(--color-primary-6)]', …),
} satisfies Record<HeaderAppearance, string>;
```

**Component CHỈ chọn ô trong bảng** — KHÔNG viết Tailwind chain dài trong JSX:

```tsx
// ❌ SAI — magic chain trong JSX
<div className="relative flex min-w-0 flex-1 items-center gap-1 self-stretch ...">

// ✅ ĐÚNG — chọn ô của bảng
<header
  className={cn(HEADER_SLOT_CLASSES.root, HEADER_APPEARANCE_CLASSES[appearance], className)}
  data-appearance={appearance}
>
  <div className={HEADER_SLOT_CLASSES.left}>…</div>
</header>
```

File theme hiện có — đọc trước khi thêm cái mới:
`header/header.theme.ts` · `header/modules/module-nav.theme.ts` · `header/page-header/page-header.theme.ts` ·
`header/user-menu/user-menu.theme.ts` · `dock/dock.theme.ts` · `dock/dock-settings.theme.ts` ·
`command-palette/command-palette.theme.ts` · `progress-center/progress-center.theme.ts` ·
`progress-center/card/progress-card.theme.ts`.

Bảng chỉ MỘT component dùng (vd `LOGO_*` của `Logo.tsx`) ở lại file component; chỉ khi bảng
làm file vượt ngưỡng hoặc ≥ 2 file dùng thì mới sang `*.theme.ts`.

---

## 2. Reuse UI kit Primitives — KHÔNG re-implement

Trước khi viết Tailwind cho 1 phần tử trong widget, kiểm tra `@/shared/ui/`:

| Nhu cầu         | Dùng                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| Toggle/switch   | `Toggle`                                                                                                 |
| Floating panel  | `Popover` (variant `glass` / `solid`)                                                                    |
| Modal/dialog    | `Modal` / `ConfirmDialog` / `FormModal`                                                                  |
| Dropdown action | `Menu` · selection: `Dropdown` / `MultiSelect`                                                           |
| Text/heading    | `Text` / `Heading` (KHÔNG raw `text-sm font-medium`)                                                     |
| Separator       | `Divider` (KHÔNG `<div className="h-px bg-..." />`)                                                      |
| Icon            | `<SystemIcon name="..." />` — mặc định `-outline`, `-bold` cho gem/KPI/overlay (KHÔNG inline SVG)        |
| Avatar/ảnh      | `Avatar` / `ImagePreview` / `Image`                                                                      |
| Badge/tag       | `Badge`                                                                                                  |
| Tooltip         | `Tooltip` (cẩn thận khi đặt trong `Popover.Trigger asChild` — dùng native `title` nếu xung đột Provider) |

Lý do: thay đổi typography/color/radius ở `font.json` / `colors.generated.ts` /
bảng class → widget tự cập nhật. KHÔNG cần grep sửa từng class.

**Ngoại lệ `<button>` thô — CHỈ trong widget.** Gác ESLint `guard/ui-kit-elements` cấm `<button>` /
`<input>` / `<select>` / `<textarea>` / `<table>` / `<svg>` thô ở `src/{app,features,domains}`, nhưng không áp
cho `src/shared/widgets`: widget dựng bề mặt mà `Button` không có biến thể tương ứng — trigger `asChild` của
Radix phải nhận `ref` + spread props (`UserMenuTrigger`, nút bánh răng Dock, `CommandPaletteTrigger`), phần tử
đa hình `<a>` / `<button>` (`Logo`, `NavElement`), hàng / ô chọn trong lớp nổi tự dựng (`palette-row`,
`dock-option-tile`, `dock-position-picker`), tay nắm mở Dock. Hình dạng lấy từ bảng class `*.theme.ts` của widget; vẫn bắt buộc
`type="button"` và `aria-label` khi nút không có chữ.

---

## 3. Local Sub-component khi tile lặp lại

Khi 1 layout (vd "icon + title + description + trailing") lặp lại trong widget, tạo phần con memoized:

Mẫu có thật trong repo: `page-header/parts/page-header-phone.tsx` khai `PhoneNavChip` memoized
ngay trong file, **KHÔNG export** (đúng ngoại lệ §1 của `clean-code-standards.md`)
— vì mỗi chip cần `useCallback` riêng.

```tsx
// page-header/parts/page-header-phone.tsx — local, KHÔNG export
const PhoneNavChip = memo(function PhoneNavChip({ item, active, disabled, onSelect }) {
  const handleActivate = useCallback(() => onSelect(item.key), [item.key, onSelect]);
  return <NavElement … onActivate={handleActivate} />;
});
```

Ngưỡng: lặp ≥ 2 lần trong cùng file → phần con nội bộ (`clean-code-standards.md §1`); lặp ở ≥ 2 file của widget →
file riêng trong `parts/`.

Nếu tile xuất hiện ở ≥ 2 widget → promote lên `src/shared/ui/` theo
checklist `ui-kit-architecture.md §9`.

---

## 4. Font tokens — BẮT BUỘC dùng `text-{scale}-{weight}`

KHÔNG raw `text-sm font-medium leading-5` hay `text-[11px] uppercase`. Dùng:

| Vai trò                 | Class hệ thống                                                      |
| ----------------------- | ------------------------------------------------------------------- |
| Tile title              | `text-body-14-medium` (qua `<Text size="small" weight="medium" />`) |
| Tile description        | `text-caption-12` (qua `<Text size="tiny" skin="muted" />`)         |
| Section label uppercase | `text-caption-10-medium`                                            |
| Heading panel           | `<Heading size="extraTiny" />`                                      |

Thiếu scale → sửa `src/styles/font/font.json` → `npm run generate:font`.
KHÔNG hard-code px.

---

## 5. Color tokens — KHÔNG hex / KHÔNG raw Tailwind palette

| ❌ Sai                      | ✅ Đúng                             |
| --------------------------- | ----------------------------------- |
| `bg-white` / `bg-[#0F172A]` | `bg-bg-surface` / `bg-bg-subtle`    |
| `text-gray-500`             | `text-fg-muted`                     |
| `border-[#22c55e]`          | `border-success` / `border-green-6` |
| `text-blue-500`             | `text-link` / `text-info`           |

Cần màu mới → thêm `src/styles/theme/colors-theme.json` → `npm run generate:colors`.

---

## 6. Variant extension — thêm khoá, KHÔNG fork file

Khi designer thêm 1 mode/skin mới (vd "compact mode"):

```ts
// ❌ SAI — tạo DockCompact.tsx song song với Dock.tsx
// ❌ SAI — thêm prop `compact?: boolean` rồi rải `compact && "..."` trong JSX

// ✅ ĐÚNG — thêm union + một bảng trục mới trong dock.theme.ts
type DockDensity = 'cozy' | 'compact';

export const DOCK_DENSITY_CLASSES = {
  cozy: { root: 'px-3 py-2', item: 'size-11' },
  compact: { root: 'px-2 py-1', item: 'size-9' },
} satisfies Record<DockDensity, Partial<Record<DockSlot, string>>>;
```

Component thêm 1 prop `density?: DockDensity = 'cozy'` và ghép
`cn(DOCK_SLOT_CLASSES.item, DOCK_DENSITY_CLASSES[density].item)`. Thiếu ô là `tsc` đỏ.

---

## 7. Checklist trước khi commit widget code

- [ ] File `*.theme.ts` colocated chứa hằng + bảng `*_CLASSES` (không `tv()`)
- [ ] JSX component CHỈ chọn ô của bảng ghép bằng `cn()` — KHÔNG Tailwind chain raw
- [ ] Mọi typography dùng `<Text>` / `<Heading>` hoặc `text-{scale}-{weight}`
- [ ] Mọi màu dùng semantic token (`bg-bg-surface`, `text-fg-muted`, `text-info`); trang trí HUD chỉ qua `dark:` (`visual-hierarchy.md` §0b)
- [ ] Mọi icon dùng `<SystemIcon name="..." />` (mặc định `-outline`, `-bold` cho nhấn mạnh) — không inline SVG
- [ ] Reuse primitives từ `@/shared/ui` (Popover, Toggle, Divider, …)
- [ ] Tile/row lặp lại được extract thành local component memoized
- [ ] Đúng thứ tự file + khối tài liệu ngay trên component (`component-structure.md`); không comment ngoài `comment-policy.md`
- [ ] Variant mới = thêm khoá vào bảng/union, KHÔNG copy-paste component
- [ ] Đúng khuôn folder (§9): `index.ts` chỉ xuất thứ bên ngoài dùng, phần nội bộ trong `parts/` (kebab-case)
- [ ] Store (nếu có) là store CỤC BỘ đúng §10 — không đọc store widget khác / domain; store `persist` bật `skipHydration: true` + `registerPersistedStore(...)` (`state-management.md`)
- [ ] `'use client'` ở file gọi hook; chữ qua `useTranslations('ui.widgets')`; `Link` từ `@/core/i18n` (`href`) — §9b
- [ ] `npm run check` xanh (`quality-gates.md`)

---

## 8. Anti-patterns danh sách đen

| ❌ Sai                                                                             | ✅ Đúng                                                                            |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `<div className="h-px bg-sky-5/15 my-2" />`                                        | `<Divider className="my-2 border-sky-5/15" />`                                     |
| `<p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-5">` | `<Text className={DOCK_SETTINGS_SLOT_CLASSES.sectionLabel}>` (font token qua bảng) |
| `<input type="checkbox" />` + style tay                                            | `<Toggle />` / `<Checkbox />`                                                      |
| Inline `<svg>` cho check/arrow                                                     | `<SystemIcon name="check-bold" />`                                                 |
| `selected ? "bg-sky-5/15" : "hover:bg-bg-subtle/60"` rải trong JSX                 | Bảng trạng thái (`DOCK_SETTINGS_SELECTED_CLASSES`) + `cn(…, selected && …)`        |
| Tạo `DockV2.tsx` cho variant mới                                                   | Thêm khoá vào bảng / union                                                         |
| Truyền `className` raw 3-4 layer xuyên props                                       | Bảng slot + `className` override ở root                                            |
| `tv({ slots: … })`                                                                 | Bảng `XXX_SLOT_CLASSES` + `cn()`                                                   |
| Widget A import store / file của widget B (`@/shared/widgets/dock/…` trong header) | `src/app/_shell` đọc cả hai, truyền qua prop (vd `extraMenuOptions`)               |
| `import … from '@/shared/widgets'` (barrel gốc)                                    | `@/shared/widgets/<widget>` — không có barrel gốc                                  |

---

## 9. Khuôn folder + barrel của widget

```
shared/widgets/<widget>/          kebab-case, ≤ 8 mục (folder-structure.md)
  <Widget>.tsx                    component CÔNG KHAI — PascalCase, khối tài liệu + @example
  <widget>.theme.ts               BẮT BUỘC — hằng + bảng *_CLASSES (satisfies Record<…>)
  <widget>.types.ts · .constants.ts · .store.ts · .utils.ts · useXxx.ts   khi có
  parts/                          phần NỘI BỘ (≥ 2 file), đặt kebab-case: `dock-item.tsx`
  <nhóm-con>/ + index.ts          khi một widget có nhiều cụm (header: `chrome/ modules/ page-header/ slots/ user-menu/`)
  index.ts                        chỉ `export … from` — CHỈ thứ code ngoài widget dùng
```

- **Không có barrel gốc `@/shared/widgets`**: import `@/shared/widgets/<widget>` — một layout chỉ cần Header
  thì không kéo Dock vào chunk.
- Barrel không xuất phần nội bộ (`parts/`, bảng class, store chỉ widget dùng) — test của widget import
  thẳng file / nhóm con khi cần kiểm hộp trắng.
- Component dùng chung xuất qua barrel PHẢI có khối tài liệu `@example` (`component-structure.md §4`).
- Danh sách widget hiện có + API công khai: catalog `reuse-first.md` §3.8 (nhóm "Widget").

### 9b. Next: `'use client'`, chữ hiển thị, `Link`

- **Widget là client**: có Radix, handler, hook, store cục bộ → file `.tsx` / `useXxx.ts` / `*.store.ts` gọi hook đều có `'use client'` ở dòng đầu
  (`server-client-boundary.md`). `*.theme.ts`, `*.types.ts`, `*.constants.ts`, `*.utils.ts` KHÔNG có (không hook) — để layout server đọc được bảng class
  khi cần. Phần con thuần trình bày không hook thì không directive.
- **Chữ hiển thị** (tooltip, `aria-label`, nhãn nút, câu rỗng) lấy bằng `useTranslations('ui.widgets')` — `messages/{vi,en}/ui.widgets.json`; không default
  tiếng Việt cứng trong prop. Widget nhận chữ DỮ LIỆU (tên mục menu, tiêu đề phân hệ) qua props đã dịch — `src/app/_shell` dịch bằng `useAppMenu()`
  rồi truyền xuống, widget không biết `shell.json`.
- **Điều hướng**: mục có URL đích là `<Link href>` của `@/core/i18n` (widget thuộc `shared` nên được import `core`); không `next/link`, không prop `to`.
  Widget KHÔNG biết route, cấu hình điều hướng hay phiên — nhận `href` và dữ liệu qua props, `src/app/_shell` nối (`routing-conventions.md §1`).
- **Dữ liệu từ `src/app/_shell/`**: `AppHeader` / `AppDock` / `AppCommandPalette` / `AppTabBar` / `AppPhoneTopBar` đọc `useAppMenu()` (menu đã dịch + lọc quyền),
  `useSessionStore`, `useThemeStore` rồi truyền vào `Header` / `Dock` / `CommandPalette` / `TabBar` — `AppShellLayout` gắn mỗi thứ MỘT lần.

---

## 10. Store cục bộ của widget

Widget là UI THUẦN: dữ liệu nghiệp vụ, phiên, theme, quyền… vào qua props, tầng `src/app/_shell/` nối
store của domain với widget (`state-management.md`). Ngoại lệ DUY NHẤT là **store cục bộ của widget**:

| Được làm store cục bộ                                                                                                  | Ví dụ                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Trạng thái GIAO DIỆN của chính widget mà người dùng chọn và phải nhớ (truyền qua prop thì mỗi nơi gọi ghi đè lựa chọn) | `header/chrome/header-appearance.store.ts` (kiểu header) · `dock/dock-settings.store.ts` (chế độ, cạnh neo, phóng)                                           |
| Cầu nối HAI cây component không có cha chung                                                                           | `command-palette/command-palette.store.ts` (nút mở trên header ↔ hộp thoại ở gốc layout) · `progress-center/*/…store.ts` (màn bất kỳ đẩy việc ↔ thẻ neo góc) |

- File `{x}.store.ts`, hook `use{X}Store`, interface state `{X}State`; `persist` thì khoá + `version` là
  MỘT hằng `{X}_STORAGE`, `storage: createSafeJSONStorage()`, `sanitize…` chạy ở cả `merge` lẫn `migrate`, `skipHydration: true` + `registerPersistedStore(use{X}Store)`
  để `StoreHydration` (`src/app/_providers`) nạp lại MỘT lần sau hydrate — nạp lúc tạo store làm lần render đầu khác HTML server.
- ⛔ KHÔNG đọc store của widget KHÁC, KHÔNG đọc store domain (`@/domains/*`) — nối chéo là việc của
  `src/app/_shell/` (vd mục "Ẩn / Hiện thanh Dock" do `AppHeader` gắn qua `extraMenuOptions` của `Header`).
  `tests/policy/structure/widgets.test.ts` chặn import chéo giữa các widget.
- Ngoài widget chỉ tầng `app/` (và test) được dùng store cục bộ; feature dùng hook công khai của widget
  (`useUploadQueue`, `useServerTasks`), không gọi `getState()` trần.

---

## 11. Tham chiếu

- Token & visual rules: `color-system.md` · `font-system.md` · `icon-conventions.md` · `tailwind-conventions.md`
- Khuôn file / bảng class / comment: `component-structure.md` · `comment-policy.md`
- Reuse policy chung: `reuse-first.md`
- UI kit scale + decision tree: `ui-kit-architecture.md`
- Performance / memoization: `code-optimization.md`
