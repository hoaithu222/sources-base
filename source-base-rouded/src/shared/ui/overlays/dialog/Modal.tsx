import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useRef } from 'react';
import { cn } from '@/shared/utils/style/cn';
import Button from '@/shared/ui/actions/Button';
import { MODAL_LAYOUT_CLASSES, MODAL_OVERLAY_CLASS, MODAL_SLOT_CLASSES } from '../modal.theme';
import ModalCloseButton from './ModalCloseButton';
import { useOpenAutoFocus } from './useOpenAutoFocus';

export type ModalFrame = 'default' | 'hud';

export type ModalSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | 'auto'
  | 'screen'
  | 'full';

interface ModalFooterProps {
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmCn?: string;
  loading?: boolean;
}

export interface ModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  frame?: ModalFrame;
  showClose?: boolean;
  forceCloseOnTouch?: boolean;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmCn?: string;
  loading?: boolean;
  trigger?: React.ReactNode;
  noPadding?: boolean;
  className?: string;
  onOpenAutoFocus?: (event: Event) => void;
  autoFocusFirst?: boolean;
}

const MODAL_SIZE_CLASSES = {
  xs: 'w-[320px]',
  sm: 'w-[400px]',
  md: 'w-[520px]',
  lg: 'w-[640px]',
  xl: 'w-[768px]',
  '2xl': 'w-[900px]',
  '3xl': 'w-[1024px]',
  '4xl': 'w-[1200px]',
  '5xl': 'w-[1400px]',
  '6xl': 'w-[1600px]',
  auto: 'w-fit',
  screen: 'w-[calc(100vw-64px)]',
  full: 'w-full px-10',
} satisfies Record<ModalSize, string>;

const MODAL_HEADER_CLASSES = cn(MODAL_LAYOUT_CLASSES.header, 'items-start pt-5 pb-4');
const MODAL_TITLE_CLASSES = cn(MODAL_LAYOUT_CLASSES.title, 'min-w-0');
/** Mô tả thẳng cột chữ tiêu đề: thụt = bề rộng dấu tiêu đề (vạch 3px) + `gap-2.5` = 13px. */
const MODAL_DESCRIPTION_CLASSES = 'pl-[13px] text-caption-12 text-fg-on-chrome-muted';
const MODAL_BODY_CLASSES = cn(MODAL_LAYOUT_CLASSES.body, 'px-5 py-4');

/**
 * Cặp nút mặc định dồn phải như sheet macOS (nút ≥ 96px, dạng viên `rounded-2xl`; điện thoại chia đôi bề ngang cho ngón
 * cái).
 */
const MODAL_FOOTER_ACTIONS_CLASSES = 'flex w-full justify-end gap-2 phone:[&>*]:flex-1';
const MODAL_FOOTER_BUTTON_CLASSES = 'min-w-24 rounded-2xl';
const MODAL_FLOATING_CLOSE_PANEL_CLASSES = 'max-lg:pt-12 touch:pt-12';

/**
 * ModalFooter — cặp nút mặc định [Huỷ · Xác nhận] của `Modal` (nội bộ, Modal tự dựng khi có
 * `onCancel` / `onConfirm` mà không truyền `footer`).
 *
 * @param props.cancelLabel - Nhãn nút huỷ. Mặc định `'Hủy bỏ'`.
 * @param props.confirmLabel - Nhãn nút xác nhận. Mặc định `'Xác nhận'`.
 * @param props.onCancel - Gọi khi bấm Huỷ.
 * @param props.onConfirm - Gọi khi bấm Xác nhận.
 * @param props.confirmCn - Class thêm cho nút xác nhận.
 * @param props.loading - Spinner ở nút xác nhận + khoá cả hai nút. Mặc định `false`.
 *
 * @example
 * <ModalFooter onCancel={close} onConfirm={save} loading={saving} />
 */
function ModalFooter({
  cancelLabel = 'Hủy bỏ',
  confirmLabel = 'Xác nhận',
  onCancel,
  onConfirm,
  confirmCn,
  loading = false,
}: ModalFooterProps) {
  return (
    <div className={MODAL_FOOTER_ACTIONS_CLASSES}>
      <Button
        className={MODAL_FOOTER_BUTTON_CLASSES}
        disabled={loading}
        size="md"
        skin="neutral"
        type="button"
        variant="secondary"
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
      <Button
        className={cn(MODAL_FOOTER_BUTTON_CLASSES, confirmCn)}
        loading={loading}
        size="md"
        type="button"
        variant="primary"
        onClick={onConfirm}
      >
        {confirmLabel}
      </Button>
    </div>
  );
}

