import { generatePageMetadata } from '@/app/_seo/page-metadata';
import DashboardView from '@/app/_views/DashboardView';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/dashboard'>) =>
  generatePageMetadata({ params, key: 'dashboard', path: PATHS.DASHBOARD });

export default function DashboardPage() {
  return <DashboardView />;
}
