# Spacing System — padding · gap · hiển thị trong hộp

> **Nguồn DUY NHẤT** cho mọi câu hỏi "đệm bao nhiêu, cách nhau bao nhiêu, trong
> hộp thì hiện thế nào". `visual-hierarchy.md §1` chỉ còn nêu triết lý mật độ và
> trỏ về đây.
>
> Mọi con số dưới đây đọc từ CODE đang chạy (bảng `*_CLASSES` của từng component),
> không phải số mong muốn. Đổi một con số = đổi ở bảng của component đó, rồi sửa
> dòng tương ứng ở đây.

Kiểm tự động: `tests/policy/styling/spacing-policy.test.ts` (cổng chặn) + ESLint
`guard/spacing` (báo ngay trong editor) — xem §8.

---

## 1. Ba luật gốc

| # | Luật | Hệ quả |
|---|------|--------|
| 1 | **Đệm thuộc về HỘP sở hữu mép đó — mỗi mép chỉ một chủ.** | Trang không tự đệm (vỏ ngoài đã đệm). Con không đệm thêm cho mép cha đã đệm. |
| 2 | **Khe thuộc về CHA đang xếp các con** (`gap-*` trên flex/grid). | Con không tự đẩy nhau bằng `margin`. Một cha — một cỡ khe. |
| 3 | **Chỉ dùng thang cố định, viết đúng tên class của thang.** | Không `p-[13px]`, không `p-5`. Chế độ TV co khoảng cách bằng cách bắt đúng tên class (§7) — số ngoài thang không co. |

---

## 2. Thang khoảng cách

Đơn vị gốc `--spacing = 0.25rem` (4px).

| Class | px | Dùng cho |
|-------|----|----------|
| `0.5` | 2 | Tinh chỉnh quang học trong một control (icon ↔ chữ sát nhau) |
| `1` | 4 | Cụm DÍNH: icon + nhãn, nhóm badge, tiêu đề + số đếm |
| `1.5` | 6 | Nhãn ↔ ô nhập (`FormItem`); đệm dọc của thanh tiêu đề gọn |
| **`2`** | **8** | **MẶC ĐỊNH** — đệm thân hộp, khe giữa mọi thứ ngang hàng |
| `3` | 12 | Khe giữa các NHÓM trong một hộp; đệm của hộp "thoáng" (relaxed) |
| `4` | 16 | Lề vỏ ngoài; thân modal / drawer; khe giữa các ô của form |
| `6` | 24 | CHỈ trong component kit đã liệt kê ở §5 (ConfirmDialog, `FormRow gap={6}`) và layout đăng nhập |

- Bậc lẻ `2.5`, `3.5` chỉ xuất hiện BÊN TRONG control (nút, ô bảng, tab) để ra
  đúng chiều cao theo Figma. Code trang không dùng.
- `5`, `7` trở lên: không dùng ở code trang. Cần to hơn `4` nghĩa là đang thiếu
  một hộp — tách khối ra thay vì nới khoảng trắng.

---

## 3. Bốn tầng — ai đệm, ai tạo khe

