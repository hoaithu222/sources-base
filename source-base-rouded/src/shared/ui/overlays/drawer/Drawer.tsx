import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useRef } from 'react';
import { cn } from '@/shared/utils/style/cn';
import {
  DRAWER_CLASSES,
  DRAWER_CONTENT_BASE_CLASSES,
  DRAWER_SIDE_CLASSES,
  DRAWER_SIZE_CLASSES,
} from './drawer.theme';
import type { DrawerSide, DrawerSize } from './drawer.types';
import { MODAL_OVERLAY_CLASS } from '../modal.theme';
import { useDrawerDragClose } from './useDrawerDragClose';
import ModalCloseButton from '../dialog/ModalCloseButton';
import { useOpenAutoFocus } from '../dialog/useOpenAutoFocus';

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  side?: DrawerSide;
  size?: DrawerSize;
  showClose?: boolean;
  trigger?: React.ReactNode;
  className?: string;
  onOpenAutoFocus?: (event: Event) => void;
  autoFocusFirst?: boolean;
}

/**
 * Drawer — ngăn kéo trượt từ mép màn hình (Radix Dialog) cho bảng chi tiết, bình luận, bộ lọc dài —
 * nội dung đi kèm trang đang xem. Hộp thoại giữa màn thì dùng `Modal` / `FormModal`.
 *
 * Luôn controlled (`open` + `onOpenChange`); `trigger` chỉ là nút bấm gọi `onOpenChange(true)`.
 * Animation trượt khai trong `styles/theme/animations.css`.
 * Sửa giao diện: mép / bóng / animation → `DRAWER_SIDE_CLASSES` · kích thước → `DRAWER_SIZE_CLASSES`
 * · header / body / footer → `DRAWER_CLASSES` (`drawer.theme.ts`).
 * Ngăn kéo ĐÁY ở tablet / điện thoại là bottom-sheet chuẩn: tay nắm kéo-xuống-đóng, cao THEO NỘI DUNG (trần = màn −
 * vùng an toàn − 24px), header 52px canh giữa theo ✕, thân `p-4` + đáy cộng `--safe-b` — nơi dùng KHÔNG tự cộng padding.
 * Lưu ý: không có header (không `title`, `showClose={false}`) thì body thành `Dialog.Description` để
 * hộp thoại vẫn có mô tả truy cập được. Mép là viền 1px + bóng mềm đổ về phía trang (không ray / quầng màu) —
 * notes/components/overlays.md#drawer.
 *
 * @param props.open - Trạng thái mở (bắt buộc).
 * @param props.onOpenChange - Gọi khi mở / đóng (✕, Esc, bấm nền, `trigger`).
 * @param props.title - Tiêu đề header (thành `Dialog.Title`). Header hiện khi có `title`, `description`
 *   HOẶC `showClose`.
 * @param props.description - Dòng mô tả dưới tiêu đề (thành `Dialog.Description`).
 * @param props.children - Nội dung body (tự cuộn, `p-4`).
 * @param props.footer - Dải nút cố định ở đáy (căn phải).
 * @param props.side - Mép trượt ra: `right` | `left` | `top` | `bottom`. Mặc định `right`.
 * @param props.size - `sm` | `md` | `lg` | `xl` — bề rộng với left / right (320 · 480 · 640 · 800px),
 *   chiều cao với top / bottom (256 · 360 · 480 · 600px). Mặc định `md`.
 * @param props.showClose - Hiện nút ✕ ở header. `false` chỉ ẨN nó ở máy tính — tablet / chạm ngón vẫn hiện. Mặc định `true`.
 * @param props.trigger - Phần tử bấm để mở (gọi `onOpenChange(true)`).
 * @param props.className - Class thêm cho panel.
 * @param props.onOpenAutoFocus - Ghi đè auto-focus của Radix (vd focus ô soạn tin ở footer); thắng
 *   `autoFocusFirst`.
 * @param props.autoFocusFirst - `true` → focus ô nhập đầu tiên khi mở (`data-autofocus="true"` được ưu
 *   tiên). Mặc định `false`.
 *
 * @example
 * <Drawer
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Chi tiết gói thầu"
 *   size="lg"
 *   footer={<Button onClick={() => setOpen(false)}>Đóng</Button>}
 * >
 *   <Text>Nội dung chi tiết…</Text>
 * </Drawer>
 */
function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = 'right',
  size = 'md',
  showClose = true,
  trigger,
  className,
  onOpenAutoFocus,
  autoFocusFirst = false,
}: DrawerProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const handleOpenAutoFocus = useOpenAutoFocus(contentRef, {
    enabled: autoFocusFirst,
    onOpenAutoFocus,
  });

  const hasHeader = Boolean(title) || Boolean(description) || showClose;
  const isBottom = side === 'bottom';
  const drag = useDrawerDragClose(() => onOpenChange(false));

  const headerClassName = cn(
    DRAWER_CLASSES.header,
    isBottom && DRAWER_CLASSES.headerBottom,
    !description && DRAWER_CLASSES.headerCentered,
  );
  const bodyClassName = cn(
    DRAWER_CLASSES.body,
    DRAWER_CLASSES.bodyScroll,
    isBottom && DRAWER_CLASSES.bodyBottom,
    !hasHeader && DRAWER_CLASSES.bodyHeadless,
  );
  const contentClassName = cn(
    DRAWER_CONTENT_BASE_CLASSES,
    DRAWER_SIDE_CLASSES[side],
    DRAWER_SIZE_CLASSES[side][size],
    className,
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={MODAL_OVERLAY_CLASS} />

        <DialogPrimitive.Content
          ref={contentRef}
          className={contentClassName}
          style={isBottom ? drag.style : undefined}
          onOpenAutoFocus={handleOpenAutoFocus}
        >
          {isBottom && (
            <div aria-hidden="true" className={DRAWER_CLASSES.grip} {...drag.handleProps}>
              <span className={DRAWER_CLASSES.gripBar} />
            </div>
          )}

          {hasHeader && (
            <div className={headerClassName}>
              <div className={DRAWER_CLASSES.heading}>
                {title && <span aria-hidden="true" className={DRAWER_CLASSES.titleMark} />}
                <div className={DRAWER_CLASSES.headingText}>
                  {title && (
                    <DialogPrimitive.Title className={DRAWER_CLASSES.title}>
                      {title}
                    </DialogPrimitive.Title>
                  )}
                  {description && (
                    <DialogPrimitive.Description className={DRAWER_CLASSES.description}>
                      {description}
                    </DialogPrimitive.Description>
                  )}
                </div>
              </div>
              <ModalCloseButton className={DRAWER_CLASSES.close} forced={!showClose} />
            </div>
          )}

          {!hasHeader && <ModalCloseButton floating forced />}

          {children &&
            (hasHeader ? (
              <div className={bodyClassName}>{children}</div>
            ) : (
              <DialogPrimitive.Description asChild>
                <div className={bodyClassName}>{children}</div>
              </DialogPrimitive.Description>
            ))}

          {footer && <div className={DRAWER_CLASSES.footer}>{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default Drawer;
