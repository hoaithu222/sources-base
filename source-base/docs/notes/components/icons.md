# Ghi chú component — icons (`src/shared/ui/icons/`, `icons/gem-icon/`)

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
  `Callout`, `EmptyState` và widget (Dock) cùng một kiểu, không import kiểu từ một thẻ KPI.
- **Chỉ nhận `*-bold`**: nét mảnh chìm trên nền thẻ màu / ảnh (`icon-conventions.md`).

## GemIcon

- **Id gradient / filter / mask lấy từ `useId`** (`uid`): nhiều gem trên một trang không đụng id nên
  `url(#…)` không trỏ nhầm sang gem khác. Hai file `gem-icon-defs` và `gem-icon-shapes` phải dùng CÙNG `uid`.
- **Màu đi qua `style` + `var(--color-*)`** (không `fill` thuần) nên theo token và theme. `main` là màu
  thân, `glow` là bản sáng hơn cho quầng / điểm nhấn; viền kim loại `sky-3` cố định cho cả 5 màu (đúng Figma).
- **Tâm icon ở 30% chiều cao** (`GEM_ICON_CENTER_RATIO`): Figma đặt `top-[calc(50%-11px)]` +
  `-translate-y-1/2` trên khung 56px → tâm ≈ 17px = 30.4%.
- Path chép từ Figma node 469-3876 (viewBox 56×56); `xs` (32px) là bậc compact cho hàng KPI dày, `sm`
  (40px) là mặc định theo Figma 469-2502.
- **Màu icon con theo theme** (`GEM_CONTENT_COLOR_CLASSES`): sáng bậc TƯƠI `-6` cùng họ (vàng `-7`, gray `neutral-6`) + vệt
  sáng trắng 1px dưới icon; tối `fg-heading`. Bậc `-8` cũ ra màu đục (navy, rêu, nâu) "ăn" vào ngọc pastel (người dùng báo
  2026-10-06); icon trắng thì chìm (~1.2:1). Nơi dùng ĐỪNG truyền `text-neutral-0`.
