# Reuse First — CHỈ UI kit (`src/shared/ui/`), KHÔNG raw HTML UI

> **UI kit (`src/shared/ui/`)** là **single source of truth DUY NHẤT** cho mọi
> component UI. Mọi rule về scale, taxonomy, decision tree, checklist "thêm
> component mới" → đọc **`ui-kit-architecture.md`**. Token / variant / recipe
> centralization khi sửa widget → đọc **`widget-composition.md`**.
>
> File này là **catalog tra cứu nhanh + bảng map HTML → UI kit** —
> dùng khi đang code để biết: "tôi cần làm X → component nào?".

---

## ⛔ Nguồn UI DUY NHẤT — `@/shared/ui`

```
✅ DUY NHẤT cho phép:
   import ... from "@/shared/ui"
   + ba đường import sâu có lý do (`ui-kit-architecture.md §1`):
   import { SystemIcon } from "@/shared/ui/icons/Icons"
   import { AnnotationLayer } from "@/shared/ui/media/image-annotator"
   import { MODAL_SLOT_CLASSES } from "@/shared/ui/overlays/modal.theme"   // chỉ widget tự dựng lớp nổi
```

Mọi nhu cầu UI (Button, Input, Modal, Form, Spinner, Card, …) **CHỈ** lấy từ
`@/shared/ui` (UI kit). KHÔNG dựng thư mục UI thứ hai, KHÔNG copy component ra
feature để "sửa riêng". Vi phạm → **block merge** trong code review.

Khi component cần dùng KHÔNG có trong UI kit:

1. Đọc catalog **§3 UI kit Catalog** bên dưới — đa số đã có sẵn.
2. Gần giống nhưng thiếu prop → **mở rộng** component UI kit theo
   `ui-kit-architecture.md §6` (thêm khoá vào bảng `*_CLASSES`).
3. Hoàn toàn không có → **tạo mới trong `src/shared/ui/`** theo checklist
   `ui-kit-architecture.md §9`.

---

## 0. Quy tắc tối cao — 3R

```
1. REUSE   →  Đã có component UI kit? DÙNG LẠI.
2. EXTEND  →  Gần giống nhưng thiếu prop/variant? MỞ RỘNG (thêm khoá vào bảng `*_CLASSES`).
3. CREATE  →  CHỈ tạo mới khi không trùng concept với BẤT KỲ component nào trong UI kit.
```

**Quy tắc cứng (Balanced enforcement):**

| HTML element                                         | Trạng thái     | Lý do                                                                                                    |
| ---------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| `<button>`, `<input>`, `<select>`, `<textarea>`      | ❌ **CẤM**     | Có UI kit component thay thế                                                                             |
| Inline `<svg>`, raw `<img>` cho icon/asset           | ❌ **CẤM**     | Dùng `<SystemIcon>` / `<Image>`                                                                          |
| `<span>` cho badge/chip/tag/dot                      | ❌ **CẤM**     | Dùng `<Badge>`                                                                                           |
| `<div>` cho card/panel/section header                | ❌ **CẤM**     | Dùng `<SummaryCard>` / `<BoxInfo>` / `<SectionHeader>`                                                   |
| `<a>` / `<button>` cho action menu trigger           | ⚠️ **HẠN CHẾ** | Ưu tiên `<Menu>` / `<Dropdown>` — chỉ dùng raw khi cần keyboard pattern custom                           |
| `<div>`, `<span>`, `<section>` làm flex/grid wrapper | ✅ **OK**      | Layout primitive — không có UI behavior                                                                  |
| `<form>` ngoài cùng                                  | ✅ **OK**      | Form root (nội dung bên trong dùng `<Form>` / fields)                                                    |
| `<table>`, `<thead>`, `<tr>` thủ công                | ❌ **CẤM**     | Dùng `<Table>` (UI kit)                                                                                  |
| `<ul>`, `<li>` cho navigation/menu list              | ⚠️ **HẠN CHẾ** | Ưu tiên `<Menu>` / `<Tabs>`. Cho phép `<ul>` cho danh sách nội dung thuần (vd: bullet trong description) |

Vi phạm bảng trên → **block merge** trong code review.

---

## 1. HTML → UI kit Decision Table (BẮT BUỘC tra trước khi viết JSX)

### Form controls

| Cần làm                               | Dùng                                                   | Import        |
| ------------------------------------- | ------------------------------------------------------ | ------------- |
| Text input                            | `<Input>`                                              | `@/shared/ui` |
| Password input                        | (trong Form) `<PasswordField>`                         | `@/shared/ui` |
| Multi-line text                       | `<Textarea>`                                           | `@/shared/ui` |
| Number input                          | (trong Form) `<NumberField>`                           | `@/shared/ui` |
| Single dropdown                       | `<Dropdown>`                                           | `@/shared/ui` |
| Multi-select                          | `<MultiSelect>`                                        | `@/shared/ui` |
| Checkbox                              | `<Checkbox>`                                           | `@/shared/ui` |
| Switch / toggle                       | `<Toggle>`                                             | `@/shared/ui` |
| Radio button group                    | `<RadioGroup>` + `<Radio>`                             | `@/shared/ui` |
| Date single                           | `<SingleDatePicker>` hoặc `<DatePicker mode="single">` | `@/shared/ui` |
| Date range                            | `<RangeDatePicker>` hoặc `<DatePicker mode="range">`   | `@/shared/ui` |
| Segmented control (2-4 lựa chọn ngắn) | `<SegmentToggle>`                                      | `@/shared/ui` |
| File upload                           | (trong Form) `<FileField>`                             | `@/shared/ui` |
| Async-loaded options                  | (trong Form) `<AsyncSelectField>`                      | `@/shared/ui` |
| Cascade select (parent → child)       | (trong Form) `<CascadeSelectField>`                    | `@/shared/ui` |

### Action / Navigation

| Cần làm                                                     | Dùng                                                                                                                                   | Import                             |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| CTA chính                                                   | `<Button variant="primary">`                                                                                                           | `@/shared/ui`                      |
| CTA phụ                                                     | `<Button variant="secondary">`                                                                                                         | `@/shared/ui`                      |
| Action thứ cấp viền                                         | `<Button variant="stroke">`                                                                                                            | `@/shared/ui`                      |
| Icon-only / link button                                     | `<Button variant="ghost">`                                                                                                             | `@/shared/ui`                      |
| Action menu (dropdown)                                      | `<Menu>`                                                                                                                               | `@/shared/ui`                      |
| Tab navigation                                              | `<Tabs>` + `<TabsPanel>` (tab hình thang kiểu hồ sơ → `variant="folder"`)                                                              | `@/shared/ui`                      |
| Step wizard                                                 | `<Stepper>`                                                                                                                            | `@/shared/ui`                      |
| Pagination footer                                           | `<Pagination>`                                                                                                                         | `@/shared/ui`                      |
| Tìm nhanh toàn cục (Ctrl/⌘+K, nhảy sang trang/phân hệ khác) | `<CommandPalette>` (mở qua `useCommandPaletteStore` hoặc `<CommandPaletteTrigger>`; widget — §3.8) — KHÔNG tự viết dialog tìm kiếm mới | `@/shared/widgets/command-palette` |

### Feedback / Overlay

| Cần làm                        | Dùng                                                                                                  | Import        |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------- |
| Hover hint                     | `<Tooltip>`                                                                                           | `@/shared/ui` |
| Click panel (filter, settings) | `<Popover variant="glass\|solid">`                                                                    | `@/shared/ui` |
| Modal dialog                   | `<Modal>`                                                                                             | `@/shared/ui` |
| Form trong dialog              | `<FormModal>`                                                                                         | `@/shared/ui` |
| Confirm / delete xác nhận      | `<ConfirmDialog variant="confirm\|delete\|success\|warning\|info">`                                   | `@/shared/ui` |
| Toast notification             | `showToast()` · `showErrorToast()` · `dismissToast()` · `updateToast()` — UI kit Radix Toast bên dưới | `@/shared/ui` |

