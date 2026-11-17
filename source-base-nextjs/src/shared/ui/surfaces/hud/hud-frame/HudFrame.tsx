import { memo } from 'react';

import { cn } from '@/shared/utils/style/cn';
import { HUD_FRAME_CLASSES } from './hud-frame.theme';
import type { HudFrameProps } from './hud-frame.types';

/**
 * HudFrame — khung panel: thẻ bo `lg` viền gradient 1px (dốc dọc, bắt sáng từ trên) + bóng nghỉ `--elev-1`; cùng một
 * hình ở cả hai theme, chỉ màu đổi theo bảng màu.
 *
 * Chỉ là KHUNG: không header, không đệm thân (caller tự lo, giữ mật độ cao — visual-hierarchy.md).
 * Cần header + trạng thái tải / rỗng thì dùng `PanelCard`; hộp phẳng viền đơn → `Surface`.
 * Root luôn `h-full min-h-0` để panel con cuộn được trong lưới flex.
 * Sửa giao diện: mọi class → `HUD_FRAME_CLASSES` (hud-frame.theme.ts).
 * Lưu ý: ngôn ngữ HUD (vát góc, ngoặc, chấm khoá góc, sọc, vệt quét, thước chia, quầng) đã gỡ khỏi source-base-rouded; các
 * prop trang trí giữ chữ ký TS để nơi gọi cũ còn biên dịch nhưng VÔ HIỆU — GĐ 2 gỡ hẳn cùng nơi gọi.
 * Lý do thiết kế: notes/components/surfaces-hud.md.
 *
 * @param props.tone - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Khung trung tính ở cả hai theme (tông
 *   chỉ còn ở header / ô icon của thẻ bọc ngoài).
 * @param props.notch - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Vát góc TL + BR cũ.
 * @param props.corners - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Ngoặc [ ] và chấm khoá góc cũ.
 * @param props.glow - `true` → bóng nghỉ mềm quanh khung (`--elev-1`); `false` → khung phẳng. Mặc định `true`.
 * @param props.intensity - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Độ "kịch" cũ: `default` | `cyber`
 *   | `prime`.
 * @param props.weight - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Bề dày nét cũ: `regular` | `hairline`.
 * @param props.scanlines - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Sọc ngang phủ nền thân cũ.
 * @param props.sweep - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Vệt sáng chạy mép trên cũ.
 * @param props.ticks - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Thước chia mép trên cũ.
 * @param props.notchSize - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Cạnh vát góc cũ, px.
 * @param props.bodyClassName - Class thêm cho lớp thân (nền `bg-bg-surface`, `flex-col`, `overflow-hidden`).
 * @param props.bodyStyle - Style của lớp thân; dùng khi nền phải tính bằng `color-mix` (đè `bg-bg-surface`).
 * @param props.className - Class thêm cho khung ngoài.
 * @param props.children - Nội dung của khung.
 *
 * @example
 * <HudFrame>
 *   <div className="p-2">…</div>
 * </HudFrame>
 *
 * <HudFrame glow={false} bodyClassName="p-2">…</HudFrame>
 */
const HudFrame = memo(function HudFrame({
  glow = true,
  bodyClassName,
  bodyStyle,
  className,
  children,
}: HudFrameProps) {
  return (
    <div className={cn(HUD_FRAME_CLASSES.root, glow && HUD_FRAME_CLASSES.glow, className)}>
      <div className={cn(HUD_FRAME_CLASSES.body, bodyClassName)} style={bodyStyle}>
        <div className={HUD_FRAME_CLASSES.content}>{children}</div>
      </div>
    </div>
  );
});

export default HudFrame;
