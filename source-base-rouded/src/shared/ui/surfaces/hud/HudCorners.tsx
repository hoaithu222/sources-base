import { memo } from 'react';

export type HudCornerVariant = 'bracket' | 'dot' | 'chamfer' | 'none';

export interface HudCornersProps {
  variant?: HudCornerVariant;
  size?: number;
  thickness?: number;
  frame?: boolean;
  frameWidth?: number;
  inset?: number;
  radius?: number;
  glow?: boolean;
  lightRounded?: boolean;
}

/**
 * HudCorners — @deprecated: khung viền + nhấn 4 góc kiểu HUD; VÔ HIỆU ở source-base-rouded (không vẽ gì), GĐ 2 gỡ cùng nơi gọi.
 *
 * Giữ export và chữ ký để nơi gọi cũ (nền màn đăng nhập, ô demo) còn biên dịch. Cần viền bo theo thẻ cha thì tự vẽ viền
 * bằng class (`border border-border-default rounded-lg`), không dùng component này.
 * Lý do thiết kế: notes/components/surfaces-hud.md.
 *
 * @param props.variant - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Kiểu nhấn góc cũ: `bracket` | `dot`
 *   | `chamfer` | `none`.
 * @param props.size - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Cánh ngoặc / cạnh vát cũ, px.
 * @param props.thickness - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Bề dày nét góc cũ, px.
 * @param props.frame - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Khung viền 4 cạnh cũ.
 * @param props.frameWidth - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Bề dày khung viền cũ, px.
 * @param props.inset - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Thụt lớp góc vào trong cũ, px.
 * @param props.radius - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Bo góc khung cũ, px.
 * @param props.glow - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Quầng `drop-shadow` quanh nét góc cũ.
 * @param props.lightRounded - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Chế độ "bo theo cha, ẩn nhấn góc" cũ.
 *
 * @example
 * <div className="relative">
 *   <HudCorners frame variant="bracket" />
 * </div>
 */
const HudCorners = memo<HudCornersProps>(function HudCorners() {
  return null;
});

export default HudCorners;
