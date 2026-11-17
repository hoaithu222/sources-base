import { useTranslations } from 'next-intl';

import StatusView from './StatusView';

/**
 * NotFoundView — nội dung trang 404; `[locale]/not-found.tsx` render nó (Next tự trả HTTP 404 + `noindex`).
 */
export default function NotFoundView() {
  const t = useTranslations('errors.screens.notFound');

  return <StatusView code="404" description={t('description')} title={t('title')} />;
}
