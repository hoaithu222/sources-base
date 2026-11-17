'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n';
import { PATHS } from '@/shared/constants/paths.constants';
import { Button } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import { CATALOG_SLOT_CLASSES } from '../catalog.theme';
import CatalogSection from '../CatalogSection';
import CatalogState from '../CatalogState';
import { BUTTON_SIZES, BUTTON_SKINS, BUTTON_VARIANTS } from '../data/catalog-sample.constants';

/**
 * ButtonCatalog — mục "Nút" của catalog `/demo`: bảng kiểu × màu, các cỡ, loading (bấm để thử), vô hiệu hoá, icon, liên kết
 * `asChild` và `fullWidth`.
 */
export default function ButtonCatalog() {
  const t = useTranslations('demo.button');
  const [saving, setSaving] = useState(false);

  return (
    <CatalogSection id="button">
      {BUTTON_VARIANTS.map((variant) => (
        <CatalogState key={variant} label={`variant="${variant}"`}>
          <div className={CATALOG_SLOT_CLASSES.row}>
            {BUTTON_SKINS.map((skin) => (
              <Button key={skin} size="sm" skin={skin} variant={variant}>
                {skin}
              </Button>
            ))}
          </div>
        </CatalogState>
      ))}
      <CatalogState label={t('sizes')}>
        <div className={CATALOG_SLOT_CLASSES.row}>
          {BUTTON_SIZES.map((size) => (
            <Button key={size} size={size}>
              {size}
            </Button>
          ))}
        </div>
      </CatalogState>
      <div className={CATALOG_SLOT_CLASSES.grid}>
        <CatalogState label={t('loading')}>
          <div className={CATALOG_SLOT_CLASSES.row}>
            <Button loading={saving} size="md" onClick={() => setSaving(true)}>
              {t('save')}
            </Button>
            <Button size="md" skin="neutral" variant="ghost" onClick={() => setSaving(false)}>
              {t('reset')}
            </Button>
          </div>
        </CatalogState>
        <CatalogState label={t('states')}>
          <Button disabled size="md" variant="stroke">
            {t('disabled')}
          </Button>
        </CatalogState>
        <CatalogState label={t('icons')}>
          <div className={CATALOG_SLOT_CLASSES.row}>
            <Button size="md" startIcon={<SystemIcon name="plus-outline" size={14} />}>
              {t('add')}
            </Button>
            <Button
              endIcon={<SystemIcon name="arrow-right-outline" size={14} />}
              size="md"
              variant="stroke"
            >
              {t('next')}
            </Button>
            <Button aria-label={t('iconOnlyAria')} iconOnly size="md" variant="stroke">
              <SystemIcon name="plus-outline" size={16} />
            </Button>
          </div>
        </CatalogState>
        <CatalogState label={t('link')}>
          <Button asChild size="md" variant="stroke">
            <Link href={PATHS.DEMO_CUSTOMERS}>{t('goCustomers')}</Link>
          </Button>
        </CatalogState>
      </div>
      <CatalogState className="max-w-xs" label={t('fullWidth')}>
        <Button fullWidth size="md">
          {t('saveChanges')}
        </Button>
      </CatalogState>
    </CatalogSection>
  );
}
