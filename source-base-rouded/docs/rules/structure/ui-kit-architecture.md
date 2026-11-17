# UI kit Architecture — nhóm, public API, cây quyết định đặt file

> **UI kit** = `src/shared/ui/` — design system của base project.
> Đây là **single source of truth** cho mọi component UI. Mục tiêu của rule này: **scale nhanh** + **đáp ứng thay đổi cực kỳ nhanh** mà KHÔNG vỡ UI kit.

---

## 0. Nguyên tắc tối cao — quy tắc 3R

```
   1. REUSE   →  Đã có component? DÙNG LẠI.
   2. EXTEND  →  Gần giống nhưng thiếu prop/variant? MỞ RỘNG cái có sẵn (thêm khoá vào bảng `*_CLASSES`).
   3. CREATE  →  Chỉ tạo mới khi không trùng concept với BẤT KỲ component nào trong UI kit.
```

**KHÔNG BAO GIỜ** tạo component "gần giống" `Button`/`Modal`/`Input`/`Table`/`Dropdown`/`Badge`… đã có. Mở rộng bằng variant axis mới — KHÔNG copy-clone.

> ✅ **Trước khi viết bất kỳ file `.tsx` mới nào trong `src/shared/ui/`** → đọc bảng **§2 Inventory** + **§3 Decision Tree**.

---

## 1. Public API (BẤT BIẾN)

```ts
// ✅ ĐÚNG — luôn import từ barrel
import { Button, Modal, type ButtonVariant } from "@/shared/ui";

// ❌ SAI — import sâu, vỡ refactor nội bộ
import Button from "@/shared/ui/actions/Button";
import { ModalSize } from "@/shared/ui/overlays/Modal";
```

**Quy tắc:**
- Mọi component / type / hook publish ra ngoài UI kit → export qua `src/shared/ui/index.ts`
- Type phải export cùng component (`{Name}Props` + MỌI kiểu trục của prop: `{Name}Variant`, `{Name}Size`…)
- Internal helper (calendar-panel, picker-trigger, phần con trong `parts/`…) → **KHÔNG** re-export ở root barrel
- Không xuất thứ không ai ngoài UI kit dùng (hàm tiện ích nội bộ, bảng class) — trừ API dọn sẵn có trong
  catalog `reuse-first.md §3`

**Ba ngoại lệ import sâu — CHỈ ba đường này:**

```ts
import { SystemIcon } from '@/shared/ui/icons/Icons';          // registry icon tự sinh
import { AnnotationLayer } from '@/shared/ui/media/image-annotator';  // canvas nặng, nạp lười
import { MODAL_SLOT_CLASSES } from '@/shared/ui/overlays/modal.theme';  // bề mặt lớp nổi cho widget tự dựng overlay
```

Đường thứ ba (`overlays/modal.theme` · `overlays/popup-surface.theme`) chỉ dành cho widget tự dựng một
lớp nổi riêng (CommandPalette) mà phải trông y hệt Modal / Menu: nó nhận BẢNG CLASS, không phải component,
nên không đưa lên barrel. Trang demo thư viện icon đọc registry `@/shared/ui/icons` (`systemIcons`) — đó là
phần của ngoại lệ icon, không mở thêm đường.

`SystemIcon` cố ý KHÔNG nằm ở root barrel: `icons/index.ts` là file tự sinh,
đưa nó vào barrel chung buộc mọi trang phải nạp cả registry 377 icon.

⚠️ Luật này áp cho GIÁ TRỊ, không áp cho KIỂU. `SystemIconName` bị xoá sạch lúc
biên dịch nên không tốn byte nào — nó **có** ở root barrel:

```ts
import { type SystemIconName } from '@/shared/ui';           // ✅ kiểu, miễn phí
import { SystemIcon } from '@/shared/ui/icons/Icons';        // ✅ giá trị, import sâu
```

---

## 2. Inventory & Taxonomy (luôn cập nhật)

