'use client';

import { RouteErrorScreen } from '@/app/_components';

/**
 * Ranh giới lỗi của toàn bộ trang dưới `[locale]` (nằm TRONG root layout nên vẫn có provider i18n + giao diện). Lỗi của chính
 * root layout rơi xuống `app/global-error.tsx`.
 */
export default function LocaleError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorScreen label="app" level="app" {...props} />;
}
