'use client';

import { useTranslations } from 'next-intl';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { TOUCH_HIT_CLASSES } from '@/shared/ui/primitives/touch-hit.theme';
import { cn } from '@/shared/utils/style/cn';
import {
  IMAGE_LIGHTBOX_FLOAT_BUTTON_CLASSES,
  IMAGE_LIGHTBOX_SURFACE_CLASSES,
} from '../image-lightbox.theme';
import type { ImageLightboxNavigation } from '../image-lightbox.types';

type NavDirection = 'prev' | 'next';

const IMAGE_LIGHTBOX_NAV_BUTTON_BASE_CLASSES = cn(
  TOUCH_HIT_CLASSES.icon,
  IMAGE_LIGHTBOX_FLOAT_BUTTON_CLASSES,
  'absolute top-1/2 z-10 size-10 -translate-y-1/2',
);

const IMAGE_LIGHTBOX_NAV_BUTTON_CLASSES = {
  prev: cn(IMAGE_LIGHTBOX_NAV_BUTTON_BASE_CLASSES, 'left-[calc(1rem+var(--safe-l,0px))]'),
  next: cn(IMAGE_LIGHTBOX_NAV_BUTTON_BASE_CLASSES, 'right-[calc(1rem+var(--safe-r,0px))]'),
} satisfies Record<NavDirection, string>;

const IMAGE_LIGHTBOX_NAV_COUNTER_CLASSES = cn(
  IMAGE_LIGHTBOX_SURFACE_CLASSES,
  'absolute left-1/2 top-[calc(1rem+var(--safe-t,0px))] z-10 -translate-x-1/2 px-2 py-0.5',
  'text-caption-12-medium tabular-nums text-fg-on-chrome select-none',
);

interface ImageLightboxNavProps {
  navigation: ImageLightboxNavigation;
}

/**
 * ImageLightboxNav — nút ‹ › ghim giữa hai mép khung xem + bộ đếm "3 / 12" ở mép trên; nội bộ của ImageLightbox.
 *
 * Sửa giao diện: vị trí từng nút → `IMAGE_LIGHTBOX_NAV_BUTTON_CLASSES` · bề mặt / hover → image-lightbox.theme.ts.
 * Lưu ý: `stopPropagation` ở hai nút là hàng rào — dời cụm này vào vùng xem thì bấm ‹ › thành đóng khung.
 *
 * @param props.navigation - `{ index (0-based), total, onPrev, onNext }` do caller của lightbox giữ.
 *
 * @example
 * <ImageLightboxNav navigation={{ index: 2, total: 12, onPrev: prev, onNext: next }} />
 */
function ImageLightboxNav({ navigation }: ImageLightboxNavProps) {
  const t = useTranslations('ui.media');

  return (
    <>
      <button
        aria-label={t('lightbox.prev')}
        className={IMAGE_LIGHTBOX_NAV_BUTTON_CLASSES.prev}
        title={t('lightbox.prevTitle')}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          navigation.onPrev();
        }}
      >
        <SystemIcon name="angle-left-outline" size={20} />
      </button>
      <button
        aria-label={t('lightbox.next')}
        className={IMAGE_LIGHTBOX_NAV_BUTTON_CLASSES.next}
        title={t('lightbox.nextTitle')}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          navigation.onNext();
        }}
      >
        <SystemIcon name="angle-right-outline" size={20} />
      </button>

      <span className={IMAGE_LIGHTBOX_NAV_COUNTER_CLASSES}>
        {navigation.index + 1} / {navigation.total}
      </span>
    </>
  );
}

export default ImageLightboxNav;