UI kit chia theo **CHỨC NĂNG**, không theo "atomic/composite". Lý do: khi cần một
component, người ta nhớ *nó làm gì* ("tôi cần chọn ngày"), chứ không nhớ nó
thuộc bậc trừu tượng nào. 48 file phẳng ở gốc là thứ không ai tra nổi.

| Nhóm | Thư mục | Chứa gì | Ví dụ |
|------|---------|---------|-------|
| **Nguyên tố** | `primitives/` | Hiển thị thuần, không state, không hành vi | Text · Heading · Badge · Avatar · Divider |
| **Phản hồi** | `feedback/` | Trạng thái tải / rỗng / cảnh báo / tiến độ | Spinner · Skeleton · Callout · Progress · ProgressCircle · LiquidGauge · EmptyState · TableEmptyIllustration |
| **Hành động** | `actions/` | Control kích hoạt một việc | Button · Menu · ContextMenu · `segment-toggle/` · ThemeToggle |
| **Ô nhập** | `inputs/` | Nhập liệu cơ bản | Input · Textarea · `number-input/` · Checkbox · Radio · Toggle · ColorPalettePanel · field.theme (`FieldSize` · `FIELD_HEIGHT` — thang cỡ chung của mọi ô một dòng) |
| **Chọn danh sách** | `selects/` | Chọn từ tập giá trị | `dropdown/` · `multi-select/` · `dropdown-tree-select/` |
| **Chọn thời gian** | `pickers/` | Ngày / khoảng ngày / giờ / tháng | `date/` (DatePicker · SingleDatePicker · `range-date-picker/` · `date-time-picker/`) · `month/` (MonthYearStartPicker · MonthYearRangePicker · MonthRangeFilter) · `time/` (TimePicker) · picker-trigger · month-labels.constants |
| **Lớp nổi** | `overlays/` | Nổi lên trên nội dung | Popover · Tooltip · `dialog/` (Modal · `confirm-dialog/` · FormModal · CustomModalLayout · ModalCloseButton · useOpenAutoFocus) · `drawer/` · `toast/` (Toast · ToastContainer · showToast) · modal.theme · popup-surface.theme |
| **Điều hướng** | `navigation/` | Đi giữa các phần | `tabs/` (Tabs · TabsPanel) · Stepper · Pagination · `scroll-edge-nav/` (ScrollEdgeNav · measureColumnStops) |
| **Trình bày dữ liệu** | `data-display/` | Bảng, cây, số liệu | `table/` (Table · TableDragHandle · useTableSort) · `tree/` · `bars/` (StackBar · CellBar) · `boards/` (ScrollBoard · RankingBoard · CapsuleChart · NoticeBoard · StatusBoard) · TrendBadge · AnimatedNumber |
| **Mặt nền** | `surfaces/` | Khung chứa nội dung | `panels/` (Surface · BoxPanel · BoxInfo · `panel-card/`) · `hud/` (`hud-frame/` · HudCorners · HudInfoBox · HudCallout) · `cards/` (SummaryCard · SummaryPill · CompactKpiCard · CardScreenshot · `hud-kpi-card/`) · `inset-group/` (InsetGroup · InsetGroupRow — hộp nhóm macOS) · `splitter/` |
| **Ảnh & tệp** | `media/` | Ảnh, xem ảnh, tải tệp | `image/` (Image · ImagePreview · `lightbox/` — ImageLightbox · LightboxToolButton) · `image-annotator/` · `upload/` (Upload · Dropzone · `file-list/` — FileList · FileCard · FileBadge · useUpload) |
| **Bố cục** | `layout/` | Khung màn hình / vùng | PageShell · PageBody · Toolbar · BoxGrid · SectionHeader · TitleScreen · DetailPanelHeader |
| **Hệ form** | `form/` | RHF + Zod | Form · FormItem · field-read-only (phần con nội bộ) · `fields/` (`text/` · `choice/` · `picker/` · `password-strength/` · FileField · DictionaryField · `hooks/` — useFormField · useFieldA11y · useFormMeta) · `layout/` (FormActions · FormGrid · FormRow · FormSection · FormTabs · `arrays/`) · `patterns/` · `hooks/` (useZodForm · useServerErrors · useAsyncValidation · useFormDraft · useDirtyGuard · useModalDateDefaults) |
| **Icon** | `icons/` | Registry tự sinh + bộ icon VCI | SystemIcon (icon chrome) · `vci-icon/` (VciIcon — bộ nhận diện VCI, dữ liệu sinh từ `src/assets/vci-icons/`) · `app-icon/` (AppIcon · `AppIconName` — vẽ theo tên bộ nào cũng được) · `gem-icon/` · `app-tile/` (ô icon phân hệ) — ⛔ KHÔNG sửa tay `index.ts` / `vci-icons.generated.ts` |

