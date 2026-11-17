'use client';

import { memo, useCallback, useState, type CSSProperties, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import type { ProgressCardStatus } from '../progress-center.types';
import {
  PROGRESS_CARD_ACCENT_CLASSES,
  PROGRESS_CARD_EDGE_CLASSES,
  PROGRESS_CARD_ROOT_CLASSES,
  PROGRESS_CARD_SLOT_CLASSES as SLOT,
  PROGRESS_CARD_STATUS_CLASSES,
} from './progress-card.theme';
import ProgressCardStatusIcon from './ProgressCardStatusIcon';
import { useAutoDismiss } from './useAutoDismiss';

interface ProgressCardProps {
  status: ProgressCardStatus;
  title: string;
  meta?: string;
  subtitle?: string;
  message?: string;
  progress?: number;
  actions?: ReactNode;
  onClose?: () => void;
  autoCloseMs?: number;
  children?: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

const clampPercent = (value: number): number => Math.min(100, Math.max(0, value));

/**
 * ProgressCard — thẻ tiến trình neo góc màn hình, dùng chung cho tải tệp lên (`UploadQueueCard`) và tác
 * vụ chạy dài phía máy chủ (`ServerTaskList`). Thẻ không tự neo — `ProgressCenter` lo chỗ đứng.
 *
 * Vạch trái, nền loang, icon cùng đổi theo `status` (cùng hình ở cả hai theme). `children` là phần mở
 * rộng, ẩn sau nút "Xem chi tiết". Vạch đáy thẻ chỉ để nhìn (đang chạy = tiến độ, hết chạy = thời gian còn lại trước khi tự đóng);
 * tiến độ cho trình đọc màn hình nằm ở vòng `ProgressCircle`.
 * Sửa giao diện: mọi class → `progress-card.theme.ts` · chỉ báo trạng thái → `ProgressCardStatusIcon.tsx`.
 * Lưu ý: `autoCloseMs` chỉ chạy khi KHÔNG còn `running` và có `onClose`; rê chuột / đặt focus vào thẻ thì
 * dừng đếm, cả hai rời ra mới chạy tiếp phần còn lại.
 *
 * @param props.status - `running` | `success` | `error`.
 * @param props.title - Dòng đầu — việc đang làm ("Đang tải lên", "Nhập vật tư chính").
 * @param props.meta - Nhãn nhỏ sát sau tiêu đề, vd `"2/5"`.
 * @param props.subtitle - Dòng phụ dưới tiêu đề (tên tệp, tổng kết ngắn).
 * @param props.message - Dòng thông điệp chi tiết (câu lỗi, kết quả); thẻ `error` tô màu lỗi.
 * @param props.progress - 0–100. Bỏ trống khi đang chạy → icon xoay (không biết tiến độ).
 * @param props.actions - Nút hành động ở chân thẻ (vd "Thử lại", "Huỷ tải lên").
 * @param props.onClose - Có giá trị → hiện nút × ở góc phải; cũng là hàm được gọi khi tự đóng.
 * @param props.autoCloseMs - Tự gọi `onClose` sau ngần này ms kể từ lúc hết `running`. Bỏ trống → ở lại.
 * @param props.children - Phần mở rộng, vd `<ProgressCardItemList>`; có thì hiện nút mở / thu gọn.
 * @param props.defaultExpanded - Mở sẵn phần mở rộng cho tới khi người dùng tự bấm (vd khi có lỗi).
 *   Mặc định `false`.
 * @param props.className - Class thêm cho khung thẻ.
 *
 * @example
 * <ProgressCard status="running" title="Đang tải lên" meta="2/5" subtitle="a.xlsx" progress={42} />
 *
 * <ProgressCard status="success" title="Xong" autoCloseMs={6000} onClose={remove}>
 *   <ProgressCardItemList items={items} />
 * </ProgressCard>
 */
const ProgressCard = memo(function ProgressCard({
  status,
  title,
  meta,
  subtitle,
  message,
  progress,
  actions,
  onClose,
  autoCloseMs,
  children,
  defaultExpanded = false,
  className,
}: ProgressCardProps) {
  const t = useTranslations('ui.widgets');
  const tc = useTranslations('ui.common');
  const running = status === 'running';
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);
  const expanded = userExpanded ?? defaultExpanded;
  const toggleExpanded = useCallback(() => setUserExpanded(!expanded), [expanded]);

  const countdown = useAutoDismiss({
    durationMs: running ? undefined : autoCloseMs,
    onDismiss: onClose,
  });

  const hasProgress = running && typeof progress === 'number';
  const countdownStyle: CSSProperties = {
    animationName: 'grow-x',
    animationDuration: `${autoCloseMs ?? 0}ms`,
    animationTimingFunction: 'linear',
    animationDirection: 'reverse',
    animationFillMode: 'both',
    animationPlayState: countdown.paused ? 'paused' : 'running',
  };

  const rootClassName = cn(
    PROGRESS_CARD_ROOT_CLASSES,
    PROGRESS_CARD_STATUS_CLASSES[status],
    className,
  );
  const edgeFillClassName = cn(SLOT.edgeFill, PROGRESS_CARD_EDGE_CLASSES[status]);
  const expandLabel = expanded
    ? t('progressCenter.collapseDetails')
    : t('progressCenter.viewDetails');

  return (
    <div className={rootClassName} {...countdown.handlers}>
      <span aria-hidden className={cn(SLOT.accent, PROGRESS_CARD_ACCENT_CLASSES[status])} />

      <div className={SLOT.body}>
        <div className={SLOT.head}>
          <ProgressCardStatusIcon progress={progress} status={status} />

          <div className={SLOT.text}>
            <span className={SLOT.titleRow}>
              <span className={SLOT.title} title={title}>
                {title}
              </span>
              {meta && <span className={SLOT.meta}>{meta}</span>}
            </span>
            {subtitle && (
              <span className={SLOT.subtitle} title={subtitle}>
                {subtitle}
              </span>
            )}
            {message && (
              <span className={status === 'error' ? SLOT.messageError : SLOT.message}>
                {message}
              </span>
            )}
          </div>

          <div className={SLOT.tools}>
            {children && (
              <Button
                aria-expanded={expanded}
                aria-label={expandLabel}
                className={SLOT.tool}
                size="xs"
                skin="neutral"
                title={expandLabel}
                variant="ghost"
                onClick={toggleExpanded}
              >
                <SystemIcon name={expanded ? 'angle-up-outline' : 'angle-down-outline'} size={14} />
              </Button>
            )}
            {onClose && (
              <Button
                aria-label={tc('close')}
                className={SLOT.tool}
                size="xs"
                skin="neutral"
                title={tc('close')}
                variant="ghost"
                onClick={onClose}
              >
                <SystemIcon name="xmark-outline" size={14} />
              </Button>
            )}
          </div>
        </div>

        {children && expanded && <div className={SLOT.details}>{children}</div>}

        {actions && <div className={SLOT.actions}>{actions}</div>}
      </div>

      {(hasProgress || countdown.active) && (
        <span aria-hidden className={SLOT.edgeTrack}>
          {hasProgress ? (
            <span className={edgeFillClassName} style={{ width: `${clampPercent(progress)}%` }} />
          ) : (
            <span
              className={edgeFillClassName}
              data-countdown={countdown.paused ? 'paused' : 'running'}
              style={{ width: '100%', ...countdownStyle }}
            />
          )}
        </span>
      )}
    </div>
  );
});

export default ProgressCard;
