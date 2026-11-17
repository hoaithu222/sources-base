# Ghi chú component — data-display / table (`src/shared/ui/data-display/table/`)

> Lý do thiết kế KHÔNG hiển nhiên của cụm Table (`Table.tsx`, `parts/`, `table.theme.ts`, `hooks/`),
> tách khỏi code theo `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có.

## Table

- **`fill` cần chuỗi chiều cao 4 mắt xích**: `<PageBody overflow="hidden" stack={false}>` → `<BoxPanel
bodyOverflow="hidden">` → `<Table fill>` → vùng cuộn `min-h-0 flex-1`; thiếu một mắt là bảng cao bằng nội dung.
- **`fill` chỉ ăn khi CHA là flex column**: cha `block` có chiều cao xác định thì dùng `className="h-full"`.
  Default `false` để mọi bảng đang chạy giữ nguyên.
- **`touch:overscroll-contain` phải có tiền tố `touch:`**: thiếu thì iPad vuốt hết bảng là Safari "lùi trang"; để
  trần thì chặn cả chuỗi cuộn của CHUỘT (`ipad-responsive.md §3.0`, `§4`).
- **`layout` KHÔNG có default ở destructuring** để `effectiveLayout` suy theo `resizable` (bật ⇒ `fixed`); truyền tay
  thì thắng, kể cả `auto`. Đừng viết `resizable ? 'fixed' : layout` — đè lựa chọn của người gọi.
- **`resizable` mặc định `true`** nên bảng chạy `table-layout: fixed`; cần cột tự co theo nội dung thì
  `layout="auto"` (kéo cột không ăn chắc vì `<col width>` chỉ là gợi ý) hoặc `resizable={false}`.
- **Bảng rộng ở điện thoại**: vùng cuộn `overflow-auto` giữ header dính; muốn cột đầu dính khi cuộn ngang thì khai `frozen`
  cho cột đó (không cần `width` khi chỉ ghim một cột). Nút sắp xếp ở header và tay cầm kéo-thả nới hộp bấm `::after` trên cảm ứng.
- **`scrollNav`**: lớp bọc `relative` chỉ dựng khi bật (bọc vô điều kiện đổi DOM mọi bảng); nút nằm NGOÀI mép —
  khung cắt `overflow-hidden` thì `scrollNavClassName="inset-x-0"`. Mỗi nhịp đi ĐÚNG một cột.

## table.theme — bảng nhập liệu (`TABLE_ENTRY_*`)

- **Luật + cách ghép ở `docs/rules/display/data-entry-table.md`** (mẫu chạy được: `/demo/nhap-lieu`); mục này chỉ giữ
  lý do của bảng class.
- **Không phải prop của `Table`**: `TABLE_ENTRY_ROW_HEIGHT` → `rowHeight`, `TABLE_ENTRY_ROW_CLASSES` → `rowClassName` —
  bảng chỉ đọc không trả giá cho tính năng nhập, và feature ghép trạng thái dòng theo dữ liệu của nó.
- **Một hue cho rê / đang nhập / chọn** (`primary-5` 6 · 10 · 14% pha ĐỤC với `bg-surface` qua `color-mix`): nền dòng có ô ghim
  chồng lên nên không được trong suốt; trộn hue (dòng nhập xanh dương, rê xanh lá) là lỗi đã gặp ở dự án gốc.
- **`dirty` là tam giác `::after`, không đổi nền ô**: nền dành cho trạng thái DÒNG; bọc control nên `relative block`.
- **`TABLE_INLINE_EDIT_CLASS` chỉ là móc**: CSS KHÔNG layer ở `src/styles/overrides/table-inline-edit.css` để thắng
  utility của khung `group/field` (dòng chưa rê / chưa focus, chừa ô `aria-invalid`); chỉ máy có con trỏ thật.

## TableBody — nền dòng · ô ghim

- **Nền / hover dòng phải màu ĐẶC** (`color-mix` primary-5 6% với `bg-surface`), không alpha: ô ghim dùng `bg-inherit`, nền
  dòng trong suốt thì ô ghim để lộ cột cuộn phía sau khi kéo ngang. HUD tối CHỒNG dốc `background-image` lên màu đặc (mốc
  PX — ô ghim `bg-[image:inherit]` vẽ dốc theo hộp CỦA NÓ, mốc % sẽ lệch); vạch trái rê = `first:inset-shadow` ở ô.
- **`rowClassName` tô dòng (đang chọn, cảnh báo) cũng ĐẶC và tự khai `hover:`**: không thì hover xanh mặc định của dòng
  đè mất màu (mẫu demo `DataDisplaySection`).
- **Vạch trái dòng đang chọn dùng `[&>td:first-child]:inset-shadow-[…]`**, không `shadow-[…]`: `--tw-inset-shadow` cộng được
  với bóng mép cột ghim (`TABLE_FROZEN_EDGE_CLASSES`, `--tw-shadow`); hai `shadow-[…]` thì cái sau đè cái trước.
- **`rowStyle` và màu chữ**: `<td>` đã có `text-fg-heading` nên `color` ở `rowStyle` không xuống ô; muốn cả dòng
  đổi màu thì kèm `rowClassName` trả `'[&>td]:text-inherit [&>td_*]:text-inherit'`.
- **Ô ghim có `border-b` riêng, mép phải là SHADOW**: `border-collapse` vẽ viền theo LƯỚI nên ô `sticky` mất viền dưới
  của `<tr>` và bỏ lại `border-r` khi cuộn ngang → mép = `inset -1px` + bóng trong `--tw-shadow` (`TABLE_FROZEN_EDGE_CLASSES`).
- **Cột ghim cần `width` số khi còn cột ghim khác phía sau**: `left` cột sau = tổng bề rộng cột trước, đọc từ khai
  báo; thiếu thì cột sau âm thầm thôi ghim → DEV `console.warn` (`warnUnpinnedFrozenColumns`).

## TableBody — sọc xen kẽ (`striped`)

- **Tô theo CHỈ SỐ dòng dữ liệu** (dòng thứ 2, 4, 6… = `index % 2 === 1`), không `:nth-child(even)`: dòng nhóm / `fullRowCell` /
  dòng đệm ảo hoá xen giữa sẽ làm lệch nhịp CSS. Ảo hoá ngoài (truyền lát `data` + `padTop`) phải cắt lát từ chỉ số CHẴN, không
  thì sọc đảo khi cuộn.
- **Nền sọc ĐẶC** (`bg-subtle` sáng · `hud-5` 7% trộn `bg-surface` tối) vì ô ghim kế thừa nền dòng; class sọc đứng TRƯỚC
  `rowClassName` nên dòng đang chọn / cảnh báo vẫn đè được. Mặc định TẮT (giữ nguyên giao diện các bảng cũ).

## TableBody — bấm · kéo-thả · ô rỗng

- **`onRowDoubleClick`**: trình duyệt bắn `onRowClick` 2 lần TRƯỚC khi bắn đúp, nên handler click phải chạy lại an
  toàn. `<td data-col-key>` cho biết cột dưới con trỏ khi mở chế độ sửa on-cell.
- **Kéo-thả chỉ qua `<TableDragHandle>`** (không cả dòng) để không xung đột click / nhập inline; tay cầm chặn nổi
  bọt nên không kích hoạt `onRowClick`. Tuỳ chọn sensor là hằng module vì `useSensor` memo theo reference.
- **Ô rỗng**: `emptyMessage` là chuỗi → `EmptyState` + `TableEmptyIllustration`; là node → render nguyên (màn tự dựng
  trạng thái riêng thì truyền node).

## TableHead

- **Vạch header = `box-shadow` INSET inline, gộp MỘT chuỗi** (`headerCellShadow`), không `border`: Chrome bỏ vẽ viền ô
  sticky khi cuộn; hai `shadow-[…]` thì đè nhau. Vạch đáy đứng ĐẦU chuỗi (vẽ trên cùng) để vạch dọc không khía nó.
- **Nền header ĐẶC, theo theme** (`bg-subtle` ở cả hai theme — token tự lật) vì `<th>` sticky đè dòng
  cuộn. Ray đáy LUÔN có, qua biến khai ở `TABLE_CLASSES` (box-shadow inline không nhận `dark:`): sáng 2px `--table-rule`
  (`border-strong` pha 50% `fg-faint` cho nét) · tối `--table-head-rule` = lõi 1px `hud-4` + 1px `hud-4` 45% + quầng ngắn.
- **KHÔNG thêm `relative` vào `<th>`**: nó đè `sticky` làm header thôi cố định khi bảng bật resizable; `sticky` đã là
  positioned element nên tay cầm kéo `absolute` neo đúng vào `<th>`. Ô ghim `z-20`, ô thường `z-10`.
- **Vùng bắt resize nằm TRỌN trong ô ở mép phải** (vạch nhìn thấy vẫn mảnh): nhô ra ngoài thì `<th>` kế tiếp
  (`sticky`, một stacking context) phủ lên và ăn mất pointer.
- **Header 2 tầng**: `table-fixed` chỉ đọc bề rộng ở DÒNG ĐẦU (toàn ô `colSpan`) nên bề rộng khai qua `<colgroup>`;
  tầng dưới có `top` = chiều cao THẬT của tầng trên (`ResizeObserver`). Giữa hai tầng LUÔN có vạch 1px.
- **Nút sort phủ CẢ ô** (`after:absolute after:inset-0`, neo vào `<th>` sticky — nút KHÔNG được `relative`, có là lớp phủ
  chỉ ôm chữ): bấm phần đệm cũng sắp, vòng focus ôm ô. `after:-z-10` hạ lớp phủ DƯỚI chữ và tay cầm resize.

## TableFooter

- **`sticky` đặt trên từng `<td>`, không trên `<tr>`**: trong `border-collapse`, `position` trên `<tr>` bị nhiều trình
  duyệt bỏ qua. Ô GHIM sticky cả hai chiều, `z` cao hơn ô thường để cuộn ngang không bị ô tổng khác trườn lên.
- **Bảng rỗng KHÔNG dựng `<tfoot>`**: tổng của 0 dòng chỉ là một hàng số 0 đè lên chỗ báo "chưa có dữ liệu".
- **Vạch dọc ô tổng chỉ tô cạnh phải** (`TABLE_FOOTER_CELL_DIVIDER_CLASSES`): class màu viền 4 cạnh đứng sau trong
  `cn()` bị tailwind-merge coi là đè `border-t-border-strong` và xoá mất vạch trên đậm.
- **`TABLE_FOOTER_BORDER_CLASSES` đứng SAU class vạch dọc trong `cn()`**: cùng lý do — ô có `columnDividers` mới giữ
  được cả vạch dọc lẫn vạch tổng đậm.
- **`tabular-nums` khai tường minh** (`visual-hierarchy.md §3.3`): dòng tổng gần như luôn là số, phải thẳng cột với
  ô số ở body; `globals.css` đã đặt sẵn trên `body` nên đây là chốt chặn.
- **Vạch trên ĐỐI XỨNG ray đáy header** (đổi một bên thì đổi bên kia): sáng `border-t-2 border-t-(--table-rule)` (test khoá);
  tối `dark:border-t-0` + `inset-shadow` lõi / 45% / quầng hắt xuống (KHÔNG `shadow-[…]` — ô ghim cuối mang `--tw-shadow`).

## useColumnResize

- **`pointercancel` BẮT BUỘC**: hệ điều hành có thể huỷ chuỗi pointer giữa chừng; thiếu nó thì cột dính theo ngón
  tay và `<body>` kẹt con trỏ `col-resize` (cùng lý do ở `surfaces/splitter/useSplitterDrag.ts`).
- **Class `splitter-resizing-x` trên `<body>`** ép cursor `col-resize` TOÀN trang khi kéo; dùng chung với `Splitter`.
- **Width override lưu theo KEY cột** (không theo vị trí) nên đổi `columns` giữa chừng vẫn giữ bề rộng đã kéo;
  `minWidth` là sàn khi kéo.
- **Chốt bề rộng MỌI cột khi bắt đầu kéo** (số đo mới thắng số cũ, lấy cả phần lẻ — `offsetWidth` làm tròn làm tổng lố
  vài px → thanh cuộn ngang): `table-layout: fixed` chia phần dư của `<table>` cho mọi cột nếu không chốt.
- **Cột ĐỆM cuối** (`TABLE_FILLER_COLUMN`, chỉ khi mọi cột đã chốt px + `fixed`): không `width` = "auto" nên hút phần dư khi
  tổng < khung; tổng > khung thì `<table>` tự rộng ra (fixed lấy max) → cuộn ngang. Không vạch dọc giáp nó (lố 0,5px).
- **Chỉ nút chuột chính** bắt đầu kéo; ô đệm `aria-hidden`, header của nó KHÔNG `data-col-key` (khỏi bị chốt px).

## useTableScrollFit

- **Dòng tổng sát đáy = ô đệm DỌC** (`<tbody aria-hidden>` ngay trước `<tfoot>`), cao = phần trống của vùng cuộn: `sticky`
  chỉ đẩy dòng tổng LÊN, không kéo xuống được; `<table>` `h-full` thì trình duyệt chia phần dư cho mọi dòng (dòng cao ra).
- **Đo khi ô đệm tạm = 0**: vùng cuộn cao theo nội dung (không `fill`, cha không có chiều cao) thì đệm về 0, không tự giữ
  số cũ. Chiều cao lấy `getComputedStyle` (px layout có phần lẻ — rect bị `transform` của Modal đang mở co giãn).
- **Ô đệm `box-content`**: nửa viền kề (dòng trên, vạch tổng 2px) nằm NGOÀI chiều cao ghi vào — `border-box` thì bảng
  hụt 0,5–1,5px. Làm tròn XUỐNG theo 1/64px: lố dù 1px là hiện thanh cuộn dọc.
- **Ghi style thẳng trong callback `ResizeObserver`** (không setState): áp trước lần vẽ, không render lại bảng; không
  observe chính `<table>` (đổi đệm sẽ tự kích lại → lỗi "ResizeObserver loop").
- **`scroll-padding` = chiều cao header / dòng tổng**: `scrollIntoView`, focus bàn phím chừa chỗ phần dính. Focus bàn
  phím (`:focus-visible`) còn kéo CẢ dòng vào vùng nhìn; bấm chuột thì không (cuộn giữa nhấn / nhả làm mất cú bấm).
- **Gắn theo NODE vùng cuộn** (ref callback trả hàm dọn, React 19): bật / tắt `scrollNav` / `sortable` dựng lại vùng cuộn
  thì observer gắn lại; ref callback có hàm dọn nên tự gọi `scrollContainerRef(null)` khi tháo.
