import * as PopoverPrimitive from '@radix-ui/react-popover';
import { useState } from 'react';
import { useIsPhone } from '@/shared/hooks';
import { cn } from '@/shared/utils/style/cn';
import Drawer from './drawer/Drawer';
import { popupSurface } from './popup-surface.theme';

export type PopoverVariant = 'glass' | 'solid';

export interface PopoverProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  anchorOnly?: boolean;
  onOpenAutoFocus?: (e: Event) => void;
  onCloseAutoFocus?: (e: Event) => void;
  onInteractOutside?: (e: Event) => void;
  arrow?: boolean;
  modal?: boolean;
  container?: HTMLElement | null;
  collisionBoundary?: Element | null | Array<Element | null>;
  collisionPadding?: number;
  variant?: PopoverVariant;
  className?: string;
  sheetOnPhone?: boolean | React.ReactNode;
}

const POPOVER_PHONE_COLLISION_PADDING = 8;

/**
 * Bề mặt chung (`popupSurface`): mặt ĐỤC viền `border-strong` — popover nổi trên nội dung trơn, kính ở đây thành hộp
 * mờ lộ chữ phía sau (light-theme.md §1.5).
 */
const POPOVER_SURFACE_CLASS = popupSurface();

const POPOVER_CONTENT_BASE_CLASSES = cn(
  'origin-[var(--radix-popover-content-transform-origin)] outline-none text-body-14 text-fg-on-chrome',
  'phone:max-h-[var(--radix-popover-content-available-height)] phone:max-w-[calc(100vw-16px)]',
  'phone:overflow-y-auto phone:overscroll-contain',
);

/** Có mũi tên: bỏ `overflow-hidden` của bề mặt — mũi tên nằm NGOÀI hộp, giữ thì bị cắt mất. */
const POPOVER_WITH_ARROW_CLASSES = 'overflow-visible';

/**
 * Mũi tên CÓ VIỀN (như Tooltip `data`): khung cắt 14×7 lộ nửa dưới ô vuông xoay 45° → chữ V viền `border-strong`
 * (`border-popup` vẽ chéo gần như không thấy; tam giác không viền thì mất hẳn trên thẻ cùng màu), dịch 1px đè lên
 * viền panel.
 */
const POPOVER_ARROW_CLASSES = 'relative block h-[7px] w-[14px] -translate-y-px overflow-hidden';

const POPOVER_ARROW_TIP_CLASSES = cn(
  'absolute left-1/2 top-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45',
  'border border-border-strong bg-bg-dialog',
);

/**
 * Popover — panel nổi neo vào một phần tử (Radix Popover) cho nội dung tương tác: bộ lọc nhỏ, chọn
 * nhanh, bảng thông tin có nút. Chỉ chữ gợi ý khi rê chuột thì dùng `Tooltip`; danh sách lệnh thì `Menu`.
 *
 * `children` là trigger (asChild — phải là MỘT phần tử nhận ref, vd `<Button>`). `content` không có
 * padding sẵn: tự đệm bên trong. Popover đặt trong Modal → truyền `container` là node của Dialog.
 * Điện thoại: panel không bao giờ tràn màn (cao tối đa phần màn còn lại rồi cuộn, rộng ≤ màn − 16px, chừa 8px tới
 * mép khi tránh va chạm); nội dung dài / nhiều điều khiển thì bật `sheetOnPhone` để hiện thành ngăn kéo đáy có ✕.
 * Sửa giao diện: bề mặt chung (nền đục, viền `border-strong`, bóng 3 lớp) → `popup-surface.theme.ts` · mũi tên có viền →
 * `POPOVER_ARROW_*`.
 * Lưu ý: `anchorOnly` biến `children` thành neo định vị, caller sở hữu `open`; click vào neo là
 * "bên ngoài" nên phải chặn đóng bằng `onInteractOutside` + `e.preventDefault()`
 * — notes/components/overlays.md#popover.
 *
 * @param props.content - Nội dung panel.
 * @param props.children - Phần tử trigger (hoặc neo khi `anchorOnly`).
 * @param props.side - Phía mở: `top` | `right` | `bottom` | `left`. Mặc định `bottom`.
 * @param props.align - Căn theo trigger: `start` | `center` | `end`. Mặc định `center`.
 * @param props.sideOffset - Khoảng cách tới trigger (px). Mặc định `4`.
 * @param props.open - Trạng thái mở (controlled). Bỏ trống → uncontrolled.
 * @param props.defaultOpen - Mở sẵn lúc mount (uncontrolled).
 * @param props.onOpenChange - Gọi khi mở / đóng.
 * @param props.disabled - Khoá trigger (không mở được). Không tác dụng khi `anchorOnly`. Mặc định `false`.
 * @param props.anchorOnly - `true` → `children` chỉ là NEO định vị, không bấm-để-mở (combobox / typeahead
 *   tự mở theo focus / phím, tránh popover "nháy"). Mặc định `false`.
 * @param props.onOpenAutoFocus - Gọi khi panel mở và sắp nhận focus; `e.preventDefault()` để giữ focus ở
 *   chỗ cũ (vd ô nhập của combobox).
 * @param props.onCloseAutoFocus - Gọi khi panel đóng và sắp trả focus về trigger; `e.preventDefault()` rồi
 *   `focus({ preventScroll: true })` để vùng chứa không bị cuộn.
 * @param props.onInteractOutside - Gọi khi bấm / focus ra ngoài panel; `e.preventDefault()` giữ panel mở
 *   (vd bấm vào portal Select lồng bên trong).
 * @param props.arrow - Hiện mũi tên chỉ về trigger. Mặc định `false`.
 * @param props.modal - `true` → khoá tương tác bên ngoài + focus trap trong panel. Mặc định `false`.
 * @param props.container - Node để portal vào (mặc định `body`). Trong Modal: node của Dialog, để cuộn
 *   bằng bánh xe không bị chặn.
 * @param props.collisionBoundary - Vùng coi là "màn hình" khi tránh va chạm (mặc định viewport), cho panel
 *   trong khung con có biên riêng. `null` = như bỏ trống.
 * @param props.collisionPadding - Khoảng chừa với mép vùng va chạm (px). Mặc định `0` (của Radix); điện thoại `8`.
 * @param props.variant - `glass` | `solid`. @deprecated Không còn tác dụng — cả hai là cùng mặt nổi đục viền `border-strong`
 *   (kính chỉ trên nền có màu); giữ để tương thích, sẽ gỡ ở đợt dọn dẹp. Mặc định `glass`.
 * @param props.className - Class thêm cho panel (vd bề rộng, padding).
 * @param props.sheetOnPhone - Điện thoại: hiện `content` thành NGĂN KÉO ĐÁY có ✕ + tay nắm kéo thay vì panel lơ lửng
 *   cạnh trigger; laptop / tablet không đổi. `true` = không tiêu đề; truyền node = tiêu đề ngăn kéo. Chỉ bật cho
 *   nội dung KHÔNG mở lớp nổi lồng (ngăn kéo là Dialog modal: lớp nổi lồng portal ra `body` bị khoá chuột).
 *   Mặc định `false`.
 *
 * @example
 * <Popover content={<div className="p-3">Bộ lọc nhanh…</div>} align="start">
 *   <Button variant="stroke">Bộ lọc</Button>
 * </Popover>
 */
