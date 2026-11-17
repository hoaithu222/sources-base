import { generatePageMetadata } from '@/app/_seo/page-metadata';
import { RegisterView } from '@/features/auth';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/register'>) =>
  generatePageMetadata({ params, key: 'register', path: PATHS.REGISTER });

export default function RegisterPage() {
  return <RegisterView />;
}