### Display / Data

| Cần làm                                                                           | Dùng                                                                                                       | Import                                     |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Status badge / pill / tag                                                         | `<Badge color="..." variant="tinted\|solid\|outline\|disabled">` (trạng thái trong ô bảng → `shape="tag"`) | `@/shared/ui`                              |
| Status dot (chấm đỏ unread, online, ...)                                          | `<Badge dot color="..." />`                                                                                | `@/shared/ui`                              |
| Avatar người dùng                                                                 | `<Avatar size="..." name="..." src="..." />`                                                               | `@/shared/ui`                              |
| Thumbnail / preview ảnh content                                                   | `<ImagePreview>` (object-cover, có lightbox)                                                               | `@/shared/ui`                              |
| Fullscreen viewer (zoom/rotate)                                                   | `<ImageLightbox>`                                                                                          | `@/shared/ui`                              |
| Ảnh hệ thống (logo, illustration)                                                 | `<Image name="..." />` (registry-based)                                                                    | `@/shared/ui`                              |
| KPI / summary card                                                                | `<SummaryCard>` (gem icon + label + value)                                                                 | `@/shared/ui`                              |
| Status panel (title + progress bars)                                              | `<BoxInfo>`                                                                                                | `@/shared/ui`                              |
| Panel khung chuẩn (header + body scroll)                                          | `<BoxPanel>`                                                                                               | `@/shared/ui`                              |
| KPI dày đặc cho dashboard strip                                                   | `<CompactKpiCard>`                                                                                         | `@/shared/ui`                              |
| Thẻ KPI big-screen (số lớn + huy hiệu biến động + thanh tách phần)                | `<HudKpiCard>` · dải một dòng: `density="compact"`                                                         | `@/shared/ui`                              |
| Chip số liệu inline                                                               | `<SummaryPill>`                                                                                            | `@/shared/ui`                              |
| Chia đôi panel kéo thả được                                                       | `<Splitter>`                                                                                               | `@/shared/ui`                              |
| Khung viền HUD (màn hình lớn)                                                     | `<HudFrame>` / `<HudInfoBox>`                                                                              | `@/shared/ui`                              |
| Nhãn ghim lên ảnh / bản đồ / sơ đồ xưởng (tên + trạng thái + điểm neo)            | `<HudCallout title x y />`                                                                                 | `@/shared/ui`                              |
| Card của màn dashboard (khung HUD + header + trạng thái)                          | `<PanelCard>`                                                                                              | `@/shared/ui`                              |
| Tải tệp (drag-drop + preview)                                                     | `<Upload>` (kèm `useUpload`)                                                                               | `@/shared/ui`                              |
| Vẽ chú thích lên ảnh                                                              | `image-annotator`                                                                                          | `@/shared/ui/media/image-annotator`        |
| Trạng thái rỗng                                                                   | `<EmptyState>` · `<TableEmptyIllustration>`                                                                | `@/shared/ui`                              |
| Banner thông báo trong trang                                                      | `<Callout intent="info\|success\|warning\|error\|neutral">`                                                | `@/shared/ui`                              |
| Đang tải                                                                          | `<Spinner>` / `<Skeleton>`                                                                                 | `@/shared/ui`                              |
| Header panel chi tiết (master-detail)                                             | `<DetailPanelHeader>`                                                                                      | `@/shared/ui`                              |
| Table                                                                             | `<Table columns={...} data={...} pagination />`                                                            | `@/shared/ui`                              |
| Tree (hierarchical)                                                               | `<Tree>`                                                                                                   | `@/shared/ui`                              |
| Đếm số động (dashboard)                                                           | `<AnimatedNumber value={n} />`                                                                             | `@/shared/ui`                              |
| Biến động so kỳ trước ("▲ 14,2%")                                                 | `<TrendBadge current previous />`                                                                          | `@/shared/ui`                              |
| Thanh nhiều đoạn dạng khối 3D / dãy ô sáng                                        | `<StackBar segments />` / `<CellBar segments total />` (một đoạn + 5 tông ngữ nghĩa → `<Progress>`)        | `@/shared/ui`                              |
| Bảng xếp hạng                                                                     | `<RankingBoard data={...} />`                                                                              | `@/shared/ui`                              |
| Bảng tự cuộn (kiosk/màn lớn)                                                      | `<ScrollBoard data={...} columns={...} />`                                                                 | `@/shared/ui`                              |
| So sánh giá trị dạng thanh có trục                                                | `<CapsuleChart data={...} />`                                                                              | `@/shared/ui`                              |
| Danh sách "điểm cần chú ý" (icon mức · tiêu đề · mô tả · con số · mũi tên)        | `<NoticeBoard items={...} />`                                                                              | `@/shared/ui`                              |
| Trạng thái thiết bị / dây chuyền (chấm + câu trạng thái + thanh % )               | `<StatusBoard items={...} />`                                                                              | `@/shared/ui`                              |
| Gauge mức nước/tồn kho                                                            | `<LiquidGauge value={n} />`                                                                                | `@/shared/ui`                              |
| Card ảnh chụp màn hình/thumbnail                                                  | `<CardScreenshot src={...} />`                                                                             | `@/shared/ui`                              |
| Khung viền + nền thuần (thay `border border-border-default bg-bg-surface` gõ tay) | `<Surface>`                                                                                                | `@/shared/ui`                              |
| Page header NỘI DUNG, trang KHÔNG có `PageHeader` (icon + title + back + actions) | `<TitleScreen>`                                                                                            | `@/shared/ui`                              |
| Section/panel header bar                                                          | `<SectionHeader>`                                                                                          | `@/shared/ui`                              |
| Thanh tiến độ ngang (% hoàn thành)                                                | `<Progress value={n} showValue />`                                                                         | `@/shared/ui`                              |
| Vòng tròn tiến độ (% ở tâm)                                                       | `<ProgressCircle value={n} showValue />`                                                                   | `@/shared/ui`                              |
| Màu theo mức % hoàn thành MỘT việc (dùng chung cho cả 2)                          | `taskProgressVariant(percent)` · `taskProgressTextClass(percent)` (KHÁC `kpiHealthToken` của chart)        | `@/shared/utils/style/task-progress.utils` |
| Horizontal/vertical separator                                                     | `<Divider>`                                                                                                | `@/shared/ui`                              |
| Khung ngoài 1 trang nội dung                                                      | `<PageShell>`                                                                                              | `@/shared/ui`                              |
| Vùng cuộn còn lại của trang (đi cặp `PageShell`)                                  | `<PageBody>`                                                                                               | `@/shared/ui`                              |
| Toolbar lọc/hành động của trang                                                   | `<Toolbar>`                                                                                                | `@/shared/ui`                              |
| Lưới card tự responsive (khai `min` width)                                        | `<BoxGrid min={...}>`                                                                                      | `@/shared/ui`                              |

### Typography

| Cần làm                                        | Dùng                                                                   | KHÔNG dùng                                              |
| ---------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------- |
| Heading semantic h1..h6                        | `<Heading size="extraLarge\|large\|medium\|small\|tiny\|extraTiny" />` | `<h1 className="text-2xl font-bold">`                   |
| Inline text                                    | `<Text size="..." weight="..." skin="..." />`                          | `<span className="text-sm font-medium text-neutral-5">` |
| Raw font class (khi không dùng được component) | `text-{scale}-{weight}` (vd `text-body-14-medium`)                     | `text-sm font-medium leading-5`                         |

