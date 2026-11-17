'use client';

import { cn } from '@/shared/utils/style/cn';
import { MODAL_LAYOUT_CLASSES } from '../modal.theme';
import ModalCloseButton from './ModalCloseButton';

export interface CustomModalLayoutProps {
  title?: React.ReactNode;
  header?: React.ReactNode;
  headerClassName?: string;
  onClose?: () => void;
  footer?: React.ReactNode;
  showHeader?: boolean;
  showDividerHeader?: boolean;
  showDividerFooter?: boolean;
  className?: string;
  bodyClassName?: string;
  children?: React.ReactNode;
}

const CUSTOM_MODAL_BODY_CLASSES = cn(MODAL_LAYOUT_CLASSES.body, 'px-5 py-4');

/**
 * CustomModalLayout — khung header · body · footer THUẦN (không bọc Dialog) cùng ngôn ngữ với Modal:
 * đặt trong một lớp nổi tự dựng, hoặc dùng độc lập như một tấm panel có tiêu đề.
 *
 * `FormModal` dựng trên khung này; cần cả lớp phủ + focus trap thì dùng `Modal` / `FormModal`.
 * Header một dòng (`min-h-14`) với `title`; truyền `header` để thay bằng nội dung nhiều dòng (`min-h-12`).
 * Sửa giao diện: class từng phần → `MODAL_LAYOUT_CLASSES` (`overlays/modal.theme.ts`) · padding body →
 * `CUSTOM_MODAL_BODY_CLASSES`.
 * Lưu ý: chữ dùng token tự đảo theme (`text-fg-heading`), KHÔNG `text-neutral-0` (trắng, vô hình ở
 * light theme) — notes/components/overlays.md#custommodallayout.
 *
 * @param props.title - Tiêu đề (giữ nguyên chữ hoa / thường): máy tính một dòng cắt `…`; tablet / điện thoại xuống dòng đủ
 *   câu. Bị bỏ qua khi có `header`.
 * @param props.header - Nội dung header tuỳ biến, thay cho `title`.
 * @param props.headerClassName - Class thêm cho hàng header.
 * @param props.onClose - Có → hiện nút ✕ ở header (`ModalCloseButton`: 32px, tablet / điện thoại 40px) và gọi hàm này
 *   khi bấm.
 * @param props.footer - Nội dung footer (căn phải); bỏ trống → không có dải footer.
 * @param props.showHeader - Hiện header. Mặc định `true`.
 * @param props.showDividerHeader - Hiện vạch ngăn 1px dưới header. Mặc định `true`.
 * @param props.showDividerFooter - Hiện vạch sáng ở mép trên footer. Mặc định `true`.
 * @param props.className - Class thêm cho khung ngoài.
 * @param props.bodyClassName - Class thêm cho body (padding, overflow…).
 * @param props.children - Nội dung body.
 *
 * @example
 * <CustomModalLayout title="Thông tin" onClose={close} footer={<Button onClick={save}>Lưu</Button>}>
 *   <Text>Nội dung…</Text>
 * </CustomModalLayout>
 */
function CustomModalLayout({
  title,
  header,
  headerClassName,
  onClose,
  footer,
  showHeader = true,
  showDividerHeader = true,
  showDividerFooter = true,
  className,
  bodyClassName,
  children,
}: CustomModalLayoutProps) {
  const rootClassName = cn(MODAL_LAYOUT_CLASSES.root, className);
  const headerBarClassName = cn(
    MODAL_LAYOUT_CLASSES.header,
    header ? 'min-h-12 items-start py-3' : 'min-h-14 py-3',
    headerClassName,
  );
  const closeClassName = cn(header && 'mt-0.5 max-lg:mt-0');
  const bodyAreaClassName = cn(CUSTOM_MODAL_BODY_CLASSES, bodyClassName);
  const footerClassName = cn(MODAL_LAYOUT_CLASSES.footer, !showDividerFooter && 'before:hidden');

  return (
    <div className={rootClassName}>
      {showHeader && (
        <div className={headerBarClassName}>
          {showDividerHeader && (
            <span aria-hidden="true" className={MODAL_LAYOUT_CLASSES.headerBand} />
          )}
          <span aria-hidden="true" className={MODAL_LAYOUT_CLASSES.headerBandFill} />

          {header ? (
            <div className="relative min-w-0 flex-1">{header}</div>
          ) : (
            <div className="relative flex min-w-0 flex-1 items-start gap-2.5">
              <span aria-hidden="true" className={MODAL_LAYOUT_CLASSES.titleBar} />
              <p className={MODAL_LAYOUT_CLASSES.title}>{title}</p>
            </div>
          )}

          {onClose && <ModalCloseButton className={closeClassName} onClick={onClose} />}
        </div>
      )}

      <div className={bodyAreaClassName}>{children}</div>

      {footer && <div className={footerClassName}>{footer}</div>}
    </div>
  );
}

export default CustomModalLayout;
