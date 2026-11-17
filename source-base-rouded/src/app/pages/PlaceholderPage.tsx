import { useMatches } from 'react-router-dom';

import { resolvePageTitle } from '@/app/router/definition';
import { EmptyState, PageShell } from '@/shared/ui';

/**
 * PlaceholderPage — trang giữ chỗ cho phân hệ chưa có màn hình thật (khai qua `LazyPlaceholderPage`
 * của `router/modules`); tiêu đề lấy từ `meta.title` của route đang khớp nên dùng chung cho mọi phân hệ.
 */
function PlaceholderPage() {
  const title = resolvePageTitle(useMatches());

  return (
    <PageShell variant="center">
      <EmptyState
        description="Phân hệ đang trong giai đoạn phát triển. Vui lòng quay lại sau."
        icon="cube-bold"
        iconColor="sky"
        size="md"
        title={title ?? 'Phân hệ'}
      />
    </PageShell>
  );
}

export default PlaceholderPage;
