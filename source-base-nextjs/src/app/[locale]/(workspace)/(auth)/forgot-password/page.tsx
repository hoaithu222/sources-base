import { generatePageMetadata } from '@/app/_seo/page-metadata';
import { ForgotPasswordView } from '@/features/auth';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/forgot-password'>) =>
  generatePageMetadata({ params, key: 'forgotPassword', path: PATHS.FORGOT_PASSWORD });

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
