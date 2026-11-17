'use client';

import { useTranslations } from 'next-intl';

import { useDisclosure } from '@/shared/hooks';
import { Button, FormModal, TextField, showToast, useZodForm } from '@/shared/ui';

import { createCatalogItemSchema } from '../data/catalog.schema';
import type { CatalogItemValues } from '../data/catalog.schema';

/**
 * FormModalExample — nút mở một `FormModal` có form `useZodForm` (một ô bắt buộc): lưu hợp lệ thì hiện toast và modal tự
 * đóng; để trống thì lỗi hiện dưới ô và modal giữ mở.
 */
export default function FormModalExample() {
  const t = useTranslations('demo.overlays');
  const dialog = useDisclosure();
  const form = useZodForm<CatalogItemValues>(
    createCatalogItemSchema({ nameRequired: t('formNameRequired') }),
    { defaultValues: { name: '' } },
  );

  return (
    <>
      <Button size="md" variant="stroke" onClick={dialog.open}>
        {t('openFormModal')}
      </Button>
      <FormModal
        form={form}
        open={dialog.isOpen}
        size="sm"
        title={t('formTitle')}
        onCancel={() => form.reset()}
        onConfirm={() => {
          showToast('success', t('formSaved'));
          form.reset();
        }}
        onOpenChange={dialog.onOpenChange}
      >
        <TextField label={t('formName')} name="name" required />
      </FormModal>
    </>
  );
}
