import { memo } from 'react';

import { Button } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

interface DemoAddRowButtonProps {
  label: string;
  onClick: () => void;
}

/**
 * DemoAddRowButton — nút "thêm dòng" dưới danh sách của mảng field: viền đứt, trải hết bề ngang, đổi sang màu
 * hành động khi hover.
 *
 * @param props.label - Chữ trên nút (vd "Thêm liên hệ").
 * @param props.onClick - Thêm một dòng mới.
 *
 * @example
 * <DemoAddRowButton label="Thêm mục" onClick={() => append({ label: '' })} />
 */
const DemoAddRowButton = memo(function DemoAddRowButton({ label, onClick }: DemoAddRowButtonProps) {
  return (
    <Button
      className="border-dashed hover:border-action-base hover:text-action-base"
      fullWidth
      size="sm"
      skin="neutral"
      startIcon={<SystemIcon name="plus-outline" size={14} />}
      variant="stroke"
      onClick={onClick}
    >
      {label}
    </Button>
  );
});

export default DemoAddRowButton;
