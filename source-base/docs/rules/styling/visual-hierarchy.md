# Visual Hierarchy & Density Rules

> Áp dụng cho **mọi page, panel, card, bảng, form** trong `src/features/**`.
> Mục tiêu: thông tin **quan trọng** nổi bật trước, thông tin **phụ trợ** lùi
> sau — sửa 1 chỗ → toàn page đồng bộ. Vi phạm các quy tắc đánh dấu **⛔**
> → **block merge**.

---

## 0. Nguyên tắc tối cao — Hierarchy 3 cấp

```
PRIMARY     →  cái user CẦN xem ngay (KPI tổng, action chính, kết quả).
                Diện tích lớn, font đậm, chữ `fg-heading` (tone `-5` cho chấm / vạch / mảng), border-2/shadow.
SECONDARY   →  context / chi tiết hỗ trợ PRIMARY (label, axis, sub-total).
                Diện tích vừa, font medium, màu `fg-subheading` / `fg-body`.
TERTIARY    →  metadata / control phụ (filter, hint, tooltip).
                Nhỏ, font normal, màu `fg-muted` / `fg-faint`.
```

**Quy tắc cứng:**
- 1 page CHỈ có 1-2 vùng PRIMARY (nhiều hơn = mất focus, vi phạm).
- PRIMARY luôn **chiếm > 50%** diện tích viewport nội dung chính.
- SECONDARY KHÔNG được nổi bật bằng/hơn PRIMARY (font weight ≤ PRIMARY, opacity ≤ 100%).

---

## 0b. ⛔ Ngôn ngữ hình ảnh — theme sáng sạch, trang trí HUD chỉ qua `dark:`

Áp dụng toàn `src/` (UI kit, widget, trang). Theme sáng = màn quản trị sạch; theme tối (mặc định) = cùng nền đó +
điểm nhấn màn hình lớn tiết chế. Mẫu để đối chiếu: `Button`, `inputs/field.theme`, `overlays/popup-surface.theme`,
`overlays/modal.theme`, `BoxPanel`.