### Icons

| Cần làm                                   | Dùng                                                                                                          | KHÔNG dùng                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Render system icon                        | `<SystemIcon name="..." size={16} className="text-..." />` (mặc định `-outline`, `-bold` cho gem/KPI/overlay) | Inline `<svg><path/></svg>`, `import { CheckIcon }` |
| Gem-shaped icon container (dashboard KPI) | `<GemIcon color="..." size="..."><SystemIcon ... /></GemIcon>`                                                | Tự tạo div + gradient                               |

---

## 2. Cho phép raw HTML — Trường hợp nào?

### ✅ Layout wrappers thuần (không có UI behavior)

```tsx
// ✅ OK — flex/grid container, không có visual/behavior riêng
<div className="flex items-center gap-3">
  <Button>...</Button>
  <Badge color="success">Active</Badge>
</div>

<section className="grid grid-cols-2 gap-4">
  <SummaryCard ... />
  <SummaryCard ... />
</section>

<div className="relative">
  <Button startIcon={<SystemIcon name="bell-bold" size={16} />} />
  <Badge dot color="error" className="absolute -top-0.5 -right-0.5" />
</div>
```

### ✅ Form root element

```tsx
// ✅ OK — <form> ngoài cùng, nội dung dùng UI kit
<form onSubmit={handleSubmit(onSubmit)}>
  <Form ...>
    <TextField name="email" label="Email" />
    <FormActions>
      <Button type="submit" variant="primary">Lưu</Button>
    </FormActions>
  </Form>
</form>
```

### ⚠️ Custom trigger cho Menu/Popover (cần keyboard pattern)

Khi component `<Menu>` / `<Popover>` cần trigger phức tạp (avatar + text + caret combo) thì có thể dùng `<button>` raw — nhưng **bắt buộc**:

- `type="button"` rõ ràng
- `aria-label` đầy đủ
- Class merge qua `cn()` — KHÔNG chain Tailwind raw quá 4 token
- Nếu lặp lại ≥ 2 lần → extract thành local component memoized (xem `widget-composition.md §3`)

```tsx
// ⚠️ OK có điều kiện — trigger compound cho Menu
<Menu
  trigger={
    <button
      type="button"
      className={cn('flex items-center gap-2', 'hover:bg-bg-nav-hover')}
      aria-label="Menu người dùng"
    >
      <Avatar size="sm" name={name} src={src} />
      <Text size="small" weight="medium">
        {name}
      </Text>
      <SystemIcon name="angle-down-bold" size={12} className="text-fg-muted" />
    </button>
  }
  options={options}
/>
```

---

## 3. UI kit Catalog — `@/shared/ui` (single source of truth)

> **Bảng phân nhóm chuẩn** nằm ở `ui-kit-architecture.md` §2. Mục này là catalog tra
> nhanh theo NHU CẦU; khi hai bên lệch nhau, `ui-kit-architecture.md` là bản đúng.

### 3.1 `primitives/` · `feedback/` · `actions/` · `inputs/` — nguyên tố

| Component                                         | Props chính                                                                                                                                                                                                                                   | Mục đích                                                                                                                                                                |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                          | `variant: primary\|secondary\|stroke\|ghost` · `skin: base\|accent\|danger\|neutral` · `size: xl\|lg\|md\|sm\|xs` · `fullWidth` · `startIcon` · `endIcon` · `loading`                                                                         | Mọi action button                                                                                                                                                       |
| `Text`                                            | `size: extraLarge\|large\|medium\|small\|body\|tiny\|extraTiny` · `weight: normal\|medium\|bold` · `skin: standard\|muted\|primary\|success\|warning\|error\|disabled`                                                                        | Inline text                                                                                                                                                             |
| `Heading`                                         | `size: extraLarge\|large\|medium\|small\|tiny\|extraTiny\|micro\|nano` · `light: boolean` (default true)                                                                                                                                      | Semantic heading                                                                                                                                                        |
| `Badge`                                           | `color: primary\|secondary\|accent\|info\|indigo\|success\|warning\|error\|neutral` · `variant: tinted\|solid\|outline\|disabled` · `shape: pill\|tag` · `size` · `dot: boolean` · `onRemove`                                                 | Pill/tag/dot status                                                                                                                                                     |
| `Avatar`                                          | `size: 3xs\|2xs\|xs\|sm\|md\|lg\|xl\|xxl` · `shape: circle\|square` · `variant: auto\|brand` · `name` · `src` · `onClick` (thành nút, Tab / Enter / Space)                                                                                    | Avatar + initials fallback                                                                                                                                              |
| `Divider`                                         | `orientation: horizontal\|vertical` · `variant: solid\|dashed\|dotted`                                                                                                                                                                        | Separator                                                                                                                                                               |
| Công thức HUD `HUD_*` (`primitives/hud.theme.ts`) | `HUD_LIT_FILL` · `HUD_PANEL_FILL` · `HUD_HOVER_GLOW` · `HUD_FOCUS_GLOW` · `HUD_ACTIVE_FILL` · `HUD_SOLID_PRIMARY` · `HUD_BRACKETS_BEFORE/AFTER` · `HUD_TOP_RAIL_AFTER` · `HUD_ROW_HIGHLIGHT` · `HUD_TITLE_MARK` · `HUD_TEXT_GLOW` · `HUD_HOT` | Chuỗi class (CHỈ `dark:`) cho đổ sáng · quầng · ngoặc góc · mặt "đang bật" · dấu `//` — widget / feature tự dựng khối HUD thì ghép từ đây, KHÔNG chép `color-mix` riêng |
| `Input`                                           | `variant: glass\|outline\|filled\|ghost` · `size` · `invalid` · `clearable` · `startIcon` · `endIcon`                                                                                                                                         | Text input                                                                                                                                                              |
| `Textarea`                                        | `maxLength` · `showCount` · `minHeight`                                                                                                                                                                                                       | Multi-line text                                                                                                                                                         |
| `Checkbox`                                        | `checked` · `label` · `error`                                                                                                                                                                                                                 | Checkbox                                                                                                                                                                |
| `Toggle`                                          | `size: sm\|md\|lg` · `label` · `labelPosition: left\|right` · `checked`                                                                                                                                                                       | Switch                                                                                                                                                                  |
| `Radio` + `RadioGroup`                            | `label`                                                                                                                                                                                                                                       | Radio group                                                                                                                                                             |
| `Progress`                                        | `value` · `max` · `variant: primary\|success\|warning\|error\|neutral` · `size: xs\|sm\|md\|lg` · `showValue`                                                                                                                                 | Thanh tiến độ ngang                                                                                                                                                     |
| `ProgressCircle`                                  | cùng trục `variant` / `size` với `Progress` · `showValue` (ẩn ở `xs`) · `label`                                                                                                                                                               | Vòng tiến độ, % ở tâm                                                                                                                                                   |
| `LiquidGauge`                                     | `value` (0-100)                                                                                                                                                                                                                               | Đồng hồ đo mức kiểu "nước dâng" (SVG + CSS wave animation)                                                                                                              |
| `SegmentToggle`                                   | `options[]` (key,label?,icon?,badge?,disabled?) · `value`                                                                                                                                                                                     | Segmented control                                                                                                                                                       |
| `NumberInput`                                     | `value` · `min` · `max` · `step` · `onChange`                                                                                                                                                                                                 | Ô nhập số (có nút tăng/giảm)                                                                                                                                            |
| `ColorPalettePanel`                               | `value` · `preset[]` · `usedColors[]` · `onChange`                                                                                                                                                                                            | Bảng chọn màu preset                                                                                                                                                    |
| `ContextMenu`                                     | `options[]` · `onSelect` · `children`                                                                                                                                                                                                         | Menu chuột phải                                                                                                                                                         |
| `ThemeToggle`                                     | —                                                                                                                                                                                                                                             | Chuyển sáng / tối                                                                                                                                                       |
| `Spinner`                                         | `size: sm\|md\|lg` · `color: primary\|brand\|info\|success\|warning\|danger\|neutral\|inherit` · `label`                                                                                                                                      | Trạng thái đang tải                                                                                                                                                     |
| `Skeleton`                                        | `variant` · `width` · `height` · `rounded` · `className`                                                                                                                                                                                      | Khung xương chờ dữ liệu                                                                                                                                                 |
| `EmptyState`                                      | `icon` · `iconColor` · `title` · `description?` · `action?` · `size`                                                                                                                                                                          | Trạng thái rỗng                                                                                                                                                         |
| `TableEmptyIllustration`                          | —                                                                                                                                                                                                                                             | Minh hoạ rỗng riêng cho `<Table>`                                                                                                                                       |
| `Callout`                                         | `intent: info\|success\|warning\|error\|neutral` · `variant: tinted\|ghost` · `icon?` · `title?` · `closable?`                                                                                                                                | Banner thông báo trong trang                                                                                                                                            |

