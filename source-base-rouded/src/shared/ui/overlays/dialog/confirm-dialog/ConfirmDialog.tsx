import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/shared/utils/style/cn';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import Button from '@/shared/ui/actions/Button';
import GemIcon from '@/shared/ui/icons/gem-icon/GemIcon';
import Modal from '../Modal';
import ModalCloseButton from '../ModalCloseButton';
import {
  CONFIRM_DIALOG_BUTTONS_CLASSES,
  CONFIRM_DIALOG_CLASSES,
  CONFIRM_VARIANTS,
} from './confirm-dialog.theme';
import type { ConfirmDialogVariant } from './confirm-dialog.types';

export interface ConfirmDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: ConfirmDialogVariant;
  title: string;
  description?: React.ReactNode;
  recommendation?: React.ReactNode;
  cancelLabel?: string;
  actionLabel?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryLoading?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
  showClose?: boolean;
  closeOnConfirm?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  children?: React.ReactNode;
}

/**
 * ConfirmDialog — hộp thoại xác nhận cho khoảnh khắc quyết định: xoá, rời trang,
 * tiếp tục thao tác rủi ro. Nhập liệu thì dùng `FormModal`; nội dung tuỳ ý thì dùng `Modal`.
 *
 * Hai chế độ: controlled (`open` + `onOpenChange`) hoặc uncontrolled (`children` làm nút mở).
 * Mọi thứ dồn về trục giữa: gem → tiêu đề → mô tả → khuyến nghị → hàng nút [huỷ · (phụ) · chính].
 * Gem là ô icon tông nhạt (`GemIcon`), không quầng.
 * Sửa giao diện: màu / icon / nhãn theo variant → `CONFIRM_VARIANTS` · bố cục →
 * `CONFIRM_DIALOG_CLASSES` · 2 / 3 nút → `CONFIRM_DIALOG_BUTTONS_CLASSES` (`confirm-dialog.theme.ts`).
 * Lưu ý: khung chung với `Modal`; màu ngữ nghĩa CHỈ ở gem + nút hành động.
 * Các nút đóng dialog bằng `Dialog.Close` (đóng được cả khi uncontrolled) — sửa nút thì đừng tự gọi
 * thêm `onOpenChange(false)`, nó sẽ bắn hai lần (notes/components/overlays.md#confirmdialog).
 * Figma: PMS-NEW 469-4474.
 *
 * @param props.open - Trạng thái mở (controlled). Bỏ trống → uncontrolled.
 * @param props.defaultOpen - Mở sẵn lúc mount (uncontrolled).
 * @param props.onOpenChange - Gọi MỘT lần mỗi khi mở / đóng: Huỷ, ✕, Esc, bấm nền, và nút chính / phụ
 *   khi `closeOnConfirm`.
 * @param props.variant - Ý nghĩa + màu: `confirm` | `delete` | `success` | `warning` | `info`.
 *   Mặc định `confirm`.
 * @param props.title - Tiêu đề (bắt buộc), cũng là tên truy cập của hộp thoại.
 * @param props.description - Mô tả dưới tiêu đề; bỏ trống → không render.
 * @param props.recommendation - Dòng "Khuyến nghị:" dưới mô tả; bỏ trống → không render cả cụm vạch
 *   ngăn + dòng gợi ý.
 * @param props.cancelLabel - Nhãn nút huỷ. Mặc định `'Hủy bỏ'`.
 * @param props.actionLabel - Nhãn nút chính. Mặc định theo variant (`Xác nhận` · `Xóa` · `Tiếp tục` · `OK`).
 * @param props.secondaryActionLabel - Nhãn nút PHỤ ở giữa; có → bố cục 3 nút, bỏ trống → 2 nút.
 * @param props.onSecondaryAction - Gọi khi bấm nút phụ.
 * @param props.secondaryLoading - Spinner ở nút phụ + khoá cả hàng nút và ✕. Mặc định `false`.
 * @param props.icon - Icon trong gem, thay icon mặc định của variant.
 * @param props.loading - Spinner ở nút chính + khoá cả hàng nút và ✕. Mặc định `false`.
 * @param props.showClose - Hiện nút ✕ góc phải. `false` chỉ ẨN nó ở máy tính — tablet / điện thoại vẫn có ✕. Mặc định `true`.
 * @param props.closeOnConfirm - `true` → bấm nút chính / phụ là đóng luôn. `false` → giữ mở để caller
 *   chờ tác vụ async (bật `loading`) rồi tự đóng. Mặc định `true`.
 * @param props.onCancel - Gọi khi bấm nút huỷ (không gọi với ✕ / Esc / bấm nền — các đường đó theo dõi
 *   qua `onOpenChange`).
 * @param props.onConfirm - Gọi khi bấm nút chính.
 * @param props.children - Phần tử mở hộp thoại (chế độ uncontrolled), vd một `<Button>`.
 *
 * @example
 * <ConfirmDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   variant="delete"
 *   title="Xoá hạng mục này?"
 *   description="Hành động này không hoàn tác được."
 *   onConfirm={remove}
 * />
 *
 * <ConfirmDialog title="Rời khỏi trang?" variant="warning" onConfirm={leave}>
 *   <Button variant="ghost">Rời khỏi</Button>
 * </ConfirmDialog>
 */