---

## 3. Decision Tree — đặt file ở đâu?

```
Component mới của bạn …
│
├── là field react-hook-form?                → form/fields/
├── là layout-orchestrator của form?         → form/layout/
├── là pattern form đặc biệt (conditional, stepper)? → form/patterns/
├── nổi LÊN TRÊN nội dung (dialog, popover, toast)? → overlays/
├── để NHẬP một giá trị tự do?               → inputs/
├── để CHỌN từ danh sách có sẵn?             → selects/
├── để chọn NGÀY hoặc GIỜ?                   → pickers/
├── là BẢNG hoặc CÂY dữ liệu?                → data-display/
├── đưa người dùng đi chỗ khác (tab, bước, trang)? → navigation/
├── là KHUNG CHỨA nội dung khác (panel, card, HUD)? → surfaces/
├── báo TRẠNG THÁI (đang tải, rỗng, lỗi, %)? → feedback/
├── là ẢNH hoặc TỆP?                          → media/
├── là khung BỐ CỤC màn hình / vùng?          → layout/
├── KÍCH HOẠT một hành động khi bấm?          → actions/
├── là icon SVG?                              → icons/  (KHÔNG sửa index.ts)
├── là ảnh hệ thống (logo, minh hoạ)?         → assets/image/ + dùng <Image name="..." />
└── chỉ HIỂN THỊ, không state, không hành vi? → primitives/
```

**KHÔNG tạo nhóm mới** trừ khi: ≥ 3 component cùng họ + sẽ có ≥ 5 trong 3 tháng
tới. Nhóm mới phải có barrel `index.ts` ngay từ ngày đầu, và phải thêm một dòng
vào bảng §2 + một nhánh vào cây quyết định §3 — bảng nói dối còn tệ hơn không có bảng.

---

## 4. File & Symbol Naming

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Component file | `PascalCase.tsx` | `Button.tsx`, `SummaryCard.tsx` |
| Internal helper / phần con (không export ra `@/shared/ui`) | `kebab-case.tsx` — nằm trong `parts/` hoặc ở cấp nhóm | `calendar-panel.tsx`, `picker-trigger.tsx`, `parts/table-body-row.tsx` |
| Types file (kiểu trục công khai, kiểu dùng chung) | `kebab-case.types.ts` | `table.types.ts`, `drawer.types.ts` |
| Bảng class dùng chung / dài | `kebab-case.theme.ts` — chỉ hằng / bảng class, không khai kiểu trục công khai | `field.theme.ts`, `modal.theme.ts` |
| Hàm thuần | `kebab-case.utils.ts` (mọi file trong `utils/`) | `upload.utils.ts`, `hit-test.utils.ts` |
| Hằng dữ liệu | `kebab-case.constants.ts` | `month-labels.constants.ts` |
| Context | `kebab-case.context.ts` (chỉ context + provider) | `table-row-drag.context.ts`, `form.context.ts` |
| Hook file | `useXxx.ts` (camelCase) | `useZodForm.ts`, `useFormField.ts` |
| Folder của component có ≥ 2 file | `kebab-case/` + `index.ts` | `table/`, `dropdown-tree-select/` |
| Barrel | `index.ts` | — |
| Default export | Component của file | `export default Button` |
| Named exports | Kiểu (trục, props); phần con nội bộ trong `parts/` | `export type ButtonVariant` · `export function TableFooter` |

