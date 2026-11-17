import { generatePageMetadata } from '@/app/_seo/page-metadata';
import SettingsView from '@/app/_views/SettingsView';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/settings'>) =>
  generatePageMetadata({ params, key: 'settings', path: PATHS.SETTINGS });

export default function SettingsPage() {
  return <SettingsView />;
}