/**
 * Modal — hộp thoại chung trên Radix Dialog: lớp phủ kính mờ + khung panel + header · body · footer.
 * Form nhập liệu thì dùng `FormModal` (thang rộng hơn, nối sẵn react-hook-form); hỏi "chắc chưa?" thì
 * dùng `ConfirmDialog`; ngăn kéo trượt từ mép thì dùng `Drawer`.
 *
 * Hai chế độ: controlled (`open` + `onOpenChange`) hoặc uncontrolled (`trigger` làm nút mở).
 * Footer: truyền `footer` để tự dựng; bỏ trống mà có `onCancel` / `onConfirm` → cặp nút mặc định.
 * Sửa giao diện: bề rộng → `MODAL_SIZE_CLASSES` · khung / trang trí / header / footer → `overlays/modal.theme.ts`.
 * Lưu ý: thang `size` HẸP HƠN FormModal (md 520px ở đây, 800px ở đó) — đổi qua lại phải đổi `size`.
 * Điện thoại: panel rộng `100vw − 16px`, cao `100dvh − 16px − vùng an toàn`, thân tự cuộn, tiêu đề dài xuống dòng.
 * Nút Huỷ mặc định chỉ gọi `onCancel`, KHÔNG tự đóng — caller đóng trong `onCancel`.
 * Panel chặn nổi bọt click / keydown / pointer / submit ra cây React cha (modal trong dòng của Tree,
 * form lồng trong form) — notes/components/overlays.md#modal.
 *
 * @param props.open - Trạng thái mở (controlled). Bỏ trống → uncontrolled.
 * @param props.defaultOpen - Mở sẵn lúc mount (uncontrolled).
 * @param props.onOpenChange - Gọi khi Radix muốn mở / đóng (✕, Esc, bấm nền, `trigger`).
 * @param props.title - Tiêu đề header (thành `Dialog.Title`). Header hiện khi có `title`, `description`
 *   HOẶC `showClose`.
 * @param props.description - Dòng mô tả dưới tiêu đề (thành `Dialog.Description`).
 * @param props.children - Nội dung body (có padding `p-4`, trừ khi `noPadding`).
 * @param props.footer - Footer tuỳ biến, thắng cặp nút mặc định.
 * @param props.size - Bề rộng: `xs` 320 · `sm` 400 · `md` 520 · `lg` 640 · `xl` 768 · `2xl` 900 ·
 *   `3xl` 1024 · `4xl` 1200 · `5xl` 1400 · `6xl` 1600 (px) · `auto` · `screen` (trừ 64px) · `full`.
 *   Mặc định `md`.
 * @param props.frame - `default` | `hud`. @deprecated Không còn tác dụng — mọi hộp thoại dùng chung MỘT khung (viền 1px,
 *   bóng mềm, bo `2xl`); giữ để tương thích, sẽ gỡ ở đợt dọn dẹp. Mặc định `default`.
 * @param props.showClose - Hiện nút ✕ ở header. `false` chỉ ẨN nó ở máy tính — tablet / chạm ngón vẫn hiện
 *   (`forceCloseOnTouch`). Mặc định `true`.
 * @param props.forceCloseOnTouch - `true` → tablet / điện thoại LUÔN có ✕ dù `showClose={false}`; panel không
 *   header (`noPadding` tự dựng nội dung) thì ✕ NỔI góc phải-trên. Chỉ tắt khi nội dung tự vẽ nút đóng
 *   riêng hoặc là hộp thoại khoá cứng. Mặc định `true`.
 * @param props.cancelLabel - Nhãn nút huỷ của footer mặc định. Mặc định `'Hủy bỏ'`.
 * @param props.confirmLabel - Nhãn nút xác nhận của footer mặc định. Mặc định `'Xác nhận'`.
 * @param props.onCancel - Bấm Huỷ ở footer mặc định (có prop này là hiện footer mặc định).
 * @param props.onConfirm - Bấm Xác nhận ở footer mặc định (có prop này là hiện footer mặc định).
 * @param props.confirmCn - Class ghi đè nút xác nhận của footer mặc định (vd màu danger).
 * @param props.loading - Spinner ở nút xác nhận + khoá cả hai nút của footer mặc định. Mặc định `false`.
 * @param props.trigger - Phần tử mở modal (chế độ uncontrolled), vd một `<Button>`.
 * @param props.noPadding - Bỏ khung padding của body + footer để caller tự dựng bố cục. Mặc định `false`.
 * @param props.className - Class thêm cho panel (vd chiều cao cố định).
 * @param props.onOpenAutoFocus - Ghi đè auto-focus của Radix (gọi `e.preventDefault()` rồi tự focus);
 *   thắng `autoFocusFirst`.
 * @param props.autoFocusFirst - `true` → focus ô nhập đầu tiên trong panel khi mở (`data-autofocus="true"`
 *   được ưu tiên). Mặc định `false`.
 *
 * @example
 * <Modal
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Đổi tên"
 *   onCancel={() => setOpen(false)}
 *   onConfirm={save}
 * >
 *   <Input aria-label="Tên mới" value={name} onChange={(e) => setName(e.target.value)} />
 * </Modal>
 *
 * <Modal title="Hướng dẫn" size="lg" trigger={<Button variant="ghost">Xem hướng dẫn</Button>}>
 *   <Text>Bấm Esc hoặc ✕ để đóng.</Text>
 * </Modal>
 */
