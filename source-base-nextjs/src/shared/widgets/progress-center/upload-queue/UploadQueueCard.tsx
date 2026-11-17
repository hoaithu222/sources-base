'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';

import { useBeforeUnload } from '@/shared/hooks';
import { Button, type UploadFile } from '@/shared/ui';
import { formatFileSize } from '@/shared/utils/format/file-size.utils';

import { ProgressCard, ProgressCardItemList, type ProgressCardItem } from '../card';
import type { ProgressCardStatus, ProgressStatus } from '../progress-center.types';
import { useUploadQueue, type UploadQueueSummary } from './useUploadQueue';

type Translate = ReturnType<typeof useTranslations<'ui.widgets'>>;

interface QueueActionsProps {
  status: ProgressCardStatus;
  onCancel: () => void;
  onClear: () => void;
  onRetry: () => void;
}

const SUCCESS_AUTO_CLOSE_MS = 6000;

const UPLOAD_ITEM_STATUSES = {
  pending: 'pending',
  uploading: 'running',
  paused: 'pending',
  success: 'success',
  error: 'error',
} satisfies Record<UploadFile['status'], ProgressStatus>;

function statusOf({ active, failed }: UploadQueueSummary): ProgressCardStatus {
  if (active) return 'running';
  return failed > 0 ? 'error' : 'success';
}

function titleOf(status: ProgressCardStatus, { done }: UploadQueueSummary, t: Translate): string {
  if (status === 'running') return t('progressCenter.upload.running');
  if (status === 'success') return t('progressCenter.upload.success');
  return done > 0 ? t('progressCenter.upload.partial') : t('progressCenter.upload.failed');
}

function subtitleOf(
  status: ProgressCardStatus,
  summary: UploadQueueSummary,
  bytes: number,
  t: Translate,
) {
  if (status === 'running') return summary.active?.name;
  if (status === 'success') {
    return t('progressCenter.upload.subtitleSuccess', {
      total: summary.total,
      size: formatFileSize(bytes),
    });
  }
  return t('progressCenter.upload.subtitleFailed', { done: summary.done, failed: summary.failed });
}

/** Tiến độ cả lô: tệp đã xử lý (xong + lỗi) tính 100%, tệp đang tải tính theo % của nó. */
function overallProgress({ total, done, failed, active }: UploadQueueSummary): number {
  if (total === 0) return 0;
  const current = active?.status === 'uploading' ? active.progress : 0;
  return Math.round(((done + failed) * 100 + current) / total);
}

function toItem(task: UploadFile, t: Translate): ProgressCardItem {
  const status = UPLOAD_ITEM_STATUSES[task.status];
  const detail =
    status === 'error'
      ? (task.error ?? t('progressCenter.upload.failed'))
      : status === 'running'
        ? `${Math.round(task.progress)}%`
        : formatFileSize(task.size);
  return { id: task.id, name: task.name, status, detail };
}

const QueueActions = memo(function QueueActions({
  status,
  onCancel,
  onClear,
  onRetry,
}: QueueActionsProps) {
  const t = useTranslations('ui.widgets');
  const tc = useTranslations('ui.common');

  if (status === 'success') return null;

  if (status === 'running') {
    return (
      <Button size="xs" skin="neutral" variant="ghost" onClick={onCancel}>
        {t('progressCenter.upload.cancel')}
      </Button>
    );
  }

  return (
    <>
      <Button size="xs" skin="neutral" variant="ghost" onClick={onClear}>
        {t('progressCenter.upload.skip')}
      </Button>
      <Button size="xs" variant="primary" onClick={onRetry}>
        {tc('retry')}
      </Button>
    </>
  );
});

/**
 * UploadQueueCard — MỘT thẻ tổng kết hàng đợi tải lên (`useUploadQueue`); không tự neo, `ProgressCenter`
 * lo chỗ đứng. Không có prop: đọc thẳng hàng đợi dùng chung.
 *
 * Hàng đợi rỗng → `null`. Vòng % là tiến độ CẢ LÔ, không phải của tệp đang tải. Xong sạch thì thẻ tự đóng
 * sau `SUCCESS_AUTO_CLOSE_MS`; có tệp lỗi thì thẻ Ở LẠI và mở sẵn danh sách tệp.
 * Lưu ý: còn tệp đang tải thì tải lại trang / đóng tab sẽ hỏi xác nhận (`useBeforeUnload`).
 *
 * @example
 * const { enqueue } = useUploadQueue();   // từ màn bất kỳ — thẻ tự hiện
 * enqueue(files, (file, { onProgress, signal }) => api.upload(file, onProgress, signal));
 */
const UploadQueueCard = memo(function UploadQueueCard() {
  const t = useTranslations('ui.widgets');
  const { tasks, summary, retryFailed, clear, cancel } = useUploadQueue();

  useBeforeUnload(Boolean(summary.active));

  if (tasks.length === 0) return null;

  const status = statusOf(summary);
  const running = status === 'running';
  const totalBytes = tasks.reduce((sum, task) => sum + task.size, 0);

  return (
    <ProgressCard
      actions={
        status === 'success' ? undefined : (
          <QueueActions status={status} onCancel={cancel} onClear={clear} onRetry={retryFailed} />
        )
      }
      autoCloseMs={status === 'success' ? SUCCESS_AUTO_CLOSE_MS : undefined}
      defaultExpanded={status === 'error'}
      meta={`${summary.done}/${summary.total}`}
      progress={running ? overallProgress(summary) : undefined}
      status={status}
      subtitle={subtitleOf(status, summary, totalBytes, t)}
      title={titleOf(status, summary, t)}
      onClose={running ? undefined : clear}
    >
      <ProgressCardItemList items={tasks.map((task) => toItem(task, t))} />
    </ProgressCard>
  );
});

export default UploadQueueCard;
