import { memo } from 'react';

import { Tooltip } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import { PAGE_HEADER_CLASSES } from '../page-header.theme';
import NavElement from './nav-element';

interface PageHeaderBackProps {
  onBack: () => void;
  label?: string;
  href?: string;
}

/**
 * PageHeaderBack — nút quay lại ở đầu ô `start` của thanh header: nút icon `‹` + tooltip. Phần nội bộ của `PageHeader`
 * (page bật bằng `onBack` / `backHref`).
 *
 * @param props.onBack - Gọi khi bấm (click thường).
 * @param props.label - Tooltip + `aria-label`. Mặc định "Quay lại".
 * @param props.href - Path cố định → `<Link>` thật (mở tab mới được); `navigate(-1)` thì bỏ trống.
 *
 * @example
 * <PageHeaderBack href="/" onBack={goHome} />
 */
const PageHeaderBack = memo(function PageHeaderBack({
  onBack,
  label = 'Quay lại',
  href,
}: PageHeaderBackProps) {
  return (
    <Tooltip arrow={false} content={label} side="bottom">
      <NavElement
        aria-label={label}
        className={PAGE_HEADER_CLASSES.back}
        href={href}
        onActivate={onBack}
      >
        <SystemIcon name="angle-left-outline" />
      </NavElement>
    </Tooltip>
  );
});

export default PageHeaderBack;
