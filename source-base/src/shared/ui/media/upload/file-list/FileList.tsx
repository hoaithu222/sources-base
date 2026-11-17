import { memo, type ReactNode } from 'react';
import Text from '@/shared/ui/primitives/Text';
import { cn } from '@/shared/utils/style/cn';
import FileCard, { type FileCardProps } from './FileCard';
import type { FileCardDensity, UploadFile } from '../upload.types';

export interface FileListProps extends Pick<
  FileCardProps,
  | 'onRemove'
  | 'onCancel'
  | 'onRetry'
  | 'onClick'
  | 'variant'
  | 'showPercent'
  | 'showProgressBar'
  | 'showStatus'
  | 'showRemove'
  | 'showCancel'
  | 'showRetry'
  | 'disabled'
> {
  files: UploadFile[];
  title?: ReactNode;
  emptyMessage?: ReactNode;
  density?: FileCardDensity;
  renderItem?: (file: UploadFile, index: number) => ReactNode;
  className?: string;
}

const FILE_LIST_CLASSES = 'flex w-full min-w-0 flex-col gap-1.5';

const FILE_LIST_ITEMS_CLASSES = 'flex w-full min-w-0 flex-col gap-2';

/**
 * FileList — danh sách tệp xếp dọc (`<ul>`); chuyển mọi handler / cờ hiển thị xuống `FileCard`, không giữ state.
 *
 * Ghép với `useUpload`: `<FileList files={files} onRemove={(f) => removeFile(f.id)} … />`.
 * Sửa giao diện: khung + khe → `FILE_LIST_CLASSES` / `FILE_LIST_ITEMS_CLASSES` · từng hàng → `FileCard`.
 *
 * @param props.files - Danh sách `UploadFile` cần hiện.
 * @param props.title - Tiêu đề phía trên danh sách.
 * @param props.emptyMessage - Dòng hiện khi danh sách rỗng; bỏ trống hoặc `""` để ẩn.
 * @param props.density - Mật độ thẻ: `cozy` | `compact`. Mặc định `cozy`.
 * @param props.renderItem - Thay hẳn `FileCard` mặc định: `(file, index) => ReactNode` (vẫn nằm trong `<li>`).
 * @param props.className - Class thêm cho khung danh sách.
 * @param props.variant - `FileCard.variant`: `detailed` | `simple`. Mặc định `detailed`.
 * @param props.showPercent - `FileCard.showPercent`. Mặc định `true`.
 * @param props.showProgressBar - `FileCard.showProgressBar`. Mặc định `true`.
 * @param props.showStatus - `FileCard.showStatus`. Mặc định `true`.
 * @param props.showRemove - `FileCard.showRemove`. Mặc định `true`.
 * @param props.showCancel - `FileCard.showCancel`. Mặc định `true`.
 * @param props.showRetry - `FileCard.showRetry`. Mặc định `true`.
 * @param props.disabled - Chế độ chỉ đọc: khoá mọi nút của mọi thẻ.
 * @param props.onRemove - Bấm xoá một tệp.
 * @param props.onCancel - Bấm huỷ tải một tệp.
 * @param props.onRetry - Bấm tải lại (lỗi) / tiếp tục (tạm dừng) một tệp.
 * @param props.onClick - Bấm vào một thẻ (vd xem trước).
 *
 * @example
 * <FileList files={files} title="Tệp đã tải" onRemove={(f) => removeFile(f.id)} onRetry={(f) => retryFile(f.id)} />
 */
const FileList = memo(function FileList({
  files,
  title,
  emptyMessage,
  density = 'cozy',
  renderItem,
  className,
  ...cardProps
}: FileListProps) {
  const hasFiles = files.length > 0;

  return (
    <div className={cn(FILE_LIST_CLASSES, className)}>
      {title ? (
        <Text size="small" weight="medium">
          {title}
        </Text>
      ) : null}
      {!hasFiles && emptyMessage ? (
        <Text size="tiny" skin="muted">
          {emptyMessage}
        </Text>
      ) : null}
      {hasFiles ? (
        <ul className={FILE_LIST_ITEMS_CLASSES}>
          {files.map((file, index) => (
            <li key={file.id} className="min-w-0">
              {renderItem ? (
                renderItem(file, index)
              ) : (
                <FileCard density={density} file={file} {...cardProps} />
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
});

export default FileList;
