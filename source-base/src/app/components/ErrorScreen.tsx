import { PATHS } from '@/shared/constants/paths.constants';
import { Button, Heading, Text } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import type { ErrorDescription } from './describe-error';
import type { ScreenLevel } from './screen.types';

interface ErrorScreenProps {
  error: ErrorDescription;
  level?: ScreenLevel;
}

type ErrorScreenTone = 'chunk' | 'error';

const ERROR_SCREEN_BASE_CLASSES = 'flex px-4';

const ERROR_SCREEN_LEVEL_CLASSES = {
  app: 'h-dvh items-center-safe justify-center overflow-y-auto overscroll-y-contain bg-bg-page',
  content: 'h-full min-h-60 items-center justify-center py-6',
} satisfies Record<ScreenLevel, string>;

const ERROR_SCREEN_CARD_CLASSES =
  'flex w-full max-w-md flex-col items-center gap-3 border border-border-default bg-bg-surface p-6 text-center shadow-[0_4px_20px_var(--color-shadow-popup)]';

const ERROR_SCREEN_ICON_BASE_CLASSES = cn(
  'relative mb-1 flex size-16 shrink-0 items-center justify-center border',
  "before:absolute before:-left-px before:-top-px before:size-2 before:content-['']",
  'before:border-l-2 before:border-t-2 before:border-current',
  "after:absolute after:-bottom-px after:-right-px after:size-2 after:content-['']",
  'after:border-b-2 after:border-r-2 after:border-current',
);

const ERROR_SCREEN_ICON_TONE_CLASSES = {
  chunk: 'border-warning/30 bg-warning/8 text-warning',
  error: 'border-error/30 bg-error/8 text-error',
} satisfies Record<ErrorScreenTone, string>;

/**
 * ErrorScreen — màn lỗi dùng chung của app: `ErrorBoundary`, `RouteErrorScreen` và lỗi khởi động ở
 * `main.tsx` đều hiện màn này; lỗi tải chunk chỉ có nút "Tải lại trang", lỗi khác thêm "Về trang chủ".
 *
 * Sửa giao diện: class → `ERROR_SCREEN_LEVEL_CLASSES` · `ERROR_SCREEN_CARD_CLASSES` · ô icon (cùng khuôn
 * ô icon của `EmptyState`) → `ERROR_SCREEN_ICON_*_CLASSES`.
 * Lưu ý: `level="app"` tự CUỘN khi thẻ cao hơn màn (điện thoại xoay ngang — `body` khoá cuộn) và canh giữa an toàn
 * (`items-center-safe`: tràn thì dính đỉnh, không mất phần đầu). Hai nút điều hướng CỨNG (`location.reload` / `assign`) — cây React vừa ném lỗi, không tin được
 * là nó còn dựng lại nổi bằng điều hướng phía client.
 *
 * @param props.error - Câu chữ đã mô tả sẵn, lấy từ `describeError(error)`.
 * @param props.level - `app` (chiếm trọn màn hình, có nền trang) | `content` (lấp vùng nội dung).
 *   Mặc định `content`.
 *
 * @example
 * <ErrorScreen error={describeError(error)} level="app" />
 */
function ErrorScreen({ error, level = 'content' }: ErrorScreenProps) {
  const isChunk = error.kind === 'chunk';

  const errorScreenClassName = cn(ERROR_SCREEN_BASE_CLASSES, ERROR_SCREEN_LEVEL_CLASSES[level]);
  const iconClassName = cn(
    ERROR_SCREEN_ICON_BASE_CLASSES,
    ERROR_SCREEN_ICON_TONE_CLASSES[isChunk ? 'chunk' : 'error'],
  );

  return (
    <div className={errorScreenClassName} role="alert">
      <div className={ERROR_SCREEN_CARD_CLASSES}>
        <span className={iconClassName}>
          <SystemIcon
            aria-hidden
            className={isChunk ? 'text-warning' : 'text-error'}
            name={isChunk ? 'arrows-rotate-bold' : 'triangle-exclamation-bold'}
            size={40}
          />
        </span>
        <Heading size="small">{error.title}</Heading>
        <Text size="small" skin="muted">
          {error.description}
        </Text>
        <div className="flex flex-wrap justify-center gap-3 pt-3">
          <Button size="md" onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
          {!isChunk && (
            <Button
              size="md"
              skin="neutral"
              variant="stroke"
              onClick={() => window.location.assign(PATHS.HOME)}
            >
              Về trang chủ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorScreen;
