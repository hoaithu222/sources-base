import { Suspense } from 'react';

import { generatePageMetadata } from '@/app/_seo/page-metadata';
import { CustomerEditView } from '@/features/customers';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/demo/customers/edit'>) =>
  generatePageMetadata({ params, key: 'customerEdit', path: PATHS.DEMO_CUSTOMER_EDIT });

/** `CustomerEditView` đọc `?id=` bằng `useSearchParams` → PHẢI bọc `<Suspense>`; dùng route tĩnh + `?id=` thay cho `[id]` để giữ SSG. */
export default function CustomerEditPage() {
  return (
    <Suspense fallback={null}>
      <CustomerEditView />
    </Suspense>
  );
}