### 3.2 `selects/` · `pickers/` · `navigation/` · `data-display/` — hợp thành

| Component                                       | Props chính                                                                                                                                         | Mục đích                                                                                                                                                                   |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Dropdown`                                      | `variant: tick\|radio` · `options[]` · `value` · `searchable`                                                                                       | Single-select dropdown                                                                                                                                                     |
| `MultiSelect`                                   | `options[]` · `value[]` · `searchable`                                                                                                              | Multi-select                                                                                                                                                               |
| `Tabs` + `TabsPanel`                            | `options[]` · `value` · `variant: line\|folder` · `indicator` · `size`                                                                              | Tab navigation                                                                                                                                                             |
| `Table`                                         | `columns[]` · `data[]` · `pagination` · `currentPage` · `pageSize` · `total` · `onPageChange` · `sortKey` / `sortDir` / `onSortChange` · `sortable` | Data table (sắp xếp, đổi bề rộng cột, ghim cột, kéo-thả dòng)                                                                                                              |
| `TableDragHandle`                               | `className?`                                                                                                                                        | Tay cầm kéo dòng của `<Table sortable>` — đặt trong `cell` của một cột                                                                                                     |
| `useTableSort(rows, getValue)`                  | → `{ sortKey, sortDir, onSortChange, sorted, comparator }`                                                                                          | Sắp xếp phía client cho `<Table>` (chuỗi theo locale vi, ô rỗng xuống cuối)                                                                                                |
| `AnimatedNumber`                                | `value`                                                                                                                                             | Số đếm động (DOM text, animate rAF khi giá trị thay đổi) — dùng cho số KPI dashboard                                                                                       |
| `TrendBadge`                                    | `current` · `previous` · `versus?` (tooltip) · `positive: up\|down`                                                                                 | Huy hiệu biến động: mũi tên + %, màu theo chiều tốt / xấu                                                                                                                  |
| `StackBar`                                      | `segments[{ value, color, title?, label? }]` · `max?` · `height` · `emphasis` · `ticks`                                                             | Thanh chồng khối 3D; `color` là giá trị CSS (`var(--color-*)`)                                                                                                             |
| `CellBar`                                       | `segments[{ value, color, title? }]` · `total`                                                                                                      | Thanh "bể %" dãy ô sáng; phần dư của `total` là ô tắt                                                                                                                      |
| `CapsuleChart`                                  | `data[]`                                                                                                                                            | Thanh ngang có trục, so sánh nhiều giá trị (khác `Progress`: không giới hạn 100; khác `RankingBoard`: có trục)                                                             |
| `RankingBoard`                                  | `data[]`                                                                                                                                            | Bảng xếp hạng: số thứ tự + tên + thanh scale theo giá trị MAX trong tập dữ liệu (không phải theo 100)                                                                      |
| `ScrollBoard`                                   | `data[]` · `columns[]`                                                                                                                              | Bảng tự động cuộn — cho màn hình lớn/kiosk không cần chuột                                                                                                                 |
| `NoticeBoard`                                   | `items[{ id, title, description?, value?, tone?, href?, onSelect? }]` · `emptyText`                                                                 | Danh sách điểm cần chú ý của màn điều hành; hàng có `href` là `<Link>`                                                                                                     |
| `StatusBoard`                                   | `items[{ id, label, icon?, state, stateLabel?, value }]` · `tone: sky\|primary\|teal` · `valueFormat`                                               | Trạng thái thiết bị: chấm + câu trạng thái + thanh 0–100 + %                                                                                                               |
| `Pagination`                                    | `pageIndex` · `pageCount` · `pageSize` · `total` · `onPageChange` · `onPageSizeChange`                                                              | Pagination                                                                                                                                                                 |
| `Stepper`                                       | `steps[]` (key · label · description? · status?) · `activeStep` · `layout: horizontal-center\|horizontal-inline\|vertical` · `size: sm\|md`         | Step indicator                                                                                                                                                             |
| `Tree`                                          | `data[]` · `selectionMode: single\|multi` · `selectedIds` · `searchTerm` · `height` · `renderNode` · `renderTrailing`                               | Hierarchical tree                                                                                                                                                          |
| `DatePicker`                                    | `mode: single\|range` · `value` · `range` · `format` · `minDate` · `maxDate`                                                                        | Date picker wrapper                                                                                                                                                        |
| `SingleDatePicker`                              | `value` · `onChange` · `format` · `minDate` · `maxDate` · `disabled` · `error`                                                                      | Single date                                                                                                                                                                |
| `RangeDatePicker`                               | `range` · `onRangeChange` · `showQuickSelect` · `quickSelectOptions` · `format` · `minDate` · `maxDate`                                             | Date range (+ quick-select)                                                                                                                                                |
| `DropdownTreeSelect`                            | `data[]` · `value` · `searchable` · `selectionMode`                                                                                                 | Chọn từ cây phân cấp                                                                                                                                                       |
| `TimePicker` · `DateTimePicker`                 | `value` · `onChange` · `format` · `step`                                                                                                            | Chọn giờ / ngày-giờ                                                                                                                                                        |
| `MonthYearStartPicker` · `MonthYearRangePicker` | `value` · `onChange` · `span` (Start) · `error` · `triggerWidth` · `fullWidth`                                                                      | Chọn tháng-năm: cửa sổ N tháng từ một mốc / khoảng vắt nhiều năm                                                                                                           |
| `MonthRangeFilter`                              | `monthFrom` · `monthTo` · `year` · `years[]` · `onChange` · `triggerWidth` · `fullWidth`                                                            | Lọc khoảng tháng TRONG MỘT NĂM, năm đi theo danh sách `years`                                                                                                              |
| `ScrollEdgeNav`                                 | `targetRef` · `getStops?` · `className?`                                                                                                            | Hai nút mép trái/phải điều khiển một vùng cuộn ngang (`targetRef`), mỗi nhịp đúng một cột; mốc theo cột bảng: `getStops={() => measureColumnStops(scrollEl, frozenCount)}` |

### 3.3 `surfaces/` — mặt nền, panel, thẻ số liệu

| Component                 | Props chính                                                                                                                                                                                                                                                                                | Mục đích                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `BoxInfo`                 | `title` · `total?` (label,value) · `items[]` (label,value,percent,color) · `onClose?`                                                                                                                                                                                                      | Status panel với progress bars                                                                                |
| `BoxPanel`                | `title` · `description?` · `variant` · `headerRight?` · `headerDivider?` · `footer?` · `headerClassName` · `bodyClassName`                                                                                                                                                                 | Panel khung chuẩn (header + body có scroll nội bộ)                                                            |
| `SummaryCard`             | `color: blue\|green\|yellow\|red\|gray` · `size` · `gemSize: xs\|sm\|md` (mặc định suy từ `size`) · `icon: BoldSystemIconName` · `label` · `value` · `description?`                                                                                                                        | KPI card                                                                                                      |
| `CompactKpiCard`          | `color: blue\|green\|yellow\|red\|gray` · `size` · `emphasis` · `icon: BoldSystemIconName` · `label` · `value` · `unit?` · `trailing?` · `footer?` · `selected?`                                                                                                                           | KPI dày đặc cho dashboard strip                                                                               |
| `HudKpiCard`              | `color` · `icon: BoldSystemIconName` · `label` · `labelNote?` · `value: number\|null` · `loading` · `format` · `unit` · `caption` · `badge` · `bar[]` · `barTotal` · `barVariant: block\|cells` · `legend[]` · `onDetail` · `density: default\|compact`                                    | Thẻ KPI khung HUD: nhãn → số lớn → dòng phụ, chân thẻ có chú thích + thanh tách phần                          |
| `SummaryPill`             | `label` · `value` · `color?`                                                                                                                                                                                                                                                               | Chip số liệu inline                                                                                           |
| `HudFrame` + `HudInfoBox` | `tone` · `intensity: default\|cyber\|prime` · `weight: regular\|hairline` · `notch` · `corners` · `glow` · `scanlines` · `sweep` · `ticks` · `children`                                                                                                                                    | Khung viền HUD cho màn hình lớn                                                                               |
| `HudCallout`              | `title` · `subtitle?` · `statusLabel?` · `status` · `tone` · `line: sm\|md\|lg` · `x` · `y` (% khung cha)                                                                                                                                                                                  | Nhãn ghim + đường dẫn + điểm neo phát sáng trên ảnh / bản đồ / sơ đồ                                          |
| `HudCorners`              | `variant: bracket\|dot\|chamfer\|none` · `size` · `thickness` · `frame` · `frameWidth` · `inset` · `radius` · `glow`                                                                                                                                                                       | Khung viền + nhấn 4 góc HUD cho khung tự dựng (cha `position: relative`, màu qua `--hud-c`)                   |
| `PanelCard`               | `title` · `titleNote?` · `right?` · `onExpand?`/`expanded?` · `onClose?` · `footer?` · `tone` · `variant: hud\|overlay\|plain` · `density: compact\|default\|relaxed` · `frame: default\|cyber\|prime` · `frameWeight` · `sweep` · `notch` · `flushBody` · `loading` · `empty`/`emptyText` | Card của màn dashboard — khung HUD + header vạch chéo + trạng thái tải/rỗng + nút phóng to/đóng               |
| `Splitter`                | `orientation: horizontal\|vertical` · `initialSize` · `minSize` · `maxSize` · `onResize` · `deferResize` · `collapsed`                                                                                                                                                                     | Chia đôi panel kéo thả được                                                                                   |
| `Surface`                 | —                                                                                                                                                                                                                                                                                          | Khung viền + nền thuần (`border border-border-default bg-bg-surface`) — dùng thay vì gõ tay class này lặp lại |
| `CardScreenshot`          | `variant: default\|ghost\|solid` · `size: sm\|md\|lg\|xl\|full` · `aspect` · `rounded` · `overlay`                                                                                                                                                                                         | Card hiển thị ảnh chụp màn hình/thumbnail                                                                     |

### 3.4 `layout/`

| Component           | Props chính                                                                                                                                 | Mục đích                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `TitleScreen`       | `icon` · `iconColor: TitleIconColor` (14 tông) · `title` · `subtitle?` · `titleTrailing?` · `summary?` · `right?` · `onBack?` · `brackets?` | Page header NỘI DUNG, trang KHÔNG có `PageHeader` — có rồi thì bỏ (`page-structure.md §3b`)                                              |
| `SectionHeader`     | `title` · `description?` · `right?` · `icon?` · `iconColor?` · `accent?`                                                                    | Section/panel header bar (gradient)                                                                                                      |
| `PageShell`         | `variant: scroll`                                                                                                                           | Khung ngoài của 1 trang nội dung — recipe `flex h-full min-h-0 flex-col gap-2` chuẩn                                                     |
| `PageBody`          | `overflow` · `stack`                                                                                                                        | Vùng cuộn còn lại của trang, đi cặp với `PageShell`                                                                                      |
| `Toolbar`           | `border` · `padding`                                                                                                                        | Thanh toolbar/filter của trang — cụm trái giãn+wrap (filter), cụm phải cố định (action)                                                  |
| `BoxGrid`           | `min` · `gap` · `align`                                                                                                                     | Lưới card/panel — khai `min` width mỗi ô, số cột tự suy ra (khác `FormGrid` khai SỐ CỘT)                                                 |
| `FilterDisclosure`  | `label` · `summary` · `activeCount` · `onReset` · `sticky` · `bodyClassName`                                                                | ≥ 3 bộ lọc trong modal / box → ĐIỆN THOẠI gom thành MỘT thanh thu gọn 44px bung tại chỗ; ≥ 768px vẽ nguyên tại chỗ (`display: contents`) |
| `DetailPanelHeader` | `title` · `action?` · `size?` · `titleVariant?` · `tone?` · `brackets?`                                                                     | Header của panel chi tiết trong master-detail                                                                                            |

### 3.5 `overlays/` — hộp thoại & lớp nổi

| Component                                                                                                                | Props chính                                                                                                                                                                                    | Mục đích                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Modal`                                                                                                                  | `title` · `description` · `size: xs…6xl \| auto \| screen \| full` · `frame: default\|hud` · `showClose` · `forceCloseOnTouch` · `footer` · `onConfirm` · `onCancel` · `noPadding` · `trigger` | Generic dialog                                                                                                                                                                                  |
| `ConfirmDialog`                                                                                                          | `variant: confirm\|delete\|success\|warning\|info` · `title` · `description` · `icon?` · `actionLabel?` · `cancelLabel?` · `onConfirm` · `onCancel` · `trigger`                                | Confirm với GemIcon header                                                                                                                                                                      |
| `FormModal`                                                                                                              | `title` · `size: sm\|md\|lg\|xl` · `form: UseFormReturn` · `onConfirm` · `scrollable` · `readOnly`                                                                                             | Form trong dialog (auto handleSubmit)                                                                                                                                                           |
| `Drawer`                                                                                                                 | `side` · `size` · `resizable` · `open` · `onOpenChange`                                                                                                                                        | Ngăn kéo trượt từ cạnh màn; `side="bottom"` ở tablet / điện thoại = bottom-sheet chuẩn (tay nắm kéo-đóng, cao theo nội dung)                                                                    |
| `DrawerSection`                                                                                                          | `title` · `icon` · `tone` · `extra` · `bodyClassName`                                                                                                                                          | Một VÙNG THÔNG TIN trong Drawer: vạch nhấn + tiêu đề in hoa theo tông (`primary` · `info` · `warning` · `danger` · `neutral`) — mỗi vùng một tông để tách vùng; đừng tự dựng khối `border + bg` |
| `ModalCloseButton`                                                                                                       | `forced` · `floating` · `disabled` · `onClick`                                                                                                                                                 | ✕ chung của mọi lớp nổi (32px, tablet / điện thoại 40px, vùng chạm 44px); tự dựng lớp nổi mới thì dùng nút này, đừng vẽ ✕ riêng                                                                 |
| `CustomModalLayout`                                                                                                      | `header` · `body` · `footer`                                                                                                                                                                   | Bố cục modal tự dựng khi `<Modal>` không đủ                                                                                                                                                     |
| `Menu`                                                                                                                   | `trigger` · `options[]` (`children` = submenu · `checked` = lựa chọn đơn ✓) · `onSelect` · `align`                                                                                             | Action menu; cài đặt nhỏ "chọn một trong vài dạng" (kiểu header) = submenu `checked` — KHÔNG tự dựng popover chọn riêng                                                                         |
| `Tooltip`                                                                                                                | `content` · `side` · `align` · `arrow` · `delayDuration`                                                                                                                                       | Hover tooltip                                                                                                                                                                                   |
| `Popover`                                                                                                                | `content` · `variant: glass\|solid` · `side` · `align` · `modal` · `arrow` · `sheetOnPhone`                                                                                                    | Click popover; điện thoại: `sheetOnPhone` đổi thành ngăn kéo đáy có ✕                                                                                                                           |
| `showToast(type, message, options?)` · `showErrorToast(error, options?)` · `dismissToast(id)` · `updateToast(id, patch)` | `type: success\|error\|warning\|info` · `options: { description, duration, … }`                                                                                                                | Toast thông báo (API mệnh lệnh, `overlays/toast/toast.api.ts`); `showErrorToast` bỏ qua lỗi đã báo / request huỷ (`claimErrorMessage`)                                                          |
| `ToastContainer`                                                                                                         | —                                                                                                                                                                                              | Điểm mount toast (Provider + Viewport) — đã gắn ở gốc app, KHÔNG mount lại                                                                                                                      |
| `Toast` + `ToastProvider` + `ToastViewport`                                                                              | `type` · `title` · `description` · `closable`                                                                                                                                                  | Mảnh dựng toast (thường dùng qua `showToast`)                                                                                                                                                   |

