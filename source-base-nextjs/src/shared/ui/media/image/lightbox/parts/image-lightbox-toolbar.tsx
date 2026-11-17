'use client';

import { useTranslations } from 'next-intl';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import LightboxToolButton from '../LightboxToolButton';
import { IMAGE_LIGHTBOX_SURFACE_CLASSES } from '../image-lightbox.theme';
import { ZOOM_MAX, ZOOM_MIN } from '../image-lightbox.utils';
import type { ImageAnnotationConfig } from '../image-lightbox.types';

const IMAGE_LIGHTBOX_TOOLBAR_CLASSES = cn(
  'absolute bottom-[calc(1.5rem+var(--safe-b,0px))] left-1/2 -translate-x-1/2',
  'flex items-center gap-1 px-3 py-1.5',
  'max-w-[calc(100%-1rem)] overflow-x-auto overscroll-x-contain scrollbar-hidden',
  IMAGE_LIGHTBOX_SURFACE_CLASSES,
);

/** Vạch ngăn nhóm nút. */
const IMAGE_LIGHTBOX_TOOLBAR_DIVIDER_CLASSES = 'mx-1 h-6 w-px shrink-0 bg-divider-strong';

const IMAGE_LIGHTBOX_TOOLBAR_PERCENT_CLASSES =
  'ml-1 min-w-[3rem] shrink-0 text-center text-caption-12-medium tabular-nums text-fg-on-chrome select-none';

interface ImageLightboxToolbarProps {
  scale: number;
  percent: number;
  annotating: boolean;
  annotation?: ImageAnnotationConfig;
  actions?: React.ReactNode;
  onAnnotate: () => void;
  onReset: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

/**
 * ImageLightboxToolbar — thanh công cụ nổi ở đáy khung xem: xoay · zoom · đặt lại · chú thích · % zoom; nội bộ
 * của ImageLightbox.
 *
 * Sửa giao diện: bề mặt → `IMAGE_LIGHTBOX_SURFACE_CLASSES` (image-lightbox.theme.ts).
 * Lưu ý: `actions` và nút bút chì ẩn khi `annotating` (lúc đó thanh công cụ thuộc về trình vẽ). Neo đáy đã
 * cộng `--safe-b` (ipad-responsive.md §6) — đổi `bottom` thì đổi cùng thanh chú thích
 * (annotation-layer-action-bar.tsx).
 *
 * @param props.scale - Hệ số zoom hiện tại (1 = vừa khung); khoá nút zoom ở hai đầu `ZOOM_MIN` / `ZOOM_MAX`.
 * @param props.percent - Mức phóng THẬT so với ảnh gốc (100% = 1 px ảnh trên 1 px màn hình).
 * @param props.annotating - Đang vẽ chú thích.
 * @param props.annotation - Cấu hình chú thích; có thì hiện nút bút chì (khoá khi `source` là `null`).
 * @param props.actions - Nút riêng của màn gọi, chèn cuối thanh.
 * @param props.onAnnotate - Bấm bút chì.
 * @param props.onReset - Đặt lại zoom + xoay.
 * @param props.onRotateLeft - Xoay trái 90°.
 * @param props.onRotateRight - Xoay phải 90°.
 * @param props.onZoomIn - Phóng to một bước.
 * @param props.onZoomOut - Thu nhỏ một bước.
 *
 * @example
 * <ImageLightboxToolbar scale={1} percent={100} annotating={false} onAnnotate={start} onReset={reset}
 *   onRotateLeft={left} onRotateRight={right} onZoomIn={zoomIn} onZoomOut={zoomOut} />
 */
function ImageLightboxToolbar({
  scale,
  percent,
  annotating,
  annotation,
  actions,
  onAnnotate,
  onReset,
  onRotateLeft,
  onRotateRight,
  onZoomIn,
  onZoomOut,
}: ImageLightboxToolbarProps) {
  const t = useTranslations('ui.media');

  return (
    <div className={IMAGE_LIGHTBOX_TOOLBAR_CLASSES}>
      <LightboxToolButton
        icon={<SystemIcon name="arrow-rotate-left-outline" size={16} />}
        label={t('lightbox.rotateLeft')}
        onClick={onRotateLeft}
      />
      <LightboxToolButton
        disabled={scale <= ZOOM_MIN}
        icon={<SystemIcon name="zoom-out-bold" size={16} />}
        label={t('lightbox.zoomOut')}
        onClick={onZoomOut}
      />
      <LightboxToolButton
        icon={<SystemIcon name="maximize-outline" size={16} />}
        label={t('lightbox.reset')}
        onClick={onReset}
      />
      <LightboxToolButton
        disabled={scale >= ZOOM_MAX}
        icon={<SystemIcon name="zoom-in-bold" size={16} />}
        label={t('lightbox.zoomIn')}
        onClick={onZoomIn}
      />
      <LightboxToolButton
        icon={<SystemIcon name="arrow-rotate-right-outline" size={16} />}
        label={t('lightbox.rotateRight')}
        onClick={onRotateRight}
      />

      {annotation && !annotating && (
        <>
          <span className={IMAGE_LIGHTBOX_TOOLBAR_DIVIDER_CLASSES} />
          <LightboxToolButton
            disabled={!annotation.source}
            icon={<SystemIcon name="pen-outline" size={16} />}
            label={t('lightbox.annotate')}
            onClick={onAnnotate}
          />
        </>
      )}

      {actions && !annotating && (
        <>
          <span className={IMAGE_LIGHTBOX_TOOLBAR_DIVIDER_CLASSES} />
          {actions}
        </>
      )}

      <span className={IMAGE_LIGHTBOX_TOOLBAR_PERCENT_CLASSES}>{percent}%</span>
    </div>
  );
}

export default ImageLightboxToolbar;
