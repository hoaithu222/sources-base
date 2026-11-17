import { LoadingScreen } from '@/app/_components';

/** Màn chờ khi chuyển trang trong vùng làm việc (Suspense tự bọc quanh `page.tsx`) — header / Dock giữ nguyên. */
export default function AppGroupLoading() {
  return <LoadingScreen level="content" />;
}
