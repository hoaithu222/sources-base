import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { Surface, Text } from '@/shared/ui';

import { CATALOG_SLOT_CLASSES } from './catalog.theme';
import { CATALOG_GROUPS } from './data/catalog.constants';
import type { CatalogGroupId } from './data/catalog.constants';
import { catalogAnchorId, formatImportLine } from './data/catalog.utils';

interface CatalogSectionProps {
  id: CatalogGroupId;
  children: ReactNode;
}

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={CATALOG_SLOT_CLASSES.metaRow}>
      <Text as="dt" size="tiny" skin="muted" weight="medium">
        {label}
      </Text>
      <dd className={CATALOG_SLOT_CLASSES.metaList}>{children}</dd>
    </div>
  );
}

/**
 * CatalogSection — khung MỘT nhóm của catalog `/demo`: tiêu đề + một câu "dùng khi nào", các ví dụ sống (`children`), rồi
 * khối tra cứu — dòng import đúng, đường file nguồn và tài liệu liên quan (đọc từ `CATALOG_GROUPS`).
 *
 * Là `<section id="catalog-<id>">` — đích của mục lục bên trái. Chữ khung ở `demo.groups.<id>` và `demo.section`.
 *
 * @param props.id - Nhóm đang vẽ; quyết định khoá dịch, đường neo và khối tra cứu.
 * @param props.children - Các ví dụ sống của nhóm (dùng `CatalogState` cho từng trạng thái).
 */
export default function CatalogSection({ id, children }: CatalogSectionProps) {
  const t = useTranslations('demo');
  const group = CATALOG_GROUPS[id];
  const anchorId = catalogAnchorId(id);
  const headingId = `${anchorId}-title`;

  return (
    <section aria-labelledby={headingId} className={CATALOG_SLOT_CLASSES.section} id={anchorId}>
      <Text as="h2" className="text-fg-heading" id={headingId} size="medium" weight="medium">
        {t(`groups.${id}.title`)}
      </Text>
      <Text as="p" size="small" skin="muted">
        {t(`groups.${id}.summary`)}
      </Text>
      <Surface className={CATALOG_SLOT_CLASSES.examples} padding="md">
        {children}
        <dl className={CATALOG_SLOT_CLASSES.meta}>
          <MetaRow label={t('section.importLabel')}>
            {group.imports.map((item) => (
              <code key={item.from} className={CATALOG_SLOT_CLASSES.codeBlock}>
                {formatImportLine(item)}
              </code>
            ))}
          </MetaRow>
          <MetaRow label={t('section.sourceLabel')}>
            {group.sources.map((path) => (
              <code key={path} className={CATALOG_SLOT_CLASSES.code}>
                {path}
              </code>
            ))}
          </MetaRow>
          <MetaRow label={t('section.docsLabel')}>
            {group.docs.map((path) => (
              <code key={path} className={CATALOG_SLOT_CLASSES.code}>
                {path}
              </code>
            ))}
          </MetaRow>
        </dl>
      </Surface>
    </section>
  );
}