Bảng này là bản áp cho UI kit của quy ước chung `folder-structure.md §4`. Component một file đứng phẳng trong nhóm;
từ hai file trở lên có folder riêng — xem `component-structure.md §6`.

---

## 5. Token Contract — KHÔNG NEGOTIABLE

Mọi component UI kit BẮT BUỘC:

| Aspect | Source of truth | Tham chiếu |
|--------|----------------|------------|
| Colors | `colors.generated.ts` → Tailwind classes | `color-system.md` |
| Typography | `font.json` → `text-{scale}-{weight}` | `font-system.md` |
| Icons | `<SystemIcon name="...-bold" />` (chrome) · `<VciIcon>` / `<AppIcon>` (nhận diện nghiệp vụ) | `icon-conventions.md` · `vci-icon-system.md` |
| className merge | `cn()` từ `@/shared/utils/style/cn` | `tailwind-conventions.md` |

**KHÔNG có ngoại lệ.** Vi phạm = revert.

```tsx
// ❌ Hex màu / raw font / inline SVG / clsx trực tiếp
<div className="text-sm font-medium leading-5 text-[#94A3B8]">…</div>

// ✅ Token + cn + SystemIcon
import { cn } from "@/shared/utils/style/cn";
import { SystemIcon } from "@/shared/ui/icons/Icons";

<div className={cn("text-body-14-medium text-fg-muted", className)}>
  <SystemIcon name="house-bold" size={16} className="text-primary-5" />
</div>
```

---

## 5b. Ba NGUỒN DÙNG CHUNG — đừng chép lại bề mặt

Component trong UI kit KHÔNG tự dựng lại ba thứ dưới đây. Trước khi viết chuỗi
Tailwind cho khung ô nhập, cho một lớp nổi kiểu menu, hay cho lớp phủ toàn màn,
hãy nhập từ đúng file:

| Cần gì | Nhập từ | Cấp cái gì |
| --- | --- | --- |
| Khung / nền / hover / focus của ô nhập | `inputs/field.theme` | `fieldSurface()` · `FIELD_HEIGHT` · `FIELD_VARIANT_CLASSES` · `FIELD_BORDER_CLASSES` · `FIELD_CONTROL_CLASS` · `FIELD_ICON_CLASS` · `FIELD_CHEVRON_CLASS` · `FIELD_CLEAR_BUTTON_CLASS` · `FIELD_CHIP_CLEAR_CLASS` · `FIELD_CLEAR_ICON` · `FIELD_POPUP_*` (gồm `FIELD_POPUP_SEARCH_*` · `FIELD_POPUP_EMPTY_CLASS`) |
| Bề mặt menu / popover (kính + viền + quầng teal chỉ ở dark) | `overlays/popup-surface.theme` | `popupSurface()` · `POPUP_ITEM_CLASS` · `POPUP_ITEM_ICON_CLASS` |
| Lớp phủ mờ toàn màn | `overlays/modal.theme` | `MODAL_OVERLAY_BASE` (không animation) · `MODAL_OVERLAY_CLASS` |

**Vì sao ghi thành luật.** Cả ba đều đã từng bị chép tay rồi trôi khỏi chuẩn, và
chú thích trong code còn tự thú điều đó — `ContextMenu` ghi "SYNC với Menu.tsx",
còn `modal.theme` và `drawer.theme` thì nhắc lẫn nhau. Đồng bộ bằng lời hứa
không phải là cơ chế. Hậu quả đo được: trong CÙNG một form, `TextField` tụt vào
focus có viền xanh + quầng ring, còn `MaskedField` ngay cạnh chỉ đổi màu viền —
và ba sắc đỏ khác nhau cho cùng một trạng thái lỗi.

