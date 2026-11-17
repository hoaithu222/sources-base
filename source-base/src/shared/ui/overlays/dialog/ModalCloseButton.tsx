import * as DialogPrimitive from '@radix-ui/react-dialog';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import { MODAL_CLOSE_CLASSES } from '../modal.theme';

export interface ModalCloseButtonProps {
  forced?: boolean;
  floating?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * ModalCloseButton — nút đóng (✕) CHUNG của mọi lớp nổi: Modal · FormModal · ConfirmDialog · Drawer ·
 * CustomModalLayout. Quy ước: hình 32px (tablet / điện thoại 40px), vùng chạm 44px (`::after`), có vòng
 * focus, `aria-label="Đóng"`.
 *
 * Không có `onClick` → Radix `Dialog.Close`: đóng chính Dialog bọc nó, kể cả khi caller để Dialog uncontrolled.
 * Có `onClick` → nút thường, dùng NGOÀI Dialog (`CustomModalLayout` đứng riêng).
 * Sửa giao diện: `MODAL_CLOSE_CLASSES` (`overlays/modal.theme.ts`) — không sửa ở từng nơi dùng.
 * Lưu ý: `forced` chỉ ẨN nút ở máy tính; tablet (`max-lg:`) / chạm ngón (`touch:`) vẫn hiện. Lý do thiết kế:
 * notes/components/overlays.md#modalclosebutton.
 *
 * @param props.forced - `true` → ẩn ở máy tính, vẫn hiện ở tablet / chạm ngón (khi caller tắt `showClose`).
 *   Mặc định `false`.
 * @param props.floating - `true` → nút NỔI góc phải-trên panel (panel không có header). Mặc định `false`.
 * @param props.disabled - Khoá nút (vd đang gửi). Mặc định `false`.
 * @param props.className - Class thêm, ghi đè vị trí (vd `right-3 top-3`).
 * @param props.onClick - Có → nút thường gọi hàm này; bỏ trống → `Dialog.Close`.
 *
 * @example
 * <ModalCloseButton forced={!showClose} />
 *
 * <ModalCloseButton floating className="right-3 top-3" />
 */
function ModalCloseButton({
  forced = false,
  floating = false,
  disabled = false,
  className,
  onClick,
}: ModalCloseButtonProps) {
  const closeClassName = cn(
    MODAL_CLOSE_CLASSES.base,
    forced && MODAL_CLOSE_CLASSES.forced,
    floating && MODAL_CLOSE_CLASSES.floating,
    className,
  );
  const icon = <SystemIcon name="xmark-outline" size={16} />;

  if (onClick) {
    return (
      <button
        aria-label="Đóng"
        className={closeClassName}
        disabled={disabled}
        type="button"
        onClick={onClick}
      >
        {icon}
      </button>
    );
  }

  return (
    <DialogPrimitive.Close aria-label="Đóng" className={closeClassName} disabled={disabled}>
      {icon}
    </DialogPrimitive.Close>
  );
}

export default ModalCloseButton;