function ConfirmDialog({
  open,
  defaultOpen,
  onOpenChange,
  variant = 'confirm',
  title,
  description,
  recommendation,
  cancelLabel = 'Hủy bỏ',
  actionLabel,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryLoading = false,
  icon,
  loading = false,
  showClose = true,
  closeOnConfirm = true,
  onCancel,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const cfg = CONFIRM_VARIANTS[variant];
  const label = actionLabel ?? cfg.defaultLabel;
  const actionExtraCn = 'actionCn' in cfg ? cfg.actionCn : undefined;
  const hasSecondary = !!secondaryActionLabel;
  const buttons = CONFIRM_DIALOG_BUTTONS_CLASSES[hasSecondary ? 'triple' : 'double'];
  const busy = loading || secondaryLoading;

  const handleCancel = () => {
    if (busy) return;
    onCancel?.();
  };

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleSecondaryAction = () => {
    onSecondaryAction?.();
  };

  const withClose = (node: React.ReactNode) =>
    closeOnConfirm ? (
      <DialogPrimitive.Close asChild disabled={busy}>
        {node}
      </DialogPrimitive.Close>
    ) : (
      node
    );

  const actionsClassName = cn(CONFIRM_DIALOG_CLASSES.actions, buttons.actions);
  const cancelClassName = cn(CONFIRM_DIALOG_CLASSES.cancel, buttons.cancel);
  const secondaryClassName = cn(CONFIRM_DIALOG_CLASSES.secondaryAction, buttons.secondaryAction);
  const actionClassName = cn(CONFIRM_DIALOG_CLASSES.action, buttons.action, actionExtraCn);

  return (
    <Modal
      className={buttons.width}
      defaultOpen={defaultOpen}
      forceCloseOnTouch={false}
      noPadding
      open={open}
      showClose={false}
      size="sm"
      trigger={children}
      onOpenChange={onOpenChange}
    >
      <div className={CONFIRM_DIALOG_CLASSES.root}>
        <ModalCloseButton
          className={CONFIRM_DIALOG_CLASSES.close}
          disabled={busy}
          floating
          forced={!showClose}
        />

        <div className={CONFIRM_DIALOG_CLASSES.gemRow}>
          <GemIcon
            color={cfg.gemColor}
            icon={icon ?? <SystemIcon className={cfg.iconCn} name={cfg.icon} />}
            size="md"
          />
        </div>

        <div className={CONFIRM_DIALOG_CLASSES.titleGroup}>
          <DialogPrimitive.Title className={CONFIRM_DIALOG_CLASSES.title}>
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className={CONFIRM_DIALOG_CLASSES.description}>
              {description}
            </DialogPrimitive.Description>
          )}
        </div>

        {recommendation && (
          <>
            <span aria-hidden className={CONFIRM_DIALOG_CLASSES.divider} />
            <div className={CONFIRM_DIALOG_CLASSES.tipRow}>
              <SystemIcon
                className={CONFIRM_DIALOG_CLASSES.tipIcon}
                name="bolt-lightning-outline"
                size={16}
              />
              <span className={CONFIRM_DIALOG_CLASSES.tipLabel}>Khuyến nghị:</span>
              <span className={CONFIRM_DIALOG_CLASSES.tipText}>{recommendation}</span>
            </div>
          </>
        )}

        <span aria-hidden className={CONFIRM_DIALOG_CLASSES.divider} />

        <div className={actionsClassName}>
          <DialogPrimitive.Close asChild disabled={busy}>
            <Button
              className={cancelClassName}
              disabled={busy}
              size="lg"
              skin="neutral"
              variant="secondary"
              onClick={handleCancel}
            >
              {cancelLabel}
            </Button>
          </DialogPrimitive.Close>
          {hasSecondary &&
            withClose(
              <Button
                className={secondaryClassName}
                disabled={busy}
                loading={secondaryLoading}
                size="lg"
                onClick={handleSecondaryAction}
              >
                {secondaryActionLabel}
              </Button>,
            )}
          {withClose(
            <Button
              className={actionClassName}
              disabled={busy}
              loading={loading}
              size="lg"
              skin={'actionSkin' in cfg ? cfg.actionSkin : undefined}
              onClick={handleConfirm}
            >
              {label}
            </Button>,
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
