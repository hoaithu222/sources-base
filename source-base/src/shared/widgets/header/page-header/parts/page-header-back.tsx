import { memo } from 'react';

import type { PageHeaderChipSlant } from '../page-nav.theme';
import PageHeaderChip from './chip/page-header-chip';

interface PageHeaderBackProps {
  onBack: () => void;
  label?: string;
  slant?: PageHeaderChipSlant;
  href?: string;
  compact?: boolean;
}

/**
 * PageHeaderBack — nút quay lại ở mép trái thanh header: một `PageHeaderChip` icon-only. Phần nội bộ của
 * `PageHeader` (page bật bằng `onBack` / `backHref`).
 *
 * Lưu ý: mặc định nghiêng `left` (`\`, đổ RA NGOÀI, đúng hướng đưa người dùng đi — cũng là chiều của dải tab bên trái
 * bảng tên nên cả hàng cùng một hướng vát).
 *
 * @param props.onBack - Gọi khi bấm (click thường).
 * @param props.label - Tooltip + `aria-label`. Mặc định "Quay lại".
 * @param props.slant - Hướng nghiêng chip: `right` | `left`. Mặc định `left`.
 * @param props.href - Path cố định → `<Link>` thật (mở tab mới được); `navigate(-1)` thì bỏ trống.
 * @param props.compact - Bé hơn một bậc về BỀ NGANG — khi cả cụm control của trang cũng compact.
 *   Mặc định `false`.
 *
 * @example
 * <PageHeaderBack href="/" onBack={goHome} />
 */
const PageHeaderBack = memo(function PageHeaderBack({
  onBack,
  label = 'Quay lại',
  slant = 'left',
  href,
  compact = false,
}: PageHeaderBackProps) {
  return (
    <PageHeaderChip
      compact={compact}
      href={href}
      icon="angle-left-outline"
      slant={slant}
      tooltip={label}
      onSelect={onBack}
    />
  );
});

export default PageHeaderBack;
