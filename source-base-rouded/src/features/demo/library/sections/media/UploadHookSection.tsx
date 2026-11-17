import { memo, useCallback, useEffect, useRef } from 'react';

import {
  Badge,
  Button,
  Dropzone,
  FileList,
  ImageLightbox,
  LightboxToolButton,
  Text,
  useUpload,
  type DropzonePayload,
  type UploadFile,
} from '@/shared/ui';
import { useDisclosure } from '@/shared/hooks';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  DEMO_UPLOAD_INITIAL,
  DEMO_UPLOAD_STEP,
  DEMO_LIGHTBOX_SRC,
  DEMO_UPLOAD_TICK_MS,
} from '../../constants/media/upload.constants';

/**
 * UploadHookSection — mục "Tải tệp & xem ảnh" của trang `/demo`: `useUpload` có tiến độ / huỷ / thử lại + nút công cụ của `ImageLightbox`.
 */
const UploadHookSection = memo(function UploadHookSection() {
  const lightbox = useDisclosure();
  const timersRef = useRef<number[]>([]);

  useEffect(
    () => () => {
      for (const id of timersRef.current) window.clearInterval(id);
      timersRef.current = [];
    },
    [],
  );

  const fakeUpload = useCallback(
    (
      file: File,
      { onProgress, signal }: { onProgress: (p: number) => void; signal: AbortSignal },
    ) =>
      new Promise<string>((resolve, reject) => {
        let progress = 0;
        const tick = window.setInterval(() => {
          if (signal.aborted) {
            window.clearInterval(tick);
            reject(new Error('Đã huỷ'));
            return;
          }
          progress = Math.min(100, progress + DEMO_UPLOAD_STEP);
          onProgress(progress);
          if (progress >= 100) {
            window.clearInterval(tick);
            resolve(`https://example.invalid/${encodeURIComponent(file.name)}`);
          }
        }, DEMO_UPLOAD_TICK_MS);
        timersRef.current.push(tick);
      }),
    [],
  );

  const upload = useUpload({
    initialFiles: DEMO_UPLOAD_INITIAL,
    multiple: true,
    maxSize: 10 * 1024 ** 2,
    onUpload: fakeUpload,
  });

  const { addFiles, cancelFile, removeFile, retryFile } = upload;

  const handleDrop = useCallback((payload: DropzonePayload) => addFiles(payload.files), [addFiles]);

  const handleRemove = useCallback((file: UploadFile) => removeFile(file.id), [removeFile]);
  const handleCancel = useCallback((file: UploadFile) => cancelFile(file.id), [cancelFile]);
  const handleRetry = useCallback((file: UploadFile) => retryFile(file.id), [retryFile]);

  return (
    <DemoSection
      description="Hàng đợi tải tệp có tiến độ, huỷ và thử lại — cùng nút công cụ của khung xem ảnh."
      importPath="@/shared/ui — useUpload, Dropzone, LightboxToolButton"
      title="Tải tệp & xem ảnh"
    >
      <DemoRow
        label="useUpload + Dropzone"
        note="kéo tệp thả vào vùng dưới — tiến độ chạy thật, bấm ✕ giữa chừng để thấy huỷ có tác dụng"
        stacked
      >
        <Dropzone onDrop={handleDrop}>
          <div className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-strong bg-bg-subtle p-3">
            <Text size="small" weight="medium">
              Thả tệp vào đây
            </Text>
            <Text size="tiny" skin="muted">
              tối đa 10 MB/tệp · tiến độ chạy giả lập
            </Text>
          </div>
        </Dropzone>

        <div className="flex flex-wrap items-center gap-2">
          <Badge color={upload.isUploading ? 'primary' : 'neutral'} variant="tinted">
            {upload.isUploading ? 'Đang tải…' : 'Rảnh'}
          </Badge>
          <Text size="tiny" skin="muted">
            {upload.files.length} tệp trong hàng đợi
          </Text>
          <Button size="sm" variant="stroke" onClick={upload.clear}>
            Xoá hết
          </Button>
        </div>

        <FileList
          files={upload.files}
          showCancel
          showPercent
          showProgressBar
          showRemove
          showRetry
          title="Hàng đợi"
          onCancel={handleCancel}
          onRemove={handleRemove}
          onRetry={handleRetry}
        />
      </DemoRow>

      <DemoRow
        label="LightboxToolButton"
        note="nút công cụ dùng bên trong ImageLightbox — xoay, phóng, tải về"
        stacked
        width="narrow"
      >
        <div className="flex w-fit items-center gap-1 rounded-md border border-border-default bg-bg-subtle p-1">
          <LightboxToolButton
            icon={<SystemIcon name="arrow-rotate-left-outline" size={16} />}
            label="Xoay trái"
            onClick={lightbox.open}
          />
          <LightboxToolButton
            icon={<SystemIcon name="zoom-in-bold" size={16} />}
            label="Phóng to"
            onClick={lightbox.open}
          />
          <LightboxToolButton
            disabled
            icon={<SystemIcon name="zoom-out-bold" size={16} />}
            label="Thu nhỏ (đang khoá)"
            onClick={lightbox.open}
          />
        </div>

        <Button size="sm" variant="secondary" onClick={lightbox.open}>
          Mở khung xem ảnh
        </Button>
        <ImageLightbox
          alt="Ảnh mẫu"
          open={lightbox.isOpen}
          src={DEMO_LIGHTBOX_SRC}
          onOpenChange={lightbox.onOpenChange}
        />
      </DemoRow>
    </DemoSection>
  );
});

export default UploadHookSection;
