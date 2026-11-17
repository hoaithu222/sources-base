import { useTranslations } from 'next-intl';

import StatusView from './StatusView';

/**
 * ForbiddenView — nội dung trang 403; `PermissionGate` hiện nó TẠI CHỖ (giữ URL) khi người dùng thiếu quyền, và
 * `[locale]/403/page.tsx` dùng nó cho đường `/403`.
 */
export default function ForbiddenView() {
  const t = useTranslations('errors.screens.forbidden');

  return <StatusView code="403" description={t('description')} title={t('title')} />;
}
