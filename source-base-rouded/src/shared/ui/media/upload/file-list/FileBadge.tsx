import { memo } from 'react';
import { SystemIcon, type SystemIconName } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import {
  FILE_BADGE_BASE_CLASSES,
  FILE_BADGE_ICON_PX,
  FILE_BADGE_LABEL_BASE_CLASSES,
  FILE_BADGE_LABEL_SKIN_CLASSES,
  FILE_BADGE_PREVIEW_CLASSES,
  FILE_BADGE_SIZE_CLASSES,
  FILE_BADGE_SKIN_CLASSES,
} from './file-card.theme';
import type { FileBadgeSize, FileBadgeSkin } from '../upload.types';
import { getFileTypeStyle } from '../utils/upload.utils';

export interface FileBadgeProps {
  name: string;
  skin?: FileBadgeSkin;
  iconName?: SystemIconName;
  label?: string;
  size?: FileBadgeSize;
  previewUrl?: string;
  className?: string;
}

/**
 * FileBadge — ô vuông loại tệp: icon + nhãn đuôi (PDF, DOCX…) trên nền nhuộm, tự suy từ đuôi tên tệp
 * (`getFileTypeStyle`).
 *
 * Có `previewUrl` thì vẽ ảnh thu nhỏ thay cho icon. Dùng trong `FileCard`; dùng riêng khi cần biểu tượng tệp.
 * Sửa giao diện: màu → `FILE_BADGE_SKIN_CLASSES` · nhãn → `FILE_BADGE_LABEL_*` · cỡ → `FILE_BADGE_SIZE_CLASSES`
 * (file-card.theme.ts).
 *
 * @param props.name - Tên tệp (suy loại từ đuôi; cũng là `alt` của ảnh xem trước).
 * @param props.skin - Ghi đè màu: `red` | `blue` | `green` | `orange` | `purple` | `sky` | `neutral`.
 *   Mặc định theo loại tệp.
 * @param props.iconName - Ghi đè icon (`SystemIconName`). Mặc định theo loại tệp.
 * @param props.label - Ghi đè nhãn (PDF, DOCX…); `""` để ẩn. Mặc định theo loại tệp.
 * @param props.size - Cỡ ô: `sm` | `md` | `lg`. Mặc định `md`.
 * @param props.previewUrl - URL ảnh thu nhỏ (vd `UploadFile.previewUrl`); có thì thay icon.
 * @param props.className - Class thêm cho ô.
 *
 * @example
 * <FileBadge name="ho-so.pdf" />
 *
 * <FileBadge name="anh.png" previewUrl={file.previewUrl} size="sm" />
 */
const FileBadge = memo(function FileBadge({
  name,
  skin,
  iconName,
  label,
  size = 'md',
  previewUrl,
  className,
}: FileBadgeProps) {
  const auto = getFileTypeStyle(name);
  const finalSkin = skin ?? auto.skin;
  const finalIcon = iconName ?? (auto.iconName as SystemIconName);
  const finalLabel = label ?? auto.label;

  const badgeClassName = cn(
    FILE_BADGE_BASE_CLASSES,
    FILE_BADGE_SIZE_CLASSES[size],
    previewUrl ? FILE_BADGE_PREVIEW_CLASSES : FILE_BADGE_SKIN_CLASSES[finalSkin],
    className,
  );

  if (previewUrl) {
    return (
      <span className={badgeClassName}>
        <img alt={name} className="absolute inset-0 size-full object-cover" src={previewUrl} />
      </span>
    );
  }

  const labelClassName = cn(
    FILE_BADGE_LABEL_BASE_CLASSES,
    FILE_BADGE_LABEL_SKIN_CLASSES[finalSkin],
  );

  return (
    <span className={badgeClassName}>
      <SystemIcon aria-hidden name={finalIcon} size={FILE_BADGE_ICON_PX[size]} />
      {finalLabel ? <span className={labelClassName}>{finalLabel}</span> : null}
    </span>
  );
});

export default FileBadge;
