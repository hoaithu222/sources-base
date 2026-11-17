import { NotFoundView } from '@/app/_views/status';

/**
 * 404 theo ngôn ngữ — hiện cho `notFound()` và URL không khớp route nào (`[...rest]`). Next tự trả HTTP 404 và thêm
 * `robots: noindex` — không cần khai metadata.
 */
export default function NotFound() {
  return <NotFoundView />;
}