| Mặt | Quy ước | ⛔ Không |
|---|---|---|
| Bề mặt | Viền mảnh token (1px; `border-2` chỉ cho panel ngoài cùng — §2) + bóng token mềm `shadow-[0_8px_24px_var(--color-shadow-popup)]` | Quầng, `text-shadow`, vân lưới, ngoặc góc ở theme sáng |
| Trang trí HUD | Quầng · ray phát sáng · sọc · ngoặc góc · dải gradient tiêu đề — CHỈ qua `dark:` (vd `Button` primary: `dark:hover:shadow-[0_0_14px_color-mix(in_srgb,var(--color-primary-5)_35%,transparent)]`) | Trang trí bật ở cả hai theme |
| Tiêu đề khối | Dấu `//` nghiêng (`HUD_TITLE_MARK`, màu khung `hud`) + chữ `-semibold` viết thường (`BoxPanel`, `FormSection`, `SectionHeader`, thanh tiêu đề `Modal`) | `uppercase` + `tracking-*` cho tiêu đề khối — chỉ nhãn meta rất nhỏ (`caption-10`) mới viết hoa giãn chữ |
| Focus | Control: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus` (`ring-inset` trong hàng / ô dày) · ô nhập: `focus-within:border-primary-5 focus-within:ring-1 focus-within:ring-primary-5`, quầng 24% chỉ `dark:` | `ring-offset-*` (dải trắng ở theme tối) |
| Trạng thái | Token theo theme `success` · `warning` (CAM) · `error` · `info`; chữ trạng thái cỡ nhỏ trên nền sáng thiếu tương phản → bậc `-7` (`text-success-7 dark:text-success`) | Vàng cho cảnh báo; chữ bậc `-5` trên nền sáng |
| Chuyển động | 150–200ms `ease-out`, liệt kê thuộc tính: `transition-[color,border-color,background-color,box-shadow]` | `transition-all`; `scale` nảy trên mặt lớn |

Màu hover / đang chọn / focus của từng loại control → `color-usage-guide.md` §5; bậc highlight → §4.

---

## 0c. ⛔ Ngân sách trang trí — trang trí theo TẦNG, không rải đều (theme tối)

Màn điều hành "nét" vì trang trí chỉ ở khung lớn, mọi thứ bên trong phẳng; rải ngoặc / vạch / vệt lên từng nút, từng ô là
"rối" (người dùng đã báo, 2026-10-05). Đối chiếu ảnh mẫu Precast MES: ngoặc góc chỉ ở khung panel; nút, ô nhập, tab, chip
đều phẳng — chỉ viền 1px + đổi màu khi rê / chọn.

| Tầng | Được phép | ⛔ Không |
|---|---|---|
| Thanh header · Dock · panel đứng riêng (`BoxPanel border="strong"`, `HudFrame` `regular`) · Modal · Drawer | Ngoặc 4 góc · ray sáng đỉnh · quầng ngoài | Sọc chéo, vệt quét, chấm góc ở các khung LẶP trong lưới |
| Panel trong lưới (`hairline`) · lớp nổi nhỏ (menu, dropdown, popover, tooltip, lịch) · Callout | Viền 1px tông `hud` · mặt rọi `HUD_PANEL_FILL` · ray đỉnh (lớp nổi) | Ngoặc góc, chấm góc, thước chia |
| Control: nút, ô nhập, chip, tab, ô lịch, phân trang | Viền 1px · đổi màu + quầng khi rê / focus / chọn (`HUD_HOVER_GLOW` · `HUD_FOCUS_GLOW` · `HUD_ACTIVE_FILL`) | Ngoặc / vạch góc, vệt sáng quét, vạch quét đáy |
| Thanh số liệu trong bảng / danh sách | Dốc màu + điểm sáng đầu thanh | Vạch chia 10% trên rãnh |

Một khối chỉ có MỘT điểm nhấn phát sáng (thường là thứ đang chọn hoặc nút chính); thêm hiệu ứng mới → hỏi "khối này đã
có điểm nhấn chưa", có rồi thì bỏ. Ô thả tệp chỉ hiện ngoặc góc khi đang KÉO tệp qua (trạng thái, không phải trang trí).

---

## 1. ⛔ Padding & Gap Scale — MAX DENSITY (BẮT BUỘC)

> **Triết lý CỨNG:** nội dung là TẤT CẢ, whitespace là **kẻ thù**. Càng ít padding
> càng tốt. Tham khảo Bloomberg Terminal, TradingView, VPS SmartOne — trader chuyên
> nghiệp KHÔNG dung túng padding to. Mỗi pixel phải phục vụ nội dung.

### 1.1. Con số nằm ở `spacing-system.md`

Thang khoảng cách, ai đệm ai tạo khe, trong hộp hiển thị thế nào, đệm của modal /
drawer / form, bảng sai-đúng và ngoại lệ — tất cả ở **`docs/rules/styling/spacing-system.md`**
(nguồn duy nhất, có bài kiểm tự động). Mục này chỉ giữ phần TRIẾT LÝ.

Tóm tắt một dòng để khỏi mở file khi chỉ cần nhắc lại:

```
VỎ      →  px-4 py-4   ← <main> của AppShellLayout cấp, CHỈ một lần
TRANG   →  không đệm   ← <PageShell> / <PageBody>, các khối cách nhau gap-2
HỘP     →  thân p-2    ← nội dung chữ/form; bảng & cây thì TRÀN MÉP (không đệm)
KHE     →  gap-2       ← mặc định; gap-1 cho cụm dính, gap-3 giữa các nhóm, gap-4 giữa ô form
LỚP PHỦ →  p-4         ← modal / drawer, đã nằm sẵn trong component
```

### 1.7. Tại sao MAX density?

1. **User đọc nhanh** — mắt không quét vùng trắng
2. **Fit nhiều thông tin hơn** — PMS dashboard: ≥ 6 KPI + 3 chart + table cùng viewport
3. **Chuẩn ngành trading/enterprise** — Bloomberg, TradingView, VPS: `p-2` khắp
4. **Mobile-friendly** — dense scale xuống mobile không cần media query
5. **Feel "pro"** — enterprise/trading UI = dense; airy = landing marketing

---

## 2. ⛔ Border System (BẮT BUỘC)

### 2.1. Bảng quy chuẩn — chỉ dùng các bước này

| Ngữ cảnh | Border | Color token |
|---------|--------|-------------|
| **Page-level panel** (BoxPanel ngoài cùng) | `border-2` | `border-border-strong` |
| **Section / sub-panel** trong panel | `border` (1px) | `border-border-default` |
| **Active state** (item đang chọn) | vòng 2px bằng `shadow` (không xô layout) | `shadow-[0_0_0_2px_var(--color-primary-5)]` — §4.1 |
| **Highlight current** (tháng/năm hiện tại) | vòng trong 1px | `shadow-[inset_0_0_0_1px_var(--color-primary-5)]` + `text-link` |
| **Table header bottom** | 2px (`<Table>`: `box-shadow: inset 0 -2px 0` vì `<th>` sticky không vẽ `border` khi cuộn) | `border-border-strong` |
| **Table row divider** | `border-b` (1px) | `border-divider-soft` (mặc định) · `border-divider-default` (`gridBorder`) |
| **Subtle separator** trong card | `border-t` (1px) | `border-border-default` |
| **Input default** | `border` (1px) | `border-border-default` |
| **Input focus** | `border` (1px) + `ring-1` (tổng 2px, không xô layout) | `border-primary-5` + `ring-1 ring-primary-5` |

### 2.2. ⛔ KHÔNG được phép

| ❌ Sai | ✅ Đúng |
|-------|--------|
| `border-border-default/40` `border-border-default/60` (faded — khó scan) | `border-border-default` (1px) hoặc `border-2 border-border-strong` (2px) |
| `border-4` `border-8` (quá dày, lãng phí pixel) | `border-2` tối đa |
| Trộn radius: `rounded-md` panel + `rounded-xl` card trong | Default vuông góc (xem `tailwind-conventions.md`) |
| Border `border-primary-5/25` mờ cho active | `border-primary-5` rõ + `bg-[color-mix(...)]` tint nhẹ |

---

## 3. ⛔ Visual Hierarchy — Khi nào element nào To/Đậm/Nổi?

### 3.1. Diện tích (Size)

| Element | Width / Height | Khi nào |
|---------|---------------|---------|
| **KPI dominant** (1-3 cái / page) | grid cell **2x-3x** row khác · min-h `120-160px` | Số liệu user CẦN xem 1 phát |
| **KPI strip** (4-8 thẻ ngang) | grid cell đều · `h-20` đến `h-24` | Snapshot tổng quát |
| **Chart chính** | flex-1 chiếm space còn lại · min-h `360px` | Trục chính của analysis |
| **Chart phụ** (mini, sparkline) | `h-[60-140px]` | Trend / context |
| **Table chi tiết** | flex-1 fill · scroll nội bộ | Lookup chi tiết |
| **Filter / control bar** | `h-8` đến `h-10` shrink-0 | KHÔNG được chiếm > 10% chiều cao panel |

### 3.2. Font weight & color hierarchy

| Cấp | Heading | Body | Color |
|-----|---------|------|-------|
| **PRIMARY** | `text-h4-bold` / `text-h3-bold` | `text-body-16-bold` | `text-fg-heading` (tone `-5` chỉ tô chấm / vạch / mảng — `chart-conventions.md` §1.7) |
| **SECONDARY** | `text-body-14-semibold` (viết thường — tiêu đề khối §0b) | `text-body-14-semibold` | `text-fg-subheading` |
| **TERTIARY** | `text-caption-12-medium uppercase` | `text-caption-12` | `text-fg-body` |
| **METADATA** | — | `text-caption-10 uppercase tracking-wider` | `text-fg-muted` |

### 3.3. Numbers — BẮT BUỘC `tabular-nums`

Mọi số liệu (KPI value, table cell, axis, chart label) PHẢI có:
- `tabular-nums` (cùng width cho mỗi chữ số → cột số thẳng)
- Hậu tố unit RÕ RÀNG (`tỷ`, `%`, `m²`, `ngày`) — KHÔNG để user đoán

```tsx
// ✅ ĐÚNG
<span className="tabular-nums text-body-16-bold text-fg-heading">
  {formatNumber(value, 2)} <span className="text-caption-12 text-fg-muted">tỷ</span>
