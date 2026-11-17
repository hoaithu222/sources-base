import { notFound } from 'next/navigation';

import { generatePageMetadata } from '@/app/_seo/page-metadata';
import DemoLibraryView from '@/app/_views/demo/DemoLibraryView';
import { appConfig } from '@/core/config';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/demo'>) =>
  generatePageMetadata({ params, key: 'demo', path: PATHS.DEMO });

/** `/demo` — thư viện giao diện cho dev; chỉ tồn tại ở chế độ demo (`NEXT_PUBLIC_APP_MODE=demo`), bản `app` trả 404. */
export default function DemoPage() {
  if (!appConfig.isDemo) notFound();
  return <DemoLibraryView />;
}
