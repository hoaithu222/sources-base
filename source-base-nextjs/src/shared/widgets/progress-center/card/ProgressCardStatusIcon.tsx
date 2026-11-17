import { memo } from 'react';
import { useTranslations } from 'next-intl';

import { ProgressCircle } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import type { ProgressCardStatus } from '../progress-center.types';
import {
  PROGRESS_CARD_ICON_BASE_CLASSES,
  PROGRESS_CARD_ICON_NAMES,
  PROGRESS_CARD_ICON_WRAP_CLASSES,
  PROGRESS_CARD_RING_VARIANTS,
} from './progress-card.theme';

interface ProgressCardStatusIconProps {
  status: ProgressCardStatus;
  progress?: number;
}

/**
 * ProgressCardStatusIcon — chỉ báo trạng thái đầu thẻ `ProgressCard`: đang chạy có % → vòng tiến độ
 * (`ProgressCircle`, đọc được bằng trình đọc màn hình); còn lại → icon trong đĩa màu.
 *
 * Sửa giao diện: icon · đĩa màu · màu vòng → `PROGRESS_CARD_ICON_*` / `PROGRESS_CARD_RING_VARIANTS`.
 *
 * @param props.status - `running` | `success` | `error`.
 * @param props.progress - 0–100; chỉ dùng khi `status="running"`. Bỏ trống → icon xoay (không biết
 *   tiến độ) kèm chữ "Đang xử lý" (theo ngôn ngữ) cho trình đọc màn hình.
 *
 * @example
 * <ProgressCardStatusIcon status="running" progress={42} />
 */
const ProgressCardStatusIcon = memo(function ProgressCardStatusIcon({
  status,
  progress,
}: ProgressCardStatusIconProps) {
  const t = useTranslations('ui.widgets');

  if (status === 'running' && typeof progress === 'number') {
    return (
      <ProgressCircle
        label={t('progressCenter.doneLabel', { percent: Math.round(progress) })}
        showValue
        size="sm"
        value={progress}
        variant={PROGRESS_CARD_RING_VARIANTS[status]}
      />
    );
  }

  const wrapClassName = cn(
    PROGRESS_CARD_ICON_BASE_CLASSES,
    PROGRESS_CARD_ICON_WRAP_CLASSES[status],
  );

  return (
    <span className={wrapClassName}>
      <SystemIcon
        aria-hidden
        className={status === 'running' ? 'animate-spin motion-reduce:animate-none' : undefined}
        name={PROGRESS_CARD_ICON_NAMES[status]}
        size={18}
      />
      {status === 'running' && <span className="sr-only">{t('progressCenter.processing')}</span>}
    </span>
  );
});

export default ProgressCardStatusIcon;
