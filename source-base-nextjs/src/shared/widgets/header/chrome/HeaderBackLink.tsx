import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n';

import { Tooltip } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { formatShortcut } from '@/shared/utils/browser/shortcut-label.utils';

import { HEADER_BACK_CLASS } from '../header.theme';

/** Lên một cấp như Finder (⌘↑) — đọc trong tooltip. */
const BACK_SHORTCUT_LABEL = formatShortcut('↑');

/**
 * HeaderBackLink — nút ‹ quay lại (cấp ≥ 2) bên TRÁI thanh, ngay sau logo: `<Link>` thật tới cấp trên (không `navigate(-1)`
 * — vào thẳng từ link / tab mới vẫn về đúng chỗ); tooltip nhắc Ctrl/⌘ + ↑. Phần nội bộ của `Header`.
 *
 * @param props.href - Đích cấp trên (màn đích của phân hệ, hoặc màn hình chứa bản ghi).
 *
 * @example
 * <HeaderBackLink href="/tai-chinh/so-cai" />
 */
const HeaderBackLink = memo(function HeaderBackLink({ href }: { href: string }) {
  const t = useTranslations('ui.widgets');
  const tc = useTranslations('ui.common');

  return (
    <Tooltip
      arrow={false}
      content={t('header.backTooltip', { shortcut: BACK_SHORTCUT_LABEL })}
      side="bottom"
    >
      <Link aria-label={tc('back')} className={HEADER_BACK_CLASS} href={href}>
        <SystemIcon name="angle-left-bold" />
      </Link>
    </Tooltip>
  );
});

export default HeaderBackLink;
