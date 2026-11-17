import { matchesSearch } from '@/shared/utils/format/string.utils';

import { CATALOG_GROUPS } from './catalog.constants';
import type { CatalogGroupId } from './catalog.constants';
import type { CatalogImport } from './catalog.types';

/**
 * Hàm thuần của catalog `/demo` — đường neo của nhóm, dòng import hiển thị và bộ lọc theo ô tìm.
 * Dòng import dựng từ `{ from, names }` (không viết thành chuỗi) để test kiểm được mọi tên là export thật.
 */

export function catalogAnchorId(id: CatalogGroupId): string {
  return `catalog-${id}`;
}

export function formatImportLine({ from, names }: CatalogImport): string {
  return `import { ${names.join(', ')} } from '${from}';`;
}

/** Giữ các nhóm có tiêu đề (đã dịch) hoặc tên component khớp từ khoá — bỏ dấu, không phân biệt hoa thường; từ khoá rỗng giữ hết. */
export function filterCatalogGroups(
  ids: readonly CatalogGroupId[],
  search: string,
  titleOf: (id: CatalogGroupId) => string,
): CatalogGroupId[] {
  return ids.filter((id) => matchesSearch([titleOf(id), ...CATALOG_GROUPS[id].components], search));
}
