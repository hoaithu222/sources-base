import { useMemo } from 'react';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { cn } from '@/shared/utils/style/cn';
import type { MenuOption } from './Menu';
import { MENU_CONTENT_CLASSES, MENU_ICON_CLASSES, MENU_ITEM_CLASSES } from './menu.theme';

export interface ContextMenuProps {
  children: React.ReactNode;
  options: MenuOption[];
  disabled?: boolean;
  asChild?: boolean;
  modal?: boolean;
  onSelect?: (option: MenuOption) => void;
  onCloseAutoFocus?: (event: Event) => void;
  contentClassName?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const CONTEXT_MENU_PANEL_ORIGIN_CLASSES =
  'origin-[var(--radix-context-menu-content-transform-origin)]';

/**
 * ContextMenu — danh sách hành động mở bằng CHUỘT PHẢI tại con trỏ (Radix ContextMenu).
 *
 * Bọc vùng cần chuột phải; mở bằng click vào một nút thì dùng `Menu` (chung kiểu `MenuOption`).
 * Sửa giao diện: khung / dòng / icon / tone danger → `menu.theme.ts` (chung với `Menu`).
 * Lưu ý: click trong menu KHÔNG nổi lên cha, nhưng KHÔNG được chặn `pointerdown`; một mục mở tiếp Dialog
 * → `modal={false}` (docs/notes/components/actions.md, mục Menu / ContextMenu).
 * Lưu ý: mặc định `children` nằm trong một `<span>` `display: contents` — trong bảng (`<tr>`) span bọc làm
 * hỏng cấu trúc, phải dùng `asChild`.
 *
 * @param props.children - Vùng nhận chuột phải. Với `asChild`: đúng MỘT element nhận được ref + props.
 * @param props.options - Các mục `MenuOption[]` (như `Menu`).
 * @param props.disabled - `true` → chuột phải ra menu mặc định của trình duyệt. Mặc định `false`.
 * @param props.asChild - `true` → gắn trigger thẳng vào `children` thay vì bọc span (vd `<tr>`).
 *   Mặc định `false`.
 * @param props.modal - `true` → khoá tương tác ngoài menu khi đang mở; đặt `false` khi một mục mở tiếp
 *   Dialog. Mặc định `true`.
 * @param props.onSelect - Gọi với `MenuOption` vừa chọn; menu tự đóng sau đó.
 * @param props.onCloseAutoFocus - Chạy khi đóng, trước lúc trả focus; `(e) => e.preventDefault()` giữ focus
 *   cho ô nhập mở từ một mục (đổi tên inline).
 * @param props.contentClassName - Class thêm cho khung danh sách.
 * @param props.ref - Trỏ tới khung danh sách (`role="menu"`) khi đang mở.
 *
 * @example
 * <ContextMenu
 *   options={[{ key: 'copy', label: 'Sao chép' }, { key: 'delete', label: 'Xoá', danger: true }]}
 *   onSelect={(option) => handleAction(option.key)}
 * >
 *   <div>Vùng chuột phải</div>
 * </ContextMenu>
 *
 * <ContextMenu asChild options={rowOptions} onSelect={onRowAction}>
 *   <tr>…</tr>
 * </ContextMenu>
 */
function ContextMenu({
  children,
  options,
  disabled,
  asChild,
  modal,
  onSelect,
  onCloseAutoFocus,
  contentClassName,
  ref,
}: ContextMenuProps) {
  const optionElements = useMemo(
    () =>
      options.map((option) => {
        const tone = option.danger ? 'danger' : 'default';
        return (
          <ContextMenuPrimitive.Item
            key={option.key}
            className={MENU_ITEM_CLASSES[tone]}
            disabled={option.disabled}
            title={option.disabled ? option.hint : undefined}
            onSelect={() => onSelect?.(option)}
          >
            {option.icon && <span className={MENU_ICON_CLASSES[tone]}>{option.icon}</span>}
            <span className="flex-1">{option.label}</span>
          </ContextMenuPrimitive.Item>
        );
      }),
    [onSelect, options],
  );

  const panelClassName = cn(
    MENU_CONTENT_CLASSES,
    CONTEXT_MENU_PANEL_ORIGIN_CLASSES,
    contentClassName,
  );

  return (
    <ContextMenuPrimitive.Root modal={modal}>
      <ContextMenuPrimitive.Trigger
        asChild={asChild}
        className={asChild ? undefined : 'contents'}
        disabled={disabled}
      >
        {children}
      </ContextMenuPrimitive.Trigger>
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content
          ref={ref}
          className={panelClassName}
          collisionPadding={8}
          onClick={(e) => e.stopPropagation()}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          {optionElements}
        </ContextMenuPrimitive.Content>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  );
}

export default ContextMenu;
