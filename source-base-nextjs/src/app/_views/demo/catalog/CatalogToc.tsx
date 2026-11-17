'use client';

import { useTranslations } from 'next-intl';

import { useImeSafeSearchInput } from '@/shared/hooks';
import { Input } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import { CATALOG_SLOT_CLASSES } from './catalog.theme';
import type { CatalogGroupId } from './data/catalog.constants';
import { catalogAnchorId } from './data/catalog.utils';

interface CatalogTocProps {
  items: readonly CatalogGroupId[];
  search: string;
  onSearchChange: (search: string) => void;
}

/**
 * CatalogToc — mục lục + ô tìm nhanh của catalog `/demo`: bên trái (dính đầu khung) từ `lg`, dải cuộn ngang trên cùng ở
 * điện thoại / tablet. Mỗi mục là liên kết neo `#catalog-<id>` tới đúng `CatalogSection`.
 *
 * Ô tìm không kiểm soát (`useImeSafeSearchInput`) nên gõ Telex / VNI không mất dấu; việc lọc do nơi gọi làm.
 *
 * @param props.items - Các nhóm còn hiện sau khi lọc (đã đúng thứ tự).
 * @param props.search - Từ khoá hiện tại.
 * @param props.onSearchChange - Gọi mỗi khi từ khoá đổi (đã qua kiểm IME).
 */
export default function CatalogToc({ items, search, onSearchChange }: CatalogTocProps) {
  const t = useTranslations('demo');
  const { inputProps } = useImeSafeSearchInput(search, onSearchChange);

  return (
    <nav aria-label={t('toc.aria')} className={CATALOG_SLOT_CLASSES.toc}>
      <Input
        {...inputProps}
        aria-label={t('toc.searchLabel')}
        clearable
        placeholder={t('toc.searchPlaceholder')}
        size="sm"
        startIcon={<SystemIcon name="magnifying-glass-outline" size={14} />}
      />
      <ul className={CATALOG_SLOT_CLASSES.tocList}>
        {items.map((id) => (
          <li key={id} className="shrink-0">
            <a className={CATALOG_SLOT_CLASSES.tocLink} href={`#${catalogAnchorId(id)}`}>
              {t(`groups.${id}.title`)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
