import { memo } from 'react';

import { Button, Tooltip } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { formatShortcut } from '@/shared/utils/browser/shortcut-label.utils';

interface EntrySaveStateProps {
  dirtyCount: number;
  onSave: () => void;
}

const SAVE_STATE_CLASSES = {
  saved:
    'inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-caption-12-medium text-fg-muted [&>svg]:text-success',
  count:
    'inline-grid h-5 min-w-5 place-items-center rounded-full bg-neutral-0/22 px-1.5 text-caption-12-semibold tabular-nums',
} satisfies Record<string, string>;

const SAVE_TOOLTIP = `Lưu phiếu · ${formatShortcut('S')}`;

/**
 * EntrySaveState — trạng thái lưu của phiếu nhập trong MỘT chỗ: chưa sửa gì → nhãn "Đã lưu ✓" (không có nút xám chết);
 * có dòng sửa → nút "Lưu phiếu" kèm số dòng chờ lưu, tooltip nhắc Ctrl+S. Phiếu còn lỗi vẫn bấm được — trang báo dòng lỗi
 * thay vì để nút im lặng.
 *
 * @param props.dirtyCount - Số dòng đã sửa / thêm chưa lưu.
 * @param props.onSave - Lưu phiếu (cùng hàm với Ctrl+S).
 *
 * @example
 * <EntrySaveState dirtyCount={dirtyCount} onSave={handleSave} />
 */
const EntrySaveState = memo(function EntrySaveState({ dirtyCount, onSave }: EntrySaveStateProps) {
  if (dirtyCount === 0) {
    return (
      <span aria-live="polite" className={SAVE_STATE_CLASSES.saved} role="status">
        <SystemIcon name="circle-check-outline" size={14} />
        Đã lưu
      </span>
    );
  }

  return (
    <Tooltip arrow={false} content={SAVE_TOOLTIP} side="bottom">
      <Button
        endIcon={
          <span aria-label={`${dirtyCount} dòng chờ lưu`} className={SAVE_STATE_CLASSES.count}>
            {dirtyCount}
          </span>
        }
        size="sm"
        startIcon={<SystemIcon name="check-bold" size={14} />}
        onClick={onSave}
      >
        Lưu phiếu
      </Button>
    </Tooltip>
  );
});

export default EntrySaveState;
