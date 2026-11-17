import { memo, useCallback, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import Button from '@/shared/ui/actions/Button';
import { SystemIcon, type SystemIconName } from '@/shared/ui/icons/Icons';
import Divider from '@/shared/ui/primitives/Divider';
import { cn } from '@/shared/utils/style/cn';
import { formatFileSize } from '@/shared/utils/format/file-size.utils';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import FileBadge from './FileBadge';
import {
  FILE_CARD_ACCENT_CLASSES,
  FILE_CARD_ACTION_BASE_CLASSES,
  FILE_CARD_ACTION_SKINS,
  FILE_CARD_ACTION_TONE_CLASSES,
  FILE_CARD_ACTIONS_CLASSES,
  FILE_CARD_BADGE_SIZES,
  FILE_CARD_BASE_CLASSES,
  FILE_CARD_BODY_CLASSES,
  FILE_CARD_DENSITY_CLASSES,
  FILE_CARD_INTERACTIVE_CLASSES,
  FILE_CARD_META_CLASSES,
  FILE_CARD_NAME_CLASSES,
  FILE_CARD_NAME_DENSITY_CLASSES,
  FILE_CARD_PERCENT_CLASSES,
  FILE_CARD_PROGRESS_FILL_CLASSES,
  FILE_CARD_PROGRESS_SHINE_CLASSES,
  FILE_CARD_PROGRESS_TRACK_CLASSES,
  FILE_CARD_STATUS_LABEL_CLASSES,
  FILE_CARD_STATUS_TONES,
} from './file-card.theme';
import type {
  FileCardActionTone,
  FileCardDensity,
  FileCardVariant,
  UploadFile,
  UploadFileStatus,
} from '../upload.types';

export interface FileCardProps {
  file: UploadFile;
  density?: FileCardDensity;
  variant?: FileCardVariant;
  showPercent?: boolean;
  showProgressBar?: boolean;
  showStatus?: boolean;
  showRemove?: boolean;
  showCancel?: boolean;
  showRetry?: boolean;
  disabled?: boolean;
  statusLabel?: string;
  actions?: ReactNode;
  onRemove?: (file: UploadFile) => void;
  onCancel?: (file: UploadFile) => void;
  onRetry?: (file: UploadFile) => void;
  onClick?: (file: UploadFile) => void;
  className?: string;
}

interface FileCardActionProps {
  icon: SystemIconName;
  label: string;
  tone: FileCardActionTone;
  disabled?: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

const FILE_CARD_STATUS_LABELS = {
  pending: 'Đang chờ',
  uploading: 'Đang tải file',
  paused: 'Đã tạm dừng',
  success: 'Đã tải xong',
  error: 'Lỗi tải file',
} satisfies Record<UploadFileStatus, string>;

function clampProgress(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * FileCardAction — nút icon `ghost` cỡ 28px trong cụm nút của FileCard; nội bộ của FileCard.
 *
 * @param props.icon - Icon của nút.
 * @param props.label - Tên trợ năng, dùng luôn làm tooltip gốc.
 * @param props.tone - Màu: `neutral` | `danger` | `primary`.
 * @param props.disabled - Khoá nút.
 * @param props.onClick - Bấm nút (đã chặn nổi bọt lên thẻ ở FileCard).
 *
 * @example
 * <FileCardAction icon="trash-outline" label="Xoá tệp" tone="danger" onClick={handleRemove} />
 */
const FileCardAction = memo(function FileCardAction({
  icon,
  label,
  tone,
  disabled,
  onClick,
}: FileCardActionProps) {
  const actionClassName = cn(FILE_CARD_ACTION_BASE_CLASSES, FILE_CARD_ACTION_TONE_CLASSES[tone]);

  return (
    <Button
      aria-label={label}
      className={actionClassName}
      disabled={disabled}
      size="xs"
      skin={FILE_CARD_ACTION_SKINS[tone]}
      title={label}
      variant="ghost"
      onClick={onClick}
    >
      <SystemIcon aria-hidden name={icon} size={14} />
    </Button>
  );
});

/**
 * FileCard — một hàng tệp với 5 trạng thái (pending · uploading · paused · success · error) và nút theo trạng thái.
 *
 * Mỗi trạng thái có icon · vạch trái 2px · thanh tiến độ đáy · màu chữ riêng. Nút mặc định: `uploading` → huỷ
 * + xoá · `paused` / `error` → thử lại + xoá · còn lại → xoá; `actions` thay thế toàn bộ. Có `onClick` thì thẻ là
 * `role="button"` (Tab tới được, Enter / Space kích hoạt). Nhiều tệp → `FileList`.
 * Sửa giao diện: mọi class → `file-card.theme.ts` (trạng thái → `FILE_CARD_STATUS_TONES` · đệm →
 * `FILE_CARD_DENSITY_CLASSES` · nút → `FILE_CARD_ACTION_*`) · nhãn trạng thái → `FILE_CARD_STATUS_LABELS`.
 * Lưu ý: `file.error` thay nhãn trạng thái (cắt một dòng, đủ câu ở `title`) nên mọi hàng cao bằng nhau.
 *
 * @param props.file - Tệp cần hiện (`UploadFile`); trạng thái lấy từ `file.status`, lỗi từ `file.error`.
 * @param props.density - Mật độ: `cozy` | `compact`. Mặc định `cozy`.
 * @param props.variant - `detailed` (badge + dung lượng + trạng thái + tiến độ) | `simple` (kẹp giấy + tên +
 *   nút; vẫn có vạch trái + thanh tiến độ). Mặc định `detailed`.
 * @param props.showPercent - Hiện % sau nhãn trạng thái khi đang tải / tạm dừng. Mặc định `true`.
 * @param props.showProgressBar - Thanh tiến độ mảnh trên viền đáy khi chờ / đang tải / tạm dừng. Mặc định `true`.
 * @param props.showStatus - Hiện icon + chữ trạng thái. Mặc định `true`.
 * @param props.showRemove - Hiện nút xoá. Mặc định `true`.
 * @param props.showCancel - Hiện nút huỷ khi đang tải. Mặc định `true`.
 * @param props.showRetry - Hiện nút thử lại / tiếp tục khi lỗi / tạm dừng. Mặc định `true`.
 * @param props.disabled - Chế độ chỉ đọc: khoá mọi nút. Mặc định `false`.
 * @param props.statusLabel - Ghi đè chữ trạng thái mặc định (`file.error` vẫn được ưu tiên).
 * @param props.actions - Thay thế toàn bộ nút mặc định.
 * @param props.onRemove - Bấm xoá.
 * @param props.onCancel - Bấm huỷ tải.
 * @param props.onRetry - Bấm "Tải lại" (error) hoặc "Tiếp tục" (paused).
 * @param props.onClick - Bấm vào thẻ (vd xem trước).
 * @param props.className - Class thêm cho thẻ.
 *
 * @example
 * <FileCard file={file} onRemove={(f) => removeFile(f.id)} onCancel={(f) => cancelFile(f.id)} />
 */
const FileCard = memo(function FileCard({
  file,
  density = 'cozy',
  variant = 'detailed',
  showPercent = true,
  showProgressBar = true,
  showStatus = true,
  showRemove = true,
  showCancel = true,
  showRetry = true,
  disabled,
  statusLabel,
  actions,
  onRemove,
  onCancel,
  onRetry,
  onClick,
  className,
}: FileCardProps) {
  const tone = FILE_CARD_STATUS_TONES[file.status];
  const isSimple = variant === 'simple';
  const isUploading = file.status === 'uploading';
  const isPaused = file.status === 'paused';
  const isErrored = file.status === 'error';
  const progress = clampProgress(file.progress);
  const statusText = file.error ?? statusLabel ?? FILE_CARD_STATUS_LABELS[file.status];
  const nameTitle = isSimple && file.error ? `${file.name} — ${file.error}` : file.name;
  const hasBar = showProgressBar && tone.bar;
  const hasPercent = showPercent && (isUploading || isPaused);

  const handleRemove = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onRemove?.(file);
    },
    [file, onRemove],
  );
  const handleCancel = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onCancel?.(file);
    },
    [file, onCancel],
  );
  const handleRetry = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onRetry?.(file);
    },
    [file, onRetry],
  );
  const handleRootClick = useCallback(() => onClick?.(file), [file, onClick]);
  const handleRootKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      onClick?.(file);
    },
    [file, onClick],
  );

  const cardClassName = cn(
    FILE_CARD_BASE_CLASSES,
    FILE_CARD_DENSITY_CLASSES[density],
    tone.root,
    onClick && FILE_CARD_INTERACTIVE_CLASSES,
    className,
  );
  const trackClassName = cn(FILE_CARD_PROGRESS_TRACK_CLASSES, tone.track);
  const fillClassName = cn(FILE_CARD_PROGRESS_FILL_CLASSES, tone.fill);
  const accentClassName = cn(FILE_CARD_ACCENT_CLASSES, tone.accent);
  const nameClassName = cn(FILE_CARD_NAME_CLASSES, FILE_CARD_NAME_DENSITY_CLASSES[density]);
  const statusClassName = cn(FILE_CARD_STATUS_LABEL_CLASSES, tone.tone);
  const percentClassName = cn(FILE_CARD_PERCENT_CLASSES, tone.tone);

  const defaultActions = (
    <>
      {showCancel && isUploading ? (
        <FileCardAction
          disabled={disabled}
          icon="xmark-outline"
          label="Huỷ tải"
          tone="neutral"
          onClick={handleCancel}
        />
      ) : null}
      {showRetry && (isPaused || isErrored) ? (
        <FileCardAction
          disabled={disabled}
          icon={isPaused ? 'play-outline' : 'arrow-rotate-right-outline'}
          label={isPaused ? 'Tiếp tục' : 'Tải lại'}
          tone="primary"
          onClick={handleRetry}
        />
      ) : null}
      {showRemove ? (
        <FileCardAction
          disabled={disabled}
          icon="trash-outline"
          label="Xoá tệp"
          tone="danger"
          onClick={handleRemove}
        />
      ) : null}
    </>
  );

  return (
    <div
      className={cardClassName}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick ? handleRootClick : undefined}
      onKeyDown={onClick ? handleRootKeyDown : undefined}
    >
      {hasBar ? (
        <span aria-hidden className={trackClassName}>
          <span className={fillClassName} style={{ width: `${progress}%` }}>
            {isUploading ? <span className={FILE_CARD_PROGRESS_SHINE_CLASSES} /> : null}
          </span>
        </span>
      ) : null}
      <span aria-hidden className={accentClassName} />
      {isSimple ? (
        <SystemIcon aria-hidden className={tone.tone} name="paperclip-bold" size={16} />
      ) : (
        <FileBadge
          name={file.name}
          previewUrl={file.previewUrl}
          size={FILE_CARD_BADGE_SIZES[density]}
        />
      )}
      <div className={FILE_CARD_BODY_CLASSES}>
        <p className={nameClassName} title={nameTitle}>
          {file.name}
        </p>
        {isSimple ? null : (
          <div className={FILE_CARD_META_CLASSES}>
            <span className="shrink-0">{formatFileSize(file.size)}</span>
            {showStatus || hasPercent ? (
              <Divider className="my-0.5" orientation="vertical" />
            ) : null}
            {showStatus ? (
              <span className={statusClassName} title={statusText}>
                <SystemIcon aria-hidden className={tone.motion} name={tone.icon} size={12} />
                <span className={TEXT_ELLIPSIS_CLASSES}>{statusText}</span>
              </span>
            ) : null}
            {hasPercent ? <span className={percentClassName}>{progress}%</span> : null}
          </div>
        )}
      </div>
      <div className={FILE_CARD_ACTIONS_CLASSES}>{actions ?? defaultActions}</div>
    </div>
  );
});

export default FileCard;
