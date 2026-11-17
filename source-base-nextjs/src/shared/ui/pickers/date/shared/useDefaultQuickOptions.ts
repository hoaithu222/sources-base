'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import type { QuickSelectOption } from './date-picker.types';
import { buildDefaultQuickOptions } from './date-picker.utils';

/**
 * useDefaultQuickOptions — bộ nút chọn nhanh mặc định của `RangeDatePicker` với nhãn theo ngôn ngữ hiện tại.
 *
 * Dùng khi muốn mở rộng bộ mặc định (`[...useDefaultQuickOptions(), mine]`); nhãn nằm ở `ui.pickers` →
 * `quick.*`. Không truyền `quickSelectOptions` thì `RangeDatePicker` tự dùng bộ này.
 *
 * @returns Mảng `QuickSelectOption` (2 tuần tới · tháng / quý / năm nay · 3 / 6 tháng gần nhất), giữ nguyên
 *   tham chiếu khi ngôn ngữ không đổi.
 *
 * @example
 * const quickOptions = [...useDefaultQuickOptions(), { label: 'Hôm qua', getRange }];
 */
export function useDefaultQuickOptions(): QuickSelectOption[] {
  const t = useTranslations('ui.pickers');

  return useMemo(
    () =>
      buildDefaultQuickOptions({
        next2Weeks: t('quick.next2Weeks'),
        thisMonth: t('quick.thisMonth'),
        thisQuarter: t('quick.thisQuarter'),
        thisYear: t('quick.thisYear'),
        last3Months: t('quick.last3Months'),
        last6Months: t('quick.last6Months'),
      }),
    [t],
  );
}
