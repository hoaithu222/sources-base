'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { useDisclosure } from '@/shared/hooks';
import { Button, ConfirmDialog, Modal, Text, showToast } from '@/shared/ui';
import type { ConfirmDialogVariant } from '@/shared/ui';

import { CATALOG_SLOT_CLASSES } from '../catalog.theme';
import CatalogSection from '../CatalogSection';
import CatalogState from '../CatalogState';
import { CONFIRM_VARIANTS, TOAST_TYPES } from '../data/catalog-sample.constants';
import FormModalExample from './FormModalExample';

/**
 * OverlayCatalog — mục "Hộp thoại và toast" của catalog `/demo`: mở `Modal`, `ConfirmDialog` (ba variant), `FormModal` và
 * bắn toast bốn loại bằng `showToast`. Mỗi hộp thoại đóng được bằng ✕, Esc, bấm nền hoặc nút của nó.
 */
export default function OverlayCatalog() {
  const t = useTranslations('demo.overlays');
  const modal = useDisclosure();
  const [confirm, setConfirm] = useState<ConfirmDialogVariant | null>(null);

  return (
    <CatalogSection id="overlays">
      <div className={CATALOG_SLOT_CLASSES.grid}>
        <CatalogState label={t('modal')}>
          <Button size="md" variant="stroke" onClick={modal.open}>
            {t('openModal')}
          </Button>
        </CatalogState>
        <CatalogState label={t('formModal')}>
          <FormModalExample />
        </CatalogState>
        <CatalogState label={t('confirm')}>
          <div className={CATALOG_SLOT_CLASSES.row}>
            {CONFIRM_VARIANTS.map((variant) => (
              <Button
                key={variant}
                size="md"
                skin={variant === 'delete' ? 'danger' : 'base'}
                variant="stroke"
                onClick={() => setConfirm(variant)}
              >
                {t(`confirmVariants.${variant}`)}
              </Button>
            ))}
          </div>
        </CatalogState>
        <CatalogState label={t('toast')}>
          <div className={CATALOG_SLOT_CLASSES.row}>
            {TOAST_TYPES.map((type) => (
              <Button
                key={type}
                size="md"
                variant="stroke"
                onClick={() => showToast(type, t(`toastMessages.${type}`))}
              >
                {t(`toastTypes.${type}`)}
              </Button>
            ))}
          </div>
        </CatalogState>
      </div>
      <Modal
        description={t('modalDescription')}
        open={modal.isOpen}
        title={t('modalTitle')}
        onCancel={modal.close}
        onConfirm={modal.close}
        onOpenChange={modal.onOpenChange}
      >
        <Text as="p" size="small">
          {t('modalBody')}
        </Text>
      </Modal>
      <ConfirmDialog
        description={t('confirmDescription')}
        open={confirm !== null}
        title={t('confirmTitle')}
        variant={confirm ?? 'confirm'}
        onConfirm={() => showToast('success', t('toastMessages.success'))}
        onOpenChange={(open) => !open && setConfirm(null)}
      />
    </CatalogSection>
  );
}