function Popover({
  content,
  children,
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
  open,
  defaultOpen,
  onOpenChange,
  disabled = false,
  anchorOnly = false,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onInteractOutside,
  arrow = false,
  modal = false,
  container,
  collisionBoundary,
  collisionPadding,
  className,
  sheetOnPhone = false,
}: PopoverProps) {
  const phone = useIsPhone();
  const asSheet = phone && sheetOnPhone !== false && sheetOnPhone !== undefined;
  const [innerOpen, setInnerOpen] = useState(defaultOpen ?? false);
  const isOpen = open ?? innerOpen;
  const handleOpenChange = (next: boolean) => {
    if (open === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };
  const contentClassName = cn(
    POPOVER_SURFACE_CLASS,
    POPOVER_CONTENT_BASE_CLASSES,
    arrow && POPOVER_WITH_ARROW_CLASSES,
    className,
  );

  if (asSheet) {
    return (
      <>
        <PopoverPrimitive.Root modal={false} open={isOpen} onOpenChange={handleOpenChange}>
          {anchorOnly ? (
            <PopoverPrimitive.Anchor asChild>{children}</PopoverPrimitive.Anchor>
          ) : (
            <PopoverPrimitive.Trigger asChild disabled={disabled}>
              {children}
            </PopoverPrimitive.Trigger>
          )}
        </PopoverPrimitive.Root>
        <Drawer
          open={isOpen}
          side="bottom"
          size="md"
          title={sheetOnPhone === true ? undefined : sheetOnPhone}
          onOpenChange={handleOpenChange}
        >
          {content}
        </Drawer>
      </>
    );
  }

  return (
    <PopoverPrimitive.Root
      defaultOpen={defaultOpen}
      modal={modal}
      open={open}
      onOpenChange={onOpenChange}
    >
      {anchorOnly ? (
        <PopoverPrimitive.Anchor asChild>{children}</PopoverPrimitive.Anchor>
      ) : (
        <PopoverPrimitive.Trigger asChild disabled={disabled}>
          {children}
        </PopoverPrimitive.Trigger>
      )}
      <PopoverPrimitive.Portal container={container ?? undefined}>
        <PopoverPrimitive.Content
          align={align}
          className={contentClassName}
          collisionBoundary={collisionBoundary ?? undefined}
          collisionPadding={
            collisionPadding ?? (phone ? POPOVER_PHONE_COLLISION_PADDING : undefined)
          }
          side={side}
          sideOffset={sideOffset}
          onCloseAutoFocus={onCloseAutoFocus}
          onInteractOutside={onInteractOutside}
          onOpenAutoFocus={onOpenAutoFocus}
        >
          {content}
          {arrow && (
            <PopoverPrimitive.Arrow asChild height={7} width={14}>
              <span aria-hidden className={POPOVER_ARROW_CLASSES}>
                <span className={POPOVER_ARROW_TIP_CLASSES} />
              </span>
            </PopoverPrimitive.Arrow>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export default Popover;
