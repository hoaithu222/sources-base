'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Checkbox, SegmentToggle, Toggle } from '@/shared/ui';

import { CATALOG_SLOT_CLASSES } from '../catalog.theme';
import CatalogSection from '../CatalogSection';
import CatalogState from '../CatalogState';
import { SEGMENT_OPTION_IDS, TOGGLE_SIZES } from '../data/catalog-sample.constants';

/**
 * ControlCatalog — mục "Công tắc và lựa chọn nhanh" của catalog `/demo`: `Toggle` (các cỡ · vô hiệu hoá), `SegmentToggle`
 * (hai kiểu tô dùng chung một giá trị) và `Checkbox`. Giá trị đang chọn hiện dưới ví dụ.
 */
export default function ControlCatalog() {
  const t = useTranslations('demo.controls');
  const [notify, setNotify] = useState(true);
  const [range, setRange] = useState('week');
  const [agree, setAgree] = useState(false);

  const segmentOptions = SEGMENT_OPTION_IDS.map((key) => ({
    key,
    label: t(`segmentOptions.${key}`),
  }));
  const switchText = (on: boolean) => t('state', { value: on ? t('on') : t('off') });

  return (
    <CatalogSection id="controls">
      <div className={CATALOG_SLOT_CLASSES.grid}>
        <CatalogState label={t('toggle')} note={switchText(notify)}>
          <Toggle checked={notify} label={t('toggleLabel')} onCheckedChange={setNotify} />
          <div className={CATALOG_SLOT_CLASSES.row}>
            {TOGGLE_SIZES.map((size) => (
              <Toggle
                key={size}
                aria-label={`${t('toggleAria')} ${size}`}
                checked={notify}
                size={size}
                onCheckedChange={setNotify}
              />
            ))}
            <Toggle aria-label={t('disabled')} checked disabled />
          </div>
        </CatalogState>
        <CatalogState label={t('segment')} note={t('state', { value: range })}>
          <SegmentToggle options={segmentOptions} value={range} onValueChange={setRange} />
          <SegmentToggle
            options={segmentOptions}
            size="sm"
            value={range}
            variant="subtle"
            onValueChange={setRange}
          />
        </CatalogState>
        <CatalogState label={t('checkbox')} note={switchText(agree)}>
          <Checkbox checked={agree} label={t('checkboxLabel')} onCheckedChange={setAgree} />
          <Checkbox checked disabled label={t('disabled')} />
        </CatalogState>
      </div>
    </CatalogSection>
  );
}