**Hai vai trò của nút xoá.** `FIELD_CLEAR_ICON.chip` (8px) cho dấu ✕ nằm trong
một `<Badge>`; `FIELD_CLEAR_ICON.all` (10px) cho dấu ✕ xoá tất cả, bằng đúng cỡ
mũi tên xổ đứng cạnh. Trước khi gom, năm chỗ dùng năm con số — nặng nhất là
`Dropdown` vẽ nút xoá cỡ 6 ngay cạnh mũi tên cỡ 10.

**Màu trong shadow phải qua token.** `shadow-[…rgba(45,212,191,0.15)…]` chính là
`teal-5` chép tay — đổi palette là nó ở lại màu cũ. Viết
`color-mix(in_srgb,var(--color-teal-5)_15%,transparent)`, đúng như `modal.theme`
đã quy định.

**Rào chắn tự động.** `tests/policy/structure/ui-kit-props-types.test.ts` bắt buộc mọi
component đi qua barrel phải xuất kèm kiểu `XxxProps`;
bộ render `tests/shared/ui/render/*.test.tsx` (đọc barrel) giữ cho MỌI export — kể cả API dọn sẵn chưa có nơi
dùng — vẫn render được (`docs/rules/foundations/testing.md §5`).

---

## 6. Variant System — bảng `*_CLASSES` + `cn()`

Component có biến thể (size, skin, variant, color…) → mỗi trục một **bảng class** đặt
ngay trong file component, đóng kiểu bằng `satisfies Record<…>`:

```ts
export type ButtonSize = "xl" | "md";
export type ButtonSkin = "base" | "danger";
export type ButtonVariant = "primary" | "ghost";

const BUTTON_SIZE_CLASSES = { xl: "h-11 px-5", md: "h-9 px-3.5" } satisfies Record<ButtonSize, string>;

const BUTTON_SKIN_CLASSES = {
  base:   { primary: "bg-primary-6 text-neutral-0", ghost: "text-action-base" },
  danger: { primary: "bg-error-6 text-neutral-0",   ghost: "text-error" },
} satisfies Record<ButtonSkin, Record<ButtonVariant, string>>;

const buttonClassName = cn(BUTTON_BASE_CLASSES, BUTTON_SIZE_CLASSES[size], BUTTON_SKIN_CLASSES[skin][variant], className);
```

**Vì sao:** thêm variant mới = thêm 1 khoá vào union + 1 ô vào bảng; thiếu ô là `tsc`
đỏ. Dev đổi màu chỉ cần tìm đúng `[skin][variant]`. KHÔNG dùng `tv()` /
`compoundVariants` ở bất cứ đâu trong repo (lý do: `component-structure.md §2`).

Khi mở rộng: **thêm khoá vào union + bảng**, KHÔNG fork component. Đầy đủ quy tắc
(thứ tự file, đặt tên, khối tài liệu component): `component-structure.md`.

---

## 7. Props Pattern — chuẩn UI kit

```tsx
export interface ComponentNameProps {
  title?: string;
  variant?: ComponentNameVariant;
  size?: ComponentNameSize;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}
```

Thứ tự prop: nội dung → trục biến thể (mọi variant có `export type` riêng) → slot
(`React.ReactNode`) → hành vi (`onXxx`) → `className`. Không dùng comment ngăn cách.

**Rules:**
- Mọi prop optional có `defaultValue` rõ ràng — KHÔNG để rơi vào `undefined`
- Slot luôn `React.ReactNode` (không `string` riêng) — caller tự render component con
- `className` luôn được merge cuối qua `cn()` để cho phép override
- Icon prop = `BoldSystemIconName` (khai ở `icons/Icons.tsx`, xuất kiểu ở `@/shared/ui`) — KHÔNG `string`; icon NHẬN DIỆN
  đi qua `AppTile` / ô màu (phân hệ, dòng `InsetGroupRow`) = `AppIconName` (tên VCI hoặc tên hệ thống — `vci-icon-system.md` §5)

