import { lazy, Suspense } from 'react';
import Spinner from '@/shared/ui/feedback/Spinner';
import { cn } from '@/shared/utils/style/cn';
import type { AnnotationResult, Shape } from '../../../image-annotator';
import type { ImageAnnotationConfig, ImageLayout, ImageNatural } from '../image-lightbox.types';

const AnnotationLayer = lazy(() =>
  import('../../../image-annotator').then((m) => ({ default: m.AnnotationLayer })),
);

const EMPTY_SHAPES: Shape[] = [];

type ViewportMode = 'annotating' | 'viewing';
type ImageMeasure = 'measured' | 'unmeasured';

const IMAGE_LIGHTBOX_VIEWPORT_BASE_CLASSES = 'flex min-h-0 w-full flex-1 overflow-auto p-6';

const IMAGE_LIGHTBOX_VIEWPORT_STATE_CLASSES = {
  annotating: 'cursor-default',
  viewing: 'cursor-zoom-out',
} satisfies Record<ViewportMode, string>;

const IMAGE_LIGHTBOX_BOX_CLASSES = 'relative m-auto shrink-0';

const IMAGE_LIGHTBOX_IMAGE_BASE_CLASSES = cn(
  'absolute left-1/2 top-1/2 cursor-default select-none',
  'transition-[width,height] duration-150 ease-out',
);

const IMAGE_LIGHTBOX_IMAGE_MEASURE_CLASSES = {
  measured: 'max-w-none',
  unmeasured: 'max-h-full max-w-full',
} satisfies Record<ImageMeasure, string>;

const IMAGE_LIGHTBOX_SPINNER_BOX_CLASSES = 'absolute inset-0 grid place-items-center';

interface ImageLightboxViewportProps {
  src: string;
  alt: string;
  layout: ImageLayout | null;
  rotation: number;
  annotating: boolean;
  annotation?: ImageAnnotationConfig;
  containerRef: (el: HTMLDivElement | null) => void;
  onBackdropClick: () => void;
  onNatural: (natural: ImageNatural) => void;
  onAnnotationCancel: () => void;
  onAnnotationSave: (result: AnnotationResult) => void;
}

/**
 * ImageLightboxViewport — vùng xem CUỘN ĐƯỢC của lightbox: thẻ `<img>`, hoặc lớp chú thích khi đang vẽ; nội bộ
 * của ImageLightbox.
 *
 * Lưu ý: `lazy()` của AnnotationLayer PHẢI ở module scope — gọi trong component thì mỗi lượt render React
 * unmount lại cả khung vẽ. Hộp ảnh dùng `m-auto`, KHÔNG `justify-center` (cắt mất mép trên / trái).
 *
 * @param props.src - URL ảnh.
 * @param props.alt - Văn bản thay thế.
 * @param props.layout - Cỡ hiển thị + hộp bao sau xoay; `null` = chưa biết cỡ ảnh (ảnh co vừa khung).
 * @param props.rotation - Góc xoay, độ.
 * @param props.annotating - Đang vẽ: thay `<img>` bằng lớp chú thích, click nền không đóng.
 * @param props.annotation - Cấu hình chú thích (nguồn ảnh gốc, tên tệp, nét có sẵn).
 * @param props.containerRef - Callback ref của vùng cuộn (lightbox đo cỡ + bắt lăn chuột ở đây).
 * @param props.onBackdropClick - Click vào nền quanh ảnh.
 * @param props.onNatural - Báo cỡ gốc của ảnh khi tải / giải mã xong.
 * @param props.onAnnotationCancel - Thoát chế độ vẽ.
 * @param props.onAnnotationSave - Lưu ảnh đã chú thích.
 *
 * @example
 * <ImageLightboxViewport src={src} alt={alt} layout={layout} rotation={0} annotating={false}
 *   containerRef={ref} onBackdropClick={close} onNatural={setNatural} onAnnotationCancel={stop}
 *   onAnnotationSave={save} />
 */
function ImageLightboxViewport({
  src,
  alt,
  layout,
  rotation,
  annotating,
  annotation,
  containerRef,
  onBackdropClick,
  onNatural,
  onAnnotationCancel,
  onAnnotationSave,
}: ImageLightboxViewportProps) {
  const viewportClassName = cn(
    IMAGE_LIGHTBOX_VIEWPORT_BASE_CLASSES,
    IMAGE_LIGHTBOX_VIEWPORT_STATE_CLASSES[annotating ? 'annotating' : 'viewing'],
  );
  const imageClassName = cn(
    IMAGE_LIGHTBOX_IMAGE_BASE_CLASSES,
    IMAGE_LIGHTBOX_IMAGE_MEASURE_CLASSES[layout ? 'measured' : 'unmeasured'],
  );
  const boxStyle = layout
    ? { width: layout.boxWidth, height: layout.boxHeight }
    : { width: '100%', height: '100%' };

  return (
    <div
      ref={containerRef}
      className={viewportClassName}
      onClick={() => !annotating && onBackdropClick()}
    >
      <div className={IMAGE_LIGHTBOX_BOX_CLASSES} style={boxStyle}>
        {annotating && annotation?.source ? (
          <Suspense
            fallback={
              <div className={IMAGE_LIGHTBOX_SPINNER_BOX_CLASSES}>
                <Spinner size="lg" />
              </div>
            }
          >
            <AnnotationLayer
              key={src}
              fileName={annotation.fileName}
              initialShapes={annotation.initialShapes ?? EMPTY_SHAPES}
              layout={layout}
              rotation={rotation}
              saving={annotation.saving ?? false}
              source={annotation.source}
              onCancel={onAnnotationCancel}
              onNatural={onNatural}
              onSave={onAnnotationSave}
            />
          </Suspense>
        ) : (
          <img
            alt={alt}
            className={imageClassName}
            draggable={false}
            src={src}
            style={{
              transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              ...(layout ? { width: layout.width, height: layout.height } : {}),
            }}
            onClick={(e) => e.stopPropagation()}
            onLoad={(e) =>
              onNatural({
                w: e.currentTarget.naturalWidth,
                h: e.currentTarget.naturalHeight,
              })
            }
          />
        )}
      </div>
    </div>
  );
}

export default ImageLightboxViewport;
