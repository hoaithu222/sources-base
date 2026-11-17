import { memo } from 'react';

import { Badge, Text } from '@/shared/ui';

interface VariantChipProps {
  label: string;
  detail?: string;
  matches: boolean;
}

/**
 * VariantChip — chip "biến thể đang khớp / không khớp": tên biến thể (mono) + chữ `khớp` / `không`, kèm điều
 * kiện (media query) in mờ bên cạnh. Màu chỉ là phụ — trạng thái nằm ở CHỮ nên đọc được cả khi mù màu.
 *
 * @param props.label - Tên biến thể như viết trong class (vd `phone:`, `xl:max-wide:`).
 * @param props.detail - Điều kiện tương đương (media query / mô tả), in mono mờ.
 * @param props.matches - `true` → khớp (xanh, nền tô); `false` → không khớp (xám, chỉ viền).
 *
 * @example
 * <VariantChip detail="(min-width: 768px)" label="md:" matches={width >= 768} />
 */
const VariantChip = memo(function VariantChip({ label, detail, matches }: VariantChipProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
      <Badge
        color={matches ? 'success' : 'neutral'}
        dot
        size="md"
        variant={matches ? 'tinted' : 'outline'}
      >
        <span className="font-mono">{label}</span>
        <span>{matches ? 'khớp' : 'không'}</span>
      </Badge>
      {detail ? (
        <Text className="min-w-0 break-words font-mono" size="extraTiny" skin="muted">
          {detail}
        </Text>
      ) : null}
    </div>
  );
});

export default VariantChip;
