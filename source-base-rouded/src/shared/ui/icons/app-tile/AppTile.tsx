import { memo } from 'react';

import { AppIcon, type AppIconName } from '@/shared/ui/icons/app-icon';
import { cn } from '@/shared/utils/style/cn';

import {
  APP_TILE_BASE_CLASSES,
  APP_TILE_GLYPH_PX,
  APP_TILE_GLYPH_WEIGHT,
  APP_TILE_SIZE_CLASSES,
  APP_TILE_TONE_CLASSES,
} from './app-tile.theme';
import './app-tile.css';
import type { AppTileSize, AppTileTone } from './app-tile.types';

export interface AppTileProps {
  icon: AppIconName;
  tone?: AppTileTone;
  size?: AppTileSize;
  className?: string;
}

/**
 * AppTile — ô icon kiểu ứng dụng macOS: squircle dốc màu theo tông + glyph trắng (icon VCI vẽ bản `duo`: mảng tô trắng
 * nhạt + chấm nhấn vàng kim; glyph ≤ 16px tự dày nét). Nhận diện PHÂN HỆ ở Dock, bộ chọn
 * phân hệ trên header, lưới launcher và bảng lệnh — cùng một tông cho một phân hệ ở mọi nơi.
 *
 * Chỉ trang trí (`aria-hidden`): tên phân hệ do phần tử bọc ngoài nói (`aria-label` của liên kết / nhãn chữ cạnh ô).
 * Sửa giao diện: `app-tile.theme.ts` (khung · cỡ · tông) · lớp kính `app-tile.css`. Cùng một diện mạo ở cả hai theme.
 * Lưu ý: tông là danh tính, KHÔNG phải trạng thái — đừng dùng `red` cho phân hệ chỉ vì nó "quan trọng".
 *
 * @param props.icon - `AppIconName`: ưu tiên icon VCI (`'finance'`, `'warehouse'`…); icon hệ thống thì dùng bản `-bold`.
 * @param props.tone - Tông nhận diện (`AppTileTone`). Mặc định `primary` (ngọc thương hiệu).
 * @param props.size - `xs` 24 · `sm` 32 · `md` 40 · `lg` 44 · `xl` 56px. Mặc định `md`.
 * @param props.className - Class thêm cho ô.
 *
 * @example
 * <AppTile icon="finance" tone="primary" size="lg" />
 */
const AppTile = memo(function AppTile({
  icon,
  tone = 'primary',
  size = 'md',
  className,
}: AppTileProps) {
  return (
    <span
      aria-hidden
      className={cn(
        APP_TILE_BASE_CLASSES,
        APP_TILE_SIZE_CLASSES[size],
        APP_TILE_TONE_CLASSES[tone],
        className,
      )}
    >
      <AppIcon
        name={icon}
        size={APP_TILE_GLYPH_PX[size]}
        variant="duo"
        weight={APP_TILE_GLYPH_WEIGHT[size]}
      />
    </span>
  );
});

export default AppTile;
