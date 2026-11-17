import { memo, useCallback, useState } from 'react';

import {
  Button,
  Dropzone,
  FileBadge,
  FileCard,
  FileList,
  Image,
  ImageLightbox,
  ImagePreview,
  Text,
  Upload,
} from '@/shared/ui';
import type { DropzonePayload } from '@/shared/ui';
import { images } from '@/assets/image';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  DEMO_FILE_BADGE_NAMES,
  DEMO_UPLOAD_FILES,
  DEMO_UPLOAD_THUMB_FILE,
} from '../../constants/media/upload.constants';

const PREVIEW_SRC = images['folder-fill'];

/**
 * MediaSection — mục "Ảnh & tệp" của trang `/demo`: `Image` · `ImagePreview` · `ImageLightbox` · `Upload` · `Dropzone` · `FileCard` · `FileList`.
 */
const MediaSection = memo(function MediaSection() {
  const [manualLightboxOpen, setManualLightboxOpen] = useState(false);
  const openManualLightbox = useCallback(() => setManualLightboxOpen(true), []);

  const [dropFeedback, setDropFeedback] = useState('Kéo tệp hoặc thư mục vào đây');
  const handleDrop = useCallback(({ kind, files }: DropzonePayload) => {
    setDropFeedback(`kind="${kind}" · ${files.length} tệp`);
  }, []);

  return (
    <DemoSection
      description="Image · ImagePreview + ImageLightbox · Upload · Dropzone · FileCard · FileList · FileBadge."
      importPath="@/shared/ui"
      title="Ảnh & tệp"
    >
      <DemoRow label="Image" note="lấy theo tên từ registry sinh bởi npm run generate:images">
        <Image alt="Thư mục rỗng" height={48} name="folder-empty" width={48} />
        <Image alt="Thư mục có nội dung" height={48} name="folder-fill" width={48} />
      </DemoRow>

      <DemoRow
        label="ImagePreview · size (sm·md·lg·xl·full) — có src thật, preview=true"
        note="bấm ảnh mở ImageLightbox (xoay / phóng)"
      >
        {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <ImagePreview key={size} alt="Xem trước" preview size={size} src={PREVIEW_SRC} />
        ))}
        <div className="size-16">
          <ImagePreview
            alt="Xem trước (size=full, lấp cha)"
            preview
            size="full"
            src={PREVIEW_SRC}
          />
        </div>
      </DemoRow>

      <DemoRow
        label="ImagePreview · rounded (none·sm·md·full)"
        note="⚠️ recipe rounded hiện RỖNG trong UI kit (Image/ImagePreview) — 4 ô dưới trông giống hệt nhau, xem báo cáo"
      >
        {(['none', 'sm', 'md', 'full'] as const).map((rounded) => (
          <ImagePreview
            key={rounded}
            alt={`rounded=${rounded}`}
            rounded={rounded}
            size="lg"
            src={PREVIEW_SRC}
          />
        ))}
      </DemoRow>

      <DemoRow label="ImagePreview · fallback + không có src + disabled">
        <ImagePreview alt="Không có src" size="lg" />
        <ImagePreview
          alt="fallback tuỳ biến"
          fallback={
            <Text size="tiny" weight="medium">
              VCI
            </Text>
          }
          size="lg"
        />
        <ImagePreview alt="disabled" disabled size="lg" src={PREVIEW_SRC} />
      </DemoRow>

      <DemoRow
        label="ImageLightbox"
        note="mở THỦ CÔNG bằng state ngoài — vd nút 'Xem trước' trong bảng"
        stacked
        width="narrow"
      >
        <Button size="sm" variant="stroke" onClick={openManualLightbox}>
          Mở ImageLightbox
        </Button>
        <ImageLightbox
          alt="Xem trước thủ công"
          open={manualLightboxOpen}
          src={PREVIEW_SRC}
          onOpenChange={setManualLightboxOpen}
        />
      </DemoRow>

      <DemoRow label="Upload · variant (dropzone·inline·button)" stacked>
        <DemoGrid min="md">
          <Upload accept=".pdf,.docx,.xlsx" maxSize={10 * 1024 ** 2} multiple variant="dropzone" />
          <Upload variant="inline" />
          <Upload variant="button" />
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="Upload · trạng thái (error·invalid·disabled)"
        note="rê chuột → hover · kéo tệp qua → drag-over · invalid chỉ tô đỏ (lỗi in ở FormItem)"
        stacked
      >
        <DemoGrid align="start" min="sm">
          <Upload error="Chỉ nhận tệp .pdf" size="sm" />
          <Upload invalid size="sm" title="invalid — không tự in lỗi" />
          <Upload disabled size="sm" />
        </DemoGrid>
        <DemoGrid align="start" min="sm">
          <Upload error="Bắt buộc chọn tệp" variant="inline" />
          <Upload invalid variant="button" />
          <Upload disabled variant="inline" />
        </DemoGrid>
      </DemoRow>

      <DemoRow label="Upload · size (sm·md·lg) + directory">
        <Upload buttonLabel="size=sm" size="sm" variant="button" />
        <Upload buttonLabel="size=md" size="md" variant="button" />
        <Upload buttonLabel="size=lg" size="lg" variant="button" />
        <Upload buttonLabel="Chọn thư mục" directory variant="button" />
      </DemoRow>

      <DemoRow
        label="Dropzone"
        note="thả tệp/thư mục thật vào khung — overlay chỉ hiện khi kéo qua từ trình duyệt"
        stacked
      >
        <Dropzone onDrop={handleDrop}>
          <div className="flex h-20 items-center justify-center border border-dashed border-border-strong bg-bg-subtle text-caption-12 text-fg-muted">
            {dropFeedback}
          </div>
        </Dropzone>
      </DemoRow>

      <DemoRow
        label="FileCard · variant (detailed·simple) × density (cozy·compact)"
        note="ô loại tệp · ảnh xem trước · tên dài tự cắt (rê chuột xem đủ)"
        stacked
      >
        <DemoGrid min="md">
          <FileCard file={DEMO_UPLOAD_FILES[1]} />
          <FileCard file={DEMO_UPLOAD_THUMB_FILE} />
          <FileCard density="compact" file={DEMO_UPLOAD_FILES[2]} />
          <FileCard density="compact" file={DEMO_UPLOAD_FILES[4]} variant="simple" />
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="FileList · mọi UploadFileStatus (pending·uploading·paused·success·error)"
        stacked
      >
        <DemoGrid min="lg">
          <FileList files={DEMO_UPLOAD_FILES} title="density=cozy (mặc định)" />
          <FileList density="compact" files={DEMO_UPLOAD_FILES} title="density=compact" />
        </DemoGrid>
      </DemoRow>

      <DemoRow label="FileBadge · skin theo đuôi tệp · size (sm·md·lg)">
        {DEMO_FILE_BADGE_NAMES.map((name) => (
          <FileBadge key={name} name={name} />
        ))}
        <FileBadge name="video.mp4" size="sm" />
        <FileBadge name="video.mp4" size="lg" />
      </DemoRow>

      <Text size="extraTiny" skin="muted">
        Hook <code className="font-mono">useUpload</code> chạy thật (tiến độ · huỷ · thử lại) ở mục
        “Tải tệp & xem ảnh”.
      </Text>
    </DemoSection>
  );
});

export default MediaSection;
