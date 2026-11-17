import { Suspense } from 'react';

import { generatePageMetadata } from '@/app/_seo/page-metadata';
import { CustomerListView } from '@/features/customers';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/demo/customers'>) =>
  generatePageMetadata({ params, key: 'customers', path: PATHS.DEMO_CUSTOMERS });

/** `CustomerListView` đọc bộ lọc từ URL bằng `useSearchParams` → PHẢI bọc `<Suspense>` để trang vẫn tĩnh. */
export default function CustomersPage() {
  return (
    <Suspense fallback={null}>
      <CustomerListView />
    </Suspense>
  );
}