### 3.6 `icons/` + `media/`

| Component                                                    | Props chính                                                                                                                               | Mục đích                                                                                       |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `SystemIcon`                                                 | `name: SystemIconName` (kebab-case, `*-bold` / `*-outline`) · `size: number` (default 16)                                                 | Render icon từ registry                                                                        |
| `GemIcon`                                                    | `color: blue\|green\|yellow\|red\|gray` · `size: xs\|sm\|md` · `icon` · `children`                                                        | Isometric icon container                                                                       |
| `Image`                                                      | `name: ImageName` · `alt: string` (required) · `width` · `height` · `fit: cover\|contain\|fill\|none\|scale-down` · `rounded` · `preview` | Ảnh từ registry                                                                                |
| `ImagePreview`                                               | `src` · `size: sm\|md\|lg\|xl\|full` · `rounded: none\|sm\|md\|full` · `preview` · `fallback`                                             | Thumbnail + lightbox                                                                           |
| `ImageLightbox`                                              | `open` · `onOpenChange` · `src` · `alt` · `actions`                                                                                       | Fullscreen viewer                                                                              |
| `LightboxToolButton`                                         | `icon` · `label` · `onClick` · `disabled`                                                                                                 | Nút công cụ riêng truyền vào `ImageLightbox actions` (trông y hệt nút xoay / zoom)             |
| `Upload`                                                     | `variant` · `size` · `accept` · `maxSize` · `maxFiles` · `multiple` · `onFiles` · `onReject`                                              | Vùng tải tệp (dùng kèm `useUpload`)                                                            |
| `Dropzone`                                                   | `onDrop({ kind, files, folderPaths })` · `disabled` · `overlayTitle` · `children`                                                         | Vùng thả tệp / thư mục phủ lên nội dung có sẵn (không có nút chọn)                             |
| `FileList` · `FileCard` · `FileBadge`                        | `files` / `file` · `density` · `variant`                                                                                                  | Danh sách / thẻ / huy hiệu tệp — mảnh hiển thị của cụm tải tệp, dùng riêng khi cần layout khác |
| `image-annotator` (`AnnotationLayer` · `flattenAnnotations`) | `source` · `fileName` · `initialShapes` · `onSave` · `onCancel`                                                                           | Vẽ chú thích lên ảnh (canvas thuần, import sâu `@/shared/ui/media/image-annotator`)            |

