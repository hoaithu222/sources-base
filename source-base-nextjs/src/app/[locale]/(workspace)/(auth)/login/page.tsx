import { generatePageMetadata } from '@/app/_seo/page-metadata';
import { LoginView } from '@/features/auth';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/login'>) =>
  generatePageMetadata({ params, key: 'login', path: PATHS.LOGIN });

export default function LoginPage() {
  return <LoginView />;
}
