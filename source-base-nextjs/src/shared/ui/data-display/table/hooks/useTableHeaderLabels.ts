'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export interface TableHeaderLabels {
  /** Tên trợ năng của nút sắp xếp theo `name` (tên cột). */
  sortBy: (name: string) => string;
  /** Tên trợ năng của tay cầm kéo giãn cột. */
  resize: string;
}

/**
 * useTableHeaderLabels — chữ trợ năng của ô header (nút sắp xếp, tay cầm kéo giãn) theo ngôn ngữ hiện tại.
 *
 * Hook NỘI BỘ của `TableHeaderRow` / `TableHeaderGroupRow`, truyền kết quả cho `renderHeaderCell` (hàm render
 * thuần, không gọi được hook); chữ nằm ở `ui.dataDisplay` → `table.sortBy` / `table.resizeColumn`.
 *
 * @returns `{ sortBy, resize }`, giữ nguyên tham chiếu khi ngôn ngữ không đổi.
 *
 * @example
 * const labels = useTableHeaderLabels();
 * renderHeaderCell({ col, labels, ...rest });
 */
export function useTableHeaderLabels(): TableHeaderLabels {
  const t = useTranslations('ui.dataDisplay');

  return useMemo(
    () => ({
      sortBy: (name) => t('table.sortBy', { name }),
      resize: t('table.resizeColumn'),
    }),
    [t],
  );
}
