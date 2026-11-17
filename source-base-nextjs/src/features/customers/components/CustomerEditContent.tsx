'use client';

import { useTranslations } from 'next-intl';

import { errorMessageOf, isAppError } from '@/core/http';
import { Link } from '@/core/i18n';
import { PATHS } from '@/shared/constants/paths.constants';
import { Button, EmptyState, Spinner } from '@/shared/ui';

import { useCustomerQuery } from '../service/customers.queries';
import CustomerForm from './CustomerForm';
import CustomerLoadError from './CustomerLoadError';

interface CustomerEditContentProps {
  id: number | null;
}

/**
 * CustomerEditContent — thân trang sửa: tải bản ghi theo `id` rồi hiện form, hoặc đúng MỘT trong các trạng thái
 * "không tìm thấy" (id rác trên URL / BE trả 404) · lỗi tải (có "Thử lại") · đang tải.
 *
 * @param props.id - Id đã kiểm từ `?id=` (`parseCustomerId`); `null` = URL không có id hợp lệ.
 */
export default function CustomerEditContent({ id }: CustomerEditContentProps) {
  const t = useTranslations('customers.state');
  const query = useCustomerQuery(id);

  const notFound = id === null || (isAppError(query.error) && query.error.kind === 'not_found');
  if (notFound) {
    return (
      <EmptyState
        action={
          <Button asChild size="sm" variant="secondary">
            <Link href={PATHS.DEMO_CUSTOMERS}>{t('backToList')}</Link>
          </Button>
        }
        description={t('notFoundDescription')}
        icon="users-bold"
        iconColor="neutral"
        size="lg"
        title={t('notFoundTitle')}
      />
    );
  }

  if (query.isError) {
    return (
      <CustomerLoadError
        description={errorMessageOf(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) {
    return (
      <div className="flex justify-center p-4">
        <Spinner label={t('loading')} size="lg" />
      </div>
    );
  }

  return <CustomerForm key={query.data.id} customer={query.data} />;
}
