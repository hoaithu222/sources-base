import { memo } from 'react';
import type { SVGProps } from 'react';

import { isVciIconName, type AppIconName } from './app-icon.utils';
import { SystemIcon } from '../Icons';
import { VciIcon, type VciIconVariant, type VciIconWeight } from '../vci-icon';

export interface AppIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: AppIconName;
  size?: number;
  variant?: VciIconVariant;
  weight?: VciIconWeight;
  labelled?: boolean;
}

/**
 * AppIcon — vẽ icon NHẬN DIỆN theo tên, tự chọn `VciIcon` hay `SystemIcon`: dùng ở chỗ dữ liệu cấu hình icon (meta route,
 * phân hệ, thẻ màn hình) để nơi khai báo được chọn icon VCI hoặc icon hệ thống mà nơi vẽ không phải rẽ nhánh.
 *
 * Import qua barrel `@/shared/ui`. `variant` / `weight` chỉ áp cho icon VCI.
 *
 * @param props.name - `AppIconName`: tên VCI (`'warehouse'`) hoặc tên hệ thống (`'boxes-stacked-bold'`).
 * @param props.size - Cạnh icon, px. Mặc định `16`.
 * @param props.variant - Biến thể icon VCI (`line` · `duo`). Mặc định `line`.
 * @param props.weight - Độ dày nét icon VCI (`regular` · `bold`). Mặc định `regular`.
 * @param props.labelled - Chỉ áp cho icon VCI: `true` → `role="img"` + `aria-label` là nhãn icon theo ngôn ngữ. Mặc định
 *   `false`.
 *
 * @example
 * <AppIcon name={module.icon} size={20} variant="duo" className="text-primary-7" />
 */
export const AppIcon = memo(function AppIcon({
  name,
  size = 16,
  variant,
  weight,
  labelled,
  ...props
}: AppIconProps) {
  if (isVciIconName(name)) {
    return (
      <VciIcon
        labelled={labelled}
        name={name}
        size={size}
        variant={variant}
        weight={weight}
        {...props}
      />
    );
  }
  return <SystemIcon name={name} size={size} {...props} />;
});

export default AppIcon;