</span>

// ❌ SAI — không tabular (cột số so le), không unit
<span className="text-body-16">{value}</span>
```

### 3.3.1. ⛔ SỐ KHÔNG DÙNG FONT MONO — `.num-mono` ĐÃ XOÁ

Recipe `.num-mono` / `.num-mono-light` (JetBrains Mono + weight 600) đã **gỡ khỏi
toàn bộ codebase** và **xoá định nghĩa** trong `globals.css`. Số dùng ĐÚNG font
sans của app; căn cột là việc của `tabular-nums`, không cần font mono.

Lý do đầy đủ + bảng đối chiếu → `chart-conventions.md §1.8`. Tóm tắt:

- Số mono cạnh nhãn sans trong cùng một dòng đọc ra như hai hệ chữ ghép vào nhau.
- Ở cỡ 10–12px, JetBrains Mono nét MỎNG hơn sans → nhoè, đúng thứ nó định chống.
- `.num-mono` khoá `font-weight: 600` trong CSS rule → nuốt `weight` của
  component, và nuốt cả SVG presentation attribute (`fontWeight={700}`).

```tsx
// ❌ SAI — class đã xoá; viết lại là dựng lại đúng recipe vừa gỡ
<span className="num-mono tabular-nums">{value}</span>
<span className="num-mono-light">{value}</span>
<span className="font-mono tabular-nums">{value}</span>   // ép mono bằng đường vòng