```
┌ VỎ ───────────────────────────────────────────────┐  <main> của AppShellLayout
│ px-4 py-4   (TV: px-2 py-2)                        │  SHELL_GUTTER_X / SHELL_GUTTER_Y
│ ┌ TRANG ─────────────────────────────────────────┐ │  <PageShell>  KHÔNG đệm · gap-2
│ │ TitleScreen                                    │ │
│ │ Toolbar                                        │ │
│ │ ┌ THÂN TRANG ────────────────────────────────┐ │ │  <PageBody>   KHÔNG đệm · gap-2
│ │ │ ┌ HỘP ──────────┐ gap ┌ HỘP ──────────┐    │ │ │  <BoxGrid>    gap-2 | 3 | 4
│ │ │ │ header  p-2   │     │               │    │ │ │  <BoxPanel> / <PanelCard> / <Surface>
│ │ │ │ thân    §4    │     │               │    │ │ │
│ │ │ │ footer  p-2   │     │               │    │ │ │
│ │ │ └───────────────┘     └───────────────┘    │ │ │
│ │ └────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

| Tầng | Component | Đệm | Khe giữa các con | Nguồn |
|------|-----------|-----|------------------|-------|
| Vỏ | `<main>` (`AppShellLayout`) | `px-4 py-4`, TV `px-2 py-2` | — | `shared/constants/layout.constants.ts` |
| Vỏ | Header | cùng `SHELL_GUTTER_X` với `<main>` | — | cùng hằng số → mép header thẳng mép nội dung |
| Trang | `PageShell` | **không** | `gap-2` | `PAGE_SHELL_VARIANT_CLASSES` |
| Trang | `PageBody` | **không** | `gap-2` (`stack`), tắt bằng `stack={false}` | `PAGE_BODY_*` |
| Trang | `Toolbar` | `none` (mặc định) · `sm` `px-2 py-1.5` · `md` `p-2` · `lg` `px-3 py-2.5` | `gap-2` | `TOOLBAR_PADDING_CLASSES` |
| Lưới | `BoxGrid` | **không** | `sm` `gap-2` (mặc định) · `md` `gap-3` · `lg` `gap-4` | `BOX_GRID_GAP_CLASSES` |
| Hộp | xem §4 | | | |

**Trang KHÔNG BAO GIỜ tự thêm đệm ngoài.** `<main>` đã cấp 16px; thêm `p-2` vào
`PageShell` là cộng dồn thành 24px và mép trang lệch khỏi mép header.

---

## 4. Trong hộp hiển thị thế nào

### 4.1. Hộp nào tự đệm thân, hộp nào không

| Hộp | Header | Thân (mặc định) | Footer | Đổi bằng |
|-----|--------|-----------------|--------|----------|
| `BoxPanel` | `p-2`, khe tiêu đề ↔ action `gap-4`, các action `gap-3` | **KHÔNG đệm** | `p-2` | `bodyClassName` |
| `BoxPanel variant="cyber"` | `DetailPanelHeader` (`px-3`, màn < lg `px-2`) | **KHÔNG đệm** | `p-2` | `bodyClassName` |
| `PanelCard` | theo `density`: `px-1.5 py-0.5` / `px-2 py-1` / `px-3 py-1.5` | `p-1.5` / **`p-2`** / `p-3` | `px-1.5 py-1` / `px-2 py-1.5` / `px-3 py-2` | `density` = `compact` \| `default` \| `relaxed`; `flushBody` → `p-0` |
| `Surface` | — | `none` (mặc định) · `sm` `p-2` · `md` `p-3` · `lg` `p-4` | — | `padding` |
| `HudInfoBox` | `px-2.5 py-2` | `p-2` | — | `bodyClassName` |
| `BoxInfo` | `px-2 py-1.5` | `p-2`, các dòng `gap-2` | — | — |
| `SectionHeader` (thanh tiêu đề) | `px-2 py-1.5`, `gap-2` | — | — | — |
| `SummaryCard` | — | `sm` `px-2 py-2` · `md` `px-3 py-2` · `lg` `px-4 py-3` | — | `size` |
| `CompactKpiCard` | — | `xs` `px-2 py-1` · `sm` `px-2.5 py-1.5` · `md` `px-3 py-2` · `lg` `px-4 py-3` | — | `size` |

`BoxPanel` cố ý để thân trần: nội dung phổ biến nhất của nó là bảng / cây, thứ
phải chạm mép. Vì vậy **chính bạn quyết định** thân hiển thị kiểu nào — theo bảng dưới.

### 4.2. Chọn kiểu thân theo NỘI DUNG

| Nội dung trong hộp | Thân | Viết |
|--------------------|------|------|
| **Bảng, cây, danh sách dòng, Splitter, canvas** — thứ có đường kẻ / nền riêng chạy hết bề ngang | **Tràn mép** (không đệm). Đệm nằm trong từng ô. | `<BoxPanel bodyOverflow="hidden">` + con `className="min-h-0 flex-1"`; `PanelCard flushBody` |
| **Chữ, cặp nhãn–giá trị, hàng cài đặt, form ngắn** | **Đệm `p-2`**, các nhóm cách nhau `gap-3` (hoặc `gap-2` khi các dòng cùng loại) | `<div className="flex flex-col gap-3 p-2">` |
| **Biểu đồ** | **Đệm `p-2`** — trục và nhãn không được dính viền | `bodyClassName="p-2"` |
| **Form dài** (nhiều ô) | **Đệm `p-3`**, khe do `<Form>` / `<FormGrid>` lo (`gap-4`) | `bodyClassName="p-3"` |
| **Trạng thái rỗng / đang tải / lỗi** | Canh giữa, đệm `p-3`–`p-4` | `EmptyState`; `PanelCard` tự lo (`state: p-3`) |
| **Thanh công cụ trong hộp** | Hàng riêng, có vạch ngăn, không cuộn theo thân | `<Toolbar padding="sm" border="bottom">` đặt TRÊN vùng cuộn |
| **Hộp lồng trong hộp** | Hộp trong: `Surface` / `PanelCard`, đệm **≤** đệm hộp ngoài, viền `hairline` | xem §4.3 |

Dấu hiệu chọn sai: bảng nằm trong thân `p-2` (đường kẻ hụt 8px hai bên, cột lệch
với header hộp) hoặc đoạn chữ nằm trong thân trần (chữ dính sát viền).

### 4.3. Lồng nhau — đệm không được tăng ngược

```
✅ ĐÚNG                              ❌ SAI
<main>  px-4 py-4                    <main>  px-4 py-4
 └ PageShell   (0)                    └ PageShell  p-2        ← cộng dồn
    └ BoxPanel thân p-2                   └ BoxPanel thân p-4 ← to hơn mức cần
       └ Surface  p-2                        └ Surface  p-4   ← trong to hơn ngoài
          └ ô / control  px-2 py-1
