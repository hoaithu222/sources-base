import { memo } from 'react';
import type { SVGProps } from 'react';

import { cn } from '@/shared/utils/style/cn';

import { VCI_ICON_LAYER_CLASSES, VCI_ICON_STROKE } from './vci-icon.theme';
import type { VciIconDot, VciIconVariant, VciIconWeight } from './vci-icon.types';
import { VCI_ICONS, type VciIconName } from './vci-icons.generated';

export interface VciIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: VciIconName;
  size?: number;
  variant?: VciIconVariant;
  weight?: VciIconWeight;
}

const renderDot = (dot: string | VciIconDot) =>
  typeof dot === 'string' ? (
    <path key={dot} d={dot} />
  ) : (
    <circle key={`${dot.cx}-${dot.cy}`} cx={dot.cx} cy={dot.cy} r={dot.r} />
  );

/**
 * VciIcon — icon BỘ NHẬN DIỆN VCI (lưới 24, nét 1.75 đầu tròn, vòng hở 3 cung + chấm nhấn lấy từ logo): phân hệ, chứng
 * từ, đối tượng nghiệp vụ, thao tác chính. Dữ liệu sinh từ `src/assets/vci-icons/*.svg` (`npm run generate:vci-icons`).
 *
 * Icon chrome nhỏ (mũi tên, đóng, tìm…) vẫn dùng `SystemIcon`; `VciIcon` cho chỗ cần NHẬN RA nghiệp vụ trong một cái
 * nhìn (ô phân hệ, thẻ màn hình, tiêu đề khối, empty state). Không chắc tên thuộc bộ nào → `AppIcon`.
 * Màu thân = `currentColor` (đổi bằng `text-*`); `duo` thêm mảng tô nhạt + chấm đỏ thương hiệu. Mặc định `aria-hidden`.
 * Lưu ý: cỡ đặt bằng inline `style` như `SystemIcon` — đổi cỡ bằng `size`, đừng dùng class `size-*`.
 *
 * @param props.name - Tên icon (`VciIconName`), vd `'finance'`, `'warehouse'`, `'approval'`.
 * @param props.size - Cạnh icon, px. Mặc định `20`.
 * @param props.variant - `line` (mặc định) nét đơn sắc · `duo` thêm mảng tô + chấm nhấn màu.
 * @param props.weight - `regular` nét 1.75 (mặc định) · `bold` 2.25 cho glyph ≤ 14px trên nền màu.
 *
 * @example
 * <VciIcon name="warehouse" size={24} variant="duo" className="text-primary-7" />
 *
 * <Button startIcon={<VciIcon name="import" size={16} />} variant="stroke">Nhập Excel</Button>
 */
export const VciIcon = memo(function VciIcon({
  name,
  size = 20,
  variant = 'line',
  weight = 'regular',
  style,
  className,
  ...props
}: VciIconProps) {
  const icon = VCI_ICONS[name];
  if (!icon) return null;
  const layers = VCI_ICON_LAYER_CLASSES[variant];

  return (
    <svg
      aria-hidden
      className={cn('shrink-0', className)}
      fill="none"
      overflow="visible"
      style={{ width: size, height: size, display: 'block', ...style }}
      viewBox="0 0 24 24"
      {...props}
    >
      {icon.duo.length > 0 && (
        <g className={layers.duo} data-layer="duo">
          {icon.duo.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      )}
      <g
        data-layer="line"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={VCI_ICON_STROKE[weight]}
      >
        {icon.line.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {icon.dot.length > 0 && (
        <g className={layers.dot} data-layer="dot">
          {icon.dot.map(renderDot)}
        </g>
      )}
    </svg>
  );
});

export default VciIcon;