// ✅ ĐÚNG
<span className="tabular-nums text-fg-heading">{value}</span>
```

`font-mono` CHỈ còn dùng cho chuỗi KHÔNG phải số liệu — IP, độ phân giải, mã/ID,
đoạn cấu hình, `<kbd>`. Dấu hiệu: **đi kèm `tabular-nums` nghĩa là SỐ → bỏ
`font-mono`.**

### 3.4. Hover tooltip cho data dày — BẮT BUỘC

Mọi cell trong bảng chứa số đã được rút gọn (integer/truncate) → BẮT BUỘC có
`title` attribute với giá trị đầy đủ + context:

```tsx
<td
  className="tabular-nums"
  title={`KH · ${group.short} · ${month}: ${formatNumber(value, 3, 0)} đơn vị`}
>
  {formatNumber(value)}
</td>
```

**Lý do:** dashboard density cao → user cần xem chi tiết KHÔNG ROI mouse vào row riêng.

---

## 4. ⛔ Highlight & Active State Rules

### 4.1. Bậc highlight

| Cấp | Pattern | Khi nào |
|-----|---------|---------|
| **L1 — Selected** (1 item active) | Thẻ: vòng 2px `shadow-[0_0_0_2px_var(--color-primary-5)]` (`CompactKpiCard`) · ô / segment: đặc `bg-primary-6 text-neutral-0` · dòng danh sách: `bg-primary-5/15` + `text-link` semibold (`Dropdown`). Quầng thêm CHỈ qua `dark:` | User chọn 1 trong list |
| **L2 — Current** (tháng/năm/period hiện tại) | `text-link` semibold + vòng trong 1px `shadow-[inset_0_0_0_1px_var(--color-primary-5)]` (ô hôm nay / tháng hiện tại của picker) | Marker "you are here" |
| **L3 — Hover** | Dòng / mục: `hover:bg-bg-nav-hover` · control có viền: `hover:border-primary-5/60` | Mouse over |
| **L4 — Focused** | Ô nhập: `focus-within:border-primary-5 focus-within:ring-1 focus-within:ring-primary-5` · control: `focus-visible:ring-2 focus-visible:ring-ring-focus` (§0b) | Keyboard focus |

### 4.2. ⛔ KHÔNG được trộn

- KHÔNG dùng selected + current cùng 1 element (visual conflict). Ưu tiên L1 selected.
- KHÔNG có "active" mờ (vd `border-primary-5/25` `bg-primary-5/8`) — user phải thấy ngay.
- Hover state KHÔNG được mạnh hơn selected (vd hover `bg-primary-5/30` > selected `bg-primary-5/15` → loạn).

---

## 5. ⛔ Page Layout Skeleton (BẮT BUỘC)

### 5.1. Page route content

```tsx
const FeaturePage = memo(function FeaturePage() {
  return (
    <PageShell>                                      {/* không đệm · gap-2 */}
      <FeatureHeader />                              {/* shrink-0 */}
      <FeatureKpiRow />                              {/* shrink-0 — optional */}
      <PageBody>                                     {/* phần còn lại, tự cuộn */}
        {/* Tab content / main content */}
      </PageBody>
    </PageShell>
  );
});