```

- Càng vào trong đệm **bằng hoặc nhỏ hơn**. Mặc định mọi cấp là `2`.
- Hai hộp lồng nhau không dùng hai viền đậm: hộp ngoài `strong`, hộp trong `hairline`.
- Quá 3 cấp hộp → tách thành tab, panel bên cạnh hoặc dialog.

---

## 5. Lớp phủ và form

| Component | Header | Thân | Footer | Ghi chú |
|-----------|--------|------|--------|---------|
| `Modal` / `CustomModalLayout` | `px-4` | `px-4 py-4` | `px-4 py-3`, nút `gap-3` | `size="full"` → khung `px-10` |
| `FormModal` | như `Modal` | `p-4`, form `gap-4` | nút `gap-4` | |
| `Drawer` | `px-4 pt-3.5 pb-3` | `p-4` | `px-4 py-3`, nút `gap-3` | |
| `ConfirmDialog` | — | `px-6 pb-5 pt-7`, `gap-4` | nút `gap-2`–`gap-3` | Hộp thoại nhỏ canh giữa — nơi duy nhất dùng bậc `5`–`7` |
| Popover / menu (`popup-surface`) | — | mỗi dòng `px-3 py-2.5`, `gap-3` | — | |
| `Tooltip` | — | `px-3 py-2` / `px-2.5 py-2` | — | |
| `Toast` | — | `p-3`, `gap-3`–`gap-4` | — | |

| Form | Khe |
|------|-----|
| `Form`, `FormGrid`, `FormSection` — giữa các Ô | `gap-4` |
| `FormItem` — nhãn ↔ ô ↔ dòng lỗi | `gap-1.5` |
| `FormActions` — giữa các nút / cách ô cuối | `gap-3` / `pt-4` |
| `FormRow` | prop `gap` = `2` \| `3` \| `4` \| `6` |

Lớp phủ đệm `4` chứ không phải `2`: nó nổi tách khỏi trang nên cần mép thở, và
người dùng chỉ làm MỘT việc trong đó. Đó là ngoại lệ có chủ đích của luật mật độ,
đã nằm sẵn trong component — code trang không tự đặt lại.

---

## 6. Chọn `gap` theo QUAN HỆ giữa hai phần tử

| Quan hệ | Khe | Ví dụ |
|---------|-----|-------|
| Hai phần của CÙNG một thứ | `gap-1` (`gap-0.5` nếu rất sát) | icon + nhãn, tiêu đề + badge đếm, nhóm badge |
| Nhãn và control của nó | `gap-1.5` | `FormItem`, icon + chữ trong nút |
| **Ngang hàng, cùng loại** | **`gap-2`** | các hộp trong trang, các nút trong toolbar, các dòng danh sách |
| Các NHÓM khác nhau trong một hộp | `gap-3` | các hàng cài đặt, avatar ↔ khối tên, cụm action ở header hộp |
| Các ô của form · tiêu đề ↔ cụm action · cụm lớn | `gap-4` | `Form`, header `BoxPanel` |

- **Một cha — một cỡ khe.** Hai cỡ khe trong cùng một flex nghĩa là đang có hai
  nhóm: bọc mỗi nhóm vào một cha riêng.
- `gap-x-*` khác `gap-y-*` chỉ dùng cho **lưới nhãn–giá trị tự xuống dòng**
  (`gap-x-6 gap-y-2`): khe ngang tách cột, khe dọc là khe dòng. Flex một chiều
  không tách trục.
- `space-x-*` / `space-y-*`: không dùng — `gap` làm đúng việc đó và không vỡ khi
  phần tử ẩn/hiện.
- **`margin` không phải công cụ dàn trang.** Chỉ được: `m*-auto` (đẩy về một
  phía) và tinh chỉnh quang học ≤ `2` (vd `mt-0.5` hạ icon cho thẳng dòng chữ).

---

## 7. Chế độ TV và cảm ứng

- **TV tự co khoảng cách lớn.** `src/styles/modes/tv.css` chia `p-3 / p-4 / p-6`,
  `px-*`, `py-*`, `gap-3 / gap-4 / gap-6` cho `--ui-scale` (chữ to lên thì khoảng
  trắng nhường chỗ). Bậc `2` trở xuống giữ nguyên. Nó bắt **đúng tên class**, nên:
  - `p-[16px]`, `p-5`, `style={{ padding: 16 }}` → KHÔNG co → lệch nhịp ở TV.
  - Không tự viết `tv:p-*` trong trang. Chỉ vỏ ngoài (`SHELL_GUTTER_*`) có bậc `tv:`.
- **Cảm ứng không đổi khoảng cách của trang.** Control tự thu/nới bằng `touch:`
  trong bảng size của nó (`Button`, `Dock`); vùng chạm nới bằng lớp `::after`
  trong suốt chứ không bằng cách thổi đệm. Xem `ipad-responsive.md`.
- **Không đổi đệm theo breakpoint ở code trang** (`md:p-4`, `lg:gap-6`, `phone:p-2` — mọi biến thể trên
  token khoảng cách đều bị bài kiểm chặn). Mật độ là hằng số; thứ đổi theo bề ngang là SỐ CỘT (`BoxGrid`), không phải
  khoảng trắng.
- **Neo mép màn thì cộng vùng an toàn.** Đệm / `bottom` / `top` của phần tử dính mép màn viết
  `pb-[calc(1rem+var(--safe-b,0px))]` — trên laptop `--safe-*` = 0 nên ra đúng bậc cũ; đây là giá trị tuỳ ý DUY NHẤT
  được miễn (§8).
- **Điện thoại cũng dùng thang này.** Không có bậc đệm riêng cho `phone:` ở code trang; lớp nổi do kit tự đệm
  (bottom-sheet thân `p-4`, nơi dùng KHÔNG cộng thêm — `responsive-screens.md §4.1`). Công thức theo nhóm màn:
  `responsive-screens.md §3`.

---

## 8. Kiểm tự động

`tests/policy/styling/spacing-policy.test.ts` — chạy trong `npm test`:

| Phạm vi | Luật |
|---------|------|
| Toàn `src/` | Không có giá trị khoảng cách tuỳ ý (`p-[…]`, `gap-[…]`, `m-[…]`) ngoài danh sách file kit đã duyệt — **trừ đệm cộng vùng an toàn** (`pb-[calc(1rem+var(--safe-b,0px))]`: giá trị chứa `var(--safe-t\|r\|b\|l,`), cách DUY NHẤT tránh vạch Home / tai thỏ (`ipad-responsive.md §6`) |
| Code trang (`src/app/pages`, `src/features`) | Đệm chỉ ở bậc `0 · 0.5 · 1 · 1.5 · 2 · 2.5 · 3 · 4` |
| Code trang | `gap` / `gap-y` ≤ `4`; `gap-x` ≤ `6` |
| Code trang | `margin` chỉ `auto` hoặc ≤ `2`; không `space-x/y` |
| Code trang | Không có bậc responsive cho khoảng cách (`md:p-*`, `lg:gap-*`, `tv:p-*`…) |
| Kit | `PageShell`, `PageBody`, `BoxGrid` không chứa utility đệm nào; `<PageShell className>` không mang đệm |
| Kit ↔ tài liệu | Bảng đệm của `Surface`, `Toolbar`, `PanelCard`, `BoxGrid` và `SHELL_GUTTER_*` khớp đúng con số ghi ở §3–§4 |

ESLint (gác `guard/spacing` ở `scripts/eslint/syntax-guards.mjs`, file trong `src/features/**` và `src/app/pages/**`)
báo ngay trong editor cho ba lỗi hay gặp nhất: giá trị tuỳ ý, đệm ≥ `5`,
`<PageShell className="… p-*">`.

Thêm một file kit CẦN giá trị tuỳ ý (hình học khớp Figma tới từng px): thêm đường
dẫn vào `ARBITRARY_ALLOWLIST` trong bài kiểm, kèm lý do ở
`docs/notes/components/`.

---

## 9. Sai thường gặp

| ❌ Sai | Vì sao | ✅ Đúng |
|-------|--------|--------|
| `<PageShell className="p-2">` | Cộng dồn với lề của `<main>` | Bỏ — vỏ đã đệm |
| Bảng trong `bodyClassName="p-2"` | Đường kẻ hụt mép, cột lệch header hộp | Thân tràn mép (`bodyOverflow="hidden"`) |
| Đoạn chữ / form trong `BoxPanel` thân trần | Chữ dính viền | Bọc `flex flex-col gap-3 p-2` |
| `gap-4` giữa các hộp ngang hàng | Trang rời rạc | `gap-2` (hoặc `<BoxGrid>`) |
| `p-4` / `p-6` cho thân hộp trong trang | Trong to hơn ngoài | `p-2`; form dài `p-3` |
| `mt-4` để tách hai khối | Khe phụ thuộc thứ tự phần tử | `gap-*` trên cha |
| `p-[13px]`, `gap-[10px]` | Ngoài thang, TV không co | Bậc gần nhất của thang |
| Trộn `gap-1` và `gap-4` trong một hàng | Hai nhóm bị gộp một cha | Tách hai cha |
| `md:p-4 lg:p-6` trong trang | Mật độ đổi theo màn hình | Một bậc cố định |

---

## 10. Checklist

- [ ] Trang bọc bằng `<PageShell>` / `<PageBody>`, không tự đệm ngoài
- [ ] Mỗi hộp: thân tràn mép HAY đệm đã chọn theo §4.2
- [ ] Đệm lồng nhau không tăng ngược; mặc định `2`
- [ ] Mỗi cha một cỡ `gap`, chọn theo quan hệ ở §6
- [ ] Không `margin` dàn trang, không giá trị tuỳ ý, không bậc responsive cho khoảng cách
- [ ] Modal / drawer / form: dùng component, không tự đặt lại đệm