### 3.7 `form/` — Form system (RHF + Zod)

**Core:**
`Form` · `FormItem` · `FormActions` · `PasswordStrength`

**Hooks:**
`useZodForm` · `useFormField` (`useFormField(name, { label, description })` → `{ field, error, a11y, readOnly }`) ·
`useFieldA11y` · `useFormMeta` · `useServerErrors` · `useAsyncValidation` · `useFormDraft` · `useDirtyGuard` · `useModalDateDefaults`

**Fields (`form/fields/`) — 21 field:**

| Field                | Loại data                                  |
| -------------------- | ------------------------------------------ |
| `TextField`          | string                                     |
| `EmailField`         | string (email)                             |
| `PhoneField`         | string (số điện thoại)                     |
| `IPAddressField`     | string (IPv4)                              |
| `PasswordField`      | string (masked)                            |
| `TextareaField`      | string (multi-line)                        |
| `NumberField`        | number                                     |
| `MaskedField`        | string (formatted)                         |
| `SelectField`        | single option                              |
| `MultiSelectField`   | multi options                              |
| `CheckboxField`      | boolean                                    |
| `ToggleField`        | boolean                                    |
| `RadioGroupField`    | enum value                                 |
| `DateField`          | single date                                |
| `TimeField`          | string (giờ)                               |
| `DateRangeField`     | `IsoDateRange` { from, to } (`YYYY-MM-DD`) |
| `AsyncSelectField`   | option (loaded from API)                   |
| `CascadeSelectField` | parent → child option                      |
| `FileField`          | `FileFieldValue` / `FileFieldValue[]`      |
| `ColorPickerField`   | string (hex)                               |
| `DictionaryField`    | cặp khoá–giá trị tự do                     |

Cả 21 field + `PasswordStrength` đều có trên barrel gốc `@/shared/ui`.

**Layout (`form/layout/`):**
`FormSection` · `FormGrid` · `FormRow` · `FieldArray` (lồng được — mảng trong mảng) · `FormTabs` · `SortableFieldArray`

**Patterns (`form/patterns/`):**
`ConditionalField` · `DynamicSchemaField` · `FormStepper`

### 3.8 Widget — khung app dùng chung (`@/shared/widgets/<widget>`)

> Không thuộc UI kit và KHÔNG có barrel gốc: import theo TỪNG widget. Khuôn + luật store:
> `widget-composition.md` §9–§10. Tầng `app/shell/` nối widget với store của app.