export default FeaturePage;
```

### 5.2. Tab / nested content (full-height)

```tsx
const FooTab = memo(function FooTab() {
  return (
    <div className="grid h-full min-h-0 grid-cols-[300px_1fr] gap-3 overflow-hidden">
      <LeftPanel />     {/* h-full overflow-hidden */}
      <RightPanel />    {/* h-full overflow-hidden */}
    </div>
  );
});

export default FooTab;
```

### 5.3. Panel với scroll nội bộ (BẮT BUỘC pattern)

```tsx
<BoxPanel
  className="h-full overflow-hidden border-2 border-border-strong"
  headerClassName="shrink-0 px-2 py-1.5"
  bodyClassName="flex min-h-0 flex-col gap-2 p-2"
>
  <div className="shrink-0">{/* Toolbar / filter — không scroll */}</div>
  <div className="min-h-0 flex-1 overflow-y-auto">
    {/* Long content — scroll nội bộ */}
  </div>
</BoxPanel>
```

### 5.4. ⛔ Anti-patterns layout

| ❌ Sai | ✅ Đúng |
|-------|--------|
| Page wrapper thiếu `h-full flex-col` | Luôn `flex h-full flex-col` + child `min-h-0 flex-1` |
| Magic `max-h-[calc(100vh-420px)]` | `flex-1 min-h-0` + `overflow-y-auto` |
| Panel có scroll page lẫn scroll nội bộ (double scroll) | Panel `overflow-hidden`, scroll CHỈ ở body cuối |
| Header KHÔNG `shrink-0` → bị co khi content dài | Header BẮT BUỘC `shrink-0` |
| Body KHÔNG `min-h-0` → flex không co được | Body BẮT BUỘC `min-h-0` khi parent flex |

### 5.5. Responsive — điện thoại và màn thấp

Công thức đầy đủ: **`responsive-screens.md`** (không chép lại). Phần thuộc về bố cục trang:

- Khung "cao đúng một viewport" của §5.1–§5.3 là bố cục laptop / tablet. Ở điện thoại (`phone:`) trang CUỘN DỌC bình
  thường, mỗi box có chiều cao riêng — xoay ngang chỉ còn ~270px chiều cao nội dung, ép `h-full` + `overflow-hidden`
  là cắt mất nội dung (`responsive-screens.md §3.1`).
- Laptop thấp (1280×720 → viewport ~600px): khối nào cũng có SÀN chiều cao, thấp hơn sàn thì `<main>` cuộn (§3.3).
- Tooltip `title` ở §3.4 chỉ là phần BỔ SUNG cho chuột — con số rút gọn phải có đường xem khác trên máy chạm
  (không thông tin chỉ-hover, `ipad-responsive.md §7`).
- Màn đổi SỐ CỘT (`BoxGrid`), không đổi mật độ (`spacing-system.md §7`).

---

## 6. ⛔ Information Density per Region

### 6.1. Tỉ lệ vùng theo cấp

| Cấp page | Diện tích PRIMARY | SECONDARY | TERTIARY |
|---------|------------------|-----------|----------|
| Dashboard / analytics | ≥ 60% | 25-35% | ≤ 10% |
| Form / wizard | ≥ 70% (form fields) | 15-20% (preview/help) | ≤ 10% |
| List / table page | ≥ 75% (table) | 15-20% (filter sidebar) | ≤ 10% |
| Detail page | ≥ 60% (content) | 25-30% (sidebar meta) | ≤ 10% |

### 6.2. Nhồi không gian — RULE OF 3

Trong 1 panel (region), tối đa **3 mức** nội dung cùng cấp:

```
✅ ĐÚNG — 3 cấp rõ:
   [Title bold]
     [Sub-section label]
       [Data row]

