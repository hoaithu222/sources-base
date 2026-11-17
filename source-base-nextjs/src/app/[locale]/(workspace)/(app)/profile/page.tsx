import { generatePageMetadata } from '@/app/_seo/page-metadata';
import ProfileView from '@/app/_views/ProfileView';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/profile'>) =>
  generatePageMetadata({ params, key: 'profile', path: PATHS.PROFILE });

export default function ProfilePage() {
  return <ProfileView />;
}
