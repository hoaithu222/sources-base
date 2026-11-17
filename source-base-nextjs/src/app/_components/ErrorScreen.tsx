'use client';

import { ArrowsRotateBoldIcon, TriangleExclamationBoldIcon } from '@/assets/icons/standalone';
import { Button, Heading, Text } from '@/shared/ui';
import StaticIcon from '@/shared/ui/icons/StaticIcon';
import { cn } from '@/shared/utils/style/cn';

import type { ScreenLevel } from './screen.types';

type ErrorScreenTone = 'chunk' | 'error';

interface ErrorScreenProps {
  title: string;
  description: string;
  /** `chunk` (cam, icon xoay vòng): không tải được mã trang. `error` (đỏ): lỗi khác. Mặc định `error`. */
  tone?: ErrorScreenTone;
  primaryLabel: string;
  onPrimary: () => void;
  /** Nút phụ (vd "Về trang chủ"); bỏ trống thì chỉ có nút chính. */
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Dòng nhỏ cuối thẻ — mã tham chiếu `error.digest` để đội kỹ thuật tra log. */
  reference?: string;
  level?: ScreenLevel;
}

const ERROR_SCREEN_BASE_CLASSES = 'flex px-4';

const ERROR_SCREEN_LEVEL_CLASSES = {
  app: 'h-dvh items-center-safe justify-center overflow-y-auto overscroll-y-contain bg-bg-page',
  content: 'h-full min-h-60 items-center justify-center py-6',
} satisfies Record<ScreenLevel, string>;

const ERROR_SCREEN_CARD_CLASSES = cn(
  'squircle flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border border-border-default',
  'bg-bg-surface p-6 text-center shadow-[0_4px_20px_var(--color-shadow-popup)]',
);

const ERROR_SCREEN_ICON_BASE_CLASSES =
  'relative mb-1 flex size-16 shrink-0 items-center justify-center rounded-lg border';

const ERROR_SCREEN_ICON_TONE_CLASSES = {
  chunk: 'border-warning/30 bg-warning/8 text-warning',
  error: 'border-error/30 bg-error/8 text-error',
} satisfies Record<ErrorScreenTone, string>;

/**
 * ErrorScreen — màn lỗi THUẦN TRÌNH BÀY dùng chung: `RouteErrorScreen` (cho `error.tsx`) và `global-error.tsx` cùng hiện màn
 * này; chữ do nơi gọi dịch rồi truyền vào (`global-error` nằm ngoài provider i18n nên tự chọn chữ).
 *
 * Sửa giao diện: class → `ERROR_SCREEN_LEVEL_CLASSES` · `ERROR_SCREEN_CARD_CLASSES` (thẻ bo `2xl` + `squircle`) · ô icon
 * (bo `lg`, cùng khuôn ô icon của `EmptyState`) → `ERROR_SCREEN_ICON_*_CLASSES`.
 * Lưu ý: `level="app"` tự CUỘN khi thẻ cao hơn màn (điện thoại xoay ngang) và canh giữa an toàn (`items-center-safe`: tràn
 * thì dính đỉnh, không mất phần đầu).
 *
 * @param props.title - Tiêu đề đã dịch.
 * @param props.description - Mô tả đã dịch.
 * @param props.tone - `chunk` | `error`. Mặc định `error`.
 * @param props.primaryLabel - Chữ nút chính.
 * @param props.onPrimary - Việc của nút chính (thử lại / tải lại).
 * @param props.secondaryLabel - Chữ nút phụ; bỏ trống → không có nút phụ.
 * @param props.onSecondary - Việc của nút phụ.
 * @param props.reference - Dòng mã tham chiếu cuối thẻ.
 * @param props.level - `app` (chiếm trọn màn hình, có nền trang) | `content` (lấp vùng nội dung). Mặc định `content`.
 *
 * @example
 * <ErrorScreen description={t('description')} primaryLabel={t('action')} title={t('title')} onPrimary={reset} />
 */
function ErrorScreen({
  title,
  description,
  tone = 'error',
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  reference,
  level = 'content',
}: ErrorScreenProps) {
  const isChunk = tone === 'chunk';

  const errorScreenClassName = cn(ERROR_SCREEN_BASE_CLASSES, ERROR_SCREEN_LEVEL_CLASSES[level]);
  const iconClassName = cn(ERROR_SCREEN_ICON_BASE_CLASSES, ERROR_SCREEN_ICON_TONE_CLASSES[tone]);

  return (
    <div className={errorScreenClassName} role="alert">
      <div className={ERROR_SCREEN_CARD_CLASSES}>
        <span className={iconClassName}>
          <StaticIcon
            className={isChunk ? 'text-warning' : 'text-error'}
            icon={isChunk ? ArrowsRotateBoldIcon : TriangleExclamationBoldIcon}
            size={40}
          />
        </span>
        <Heading size="small">{title}</Heading>
        <Text size="small" skin="muted">
          {description}
        </Text>
        <div className="flex flex-wrap justify-center gap-3 pt-3">
          <Button size="md" onClick={onPrimary}>
            {primaryLabel}
          </Button>
          {secondaryLabel && onSecondary && (
            <Button size="md" skin="neutral" variant="stroke" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          )}
        </div>
        {reference && (
          <Text className="pt-1 tabular-nums" size="extraTiny" skin="muted">
            {reference}
          </Text>
        )}
      </div>
    </div>
  );
}

export default ErrorScreen;
