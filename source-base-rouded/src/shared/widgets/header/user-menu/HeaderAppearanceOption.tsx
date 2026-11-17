import { memo } from 'react';

import { cn } from '@/shared/utils/style/cn';

import { HEADER_APPEARANCE_LABEL, type HeaderAppearance } from '../chrome/header-appearance.store';

const PREVIEW_CLASSES = {
  brand: 'bg-linear-to-r from-bg-brand-from via-bg-brand-via to-bg-brand-to',
  glass: 'border border-border-default bg-bg-glass',
} satisfies Record<HeaderAppearance, string>;

const PREVIEW_BAR_CLASSES = {
  brand: 'bg-accent-5',
  glass: 'bg-primary-6',
} satisfies Record<HeaderAppearance, string>;

/**
 * HeaderAppearanceOption — nhãn một dòng trong submenu "Kiểu header": dải thanh thu nhỏ (màu thật của kiểu đó + vạch
 * mục đang mở) + tên kiểu. Phần nội bộ của menu người dùng (`useUserMenuOptions`).
 *
 * @param props.appearance - Kiểu cần vẽ (`brand` | `glass`).
 *
 * @example
 * <HeaderAppearanceOption appearance="brand" />
 */
const HeaderAppearanceOption = memo(function HeaderAppearanceOption({
  appearance,
}: {
  appearance: HeaderAppearance;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden
        className={cn(
          'relative h-4 w-10 shrink-0 overflow-hidden rounded-xs',
          PREVIEW_CLASSES[appearance],
        )}
      >
        <span
          className={cn(
            'absolute bottom-0 left-2 h-0.5 w-3 rounded-full',
            PREVIEW_BAR_CLASSES[appearance],
          )}
        />
      </span>
      {HEADER_APPEARANCE_LABEL[appearance]}
    </span>
  );
});

export default HeaderAppearanceOption;
