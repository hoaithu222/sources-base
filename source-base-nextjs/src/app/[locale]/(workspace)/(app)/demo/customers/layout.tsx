import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { PermissionGate } from '@/app/_guards';
import { appConfig } from '@/core/config';

/** Cả nhóm `/demo/customers/*` chỉ có ở chế độ demo (bản `app` trả 404) và cần quyền xem khách hàng; màn con khai thêm quyền riêng ở `page.tsx`. */
export default function CustomersLayout({ children }: { children: ReactNode }) {
  if (!appConfig.isDemo) notFound();
  return <PermissionGate permission={{ resource: 'customer' }}>{children}</PermissionGate>;
}