---

## 8. Barrel File — BẮT BUỘC cho mọi sub-folder

Mỗi nhóm (`primitives/`, `feedback/`, `actions/`, `inputs/`, `selects/`, `pickers/`, `overlays/`, `navigation/`, `data-display/`, `surfaces/`, `media/`, `layout/`, `form/`, …) PHẢI có `index.ts` re-export public API. Lý do: refactor đổi tên file → KHÔNG vỡ caller.

```ts
// src/shared/ui/surfaces/panels/index.ts
export * from "./panel-card";
export { default as BoxInfo } from "./BoxInfo";
export type { BoxInfoProps, BoxInfoItem, BoxInfoItemColor } from "./BoxInfo";
export { default as BoxPanel } from "./BoxPanel";
export type { BoxPanelProps, BoxPanelVariant, BoxPanelBorder, BoxPanelBodyOverflow } from "./BoxPanel";
```

Component có folder riêng (`component-structure.md §6`) thì barrel nhóm viết
`export * from "./table";` — danh sách tên công khai nằm ở `table/index.ts`, lấy THẲNG từ file nguồn
(`./Table`, `./table.types`); file component KHÔNG re-export kiểu / phần con của mình.

Root barrel (`src/shared/ui/index.ts`) chỉ gồm `export * from './<nhóm>'` (kể cả `./form`) — KHÔNG
liệt kê tay, KHÔNG import từ file lá (ngoại lệ: kiểu `SystemIconName` / `BoldSystemIconName` /
`SystemIconProps` vì `icons/index.ts` là file tự sinh).

---

## 9. Adding a New Component — Checklist BẮT BUỘC

Trước khi merge PR thêm component mới vào UI kit:

- [ ] Đã grep `src/shared/ui/` → KHÔNG trùng concept với component có sẵn
- [ ] Đặt file đúng layer theo **§3 Decision Tree**
- [ ] PascalCase cho file `.tsx` component
- [ ] Đúng thứ tự file + khối tài liệu ngay trên component: `@param props.*` đủ từng prop, `@example` (`component-structure.md §1`, `§4`)
- [ ] Comment theo `comment-policy.md`
- [ ] Mọi color = Tailwind token (xem `color-system.md`)
- [ ] Mọi typography = `text-{scale}-{weight}` (xem `font-system.md`)
- [ ] Mọi icon = `<SystemIcon name="..." />` — mặc định `-outline`, `-bold` cho gem/KPI/overlay (xem `icon-conventions.md`); icon
      nhận diện nghiệp vụ = `<VciIcon>` / `<AppIcon>` (xem `vci-icon-system.md`) — KHÔNG inline `<svg>`
- [ ] Mỗi trục biến thể → union type + bảng `*_CLASSES` `satisfies Record<…>` (xem **§6**), KHÔNG `tv()`
- [ ] Props theo pattern **§7** (slots = ReactNode, có `className`, default rõ ràng)
- [ ] Export qua barrel con + root `src/shared/ui/index.ts`
- [ ] Bộ render của UI kit (`testing.md §4`, `render-suite`) đọc barrel và báo component chưa có ca render — thêm một ca tối thiểu; barrel trỏ sai đường là lỗi im lặng mà `tsc` không thấy
- [ ] Update bảng **§2 Inventory** trong rule này
- [ ] `npm run check` xanh (`quality-gates.md`)

**Khoảng cách giữa "có yêu cầu mới" và "component sẵn sàng" phải ≤ 1 giờ** với checklist này.

---

## 10. Extending Existing Component — checklist mini

Khi thêm variant / size / slot vào component có sẵn:

- [ ] Thêm khoá vào union type (`export type XxxVariant = "a" | "b"`) rồi vào bảng `*_CLASSES` — `tsc` báo ô còn thiếu
- [ ] Cập nhật dòng `@param props.<trục>` trong khối tài liệu component (giá trị mới + mặc định)
- [ ] Cập nhật bảng props của component trong `reuse-first.md` §3
- [ ] KHÔNG fork component thành `XxxV2.tsx`

