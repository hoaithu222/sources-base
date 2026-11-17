import { useCallback, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import Text from '@/shared/ui/primitives/Text';
import { cn } from '@/shared/utils/style/cn';
import { useDropQueue } from './hooks/useDropQueue';
import {
  UPLOAD_DROP_AREA_HERO_BASE_CLASSES,
  UPLOAD_DROP_AREA_HERO_ICON_PX,
  UPLOAD_DROP_AREA_HERO_SIZE_CLASSES,
  UPLOAD_DROP_AREA_HERO_STATE_CLASSES,
} from './upload.theme';
import { readDirectoryDrop } from './utils/drop.utils';

export type DropzoneKind = 'file' | 'folder';

export interface DropzonePayload {
  /** 'folder' nếu có thư mục được thả; ngược lại 'file'. */
  kind: DropzoneKind;
  files: File[];
  /** Đường dẫn mọi thư mục vừa thả, kể cả rỗng — nguồn DUY NHẤT nhận ra thư mục rỗng. */
  folderPaths: string[];
}

export interface DropzoneProps {
  onDrop: (payload: DropzonePayload) => void;
  disabled?: boolean;
  overlayTitle?: ReactNode;
  overlayDescription?: ReactNode;
  className?: string;
  children: ReactNode;
}

const DROPZONE_OVERLAY_CLASSES = cn(
  'pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 px-3',
  'text-center rounded-lg border-2 border-dashed border-primary-5 bg-bg-surface/85 backdrop-blur-[2px]',
  'animate-fade-in motion-reduce:animate-none',
);

const DROPZONE_OVERLAY_HERO_CLASSES = cn(
  UPLOAD_DROP_AREA_HERO_BASE_CLASSES,
  UPLOAD_DROP_AREA_HERO_SIZE_CLASSES.md,
  UPLOAD_DROP_AREA_HERO_STATE_CLASSES.dragOver,
);

/**
 * Dropzone — vùng nhận KÉO-THẢ bọc nội dung bất kỳ (bảng, cây thư mục), hiện overlay khi kéo tệp vào.
 *
 * Khác `Upload`: không có nút chọn tệp, không giao diện riêng — chỉ biến khung có sẵn thành đích thả. Phân biệt
 * tệp / thư mục qua FileSystemEntry; tệp trong thư mục kèm `webkitRelativePath`.
 * Sửa giao diện: khung overlay → `DROPZONE_OVERLAY_CLASSES` · ô icon dùng chung `UPLOAD_DROP_AREA_HERO_*`
 * (upload.theme.ts).
 * Lưu ý: KHÔNG tự validate (accept / dung lượng) — caller xử lý. Thả rỗng thì không gọi `onDrop`. Đọc thư mục
 * là bất đồng bộ: các lần thả được giao ĐÚNG thứ tự thả, unmount trước khi đọc xong thì không giao. Thả lẫn thư
 * mục + tệp lẻ thì `kind="folder"` và chỉ có tệp nằm trong thư mục. Lý do thiết kế:
 * notes/components/media-upload.md.
 *
 * @param props.onDrop - Nhận `{ kind, files, folderPaths }`: `kind` `folder` khi có thư mục (kể cả rỗng —
 *   `folderPaths` là nguồn DUY NHẤT nhận ra thư mục rỗng), ngược lại `file`.
 * @param props.disabled - `true` → không nhận thả, không hiện overlay; vẫn render `children`. Mặc định `false`.
 * @param props.overlayTitle - Dòng chính của overlay. Mặc định "Thả tệp / thư mục vào đây".
 * @param props.overlayDescription - Dòng phụ của overlay.
 * @param props.className - Class thêm cho khung (luôn `relative`).
 * @param props.children - Nội dung được bọc.
 *
 * @example
 * <Dropzone onDrop={({ files }) => addFiles(files)} overlayDescription="Tối đa 20 MB / tệp">
 *   <FileList files={files} />
 * </Dropzone>
 */
function Dropzone({
  onDrop,
  disabled,
  overlayTitle = 'Thả tệp / thư mục vào đây',
  overlayDescription,
  className,
  children,
}: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const depthRef = useRef(0);
  const enqueueDrop = useDropQueue();

  const reset = useCallback(() => {
    depthRef.current = 0;
    setDragging(false);
  }, []);

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      if (disabled || !Array.from(e.dataTransfer.types).includes('Files')) return;
      e.preventDefault();
      depthRef.current += 1;
      setDragging(true);
    },
    [disabled],
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      if (disabled || !dragging) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    },
    [disabled, dragging],
  );

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      if (disabled || !dragging) return;
      e.preventDefault();
      depthRef.current -= 1;
      if (depthRef.current <= 0) reset();
    },
    [disabled, dragging, reset],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      reset();
      const dt = e.dataTransfer;
      const loose = Array.from(dt.files ?? []);
      enqueueDrop(readDirectoryDrop(dt), ({ files: folderFiles, folderPaths }) => {
        if (folderPaths.length > 0) {
          onDrop({ kind: 'folder', files: folderFiles, folderPaths });
        } else if (loose.length > 0) {
          onDrop({ kind: 'file', files: loose, folderPaths: [] });
        }
      });
    },
    [disabled, enqueueDrop, onDrop, reset],
  );

  return (
    <div
      className={cn('relative', className)}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      {dragging && (
        <div className={DROPZONE_OVERLAY_CLASSES}>
          <span aria-hidden className={DROPZONE_OVERLAY_HERO_CLASSES}>
            <SystemIcon name="upload-outline" size={UPLOAD_DROP_AREA_HERO_ICON_PX.md} />
          </span>
          <Text size="small" weight="medium">
            {overlayTitle}
          </Text>
          {overlayDescription && (
            <Text size="tiny" skin="muted">
              {overlayDescription}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}

export default Dropzone;
