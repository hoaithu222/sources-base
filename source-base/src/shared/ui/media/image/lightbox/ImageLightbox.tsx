import { useCallback, useEffect, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useElementSize } from '@/shared/hooks';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { TOUCH_HIT_CLASSES } from '@/shared/ui/primitives/touch-hit.theme';
import { cn } from '@/shared/utils/style/cn';
import ImageLightboxNav from './parts/image-lightbox-nav';
import ImageLightboxToolbar from './parts/image-lightbox-toolbar';
import ImageLightboxViewport from './parts/image-lightbox-viewport';
import { IMAGE_LIGHTBOX_FLOAT_BUTTON_CLASSES } from './image-lightbox.theme';
import { clamp, layoutImage, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from './image-lightbox.utils';
import type { AnnotationResult } from '../../image-annotator';
import type { ImageLightboxProps, ImageNatural } from './image-lightbox.types';

const IMAGE_LIGHTBOX_OVERLAY_CLASSES = cn(
  'fixed inset-0 z-50 bg-black-6 backdrop-blur-[5px]',
  'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
);

const IMAGE_LIGHTBOX_CONTENT_CLASSES = cn(
  'fixed inset-0 z-50 flex flex-col items-center justify-center outline-none',
  'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
);

const IMAGE_LIGHTBOX_CORNER_CLASSES = cn(
  'absolute z-10 flex items-center gap-2',
  'top-[calc(1rem+var(--safe-t,0px))] right-[calc(1rem+var(--safe-r,0px))]',
);

const IMAGE_LIGHTBOX_CORNER_BUTTON_CLASSES = cn(
  TOUCH_HIT_CLASSES.inline,
  IMAGE_LIGHTBOX_FLOAT_BUTTON_CLASSES,
  'size-9 phone:size-10',
);

const IMAGE_LIGHTBOX_VIDEO_BOX_CLASSES = 'flex-1 w-full flex items-center justify-center p-8';

/**
 * ImageLightbox — khung xem ảnh / video toàn màn hình: xoay, zoom (nút hoặc lăn chuột trên ảnh), cuộn, chú thích.
 *
 * Thường không dùng trực tiếp: `Image` / `ImagePreview` / `CardScreenshot` có `preview` đã gắn sẵn. Dùng
 * thẳng khi cần tải về, chuyển ảnh trong danh sách (`navigation`), chú thích ảnh (`annotation`) hoặc nút
 * riêng (`actions` + `LightboxToolButton` cho đồng bộ kiểu).
 * Sửa giao diện: thanh xoay / zoom → image-lightbox-toolbar.tsx · vùng cuộn + ảnh → image-lightbox-viewport.tsx
 * · nút ‹ › → image-lightbox-nav.tsx · bước zoom → image-lightbox.utils.ts · bề mặt / nút nổi (thanh công cụ,
 * bộ đếm, nút góc, nút ‹ ›) → image-lightbox.theme.ts.
 * Lưu ý: zoom đổi width / height của ảnh, KHÔNG dùng `transform: scale` (vỡ hạt); `transform` chỉ để xoay.
 * Đang vẽ chú thích: Esc và click nền không đóng khung, ←/→ không chuyển ảnh. Chuyển ảnh (đổi `src`) và mở
 * lại đều reset zoom / xoay. Lý do thiết kế: notes/components/media.md.
 *
 * @param props.open - Đang mở (controlled).
 * @param props.onOpenChange - Gọi khi đóng / mở (Esc, nút ✕, click nền).
 * @param props.src - URL ảnh / video đang xem.
 * @param props.alt - Văn bản thay thế; cũng là tiêu đề (ẩn) của hộp thoại. Mặc định `""` (tiêu đề "Xem ảnh").
 * @param props.kind - `image` | `video` (chỉ phát, không xoay / zoom / chú thích). Mặc định `image`.
 * @param props.onDownload - Có handler → hiện nút "Tải về" ở góc trên phải.
 * @param props.annotation - Bật nút bút chì chú thích: `{ source, fileName, initialShapes?, saving?, onSave }`;
 *   `source = null` (caller đang tải ảnh gốc) → nút bị khoá.
 * @param props.actions - Nút riêng của màn gọi, chèn cuối thanh công cụ (dùng `LightboxToolButton`); ẩn khi
 *   đang vẽ chú thích.
 * @param props.navigation - `{ index, total, onPrev, onNext }`: hiện nút ‹ ›, đếm "3 / 12" và bắt phím ←/→
 *   khi `total > 1`; caller giữ danh sách, chỉ số và quyết định quay vòng hay dừng ở hai đầu.
 *
 * @example
 * <ImageLightbox open={open} src={url} alt="Biên bản" onOpenChange={setOpen} onDownload={download} />
 *
 * <ImageLightbox
 *   open={open}
 *   src={photos[index].url}
 *   onOpenChange={setOpen}
 *   navigation={{ index, total: photos.length, onPrev: prev, onNext: next }}
 * />
 */
function ImageLightbox({
  open,
  onOpenChange,
  src,
  alt = '',
  kind = 'image',
  onDownload,
  annotation,
  actions,
  navigation,
}: ImageLightboxProps) {
  const isVideo = kind === 'video';
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [natural, setNatural] = useState<ImageNatural | null>(null);
  const [annotating, setAnnotating] = useState(false);
  const [viewportRef, viewport] = useElementSize<HTMLDivElement>();
  const [viewportNode, setViewportNode] = useState<HTMLDivElement | null>(null);
  const layout = layoutImage(natural, viewport, scale, rotation);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setRotation(0);
      setScale(1);
      setNatural(null);
      setAnnotating(false);
    }
  }

  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setRotation(0);
    setScale(1);
    setNatural(null);
    setAnnotating(false);
  }

  const handleNatural = useCallback((next: ImageNatural) => setNatural(next), []);

  const handleViewportRef = useCallback(
    (el: HTMLDivElement | null) => {
      viewportRef(el);
      setViewportNode(el);
    },
    [viewportRef],
  );

  const handleAnnotationSave = useCallback(
    (result: AnnotationResult) => {
      setAnnotating(false);
      annotation?.onSave(result);
    },
    [annotation],
  );

  useEffect(() => {
    if (!viewportNode) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale((s) => clamp(s + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP), ZOOM_MIN, ZOOM_MAX));
    };
    viewportNode.addEventListener('wheel', onWheel, { passive: false });
    return () => viewportNode.removeEventListener('wheel', onWheel);
  }, [viewportNode]);

  useEffect(() => {
    if (!open || !navigation || navigation.total <= 1 || annotating) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      if (e.key === 'ArrowLeft') navigation.onPrev();
      else navigation.onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, navigation, annotating]);

  const rotateLeft = () => setRotation((r) => r - 90);
  const rotateRight = () => setRotation((r) => r + 90);
  const zoomIn = () => setScale((s) => clamp(s + ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));
  const zoomOut = () => setScale((s) => clamp(s - ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));
  const reset = () => {
    setRotation(0);
    setScale(1);
  };

  const zoomPercent =
    layout && natural ? Math.round((layout.width / natural.w) * 100) : Math.round(scale * 100);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={IMAGE_LIGHTBOX_OVERLAY_CLASSES} />

        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={IMAGE_LIGHTBOX_CONTENT_CLASSES}
          onEscapeKeyDown={(e) => {
            if (annotating) e.preventDefault();
          }}
        >
          <DialogPrimitive.Title className="sr-only">{alt || 'Xem ảnh'}</DialogPrimitive.Title>

          {navigation && navigation.total > 1 && !annotating && (
            <ImageLightboxNav navigation={navigation} />
          )}

          <div className={IMAGE_LIGHTBOX_CORNER_CLASSES}>
            {onDownload ? (
              <button
                aria-label="Tải về"
                className={IMAGE_LIGHTBOX_CORNER_BUTTON_CLASSES}
                title="Tải về"
                type="button"
                onClick={onDownload}
              >
                <SystemIcon name="arrow-down-to-bracket-outline" size={18} />
              </button>
            ) : null}
            <DialogPrimitive.Close
              aria-label="Đóng"
              className={IMAGE_LIGHTBOX_CORNER_BUTTON_CLASSES}
              title="Đóng (Esc)"
            >
              <SystemIcon name="xmark-outline" size={18} />
            </DialogPrimitive.Close>
          </div>

          {isVideo ? (
            <div className={IMAGE_LIGHTBOX_VIDEO_BOX_CLASSES}>
              <video autoPlay className="max-h-full max-w-full outline-none" controls src={src} />
            </div>
          ) : (
            <>
              <ImageLightboxViewport
                alt={alt}
                annotating={annotating}
                annotation={annotation}
                containerRef={handleViewportRef}
                layout={layout}
                rotation={rotation}
                src={src}
                onAnnotationCancel={() => setAnnotating(false)}
                onAnnotationSave={handleAnnotationSave}
                onBackdropClick={() => onOpenChange(false)}
                onNatural={handleNatural}
              />

              <ImageLightboxToolbar
                actions={actions}
                annotating={annotating}
                annotation={annotation}
                percent={zoomPercent}
                scale={scale}
                onAnnotate={() => setAnnotating(true)}
                onReset={reset}
                onRotateLeft={rotateLeft}
                onRotateRight={rotateRight}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
              />
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default ImageLightbox;
