import { generatePageMetadata } from '@/app/_seo/page-metadata';
import { ForbiddenView } from '@/app/_views/status';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/403'>) =>
  generatePageMetadata({ params, key: 'forbidden', path: PATHS.FORBIDDEN });

/** `/403` — trang trạng thái đứng riêng, ngoài mọi guard / layout; `noindex`. `PermissionGate` hiện cùng nội dung này tại chỗ. */
export default function ForbiddenPage() {
  return <ForbiddenView />;
}
