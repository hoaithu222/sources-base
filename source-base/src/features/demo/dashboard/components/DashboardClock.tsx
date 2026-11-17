import { memo } from 'react';

import { useNowTick } from '@/shared/hooks';
import { Text } from '@/shared/ui';
import { formatDate } from '@/shared/utils/format/format.utils';

/**
 * DashboardClock — nhãn "Cập nhật lúc HH:mm:ss" chạy theo đồng hồ, đứng đầu cụm hành động cùng hàng với dải KPI (`KpiActionRow`).
 * Cố ý là component riêng: nhịp 1 giây chỉ dựng lại đúng nhãn này, không kéo theo cả trang.
 */
const DashboardClock = memo(function DashboardClock() {
  const { now } = useNowTick(1000);

  return (
    <Text className="whitespace-nowrap tabular-nums max-wide:hidden" size="tiny" skin="muted">
      {`Cập nhật lúc ${formatDate(now, 'HH:mm:ss')}`}
    </Text>
  );
});

export default DashboardClock;
