'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getPathname } from '@/core/i18n';
import { PATHS } from '@/shared/constants/paths.constants';

import { reloadOnceOnChunkError } from './chunk-reload.utils';
import { describeError, logAppError } from './describe-error';
import ErrorScreen from './ErrorScreen';
import type { ScreenLevel } from './screen.types';

interface RouteErrorScreenProps {
  /** `error` do Next đưa vào `error.tsx`; production chỉ có `digest`, không có thông điệp gốc. */
  error: Error & { digest?: string };
  /** `reset` của Next: dựng lại segment lỗi. */
  reset: () => void;
  level: ScreenLevel;
  /** Tên nhánh trong log console, vd `app`, `page`. */
  label: string;
}

/**
 * RouteErrorScreen — thân của `error.tsx`: ghi log, tự tải lại MỘT lần khi lỗi tải chunk (vừa triển khai bản mới), rồi hiện
 * `ErrorScreen` đã dịch.
 *
 * Dùng:   `export default function Error(props) { return <RouteErrorScreen label="page" level="content" {...props} />; }`
 * Lưu ý:  lỗi tải chunk → nút chính là "Tải lại trang" (cứng); lỗi khác → "Thử lại" (`reset`) + "Về trang chủ" (điều hướng cứng,
 *         đúng tiền tố ngôn ngữ — cây React vừa ném lỗi, không tin là điều hướng phía client còn dựng nổi).
 *
 * @param props.error - Lỗi Next bắt được.
 * @param props.reset - Dựng lại segment.
 * @param props.level - `app` | `content`.
 * @param props.label - Tên nhánh trong log (`app`, `page`).
 */
export default function RouteErrorScreen({ error, reset, level, label }: RouteErrorScreenProps) {
  const t = useTranslations('errors.screens');
  const locale = useLocale();
  const isChunk = describeError(error).kind === 'chunk';

  useEffect(() => {
    logAppError(`${label} không tải hoặc không hiển thị được:`, error);
    reloadOnceOnChunkError(error);
  }, [error, label]);

  return (
    <ErrorScreen
      description={isChunk ? t('chunk.description') : t('error.description')}
      level={level}
      primaryLabel={isChunk ? t('chunk.action') : t('error.action')}
      reference={error.digest ? `${t('error.reference')}: ${error.digest}` : undefined}
      secondaryLabel={isChunk ? undefined : t('homeAction')}
      title={isChunk ? t('chunk.title') : t('error.title')}
      tone={isChunk ? 'chunk' : 'error'}
      onPrimary={isChunk ? () => window.location.reload() : reset}
      onSecondary={() => window.location.assign(getPathname({ href: PATHS.HOME, locale }))}
    />
  );
}
