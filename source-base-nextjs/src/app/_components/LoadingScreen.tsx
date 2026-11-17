import { useTranslations } from 'next-intl';

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
 * LoadingScreen — màn chờ tải dùng chung: `loading.tsx` của route, phiên đang khôi phục (`AuthGate` / `GuestGate`).
 *
 * Sửa giao diện: class → `LOADING_SCREEN_LEVEL_CLASSES` · cỡ spinner → `LOADING_SCREEN_SPINNER_SIZE`.
 * Lưu ý: `level="app"` là màn chờ ngoài khung DUY NHẤT — hai gate cùng dùng nên chuyển từ chờ tải sang chờ khôi phục
 * phiên không đổi hình.
 * Lưu ý: không dùng hook trạng thái nên cũng render được ở server (`loading.tsx`) — chữ dịch lấy theo ngôn ngữ của route.
 *
 * @param props.level - `app` (chưa có khung bao quanh — chiếm trọn màn hình) | `content` (đã có Header /
 *   khung thẻ — chỉ lấp vùng nội dung). Mặc định `content`.
 *
 * @example
 * <LoadingScreen level="app" />
 */
function LoadingScreen({ level = 'content' }: LoadingScreenProps) {
  const t = useTranslations('errors.screens.loading');
  const loadingScreenClassName = cn(
    LOADING_SCREEN_BASE_CLASSES,
    LOADING_SCREEN_LEVEL_CLASSES[level],
  );

  return (
    <div className={loadingScreenClassName} role="status">
      <Spinner color="primary" size={LOADING_SCREEN_SPINNER_SIZE[level]} />
      <Text size="small" skin="muted">
        {t('label')}
      </Text>
    </div>
  );
}

export default LoadingScreen;
