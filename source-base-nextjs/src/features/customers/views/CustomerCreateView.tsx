import { useTranslations } from 'next-intl';

import { PageBody, PageShell } from '@/shared/ui';
import { PageHeader } from '@/shared/widgets/header';

import CustomerForm from '../components/CustomerForm';

/**
 * CustomerCreateView — trang thêm khách hàng (`/demo/customers/new`).
 *
 * Quyền `customer:create` chặn ở `page.tsx` bằng `PermissionGate`; form tự chuyển về danh sách khi tạo xong.
 */
export default function CustomerCreateView() {
  const t = useTranslations('customers.form');

  return (
    <PageShell variant="flow">
      <PageHeader subtitle={t('createSubtitle')} title={t('createTitle')} tone="sky" />
      <PageBody>
        <CustomerForm />
      </PageBody>
    </PageShell>
  );
}
