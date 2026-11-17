'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n';
import { PATHS } from '@/shared/constants/paths.constants';
import { Callout, EmptyState, PageBody, PageShell } from '@/shared/ui';
import { PageHeader } from '@/shared/widgets/header';

import { CATALOG_SLOT_CLASSES } from './catalog/catalog.theme';
import CatalogToc from './catalog/CatalogToc';
import { CATALOG_GROUP_ORDER } from './catalog/data/catalog.constants';
import type { CatalogGroupId } from './catalog/data/catalog.constants';
import { filterCatalogGroups } from './catalog/data/catalog.utils';
import BadgeCatalog from './catalog/display/BadgeCatalog';
import FeedbackCatalog from './catalog/display/FeedbackCatalog';
import OverlayCatalog from './catalog/display/OverlayCatalog';
import ProgressCatalog from './catalog/display/ProgressCatalog';
import TableCatalog from './catalog/display/TableCatalog';
import ButtonCatalog from './catalog/entry/ButtonCatalog';
import ControlCatalog from './catalog/entry/ControlCatalog';
import FormCatalog from './catalog/entry/FormCatalog';
import PickerCatalog from './catalog/entry/PickerCatalog';
import SelectCatalog from './catalog/entry/SelectCatalog';

/**
 * DemoLibraryView — danh mục component cốt lõi của UI kit (`/demo`, chỉ có ở chế độ demo): mục lục + ô tìm nhanh bên trái,
 * mỗi nhóm một mục có ví dụ sống, các trạng thái chính cạnh nhau, dòng import, đường file nguồn và tài liệu liên quan.
 *
 * Lưu ý: ví dụ chạy đúng app providers nên đổi theme / ngôn ngữ ở Cài đặt là thấy ngay. Màn ghép form + bảng + hộp thoại
 * hoàn chỉnh là `/demo/customers` (feature `customers`) — catalog chỉ trỏ tới, không nhân đôi. Thêm nhóm: `catalog/data/catalog.constants.ts`.
 */
export default function DemoLibraryView() {
  const t = useTranslations('demo');
  const tNav = useTranslations('shell.nav');
  const [search, setSearch] = useState('');
  const visible = filterCatalogGroups(CATALOG_GROUP_ORDER, search, (id) => t(`groups.${id}.title`));
  const shows = (id: CatalogGroupId) => visible.includes(id);

  return (
    <PageShell variant="flow">
      <PageHeader
        subtitle={tNav('demoLibrary.description')}
        title={tNav('demoLibrary.title')}
        tone="teal"
      />
      <PageBody>
        <div className={CATALOG_SLOT_CLASSES.layout}>
          <CatalogToc items={visible} search={search} onSearchChange={setSearch} />
          <div className={CATALOG_SLOT_CLASSES.content}>
            <Callout
              description={
                <>
                  {t('intro.description')}{' '}
                  <Link className={CATALOG_SLOT_CLASSES.introLink} href={PATHS.DEMO_CUSTOMERS}>
                    {t('intro.link')}
                  </Link>
                </>
              }
              intent="info"
              title={t('intro.title')}
            />
            {visible.length === 0 && (
              <EmptyState
                description={t('toc.emptyDescription')}
                icon="magnifying-glass-bold"
                iconColor="neutral"
                title={t('toc.emptyTitle')}
              />
            )}
            {shows('button') && <ButtonCatalog />}
            {shows('form') && <FormCatalog />}
            {shows('select') && <SelectCatalog />}
            {shows('pickers') && <PickerCatalog />}
            {shows('overlays') && <OverlayCatalog />}
            {shows('table') && <TableCatalog />}
            {shows('badge') && <BadgeCatalog />}
            {shows('feedback') && <FeedbackCatalog />}
            {shows('progress') && <ProgressCatalog />}
            {shows('controls') && <ControlCatalog />}
          </div>
        </div>
      </PageBody>
    </PageShell>
  );
}