| Cần                                                                                             | Dùng                                                                                                                                                                               | Import                             |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Chiếm chỗ trên thanh header toàn cục (tiêu đề module, tab, nút quay lại, action)                | `<PageHeader title nav onBack backHref start end />` — cần `<HeaderSlotsProvider>` ở layout                                                                                        | `@/shared/widgets/header`          |
| Thanh header của khung app                                                                      | `<Header>` (+ `HEADER_ICON_BUTTON_CLASS` cho nút icon, `extraMenuOptions` gắn mục menu người dùng) — app dùng qua `AppHeader`                                                      | `@/shared/widgets/header`          |
| Thanh launcher đáy màn                                                                          | `<Dock items>` (chế độ hiển thị ở `useDockSettingsStore`, người dùng tự chọn) — app dùng qua `AppDock`                                                                             | `@/shared/widgets/dock`            |
| Thanh tab đáy ĐIỆN THOẠI (≤ 5 ô, ô active có vạch sáng; > 5 mục → 4 ô + "Thêm" mở bottom-sheet) | `<TabBar items>` — app dùng qua `AppTabBar` (đọc module registry); chiều cao khai một chỗ ở `tab-bar.css` (`--tab-bar-h`, `--tab-bar-reach`); chiều cao THẬT được đo vào `--bottom-chrome` cho phần tử neo đáy                                       | `@/shared/widgets/tab-bar`         |
| Top bar điện thoại thay header HUD (quay lại · tên + dòng phụ · tab cuộn · tìm · avatar→sheet)  | `<PhoneTopBar>` — app dùng qua `AppPhoneTopBar`; trang vẫn chỉ gọi `<PageHeader>` (slot `start                                                                                     | title                              | end | nav`) | `@/shared/widgets/header` |
| Tải tệp chạy nền (sống qua đổi màn, có thẻ tiến độ góc màn)                                     | `useUploadQueue().enqueue(files, uploader)`                                                                                                                                        | `@/shared/widgets/progress-center` |
| Theo dõi tác vụ máy chủ chạy dài (nhập Excel, kết xuất…)                                        | `useServerTasks()` → `start` · `update` · `finishSuccess` · `finishError`                                                                                                          | `@/shared/widgets/progress-center` |
| Điểm mount thẻ tiến trình / dọn khi đổi tài khoản                                               | `<ProgressCenter />` (đã gắn ở `AppOverlays`) · `resetProgressCenter()` (`app/bootstrap.ts`)                                                                                       | `@/shared/widgets/progress-center` |
| Tìm nhanh toàn cục (Ctrl/⌘+K)                                                                   | `<CommandPalette groups>` (mục có `href` là liên kết thật) · `<CommandPaletteTrigger>` · `useCommandPaletteShortcut` · `useCommandPaletteStore` — app dùng qua `AppCommandPalette` | `@/shared/widgets/command-palette` |

---

## 4. Shared Hooks (`@/shared/hooks`)

> Chia theo chức năng: `state/` · `timing/` · `url/` · `dom/` · `browser/` · `input/` · `table/`.
> **LUÔN** import qua `@/shared/hooks`, KHÔNG import sâu vào nhóm.

| Hook                                                                                                                | Mục đích                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useDisclosure()`                                                                                                   | Open/close cho Modal / Popover / Drawer (`onOpenChange` nối thẳng vào component)                                                                                                                                                                                                      |
| `useQueryParams(config?)`                                                                                           | ⛔ Filter / search / page / pageSize / tab sống trên URL — bộ trạng thái danh sách DUY NHẤT (xem `api-patterns.md`); ô tìm ghép `useDebounce`                                                                                                                                         |
| `useNavHref()`                                                                                                      | Dựng URL cho tab `?tab=` mà giữ nguyên param lọc khác                                                                                                                                                                                                                                 |
| `useLocalStorage(key, default, { parse }?)`                                                                         | Persist state localStorage; `parse` kiểm dữ liệu đọc ra (trả `undefined` → dùng `default`); đổi `key` thì đọc lại                                                                                                                                                                     |
| `useEventCallback(fn)`                                                                                              | Callback identity ổn định                                                                                                                                                                                                                                                             |
| `useLatestRequest()`                                                                                                | ⛔ Gọi API trong component: chỉ lượt MỚI NHẤT được ghi state (xem `async-safety.md`)                                                                                                                                                                                                  |
| `useDeleteWithConfirm({ onConfirm })`                                                                               | Xoá có hộp xác nhận: giữ id/tên chờ xoá + cờ đang xoá cho `ConfirmDialog`                                                                                                                                                                                                             |
| `useDebounce(value, delay)`                                                                                         | Debounce cho filter / query                                                                                                                                                                                                                                                           |
| `useNowTick(ms)`                                                                                                    | Đồng hồ re-render theo nhịp                                                                                                                                                                                                                                                           |
| `useCountUp(value, options?)`                                                                                       | Số chạy tới giá trị mới (tôn trọng `prefers-reduced-motion`)                                                                                                                                                                                                                          |
| `useClickOutside(handler)`                                                                                          | Click outside detection                                                                                                                                                                                                                                                               |
| `useCopyToClipboard()`                                                                                              | Copy clipboard — `[copied, copy]`                                                                                                                                                                                                                                                     |
| `useElementSize()`                                                                                                  | Đo kích thước phần tử (tuple `[ref, size]`)                                                                                                                                                                                                                                           |
| `useFullscreen(ref)`                                                                                                | Toàn màn hình bằng Fullscreen API                                                                                                                                                                                                                                                     |
| `useExpandToViewport()`                                                                                             | Phóng một khối ra trọn viewport tại chỗ (`fixed inset-0`), Esc thu nhỏ                                                                                                                                                                                                                |
| `useBeforeUnload(when)`                                                                                             | Cảnh báo khi rời trang lúc đang dở việc                                                                                                                                                                                                                                               |
| `useMultiTabSync(channel, cb)`                                                                                      | Đồng bộ trạng thái giữa nhiều tab                                                                                                                                                                                                                                                     |
| `useNetworkStatus()`                                                                                                | Online / offline + `wasOffline`                                                                                                                                                                                                                                                       |
| `useMediaQuery(query)` · `useIsCoarsePointer()` · `useIsPhone()` · `useIsBelowWide()` · `usePrefersReducedMotion()` | Media query · đang chạm bằng ngón tay · điện thoại (biến thể `phone:`, `PHONE_MEDIA_QUERY`) · dưới mốc `wide` 1800px · giảm chuyển động — chia bố cục theo CHUỖI query dùng chung ở `shared/constants/media-query.constants.ts`, KHÔNG tự gõ số px (xem `responsive-screens.md §2.4`) |
| `useImeSafeSearchInput(value, onChange)`                                                                            | ⛔ Ô tìm kiếm IME-safe (xem `ime-safe-input.md`)                                                                                                                                                                                                                                      |
| `useArrowFieldNav()`                                                                                                | ⛔ Đi giữa các ô nhập bằng mũi tên (xem `keyboard-navigation.md`)                                                                                                                                                                                                                     |
| `useKeyboardShortcut({ code, mods, capture, ignoreWhileTyping, onTrigger })`                                        | Phím tắt toàn trang theo MỘT luật chung                                                                                                                                                                                                                                               |
| `useSaveShortcut(onSave, { enabled, canSave })`                                                                     | Ctrl/⌘ + S                                                                                                                                                                                                                                                                            |
| `useTvEscapeHatch(onEscape)`                                                                                        | Thoát TV mode bằng bàn phím (Ctrl/⌘ + Alt + Shift + T)                                                                                                                                                                                                                                |
| `useRowSelection(...)`                                                                                              | Chọn dòng (+ `useClearRowSelectionOnOutsideClick`)                                                                                                                                                                                                                                    |

---

## 5. Shared Utilities (`@/shared/utils`)

> Import THEO FILE (đường dưới đây) — `shared/utils` không có barrel.

| Utility                                                                              | Import                                    | Mục đích                                                                     |
| ------------------------------------------------------------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------- |
| `cn()`                                                                               | `@/shared/utils/style/cn`                 | Merge Tailwind class (BẮT BUỘC khi compose className)                        |
| `formatDate()` · `formatNow()` · `formatRelativeTime()`                              | `@/shared/utils/format/format.utils`      | Ngày → chuỗi hiển thị                                                        |
| Cộng/trừ, so sánh, phân tích ngày                                                    | `dayjs` (đã là dependency)                | Base KHÔNG bọc lại — dayjs đã đủ và mọi picker của UI kit đang dùng chính nó |
| `formatCurrency()` · `formatNumber(v, decimals?)` · `formatPercent(v, decimals = 1)` | `@/shared/utils/format/format.utils`      | Số / tiền / % (vi-VN) — KHÔNG tự ghép `` `${formatNumber(v)}%` ``            |
| `formatMoneyCompact()` · `formatMoneyDetail()`                                       | `@/shared/utils/format/money.utils`       | Tiền đơn vị tỷ / tr / đ                                                      |
| `colorMix(color, alpha, base?, space?)`                                              | `@/shared/utils/style/color-mix.utils`    | `color-mix()` DUY NHẤT (alpha 0–1)                                           |
| `getThemeColor()`                                                                    | `@/shared/utils/style/color.utils`        | Get hex từ color token (cho chart canvas)                                    |
| `stripDiacritics()` · `normalizeSearch()` · `matchesSearch()`                        | `@/shared/utils/format/string.utils`      | Bỏ dấu tiếng Việt / so khớp tìm kiếm                                         |
| `pxToRem()` · `pxToRemString()`                                                      | `@/shared/utils/style/responsive.utils`   | px → rem                                                                     |
| `safeStorage` · `createSafeJSONStorage()`                                            | `@/shared/utils/browser/storage.utils`    | localStorage không ném lỗi · `storage` cho zustand `persist`                 |
| `validateFile()` · `matchesAccept()` · `getExtension()`                              | `@/shared/utils/validation/file.utils`    | Kiểm tệp tải lên (UI kit upload đã gọi sẵn)                                  |
| `readImageSize(file)`                                                                | `@/shared/utils/browser/image-size.utils` | Kích thước ảnh (px) hoặc `null`, không ném                                   |

---

## 6. Shared Types & Constants

```ts
// API
import type { ApiResponse } from '@/core/http';

