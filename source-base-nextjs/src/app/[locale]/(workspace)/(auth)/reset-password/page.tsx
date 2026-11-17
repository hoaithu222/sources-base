import { Suspense } from 'react';

import { generatePageMetadata } from '@/app/_seo/page-metadata';
import { ResetPasswordView } from '@/features/auth';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/reset-password'>) =>
  generatePageMetadata({ params, key: 'resetPassword', path: PATHS.RESET_PASSWORD });

/** `ResetPasswordView` đọc `?token=` bằng `useSearchParams` → PHẢI bọc `<Suspense>` để trang vẫn tĩnh (phần còn lại prerender sẵn). */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordView />
    </Suspense>
  );
}
