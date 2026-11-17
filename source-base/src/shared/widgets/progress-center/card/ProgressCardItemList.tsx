import { memo } from 'react';

import type { SystemIconName } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import type { ProgressStatus } from '../progress-center.types';

export interface ProgressCardItem {
  id: string;
  name: string;
  status: ProgressStatus;
  /** Chữ bên phải: dung lượng, %, hoặc câu lỗi. */
  detail?: string;
}

interface ProgressCardItemListProps {
  items: readonly ProgressCardItem[];
  className?: string;
}

const PROGRESS_CARD_ITEM_LIST_CLASSES = 'flex max-h-40 flex-col gap-1 overflow-y-auto';
const PROGRESS_CARD_ITEM_ROW_CLASSES = 'flex min-w-0 items-center gap-2 text-caption-12';
const PROGRESS_CARD_ITEM_NAME_CLASSES = 'min-w-0 flex-1 truncate text-fg-body';

const PROGRESS_CARD_ITEM_ICON_NAMES = {
  pending: 'clock-outline',
  running: 'loader-outline',
  success: 'circle-check-bold',
  error: 'circle-xmark-bold',
} satisfies Record<ProgressStatus, SystemIconName>;

const PROGRESS_CARD_ITEM_ICON_CLASSES = {
  pending: 'shrink-0 text-fg-muted',
  running: 'shrink-0 text-info animate-spin motion-reduce:animate-none',
  success: 'shrink-0 text-success-7 dark:text-success',
  error: 'shrink-0 text-error',
} satisfies Record<ProgressStatus, string>;

const PROGRESS_CARD_ITEM_DETAIL_CLASSES = {
  pending: 'max-w-[55%] shrink-0 truncate tabular-nums text-fg-muted',
  running: 'max-w-[55%] shrink-0 truncate tabular-nums text-fg-body',
  success: 'max-w-[55%] shrink-0 truncate tabular-nums text-fg-muted',
  error: 'max-w-[55%] shrink-0 truncate text-error',
} satisfies Record<ProgressStatus, string>;

/**
 * ProgressCardItemList — danh sách mục con trong phần mở rộng của `ProgressCard` (từng tệp của một lô
 * tải lên): icon trạng thái + tên + chữ chi tiết bên phải.
 *
 * Sửa giao diện: icon · màu theo trạng thái → `PROGRESS_CARD_ITEM_ICON_*` /
 * `PROGRESS_CARD_ITEM_DETAIL_CLASSES` (ngay trong file này).
 *
 * @param props.items - Các mục `{ id, name, status, detail? }`; `status` là `ProgressStatus`
 *   (`pending` | `running` | `success` | `error`) — quyết định icon + màu dòng.
 * @param props.className - Class thêm cho `<ul>`.
 *
 * @example
 * <ProgressCardItemList items={[{ id: 'a', name: 'a.png', status: 'success', detail: '1.2 MB' }]} />
 */
const ProgressCardItemList = memo(function ProgressCardItemList({
  items,
  className,
}: ProgressCardItemListProps) {
  return (
    <ul className={cn(PROGRESS_CARD_ITEM_LIST_CLASSES, className)}>
      {items.map((item) => (
        <li key={item.id} className={PROGRESS_CARD_ITEM_ROW_CLASSES}>
          <SystemIcon
            className={PROGRESS_CARD_ITEM_ICON_CLASSES[item.status]}
            name={PROGRESS_CARD_ITEM_ICON_NAMES[item.status]}
            size={14}
          />
          <span className={PROGRESS_CARD_ITEM_NAME_CLASSES} title={item.name}>
            {item.name}
          </span>
          {item.detail && (
            <span className={PROGRESS_CARD_ITEM_DETAIL_CLASSES[item.status]} title={item.detail}>
              {item.detail}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
});

export default ProgressCardItemList;
