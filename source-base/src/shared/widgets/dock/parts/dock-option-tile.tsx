import { memo } from 'react';
import type { ReactNode } from 'react';

import { Text, type BoldSystemIconName } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import {
  DOCK_SETTINGS_ACCENT_ICON_CLASSES,
  DOCK_SETTINGS_LOCKED_CLASSES,
  DOCK_SETTINGS_SELECTED_CLASSES,
  DOCK_SETTINGS_SLOT_CLASSES,
} from '../dock.theme';

interface DockOptionTileProps {
  icon: BoldSystemIconName;
  title: string;
  description: string;
  selected?: boolean;
  accent?: boolean;
  locked?: boolean;
  trailing?: ReactNode;
  as?: 'button' | 'label';
  onClick?: () => void;
}

/**
 * DockOptionTile — một hàng của panel cấu hình Dock: ô icon + tiêu đề + mô tả + phần đuôi. Phần nội bộ
 * của `DockSettingsPanel`.
 *
 * Sửa giao diện: `DOCK_SETTINGS_SLOT_CLASSES.option*` · hàng chọn / khoá / công tắc → `DOCK_SETTINGS_*_CLASSES`.
 * Lưu ý: cần ở nơi khác thì nâng lên `@/shared/ui` theo `ui-kit-architecture.md §9`, đừng import chéo.
 *
 * @param props.icon - Icon `-bold` trong ô vuông đầu hàng.
 * @param props.title - Dòng tiêu đề.
 * @param props.description - Dòng mô tả ngắn dưới tiêu đề.
 * @param props.selected - Đang được chọn — nhuộm cả hàng, ô icon và chấm tròn. Mặc định `false`.
 * @param props.accent - Chỉ nhuộm ô icon, KHÔNG nhuộm nền hàng — cho công tắc đang bật. Mặc định `false`.
 * @param props.locked - Còn nhìn thấy nhưng không bấm được. Mặc định `false`.
 * @param props.trailing - Phần đuôi (chấm radio, `<Toggle>`).
 * @param props.as - Gốc ngữ nghĩa: `button` (hàng chọn chế độ) | `label` (hàng công tắc — bọc `<button>`
 *   quanh `<Toggle>` là HTML sai). Mặc định `button`.
 * @param props.onClick - Bấm hàng (chỉ với `as="button"`).
 *
 * @example
 * <DockOptionTile icon="eye-slash-bold" title="Tự ẩn" description="Hiện khi rê chuột" selected />
 */
const DockOptionTile = memo(function DockOptionTile({
  icon,
  title,
  description,
  selected = false,
  accent = false,
  locked = false,
  trailing,
  as = 'button',
  onClick,
}: DockOptionTileProps) {
  const optionClassName = cn(
    DOCK_SETTINGS_SLOT_CLASSES.option,
    selected && DOCK_SETTINGS_SELECTED_CLASSES.option,
    locked && DOCK_SETTINGS_LOCKED_CLASSES,
  );
  const optionIconClassName = cn(
    DOCK_SETTINGS_SLOT_CLASSES.optionIcon,
    selected && DOCK_SETTINGS_SELECTED_CLASSES.optionIcon,
    accent && DOCK_SETTINGS_ACCENT_ICON_CLASSES,
  );

  const body = (
    <>
      <span className={optionIconClassName}>
        <SystemIcon name={icon} />
      </span>
      <span className={DOCK_SETTINGS_SLOT_CLASSES.optionBody}>
        <Text className="truncate text-fg-on-chrome" size="tiny" weight="medium">
          {title}
        </Text>
        <Text className="truncate text-fg-on-chrome-muted" size="extraTiny">
          {description}
        </Text>
      </span>
      {trailing}
    </>
  );

  if (as === 'label') {
    return <label className={optionClassName}>{body}</label>;
  }

  return (
    <button
      aria-disabled={locked || undefined}
      className={optionClassName}
      disabled={locked}
      type="button"
      onClick={onClick}
    >
      {body}
    </button>
  );
});

export default DockOptionTile;
