import { PermissionGate } from '@/app/_guards';
import { generatePageMetadata } from '@/app/_seo/page-metadata';
import { CustomerCreateView } from '@/features/customers';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/demo/customers/new'>) =>
  generatePageMetadata({ params, key: 'customerNew', path: PATHS.DEMO_CUSTOMER_NEW });

export default function CustomerNewPage() {
  return (
    <PermissionGate permission={{ resource: 'customer', action: 'create' }}>
      <CustomerCreateView />
    </PermissionGate>
  );
}