// Constants — mỗi nhóm một file `*.constants.ts`, import theo file
import { APP_NAME } from '@/shared/constants/app.constants';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/shared/constants/pagination.constants';
import { PATHS } from '@/shared/constants/paths.constants';
import { HEADER_HEIGHT_CLASS, SHELL_GUTTER_X } from '@/shared/constants/layout.constants';
import { OPEN_DIALOG_SELECTOR } from '@/shared/constants/dom.constants';
```

Kiểu dùng chung KHÔNG có folder `shared/types` riêng: kiểu sống cạnh module sở hữu nó (`@/core/http`,
`*.types.ts` của component / feature). Kiểu tiện ích kiểu `Maybe<T>` viết thẳng `T | null | undefined`.

---

## 7. Core Services

| Module                                                                                            | Import                  | Mục đích                                                                                               |
| ------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `apiClient` · `readData()`                                                                        | `@/core/http`           | HTTP (đã có interceptors) + bóc `data` có kiểm                                                         |
| `useQueryClient()`                                                                                | `@tanstack/react-query` | QueryClient của app (dựng bằng `createQueryClient` — `@/core/query`)                                   |
| `useSessionStore(selectUser)` · `logout()`                                                        | `@/domains/session`     | Phiên đăng nhập (đăng xuất xong KHÔNG tự `navigate` — `AuthGuard` lo)                                  |
| `usePermission({ resource, action })` · `canAccess(user, permissions)`                            | `@/domains/session`     | Ẩn/hiện theo quyền — CÙNG luật với guard và menu (chế độ demo mở hết); không tự đọc `user.permissions` |
| `useEffectiveTheme()` · `useDisplayStore(selectIsTv)` · `useDisplayStore(selectEffectiveUiScale)` | `@/domains/preferences` | Theme / chế độ TV / hệ số chữ ĐANG hiển thị (TV ép tối)                                                |
| `AppError` · `errorMessageOf()` · `isAppError()`                                                  | `@/core/http`           | Ném lỗi có câu cho người dùng / câu hiển thị của một lỗi / nhận diện `AppError`                        |

---

## 8. KHÔNG ĐƯỢC — Danh sách đen

```tsx
// ❌ Raw UI element
<button onClick={...}>Lưu</button>
<input type="text" value={...} />
<select><option>...</option></select>
<textarea />
<table><tr><td>...</td></tr></table>

// ❌ Inline SVG / direct import icon component
<svg viewBox="..."><path d="..." /></svg>
import { CircleCheckBoldIcon } from "@/assets/icons";

// ❌ Raw <span> cho badge/dot
<span className="px-2 py-1 rounded-full bg-error text-neutral-0">3</span>
<span className="w-2 h-2 rounded-full bg-error absolute -top-1 -right-1" />

// ❌ Raw <div> cho card/panel
<div className="rounded-lg bg-bg-surface border border-border-default p-4">
  <h3>Tiêu đề</h3>
  <p>Mô tả</p>
</div>

// ❌ Hardcoded color / raw font utility
<p className="text-sm font-medium text-[#94A3B8]">Label</p>
<div style={{ backgroundColor: '#0F172A' }}>...</div>

// ❌ Custom toggle/modal/dropdown thay vì UI kit
const [open, setOpen] = useState(false); // dùng useDisclosure
<MyButton />     // dùng <Button>
<MyLoading />    // dùng <Spinner> hoặc Button loading state
mergeClasses(...) // dùng cn()
clsx(...)         // dùng cn()
twMerge(...)      // dùng cn()
window.alert(...)   // dùng <ConfirmDialog>
window.confirm(...) // dùng <ConfirmDialog>

// ✅ ĐÚNG — DUY NHẤT: showToast() / showErrorToast() của UI kit (Radix Toast bên dưới)
import { showErrorToast, showToast } from '@/shared/ui';
showToast('success', 'Lưu thành công');
showToast('error', 'Lỗi', { description: 'Chi tiết lỗi', duration: 5000 });
showErrorToast(error, { message: 'Không lưu được' }); // lỗi query/mutation: xem api-patterns.md §3
```

```tsx
// ✅ ĐÚNG — luôn qua UI kit
<Button variant="primary" onClick={...}>Lưu</Button>
<Input value={...} onChange={...} />
<Dropdown options={...} value={...} />
<Textarea />
<Table columns={...} data={...} />

<SystemIcon name="circle-check-bold" size={16} className="text-success" />

<Badge color="error" variant="solid">3</Badge>
<Badge dot color="error" className="absolute -top-0.5 -right-0.5" />

<SummaryCard color="blue" icon="house-bold" label="Tổng dự án" value={42} />

<Text size="small" weight="medium" skin="muted">Label</Text>

const { isOpen, open, close } = useDisclosure();
```

---

## 9. Workflow trước khi viết JSX (Checklist)

1. **Nhu cầu là form control / action / display / overlay?**
   → Tra **§1 HTML → UI kit Decision Table**
2. **Có component UI kit đúng concept?**
   → REUSE. Done.
3. **Gần giống nhưng thiếu variant/size?**
   → EXTEND: thêm khoá vào union type + bảng `*_CLASSES` của component đó (xem `component-structure.md §2`)
4. **Không trùng concept với bất kỳ component nào?**
   → CREATE theo checklist `ui-kit-architecture.md §9` (Adding a New Component)
5. **Chỉ là layout wrapper (flex/grid container)?**
   → `<div>` / `<span>` / `<section>` raw OK — KHÔNG cần UI kit
6. **Đang sửa widget (`src/shared/widgets/`)?**
   → Đọc `widget-composition.md` — token tập trung qua `*.theme.ts` + bảng `*_CLASSES`; khuôn folder §9, store cục bộ §10

---

## 10. Cross-references

- UI kit scale + decision tree → `ui-kit-architecture.md`
- Widget token centralization → `widget-composition.md`
- Color tokens → `color-system.md`
- Font tokens → `font-system.md`
- Icon registry → `icon-conventions.md`
- Tailwind / `cn()` → `tailwind-conventions.md`
- Performance / memoization → `code-optimization.md`
- Biểu đồ → `@/shared/charts` là nguồn DUY NHẤT của hạ tầng chart (mật độ, màu, trục, nhãn): `chart-conventions.md`
