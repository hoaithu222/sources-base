'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Avatar, Badge, Button } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import { CATALOG_SLOT_CLASSES } from '../catalog.theme';
import CatalogSection from '../CatalogSection';
import CatalogState from '../CatalogState';
import {
  AVATAR_NAMES,
  AVATAR_SIZES,
  BADGE_COLORS,
  BADGE_SIZES,
  BADGE_TAG_IDS,
  BADGE_VARIANTS,
} from '../data/catalog-sample.constants';

/**
 * BadgeCatalog — mục "Huy hiệu và ảnh đại diện" của catalog `/demo`: `Badge` (màu × kiểu tô, hình × cỡ, chấm · icon · nút gỡ
 * — gỡ thử được) và `Avatar` (các cỡ, `brand`, vuông, thiếu tên).
 */
export default function BadgeCatalog() {
  const t = useTranslations('demo.badge');
  const [tags, setTags] = useState<(typeof BADGE_TAG_IDS)[number][]>([...BADGE_TAG_IDS]);

  return (
    <CatalogSection id="badge">
      <CatalogState label={t('colors')}>
        {BADGE_VARIANTS.map((variant) => (
          <div key={variant} className={CATALOG_SLOT_CLASSES.row}>
            {BADGE_COLORS.map((color) => (
              <Badge key={color} color={color} variant={variant}>
                {color}
              </Badge>
            ))}
          </div>
        ))}
      </CatalogState>
      <div className={CATALOG_SLOT_CLASSES.grid}>
        <CatalogState label={t('shapes')}>
          {(['pill', 'tag'] as const).map((shape) => (
            <div key={shape} className={CATALOG_SLOT_CLASSES.row}>
              {BADGE_SIZES.map((size) => (
                <Badge key={size} color="info" shape={shape} size={size}>
                  {shape} · {size}
                </Badge>
              ))}
            </div>
          ))}
        </CatalogState>
        <CatalogState label={t('extras')}>
          <div className={CATALOG_SLOT_CLASSES.row}>
            <Badge color="success" dot>
              {t('statusActive')}
            </Badge>
            <Badge color="primary" startIcon={<SystemIcon name="check-small-bold" size={12} />}>
              {t('approved')}
            </Badge>
          </div>
          <div className={CATALOG_SLOT_CLASSES.row}>
            {tags.map((id) => (
              <Badge
                key={id}
                color="neutral"
                onRemove={() => setTags(tags.filter((tag) => tag !== id))}
              >
                {t(`tags.${id}`)}
              </Badge>
            ))}
            <Button
              size="xs"
              skin="neutral"
              variant="ghost"
              onClick={() => setTags([...BADGE_TAG_IDS])}
            >
              {t('restore')}
            </Button>
          </div>
        </CatalogState>
        <CatalogState label={t('avatars')}>
          <div className={CATALOG_SLOT_CLASSES.row}>
            {AVATAR_SIZES.map((size) => (
              <Avatar key={size} name={AVATAR_NAMES[0]} size={size} />
            ))}
            <Avatar name={AVATAR_NAMES[1]} size="md" variant="brand" />
            <Avatar name={AVATAR_NAMES[2]} shape="square" size="md" />
            <Avatar size="md" />
          </div>
        </CatalogState>
      </div>
    </CatalogSection>
  );
}
