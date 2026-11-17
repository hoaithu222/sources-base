import { memo } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import { DEMO_SCREEN_PATHS } from '../../../shared/constants/screens.constants';

interface DemoScreenLinksProps {
  className?: string;
}

/**
 * DemoScreenLinks — hai liên kết sang các màn mẫu khác của demo (ghép thực tế, dashboard tổng quan).
 *
 * Là `<Link>` thật (`navigable-controls.md`) nên Ctrl+click / chuột giữa đều chạy. Đặt ở slot `right` của
 * `TitleScreen`; hẹp quá thì kit tự cho cụm này xuống hàng riêng và các nút xuống dòng, không bị cắt.
 *
 * @param props.className - Class thêm cho cụm liên kết.
 *
 * @example
 * <TitleScreen right={<DemoScreenLinks />} title="Thư viện giao diện" />
 */
const DemoScreenLinks = memo(function DemoScreenLinks({ className }: DemoScreenLinksProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-end gap-2', className)}>
      <Button asChild className="shrink-0" size="sm" variant="stroke">
        <Link to={DEMO_SCREEN_PATHS.composed}>Ví dụ ghép thực tế</Link>
      </Button>
      <Button asChild className="shrink-0" size="sm" variant="stroke">
        <Link to={DEMO_SCREEN_PATHS.dashboard}>Dashboard dự án</Link>
      </Button>
    </div>
  );
});

export default DemoScreenLinks;
