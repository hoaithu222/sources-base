'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button, Progress, ProgressCircle, Skeleton, Spinner } from '@/shared/ui';

import { CATALOG_SLOT_CLASSES } from '../catalog.theme';
import CatalogSection from '../CatalogSection';
import CatalogState from '../CatalogState';
import {
  PROGRESS_INITIAL,
  PROGRESS_STEP,
  PROGRESS_VARIANTS,
  PROGRESS_VARIANT_SAMPLE,
  SKELETON_VARIANTS,
  SPINNER_COLORS,
  SPINNER_SIZES,
} from '../data/catalog-sample.constants';

/**
 * ProgressCatalog — mục "Tiến trình và đang tải" của catalog `/demo`: `Progress` + `ProgressCircle` (tăng / giảm thử được,
 * các `variant`), `Spinner` (cỡ · màu) và `Skeleton` (text · khối · tròn).
 */
export default function ProgressCatalog() {
  const t = useTranslations('demo.progress');
  const [value, setValue] = useState(PROGRESS_INITIAL);
  const change = (delta: number) =>
    setValue((current) => Math.min(100, Math.max(0, current + delta)));

  return (
    <CatalogSection id="progress">
      <div className={CATALOG_SLOT_CLASSES.grid}>
        <CatalogState label={t('bar')}>
          <div className={CATALOG_SLOT_CLASSES.stack}>
            <Progress label={t('barAria')} showValue size="md" value={value} />
            {PROGRESS_VARIANTS.map((variant) => (
              <Progress key={variant} size="sm" value={PROGRESS_VARIANT_SAMPLE} variant={variant} />
            ))}
          </div>
          <div className={CATALOG_SLOT_CLASSES.row}>
            <Button
              size="sm"
              skin="neutral"
              variant="stroke"
              onClick={() => change(-PROGRESS_STEP)}
            >
              {t('decrease')}
            </Button>
            <Button size="sm" variant="stroke" onClick={() => change(PROGRESS_STEP)}>
              {t('increase')}
            </Button>
          </div>
        </CatalogState>
        <CatalogState label={t('circle')}>
          <div className={CATALOG_SLOT_CLASSES.row}>
            <ProgressCircle showValue size="lg" value={value} />
            <ProgressCircle showValue size="md" value={value} variant="success" />
            <ProgressCircle size="sm" value={value} variant="warning" />
          </div>
        </CatalogState>
        <CatalogState label={t('spinner')}>
          <div className={CATALOG_SLOT_CLASSES.row}>
            {SPINNER_SIZES.map((size) => (
              <Spinner key={size} color="primary" size={size} />
            ))}
            {SPINNER_COLORS.map((color) => (
              <Spinner key={color} color={color} size="md" />
            ))}
          </div>
        </CatalogState>
        <CatalogState label={t('skeleton')}>
          <div className={CATALOG_SLOT_CLASSES.row}>
            {SKELETON_VARIANTS.map((variant) => (
              <Skeleton
                key={variant}
                height={variant === 'text' ? undefined : 40}
                variant={variant}
                width={variant === 'circle' ? 40 : 120}
              />
            ))}
          </div>
        </CatalogState>
      </div>
    </CatalogSection>
  );
}