❌ SAI — 5 cấp lồng:
   [Title]
     [Sub-title]
       [Sub-sub-title]
         [Sub-sub-sub-title]
           [Data]
```

Nếu cần > 3 cấp → tách thành panel/tab/dialog riêng.

---

## 7. Checklist trước khi commit page/panel

### Layout / Height
- [ ] Page wrapper: `<PageShell>` + `<PageBody>` — KHÔNG tự đệm, khe `gap-2` (`spacing-system.md §3`)
- [ ] Tab content: `h-full min-h-0 overflow-hidden`
- [ ] Panel: `h-full overflow-hidden border-2 border-border-strong`
- [ ] Panel header: `shrink-0`
- [ ] Panel body: `min-h-0 flex-1` + `overflow-y-auto` nếu cần scroll
- [ ] KHÔNG còn `calc(100vh-...)` magic number trong code

### Padding / Gap
- [ ] Chỉ dùng scale `1, 1.5, 2, 2.5, 3, 4` — KHÔNG arbitrary `p-[13px]`
- [ ] Đệm lồng nhau không tăng ngược, mặc định `p-2` mọi cấp (`spacing-system.md §4.3`)
- [ ] Mỗi cha một cỡ `gap`; thân hộp tràn mép hay đệm chọn theo nội dung (`spacing-system.md §4.2`)

### Border
- [ ] Panel ngoài cùng: `border-2 border-border-strong`
- [ ] Section trong panel: `border border-border-default`
- [ ] KHÔNG còn `border-border-default/40` `/60` faded
- [ ] Active state: vòng 2px primary bằng `shadow` (§4.1)
- [ ] Theme sáng không quầng / `text-shadow` / ngoặc góc — trang trí HUD chỉ qua `dark:` (§0b)

### Hierarchy & Density
- [ ] 1-2 vùng PRIMARY rõ (KPI dominant / chart chính)
- [ ] PRIMARY chiếm ≥ 50% diện tích viewport
- [ ] Mỗi cell số có `tabular-nums` — và KHÔNG có `num-mono` / `font-mono` (§3.3.1)
- [ ] Mỗi cell số dày dữ liệu có `title` tooltip full decimal + unit
- [ ] Tối đa 3 cấp nội dung lồng nhau

### Charts (link sang `chart-conventions.md`)
- [ ] Bar chart có `<LabelList formatter={labelInt}>` (integer + thousand separator)
- [ ] LabelList dùng `{...m.barLabel}` — KHÔNG `stroke` / `paintOrder` (quầng đen trên nền tối, `chart-conventions.md` §3.2.5)
- [ ] Tooltip có `formatter` đầy đủ decimal + unit
- [ ] Series color = scale `-5`, khai ở hằng token của feature (`chart-conventions.md` §1.2)

---

## 8. ⛔ Compound Layout Patterns (BẮT BUỘC khi lặp lại ≥ 2 nơi)

### 8.1. Filter Bar (segment + dropdown)

Khi 1 page có **SegmentToggle (scope) + Dropdown (category)** đứng cạnh nhau làm
filter cho dashboard / panel dữ liệu, BẮT BUỘC layout chuẩn:

```tsx
<div className="flex items-center gap-2">
  <SegmentToggle
    options={SCOPE_OPTIONS}
    value={scope}
    onChange={setScope}
    className="min-w-[280px]"   // ⛔ tối thiểu — KHÔNG hardcode `w-[300px]`
  />
  <Dropdown
    options={categoryOptions}
    value={category}
    onValueChange={setCategory}
    className="min-w-[148px]"
  />