---

## 11. Anti-patterns — DANH SÁCH ĐEN

| ❌ Sai | ✅ Đúng |
|-------|--------|
| Tạo `PrimaryButton.tsx`, `IconButton.tsx`, `LinkButton.tsx` | Mở rộng `Button` qua `variant` axis |
| `BlueBadge`, `SuccessBadge`, `WarningBadge` | `<Badge color="success" variant="tinted" />` |
| Import deep: `@/shared/ui/surfaces/cards/SummaryCard` | `import { SummaryCard } from "@/shared/ui"` |
| Sửa file auto-gen (`icons/index.ts`) | Sửa SVG nguồn rồi sinh lại — ⛔ hiện KHÔNG chạy `generate:icons` (generator lệch registry đã commit, xem `docs/known-issues.md`) |
| Hex màu trong `style={{}}` | CSS var `var(--color-azure-5)` hoặc Tailwind token |
| `text-sm font-medium leading-5` | `text-body-14-medium` |
| Copy-paste component để fork variant | Thêm khoá vào union + bảng `*_CLASSES` |
| `tv()` / `compoundVariants` (bất kỳ đâu) | Bảng `*_CLASSES` + `cn()` (`component-structure.md §2`) |
| `<svg><path d="..." /></svg>` inline | `<SystemIcon name="..." />` |
| `clsx(...)` / `twMerge(...)` trực tiếp | `cn(...)` |
| Tạo `useToggle`, `useModal` riêng | Dùng `useDisclosure` từ `@/shared/hooks` |
| `any` type | `unknown` hoặc generic |
| Hardcode size px ngoài bảng | Thêm khoá vào `XXX_SIZE_CLASSES` |

---

## 12. Khi cần thay đổi visual toàn hệ thống

**Tình huống:** Designer thay primary color, type scale, hoặc border radius.

| Phạm vi đổi | File cần sửa | Lệnh chạy lại |
|-------------|-------------|--------------|
| Màu sắc (1 token hoặc cả palette) | `src/styles/theme/colors-theme.json` | `npm run generate:colors` |
| Typography scale | `src/styles/font/font.json` | `npm run generate:font` |
| Icon SVG | `src/assets/icons/*.svg` | `npm run generate:icons` — ⛔ KHÔNG chạy: generator lệch registry đã commit, xem `docs/known-issues.md` |
| Icon VCI (bộ nhận diện) | `src/assets/vci-icons/*.svg` | `npm run generate:vci-icons` (`vci-icon-system.md` §6) |
| Component variant | Bảng `*_CLASSES` trong file component | — |
| Image asset | Thả file vào `src/assets/image/*` | `npm run generate:images` — ⛔ KHÔNG chạy (cùng lý do) |

**KHÔNG sửa class/hex/svg ở chỗ khác.** Sai chỗ → mất sync, sẽ debug lâu.

---

## 13. Cross-references

- Token & visual rules → `color-system.md` · `font-system.md` · `icon-conventions.md` · `vci-icon-system.md` · `tailwind-conventions.md`
- Thứ tự file, bảng class, luồng code, folder → `component-structure.md`
- Khi nào được viết comment → `comment-policy.md` (lý do dài: `notes/components/`)
- Reuse policy chung + catalog component → `reuse-first.md`
- Performance / memoization → `code-optimization.md`
- File naming chung cho project → `code-style.md`

---

## 14. Khi vi phạm

- PR có hex màu / raw font / inline SVG / copy-paste fork → **revert**
- Thêm component mới mà KHÔNG update bảng **§2** → **block merge**
- Thêm sub-folder mới mà KHÔNG có `index.ts` → **block merge**
- Import deep từ ngoài `@/shared/ui` (`@/shared/ui/surfaces/...`) → fail review
