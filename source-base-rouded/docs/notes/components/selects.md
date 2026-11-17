# Ghi chú component — selects (`src/shared/ui/selects/`)

> Lý do thiết kế KHÔNG hiển nhiên của từng component, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có. Giữ focus ô tìm kiếm / khớp bỏ dấu của `Dropdown`: `search-matching.md §3–§5`.

## ChoiceTiles

- **Nhóm radio Radix, không phải nút tự dựng**: ← → đi + chọn, Tab vào đúng ô đang chọn, trình đọc màn hình đọc
  "radio, 2 trên 3" — nút rời với `aria-pressed` mất cả hai.
- **Đang chọn = `outline` cách 2px, không `ring-offset`**: vành offset tô màu nền, lộ ở tối / trên nền kính.
  ⚠️ Ô `swatch` mang `outline-none` (đặt `--tw-outline-style: none`) nên trạng thái chọn phải kèm `outline-solid`.
- **Focus = quầng `ring` mờ chồng thêm**: focus bàn phím thường nằm trên ô đang chọn — đổi màu outline sẽ không phân
  biệt được hai trạng thái.
- **`fill` là chuỗi class LITERAL** nơi gọi truyền (Tailwind chỉ quét literal) — không ghép tên màu động.

## Dropdown

- **Radix LUÔN controlled** (rỗng → `EMPTY_SENTINEL`): `undefined` làm Radix rơi về kho riêng, tick cũ còn mà
  chọn lại không phát `onValueChange`. Chỉ có `defaultValue` thì Dropdown tự giữ state cho nhãn / ✕ / tick.
- **Nuốt `''` khi panel đóng**: trong `<form>` Radix render `<select>` ẩn không option, RHF reset từ ngoài làm
  nó phát `onValueChange('')` xoá giá trị vừa đổ; lúc đóng người dùng không tạo được `''` hợp lệ.
- **`tabIndex` của panel**: không `searchable` → `-1` để Radix có chỗ đặt focus (không thì focus kẹt trên trigger
  đã bị ẩn khỏi cây trợ năng); `searchable` → không focus được để Radix không giật focus khỏi ô tìm.
- **Chỉ dựng option khi mở**: đóng thì không map options, tránh hàng trăm `<Item>` mỗi Dropdown khi bảng
  re-render. Vùng cuộn là `div` con của Viewport vì Radix ẩn scrollbar của `[data-radix-select-viewport]`.
- **Dòng option**: `title` gốc thay `<Tooltip>` (item Radix tự nghe pointer/keyboard); `tone` là token theo theme
  (`text-success`… — `success-5` chỉ ~1.5:1 trên nền sáng), giữ màu cả khi highlight. `cn()`: tone rồi `hidden`.
  Dark: dòng đang chọn bật luôn vạch + dải sáng `::before` của `POPUP_ITEM_CLASS`, chữ / tick phát sáng theo `--row-tone`
  (tone đổi cả `dark:before:bg-*`) — không chép gradient riêng, dải sáng của panel chỉ có MỘT nguồn.
- **Panel không tràn màn**: vùng cuộn `max-h-[min(300px,calc(var(--radix-popper-available-height)-3rem))]` (biến Radix
  chung cho Select / Popover / Menu) — màn ngang 390px cao thì danh sách cuộn trong phần còn lại; `MultiSelect` /
  `DropdownTreeSelect` thêm `collisionPadding={8}`, cây thì `max-w` màn − 1rem.
- **✕ bắt ở `onPointerDown`** (trigger và `clearInList`): Radix chốt lựa chọn ở pointer-down, đợi `click`
  là muộn. Nhãn trigger tự tính (`Select.Value` cache nhãn cũ, không reset khi clear); mũi tên xổ luôn hiện.

## MultiSelect

- **Popover non-modal**: hai lớp modal Radix lồng trong Dialog nuốt cú click ra ngoài đầu tiên. Đổi lại
  scroll-lock của Dialog khoá wheel nên `attachWheelScroll` tự cuộn bằng listener non-passive.
- **✕ chip / ✕ xoá tất cả là `<span role="button">`** + `stopPropagation` ở click lẫn pointerdown: không
  lồng `<button>` trong trigger button, và Popover không toggle khi gỡ.
- **Trigger `min-h-*`, không `h-*`** vì chip xuống dòng làm trigger cao thêm. Chip `min-w-0 max-w-full` +
  nhãn `truncate` để chip hẹp thì cắt "…" thay vì ngắt chữ (chip cao gấp đôi); ✕ `shrink-0`.
- **"Chọn tất cả" lấy `filteredOptions`** (mục đang hiển thị, bỏ `disabled`) và union với lựa chọn hiện có:
  gõ tìm rồi chọn-tất-cả không được âm thầm bỏ chọn mục ngoài bộ lọc.
- **Dòng option là `<label>` thường**, không phải Radix Item nên không có `data-highlighted` → ánh xạ
  `hover:` sang đúng treatment của panel dùng chung; dòng `data-disabled` giữ `opacity-100` vì Checkbox tự mờ.
  Dark: dòng đã tick (`has-[:checked]`) giữ vạch + dải sáng như Dropdown.
- **Chip xám trung tính** (Badge `neutral`, như Arco / TDesign): chip là GIÁ TRỊ, không phải trạng thái chọn;
  tinted `primary` ở light chỉ ~1.6:1. Dark ngả `sky` đặc (`FIELD_CHIP_TINT_CLASS`, cả chip `+N`, chung TreeSelect) —
  khớp Badge tinted tối mà không mang màu brand. ✕ / mũi tên dùng chung `FIELD_CHIP_CLEAR_*` / `FIELD_CLEAR_*`.

## DropdownTreeSelect

- **Bề mặt trigger / panel / chip / ✕ lấy từ `field.theme`** (chung Dropdown, MultiSelect, DatePicker); file theme
  riêng chỉ giữ layout và slot của cây. Trigger `min-h-*` để cao thêm khi chip xuống dòng; chip cắt "…" như MultiSelect.
- **`single` không dùng radio**: hàng đang chọn tô nền (`Tree` rowSelected) + tick cuối dòng, đồng bộ
  `Dropdown variant="tick"`. Bấm lại cái đang chọn vẫn bắn `onChange` (arborist `onSelect` thì không).
- **`multi`**: bấm nhãn lẫn checkbox đều toggle; `Checkbox` `stopPropagation` ở click và pointerdown để
  khỏi toggle đôi với nhãn; chevron vẫn sở hữu mở/đóng. Icon node chỉ hiện khi data có `icon` (opt-in).
- **Ô tìm kiếm uncontrolled** (`useImeSafeSearchInput`) + `useDebounce` cho `searchTerm` của `Tree`: cây
  chỉ lọc sau khi ngừng gõ — `ime-safe-input.md`.
- **`renderTrailing` vẽ TRONG `renderNode`** của chính component: `Tree` bỏ qua `renderTrailing` khi có
  `renderNode` (thân dòng bị thay trọn), nên chuyển thẳng xuống `Tree` là vô hiệu.
