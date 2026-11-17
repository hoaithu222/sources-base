import { memo } from 'react';

import { useNowTick } from '@/shared/hooks';
import { Text } from '@/shared/ui';
import { formatDate } from '@/shared/utils/format/format.utils';

/**
 * DashboardClock — nội dung tooltip của nút làm mới trên header: "Làm mới · cập nhật lúc HH:mm:ss" chạy theo đồng hồ.
 * Cố ý là component riêng: nhịp 1 giây chỉ dựng lại đúng nhãn này (và chỉ khi tooltip đang mở), không kéo theo cả trang.
 */
const DashboardClock = memo(function DashboardClock() {
  const { now } = useNowTick(1000);

  return (
    <Text className="whitespace-nowrap tabular-nums" size="tiny">
      {`Làm mới · cập nhật lúc ${formatDate(now, 'HH:mm:ss')}`}
    </Text>
  );
});

export default DashboardClock;
