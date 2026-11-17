'use client';

import { RouteErrorScreen } from '@/app/_components';

/** Lỗi của MỘT trang trong vùng làm việc: hiện trong vùng nội dung, header / Dock vẫn dùng được để đi trang khác. */
export default function AppGroupError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorScreen label="page" level="content" {...props} />;
}
