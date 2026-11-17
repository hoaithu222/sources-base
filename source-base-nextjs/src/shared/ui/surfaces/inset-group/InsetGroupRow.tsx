'use client';

import { memo } from 'react';
import type { ReactNode } from 'react';
import { Link } from '@/core/i18n';

import { AppTile, type AppTileTone } from '@/shared/ui/icons/app-tile';
import type { AppIconName } from '@/shared/ui/icons/app-icon';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import { INSET_GROUP_DIVIDER_INSET, INSET_GROUP_ROW_CLASSES } from './inset-group.theme';

export interface InsetGroupRowProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: AppIconName;
  tone?: AppTileTone;
  value?: ReactNode;
  control?: ReactNode;
  wideControl?: boolean;
  href?: string;
  onSelect?: () => void;
  className?: string;
}

/**
 * InsetGroupRow — một dòng trong `InsetGroup` (hộp nhóm macOS): ô icon màu nhỏ · tên + dòng phụ bên trái · giá trị /
 * điều khiển bên phải. Có `href` → cả dòng là `<Link>` thật kèm `›` (đi sâu một cấp, chuột phải mở tab mới); có
 * `onSelect` → `<button>`; không có cả hai → dòng tĩnh để đặt `control` (Toggle, SegmentToggle, Select…).
 *
 * Lưu ý: dòng bấm được KHÔNG chứa `control` (nút lồng trong liên kết là lỗi a11y). Giá trị dài tự cắt `…`; số đếm nên là
 * số thuần (`4`, `11 ứng dụng`) để nhìn là biết có gì bên trong mà không cần mở.
 *
 * @param props.title - Tên dòng.
 * @param props.description - Dòng phụ màu nhạt dưới tên (trạng thái, giải thích ngắn).
 * @param props.icon - Icon của ô màu đầu dòng (`AppIconName` — ưu tiên icon VCI).
 * @param props.tone - Tông ô icon (`AppTileTone`). Mặc định `primary`.
 * @param props.value - Giá trị / số đếm hiện bên phải (chữ nhạt, số căn thẳng).
 * @param props.control - Điều khiển bên phải cho dòng tĩnh (Toggle, SegmentToggle…).
 * @param props.wideControl - Điều khiển RỘNG (`ChoiceTiles`, dải màu): dưới `sm` xuống dòng dưới tên thay vì ép chữ.
 * @param props.href - Đi tới trang chi tiết → cả dòng là `<Link>` + `›`.
 * @param props.onSelect - Lệnh tại chỗ khi không có `href` (mở drawer…) → dòng là `<button>` + `›`.
 * @param props.className - Class thêm cho dòng.
 *
 * @example
 * <InsetGroupRow icon="bank" title="Ngân quỹ" description="3 tài khoản" value="4" href="/tai-chinh/ngan-quy" />
 * <InsetGroupRow title="Tự động duyệt" description="Dưới 5 triệu" control={<Toggle checked={on} onChange={setOn} />} />
 */
const InsetGroupRow = memo(function InsetGroupRow({
  title,
  description,
  icon,
  tone = 'primary',
  value,
  control,
  wideControl = false,
  href,
  onSelect,
  className,
}: InsetGroupRowProps) {
  const interactive = Boolean(href || onSelect);
  const rowClassName = cn(
    INSET_GROUP_ROW_CLASSES.row,
    icon ? INSET_GROUP_DIVIDER_INSET.icon : INSET_GROUP_DIVIDER_INSET.plain,
    interactive && INSET_GROUP_ROW_CLASSES.interactive,
    wideControl && INSET_GROUP_ROW_CLASSES.wide,
    className,
  );

  const content = (
    <>
      {icon && <AppTile className="rounded-md" icon={icon} size="xs" tone={tone} />}
      <span className={INSET_GROUP_ROW_CLASSES.text}>
        <span className={INSET_GROUP_ROW_CLASSES.title}>{title}</span>
        {description != null && (
          <span className={INSET_GROUP_ROW_CLASSES.description}>{description}</span>
        )}
      </span>
      {(value != null || control != null || interactive) && (
        <span
          className={cn(
            INSET_GROUP_ROW_CLASSES.trailing,
            wideControl && INSET_GROUP_ROW_CLASSES.trailingWide,
            wideControl &&
              (icon
                ? INSET_GROUP_ROW_CLASSES.trailingWideIcon
                : INSET_GROUP_ROW_CLASSES.trailingWidePlain),
          )}
        >
          {value != null && <span className={INSET_GROUP_ROW_CLASSES.value}>{value}</span>}
          {!interactive && control}
          {interactive && (
            <SystemIcon
              aria-hidden
              className={INSET_GROUP_ROW_CLASSES.chevron}
              name="angle-right-outline"
              size={14}
            />
          )}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link className={rowClassName} href={href} role="listitem" onClick={onSelect}>
        {content}
      </Link>
    );
  }
  if (onSelect) {
    return (
      <button className={rowClassName} role="listitem" type="button" onClick={onSelect}>
        {content}
      </button>
    );
  }
  return (
    <div className={rowClassName} role="listitem">
      {content}
    </div>
  );
});

export default InsetGroupRow;
