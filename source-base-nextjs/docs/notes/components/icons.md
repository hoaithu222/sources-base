# Ghi chú component — icons (`src/shared/ui/icons/`, `icons/gem-icon/`, `icons/app-tile/`, `icons/vci-icon/`, `icons/app-icon/`)

> Lý do thiết kế KHÔNG hiển nhiên của từng component, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có.

## SystemIcon

- **Cỡ và `display: block` là inline `style`** (`width` / `height` = `size`): class `size-*` / `h-*` / `w-*` /
  `hidden` truyền qua `className` thua inline style nên vô hiệu — đổi cỡ bằng `size`, cỡ % thì qua `style`.
- **Không tự đặt `cursor-pointer`**: con trỏ kế thừa từ phần tử chứa (nút → bàn tay, nút tắt → cấm, icon trang trí →
  mũi tên). Vì cỡ đặt inline, `[&>svg]:size-*` ở nơi dùng phải kèm `!`.

## BoldSystemIconName

- **Khai ở `icons/Icons.tsx` cạnh `SystemIconName`**, xuất KIỂU ở `@/shared/ui`: prop `icon` của thẻ KPI,
  `Callout`, `EmptyState` và widget (hàng chế độ của Dock) cùng một kiểu, không import kiểu từ một thẻ KPI. Icon NHẬN
  DIỆN đến từ cấu hình (mục Dock, phân hệ) là `AppIconName`, không phải kiểu này.
- **Chỉ nhận `*-bold`**: nét mảnh chìm trên nền thẻ màu / ảnh (`icon-conventions.md`).

## VciIcon

- **Dữ liệu sinh, không vẽ tay trong TSX**: SVG nguồn ở `src/assets/vci-icons/` (3 lớp `duo` · `line` · `dot`), script
  `generate:vci-icons` đổi thành path `d` theo lớp — thân luôn `currentColor`, nên một icon đổi màu bằng `text-*` ở nơi dùng.
- **Chấm nhấn đọc biến `--color-icon-accent`** (đỏ logo) chứ không gắn màu cứng: nền màu (ô `AppTile`) ghi đè biến ở
  phần tử bọc thành vàng kim — đỏ chìm trên nền xanh — mà `VciIcon` không cần biết mình đang nằm đâu.
- **`overflow="visible"`**: nét 1.75 đầu tròn chạm mép vùng an toàn; cắt ở viewBox là mất nửa đầu nét ở 16px.

## AppIcon

- **Một tên, hai bộ**: `AppIconName` = tên VCI ∪ tên `SystemIcon`; hai tập không trùng (tên hệ thống luôn có đuôi
  `-bold` / `-outline`) nên `isVciIconName` chỉ cần tra `VCI_ICONS`. Cấu hình (meta route, Dock, bảng lệnh, phân hệ) đổi
  bộ icon mà nơi vẽ không phải sửa.

## GemIcon

- **Hai hình cùng cạnh ngoài** (`GEM_SIZE_PX`): sáng là ô bo mềm nền tông nhạt + vòng 1px cùng tông (khối 3D bóng bẩy lạc
  giữa thẻ trắng phẳng); tối là viên gem isometric. Đổi theme không xô bố cục thẻ KPI / `ConfirmDialog`.
- **Id gradient / filter / mask của gem tối lấy từ `useId`** (`uid`): nhiều gem trên một trang không đụng id nên
  `url(#…)` không trỏ nhầm sang gem khác. Hai file `gem-icon-defs` và `gem-icon-shapes` phải dùng CÙNG `uid`.
- **Màu gem tối đi qua `style` + `var(--color-*)`** (không `fill` thuần) nên theo token. `main` là màu thân, `glow` là bản
  sáng hơn cho quầng / điểm nhấn; viền kim loại `sky-3` cố định cho cả 5 màu (đúng Figma 469-2502 / node 469-3876).
- **Tâm icon trên gem ở 30% chiều cao** (`GEM_ICON_CENTER_RATIO`): Figma đặt `top-[calc(50%-11px)]` +
  `-translate-y-1/2` trên khung 56px → tâm ≈ 17px = 30.4%. `xs` (32px) là bậc compact cho hàng KPI dày.
- **Màu icon con theo theme** (`GEM_CONTENT_COLOR_CLASSES`): sáng là bậc ĐỌC ĐƯỢC của tông trên nền ô nhạt; tối
  `fg-heading`. Bậc `-8` cũ ra màu đục (navy, rêu, nâu) (người dùng báo 2026-10-06); icon trắng trên ô nhạt thì chìm
  (~1.2:1). Nơi dùng ĐỪNG truyền `text-neutral-0`.

## AppTile

- **Ô icon kiểu ứng dụng macOS = DANH TÍNH phân hệ**: cùng một `tone` ở Dock, nút bộ chọn phân hệ, lưới launcher, vệt đổi
  cấp, thẻ màn hình, dòng `InsetGroupRow` — nhận phân hệ bằng màu trước khi đọc chữ. Tông KHÔNG mang trạng thái.
- **Sáng dốc màu + gờ sáng đỉnh + viền bắt sáng `rim-tile` + bóng nhuốm tông** (`--app-tile-tone`); tối là ô PHẲNG nhuộm
  14% + viền tông, góc vuông (thang `--radius-*` = 0 ở `.dark`) — dốc màu bóng bẩy lạc giữa khung HUD.
- **Bậc dốc không đồng loạt**: `primary` dốc 3 bậc `-5 → -6 → -8` (xanh lá → ngọc → lam như vòng cung logo VCI); `yellow`
  `-6 → -7`; `green` / `teal` / `sky` / `neutral` `-5 → -7`; còn lại `-4 → -6`. Bậc sáng của các họ kia rất nhạt (vd
  `green-4` `#36DA88`, `yellow-5` `#FFC62F`) — glyph trắng sẽ chìm.
- **Icon VCI vẽ bản `duo`, chấm nhấn vàng kim**: ô ghi đè `--color-icon-accent` = `yellow-4`. Glyph ≤ 16px (`xs` / `sm`)
  dày nét `bold` (`APP_TILE_GLYPH_WEIGHT`) để không mảnh / nhoè trên nền màu.
- **Bán kính theo cỡ, không theo tầng control**: `xs` `rounded-sm` · `sm` `md` · `md`/`lg` `lg` · `xl` `xl` (~27% cạnh như
  icon app). Cỡ glyph vừa ghi ở `APP_TILE_GLYPH_PX` (cho `AppIcon size`) vừa ép `[&>svg]:size-*!` vì cỡ đặt inline.
- **`aria-hidden`**: ô chỉ trang trí, tên phân hệ do phần tử bọc ngoài nói (`aria-label` của liên kết / nhãn chữ cạnh ô).
