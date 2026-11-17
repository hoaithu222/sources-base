import { memo, type ReactNode } from 'react';

import { Text } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

type DemoRowWidth = 'narrow' | 'bounded';
type DemoRowLayout = 'inline' | 'stacked';

interface DemoRowProps {
  label: string;
  note?: string;
  stacked?: boolean;
  width?: DemoRowWidth;
  children: ReactNode;
  className?: string;
}

const DEMO_ROW_BASE_CLASSES = 'flex flex-col gap-1.5';

const DEMO_ROW_LABEL_CLASSES = 'flex flex-wrap items-baseline gap-x-2 gap-y-0.5';

const DEMO_ROW_BODY_CLASSES = {
  inline: 'flex flex-wrap items-center gap-2 overflow-x-auto overscroll-x-contain',
  stacked: 'flex flex-col items-stretch gap-2 [&>button]:self-start',
} satisfies Record<DemoRowLayout, string>;

const DEMO_ROW_WIDTH_CLASSES = {
  narrow: 'max-w-md',
  bounded: 'max-w-2xl',
} satisfies Record<DemoRowWidth, string>;

/**
 * DemoRow — một hàng mẫu trong `DemoSection`: nhãn trục (chữ sans) + ghi chú mờ ở trên, các mẫu ở dưới —
 * mặc định xếp ngang, tự xuống dòng, tràn thì cuộn ngang.
 *
 * Sửa: nhãn → `DEMO_ROW_LABEL_CLASSES` · thân → `DEMO_ROW_BODY_CLASSES` · bề ngang → `DEMO_ROW_WIDTH_CLASSES`.
 * Lưu ý: thân xếp dọc KÉO GIÃN con (ô nhập lấp đủ bề ngang khung), riêng nút đứng trực tiếp trong thân giữ bề
 * ngang tự nhiên; `width` chỉ có nghĩa cùng `stacked` — lý do ở `notes/code/demo.md` (mục DemoRow).
 *
 * @param props.label - Tên trục biến thể đang trình bày (vd `variant`, `size="sm"`).
 * @param props.note - Một dòng ghi chú mờ cạnh nhãn.
 * @param props.stacked - `true` → xếp dọc thay vì cuộn ngang, cho phần tử cao (bảng, panel, ô nhập). Mặc định
 *   `false`.
 * @param props.width - Bó bề ngang vùng mẫu khi `stacked`: `narrow` 28rem cho nút / ô nhập lẻ, `bounded`
 *   42rem cho trình soạn nhiều dòng (FieldArray, DictionaryField); bỏ trống cho bảng, lưới, panel.
 * @param props.children - Các mẫu.
 * @param props.className - Class thêm cho khung hàng.
 *
 * @example
 * <DemoRow label="size" note="mặc định md">
 *   <Button size="sm">sm</Button>
 *   <Button size="md">md</Button>
 * </DemoRow>
 */
const DemoRow = memo(function DemoRow({
  label,
  note,
  stacked = false,
  width,
  children,
  className,
}: DemoRowProps) {
  const bodyClassName = cn(
    DEMO_ROW_BODY_CLASSES[stacked ? 'stacked' : 'inline'],
    stacked && width && DEMO_ROW_WIDTH_CLASSES[width],
  );

  return (
    <div className={cn(DEMO_ROW_BASE_CLASSES, className)}>
      <div className={DEMO_ROW_LABEL_CLASSES}>
        <Text size="tiny" weight="medium">
          {label}
        </Text>
        {note ? (
          <Text size="tiny" skin="muted">
            {note}
          </Text>
        ) : null}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
});

export default DemoRow;
