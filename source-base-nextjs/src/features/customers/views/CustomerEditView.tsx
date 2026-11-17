'use client';

import { useTranslations } from 'next-intl';

import { useQueryParams } from '@/shared/hooks';
import { PageBody, PageShell } from '@/shared/ui';
import { PageHeader } from '@/shared/widgets/header';

import CustomerEditContent from '../components/CustomerEditContent';
import { parseCustomerId } from '../utils/customer-url.utils';

/**
 * CustomerEditView — trang sửa khách hàng (`/demo/customers/edit?id=…`): route TĨNH, id đọc từ query và được kiểm
 * (`parseCustomerId`) nên id rác ra màn "không tìm thấy" chứ không gọi API.
 *
 * Đọc `useSearchParams` nên `page.tsx` PHẢI bọc `<Suspense>`. Không có quyền `customer:update` thì form chỉ đọc.
 */
export default function CustomerEditView() {
  const t = useTranslations('customers.form');
  const { getParam } = useQueryParams();

  return (
    <PageShell variant="flow">
      <PageHeader subtitle={t('editSubtitle')} title={t('editTitle')} tone="sky" />
      <PageBody>
        <CustomerEditContent id={parseCustomerId(getParam('id'))} />
      </PageBody>
    </PageShell>
  );
}