function Modal({
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  showClose = true,
  forceCloseOnTouch = true,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  confirmCn,
  loading = false,
  trigger,
  noPadding = false,
  className,
  onOpenAutoFocus,
  autoFocusFirst = false,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const handleOpenAutoFocus = useOpenAutoFocus(contentRef, {
    enabled: autoFocusFirst,
    onOpenAutoFocus,
  });

  const hasHeader = Boolean(title) || Boolean(description) || showClose;
  const floatingClose = !hasHeader && forceCloseOnTouch;
  const hasBuiltinFooter = !!(onCancel ?? onConfirm);
  const resolvedFooter =
    footer ??
    (hasBuiltinFooter ? (
      <ModalFooter
        cancelLabel={cancelLabel}
        confirmCn={confirmCn}
        confirmLabel={confirmLabel}
        loading={loading}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    ) : null);
  const bodyContent = hasHeader ? (
    children
  ) : (
    <DialogPrimitive.Description asChild>
      <div>{children}</div>
    </DialogPrimitive.Description>
  );

  const panelClassName = cn(
    MODAL_SLOT_CLASSES.panel,
    MODAL_SIZE_CLASSES[size],
    floatingClose && MODAL_FLOATING_CLOSE_PANEL_CLASSES,
    className,
  );

  return (
    <DialogPrimitive.Root defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={MODAL_OVERLAY_CLASS} />

        <DialogPrimitive.Content
          ref={contentRef}
          className={panelClassName}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onOpenAutoFocus={handleOpenAutoFocus}
          onPointerDown={(e) => e.stopPropagation()}
          onSubmit={(e) => e.stopPropagation()}
        >
          {hasHeader && (
            <div className={MODAL_HEADER_CLASSES}>
              <span aria-hidden="true" className={MODAL_LAYOUT_CLASSES.headerBand} />
              <span aria-hidden="true" className={MODAL_LAYOUT_CLASSES.headerBandFill} />

              <div className="relative flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span aria-hidden="true" className={MODAL_LAYOUT_CLASSES.titleBar} />
                  {title && (
                    <DialogPrimitive.Title className={MODAL_TITLE_CLASSES}>
                      {title}
                    </DialogPrimitive.Title>
                  )}
                </div>
                {description && (
                  <DialogPrimitive.Description className={MODAL_DESCRIPTION_CLASSES}>
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>

              {(showClose || forceCloseOnTouch) && <ModalCloseButton forced={!showClose} />}
            </div>
          )}

          {floatingClose && <ModalCloseButton floating forced />}

          {children &&
            (noPadding ? <>{children}</> : <div className={MODAL_BODY_CLASSES}>{bodyContent}</div>)}

          {resolvedFooter &&
            (noPadding ? (
              <>{resolvedFooter}</>
            ) : (
              <div className={MODAL_LAYOUT_CLASSES.footer}>{resolvedFooter}</div>
            ))}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default Modal;
