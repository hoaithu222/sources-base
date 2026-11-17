'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button, Callout, EmptyState } from '@/shared/ui';

import { CATALOG_SLOT_CLASSES } from '../catalog.theme';
import CatalogSection from '../CatalogSection';
import CatalogState from '../CatalogState';
import { CALLOUT_INTENTS } from '../data/catalog-sample.constants';

/**
 * FeedbackCatalog — mục "Thông báo trong trang" của catalog `/demo`: `Callout` theo từng `intent`, kiểu `ghost`, nút đóng
 * (đóng thử được, có nút hiện lại) và `EmptyState` cho trạng thái chưa có dữ liệu.
 */
export default function FeedbackCatalog() {
  const t = useTranslations('demo.feedback');
  const [open, setOpen] = useState(true);

  return (
    <CatalogSection id="feedback">
      <CatalogState label={t('intents')}>
        <div className={CATALOG_SLOT_CLASSES.stack}>
          {CALLOUT_INTENTS.map((intent) => (
            <Callout
              key={intent}
              description={t('description')}
              intent={intent}
              title={t(`titles.${intent}`)}
            />
          ))}
          <Callout intent="info" title={t('titles.info')} variant="ghost">
            {t('description')}
          </Callout>
        </div>
      </CatalogState>
      <div className={CATALOG_SLOT_CLASSES.grid}>
        <CatalogState label={t('closable')}>
          <div className={CATALOG_SLOT_CLASSES.stack}>
            {open ? (
              <Callout
                closable
                description={t('description')}
                intent="warning"
                title={t('closableTitle')}
                onClose={() => setOpen(false)}
              />
            ) : (
              <Button size="sm" variant="stroke" onClick={() => setOpen(true)}>
                {t('restore')}
              </Button>
            )}
          </div>
        </CatalogState>
        <CatalogState label={t('empty')}>
          <EmptyState
            action={<Button size="sm">{t('emptyAction')}</Button>}
            description={t('emptyDescription')}
            icon="inbox-bold"
            iconColor="neutral"
            size="sm"
            title={t('emptyTitle')}
          />
        </CatalogState>
      </div>
    </CatalogSection>
  );
}