</div>
```

**Quy tắc:**
- `gap-2` (KHÔNG `gap-3` `gap-4`)
- SegmentToggle: `min-w-[280px]` (cho phép grow — KHÔNG fixed `w-[300px]`)
- Dropdown: `min-w-[148px]`
- KHÔNG bọc `<div className="w-[300px]">` raw — dùng className prop của UI kit

### 8.2. Data Sidebar Selection (nhóm / danh mục / phân loại)

Sidebar cột trái chứa list item chọn-1, body chính cập nhật theo selection:

```tsx
<aside className="flex h-full min-w-[240px] flex-col overflow-hidden border-2 border-border-strong bg-bg-surface">
  <header className="shrink-0 bg-bg-subtle px-3 py-2.5">
    <Text size="tiny" weight="bold" className="text-fg-heading">
      {sidebarLabel}
    </Text>
    <Text size="extraTiny" className="text-fg-muted">
      {count} mục
    </Text>
  </header>
  <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
    {items.map((item) => (
      <SidebarItem key={item.id} {...item} selected={item.id === selectedId} />
    ))}
  </div>
</aside>
```

**Item pattern (selected state — L1 theo §4):**

```tsx
<Button
  aria-pressed={selected}
  skin="neutral"
  variant="ghost"
  className={cn(
    'w-full justify-start border-2 px-3 py-2',
    selected
      ? 'border-primary-5 bg-primary-5/15 text-link hover:bg-primary-5/15 hover:text-link'
      : 'border-border-default bg-bg-surface hover:border-primary-5/60'
  )}
  onClick={() => onSelect(item.id)}
>
  {item.label}
</Button>
```

**⛔ KHÔNG:**
- KHÔNG raw `<button>` cho sidebar item — dùng UI kit `<Button variant="ghost">`
- KHÔNG sidebar width < 240px (label bị cắt)
- KHÔNG sidebar width > 320px (lấn body) — trừ khi rich content (avatar + meta)
- KHÔNG quên `min-h-0` ở body container → list không scroll được

### 8.3. Detail Modal KPI Grid (3 cột)

Modal chi tiết (theo kỳ / theo mục) có **3 KPI tổng quan ở đầu**:

```tsx
<Modal title={title} size="lg" {...rest}>
  <div className="flex flex-col gap-3">
    {/* 1. KPI grid — PRIMARY, chiếm không gian lớn */}
    <div className="grid grid-cols-3 gap-2">
      <CompactKpiCard color="blue"   icon="…-bold" label="…" value={kpi1} unit="…" />
      <CompactKpiCard color="green"  icon="…-bold" label="…" value={kpi2} unit="…" />
      <CompactKpiCard color="yellow" icon="…-bold" label="…" value={kpi3} unit="…" />
    </div>

    {/* 2. Chart hoặc Table — SECONDARY */}
    <PlanActualChart ... />

    {/* 3. Detail list / breakdown — TERTIARY */}
    <DetailTable ... />
  </div>
</Modal>
```

**Quy tắc:**
- KPI grid: `grid grid-cols-3 gap-2` (thẻ ngang hàng cùng loại — `spacing-system.md §6`)
- Tối đa 3 KPI cards top (4+ → chuyển sang KPI strip horizontal)
- 3 region là 3 nhóm khác nhau → cha `flex flex-col gap-3`; KHÔNG tách bằng `mt-*` (margin không dàn trang — `spacing-system.md §6`)
- KPI value PHẢI có `unit` prop hiển thị bên cạnh (tỷ / mục / người …)

---

## 9. Cross-references

- Chart visual + label rules → `chart-conventions.md` (§3.2.5 mandatory bar label)
- Color tokens → `color-system.md`
- Font tokens → `font-system.md`
- Border radius default vuông → `tailwind-conventions.md`
- Responsive mọi cỡ màn → `responsive-screens.md`
- Component reuse (UI kit) → `reuse-first.md`
- Clean code (1 file = 1 component) → `clean-code-standards.md`

---

## 10. Khi vi phạm

- Border faded `/40` `/60` → fail review
- Magic `p-[13px]` `calc(100vh-…)` → fail review
- Bar chart không có LabelList → **block merge** (xem chart-conventions §3.2.5)
- Số liệu KHÔNG `tabular-nums` trong bảng/KPI → fail review
- Dựng lại `.num-mono` / gắn `font-mono` cho SỐ → **revert** (§3.3.1)
- 4+ cấp nội dung lồng → **revert**, tách panel
- PRIMARY chiếm < 30% diện tích → **revert** (mất focus)
