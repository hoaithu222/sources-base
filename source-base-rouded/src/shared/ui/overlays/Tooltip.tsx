import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/shared/utils/style/cn';

export type TooltipVariant = 'hint' | 'data';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  delayDuration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  arrow?: boolean;
  variant?: TooltipVariant;
  className?: string;
}

const TOOLTIP_CONTENT_BASE_CLASSES = cn(
  'z-[999] max-w-xs text-caption-12-medium',
  'origin-[var(--radix-tooltip-content-transform-origin)]',
  'data-[state=delayed-open]:animate-pop-in data-[state=instant-open]:animate-pop-in data-[state=closed]:animate-pop-out',
);

/**
 * `hint` = viên nhãn kiểu tooltip Dock macOS: mực ĐẶC (nền trong suốt từng bị báo lộ chữ phía sau), bo `xl` 16px nên
 * MỘT dòng (cao 28px) thành viên con nhộng, nhiều dòng thành thẻ bo mềm; vòng 1px `neutral-10` (mép sắc, không tan vào bóng)
 * + bóng `--elev-2` mảnh. `data` = nền ĐỤC `bg-surface` (`bg-popup` còn alpha 97%). Không blur, không quầng.
 */
const TOOLTIP_CONTENT_VARIANT_CLASSES = {
  hint: cn(
    'relative rounded-xl px-2.5 py-1.5 text-center text-neutral-0 bg-neutral-9',
    'ring-1 ring-neutral-10 shadow-(--elev-2)',
  ),
  data: cn(
    'relative rounded-md px-2.5 py-2 text-left tabular-nums text-fg-heading',
    'border border-border-strong bg-bg-dialog',
    'shadow-[0_8px_24px_var(--color-shadow-popup)]',
  ),
} satisfies Record<TooltipVariant, string>;

/**
 * Mũi tên CÓ VIỀN: khung cắt chỉ để lộ nửa dưới của ô vuông xoay 45° → chữ V viền cùng màu viền hộp. Mũi tên là con
 * của hộp nên vẽ ĐÈ lên viền hộp: `hint` viền là `ring` (nằm ngoài hộp) → tự che; `data` viền nằm trong hộp → dịch lên 1px.
 * `hint` thu nhỏ còn 10×5 (mũi nhọn nhỏ như macOS, không "đuôi" nặng); `data` 14×7.
 */
const TOOLTIP_ARROW_CLASSES = {
  hint: 'relative block h-[5px] w-[10px] overflow-hidden',
  data: 'relative block h-[7px] w-[14px] -translate-y-px overflow-hidden',
} satisfies Record<TooltipVariant, string>;

const TOOLTIP_ARROW_TIP_BASE_CLASSES =
  'absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45';

const TOOLTIP_ARROW_TIP_CLASSES = {
  hint: cn(TOOLTIP_ARROW_TIP_BASE_CLASSES, 'size-[7px] bg-neutral-9'),
  data: cn(TOOLTIP_ARROW_TIP_BASE_CLASSES, 'border border-border-strong bg-bg-dialog'),
} satisfies Record<TooltipVariant, string>;

/**
 * Tooltip — chú thích nổi khi rê chuột / focus (Radix Tooltip): một câu gợi ý cho control, hoặc hộp số
 * liệu của một dòng danh sách. Nội dung có nút bấm / cần tương tác thì dùng `Popover`.
 *
 * `children` là trigger (asChild) — phải là MỘT phần tử focus được và nhận ref (vd `<Button>`); nút
 * `disabled` không bắn sự kiện chuột nên bọc nó trong một `<span>`. Tự mang `Provider` riêng.
 * Sửa giao diện: bề mặt → `TOOLTIP_CONTENT_VARIANT_CLASSES` · mũi tên → `TOOLTIP_ARROW_(TIP_)CLASSES` ·
 * hiệu ứng hiện / ẩn → `TOOLTIP_CONTENT_BASE_CLASSES`.
 * Lưu ý: `data` dựng đúng bề mặt tooltip biểu đồ (`buildChartStyles().tooltip`) — sửa một nơi thì sửa
 * cả hai (notes/components/overlays.md#tooltip).
 *
 * @param props.content - Nội dung chú thích.
 * @param props.children - Phần tử trigger.
 * @param props.side - Phía hiện: `top` | `right` | `bottom` | `left`. Mặc định `top`.
 * @param props.align - Căn theo trigger: `start` | `center` | `end`. Mặc định `center`.
 * @param props.sideOffset - Khoảng cách tới trigger (px). Mặc định `4`.
 * @param props.delayDuration - Độ trễ mở khi rê chuột (ms). Mặc định `200`.
 * @param props.open - Trạng thái mở (controlled). Bỏ trống → uncontrolled.
 * @param props.defaultOpen - Mở sẵn lúc mount (uncontrolled).
 * @param props.onOpenChange - Gọi khi mở / đóng.
 * @param props.disabled - `true` → chỉ render `children`, không có tooltip.
 * @param props.arrow - Hiện mũi tên chỉ về trigger. Mặc định `true`.
 * @param props.variant - `hint` (gợi ý một câu cho control, chữ giữa, nền mực đặc) | `data` (hộp SỐ LIỆU,
 *   chữ trái, cùng bề mặt tooltip biểu đồ). Mặc định `hint`.
 * @param props.className - Class thêm cho panel.
 *
 * @example
 * <Tooltip content="Tải xuống">
 *   <Button aria-label="Tải xuống" size="sm" variant="ghost">
 *     <SystemIcon name="arrow-down-to-bracket-outline" />
 *   </Button>
 * </Tooltip>
 *
 * <Tooltip variant="data" side="right" content={<span>Doanh thu: 1.240 tỷ</span>}>
 *   <span tabIndex={0}>Tháng 9</span>
 * </Tooltip>
 */
function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  sideOffset = 4,
  delayDuration = 200,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  arrow = true,
  variant = 'hint',
  className,
}: TooltipProps) {
  if (disabled) return <>{children}</>;

  const contentClassName = cn(
    TOOLTIP_CONTENT_BASE_CLASSES,
    TOOLTIP_CONTENT_VARIANT_CLASSES[variant],
    className,
  );

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            align={align}
            className={contentClassName}
            side={side}
            sideOffset={sideOffset}
          >
            {content}
            {arrow && (
              <TooltipPrimitive.Arrow asChild height={7} width={14}>
                <span aria-hidden className={TOOLTIP_ARROW_CLASSES[variant]}>
                  <span className={TOOLTIP_ARROW_TIP_CLASSES[variant]} />
                </span>
              </TooltipPrimitive.Arrow>
            )}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export default Tooltip;
