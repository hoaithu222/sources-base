import { memo } from 'react';

import { Button } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

interface DemoRemoveRowButtonProps {
  label: string;
  onClick: () => void;
}

/**
 * DemoRemoveRowButton — nút thùng rác cuối một dòng của mảng field: chỉ có icon, cao bằng ô nhập cỡ `md`,
 * tô đỏ khi hover.
 *
 * @param props.label - Nhãn trợ năng (`aria-label`) — nút không có chữ.
 * @param props.onClick - Xoá dòng.
 *
 * @example
 * <DemoRemoveRowButton label={`Xoá liên hệ ${i + 1}`} onClick={() => remove(i)} />
 */
const DemoRemoveRowButton = memo(function DemoRemoveRowButton({
  label,
  onClick,
}: DemoRemoveRowButtonProps) {
  return (
    <Button
      aria-label={label}
      className="w-9 shrink-0 px-0 text-fg-muted hover:bg-error/10 hover:text-error"
      size="md"
      skin="neutral"
      variant="ghost"
      onClick={onClick}
    >
      <SystemIcon name="trash-can-outline" size={16} />
    </Button>
  );
});

export default DemoRemoveRowButton;
