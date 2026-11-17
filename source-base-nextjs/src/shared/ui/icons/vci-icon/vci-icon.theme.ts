import type { VciIconVariant, VciIconWeight } from './vci-icon.types';

/**
 * vci-icon.theme.ts — bảng class của `VciIcon`: màu từng lớp theo biến thể + độ dày nét.
 *
 * Dùng:   <g className={VCI_ICON_LAYER_CLASSES[variant].dot}> · strokeWidth={VCI_ICON_STROKE[weight]}
 * Lưu ý:  ⛔ Thân icon luôn `currentColor` — đổi màu bằng `text-*` ở nơi dùng, không thêm biến thể màu. Chấm nhấn của
 *         `duo` đọc token `icon-accent` (đỏ logo VCI); nền màu (ô `AppTile`) đổi chấm bằng cách ghi đè biến
 *         `--color-icon-accent` trên phần tử bọc — không sửa ở đây.
 */

type VciIconLayer = 'duo' | 'dot';

export const VCI_ICON_LAYER_CLASSES = {
  line: { duo: 'hidden', dot: 'fill-current' },
  duo: { duo: 'fill-current opacity-16', dot: 'fill-icon-accent' },
} satisfies Record<VciIconVariant, Record<VciIconLayer, string>>;

/** Nét trên lưới 24: 1.75 ≈ 1.2px ở 16px (ngang icon outline hệ thống); 2.25 cho glyph nhỏ trên nền màu. */
export const VCI_ICON_STROKE = {
  regular: 1.75,
  bold: 2.25,
} satisfies Record<VciIconWeight, number>;
