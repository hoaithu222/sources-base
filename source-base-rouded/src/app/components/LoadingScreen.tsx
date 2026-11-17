import { Spinner, Text } from '@/shared/ui';
import type { SpinnerSize } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import type { ScreenLevel } from './screen.types';

interface LoadingScreenProps {
  level?: ScreenLevel;
}

const LOADING_SCREEN_BASE_CLASSES = 'flex flex-col items-center justify-center gap-3';

const LOADING_SCREEN_LEVEL_CLASSES = {
  app: 'min-h-dvh bg-bg-page',
  content: 'h-full min-h-60',
} satisfies Record<ScreenLevel, string>;

const LOADING_SCREEN_SPINNER_SIZE = {
  app: 'lg',
  content: 'md',
} satisfies Record<ScreenLevel, SpinnerSize>;

/**
 * LoadingScreen — màn chờ tải dùng chung: trang đang nạp, phiên đang khôi phục, ranh giới `Suspense`
 * ngoài cùng của `App`.
 *
 * Sửa giao diện: class → `LOADING_SCREEN_LEVEL_CLASSES` · cỡ spinner → `LOADING_SCREEN_SPINNER_SIZE`.
 * Lưu ý: `level="app"` là màn chờ ngoài khung DUY NHẤT — `App` và hai guard cùng dùng nên chuyển từ chờ
 * tải sang chờ khôi phục phiên không đổi hình.
 *
 * @param props.level - `app` (chưa có khung bao quanh — chiếm trọn màn hình) | `content` (đã có Header /
 *   khung thẻ — chỉ lấp vùng nội dung). Mặc định `content`.
 *
 * @example
 * <LoadingScreen level="app" />
 */
function LoadingScreen({ level = 'content' }: LoadingScreenProps) {
  const loadingScreenClassName = cn(
    LOADING_SCREEN_BASE_CLASSES,
    LOADING_SCREEN_LEVEL_CLASSES[level],
  );

  return (
    <div className={loadingScreenClassName}>
      <Spinner color="primary" size={LOADING_SCREEN_SPINNER_SIZE[level]} />
      <Text size="small" skin="muted">
        Đang tải…
      </Text>
    </div>
  );
}

export default LoadingScreen;
