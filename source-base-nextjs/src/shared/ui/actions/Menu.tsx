'use client';

import { Fragment, useMemo } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import {
  MENU_CHECK_CLASSES,
  MENU_CONTENT_CLASSES,
  MENU_HEADER_CLASSES,
  MENU_ICON_CLASSES,
  MENU_ITEM_CLASSES,
  MENU_RADIO_ITEM_CLASSES,
  MENU_SEPARATOR_CLASSES,
  MENU_SHORTCUT_CLASSES,
  MENU_SUB_CHEVRON_CLASSES,
  MENU_SUB_TRIGGER_CLASSES,
} from './menu.theme';

export interface MenuOption {
  /** Khoá duy nhất trong danh sách; nhận lại qua `onSelect(option)`. */
  key: string;
  label: string | React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Hiện bằng `title` gốc khi mục disabled — vd lý do thiếu quyền. */
  hint?: string;
  /** `true` → chữ + icon màu `error` (thao tác phá huỷ: xoá, gỡ…). */
  danger?: boolean;
  /**
   * Gợi ý phím tắt hiện mờ ở cuối dòng (vd `'Ctrl+D'`) — CHỈ là chữ gợi ý, menu không tự gắn phím; nơi gọi tự bắt phím.
   */
  shortcut?: string;
  /** `true` → kẻ vạch ngăn mảnh NGAY TRƯỚC mục này (tách nhóm lệnh, vd nhóm "Xoá" cuối menu). Bỏ qua ở mục đầu danh sách. */
  separatorBefore?: boolean;
  /**
   * Có `children` → mục thành SUBMENU (mở sang bên khi rê / bấm → / Enter) và KHÔNG phát `onSelect`; chỉ các mục lá
   * phát. Chỉ `Menu` hỗ trợ — `ContextMenu` (chung kiểu này) bỏ qua `children` và `checked`.
   */
  children?: MenuOption[];
  /**
   * `true` | `false` → mục là LỰA CHỌN ĐƠN (`role="menuitemradio"`): dòng `true` đậm + có dấu ✓. Các mục có `checked`
   * trong CÙNG một danh sách (`options` hoặc `children`) là một nhóm. `undefined` → mục thường.
   */
  checked?: boolean;
}

export interface MenuProps {
  trigger: React.ReactNode;
  options: MenuOption[];
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  header?: React.ReactNode;
  modal?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (option: MenuOption) => void;
  onCloseAutoFocus?: (event: Event) => void;
  contentClassName?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const MENU_PANEL_ORIGIN_CLASSES = 'origin-[var(--radix-dropdown-menu-content-transform-origin)]';

/** Khung submenu: cùng bề mặt với menu cha, không nhận `contentClassName` (bề rộng riêng do nội dung quyết). */
const MENU_SUB_PANEL_CLASSES = cn(MENU_CONTENT_CLASSES, MENU_PANEL_ORIGIN_CLASSES);

type MenuSelectHandler = ((option: MenuOption) => void) | undefined;

function renderMenuOption(option: MenuOption, onSelect: MenuSelectHandler) {
  const tone = option.danger ? 'danger' : 'default';
  const icon = option.icon && <span className={MENU_ICON_CLASSES[tone]}>{option.icon}</span>;
  const shortcut = option.shortcut && (
    <span aria-hidden className={MENU_SHORTCUT_CLASSES}>
      {option.shortcut}
    </span>
  );

  if (option.children?.length) {
    return (
      <DropdownMenuPrimitive.Sub key={option.key}>
        <DropdownMenuPrimitive.SubTrigger
          className={MENU_SUB_TRIGGER_CLASSES}
          disabled={option.disabled}
          title={option.disabled ? option.hint : undefined}
        >
          {icon}
          <span className="flex-1">{option.label}</span>
          <span className={MENU_SUB_CHEVRON_CLASSES}>
            <SystemIcon name="angle-right-outline" size={12} />
          </span>
        </DropdownMenuPrimitive.SubTrigger>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.SubContent
            className={MENU_SUB_PANEL_CLASSES}
            collisionPadding={8}
            sideOffset={6}
            onClick={(e) => e.stopPropagation()}
          >
            {renderMenuOptions(option.children, onSelect)}
          </DropdownMenuPrimitive.SubContent>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Sub>
    );
  }

  if (option.checked !== undefined) {
    return (
      <DropdownMenuPrimitive.RadioItem
        key={option.key}
        className={MENU_RADIO_ITEM_CLASSES}
        disabled={option.disabled}
        title={option.disabled ? option.hint : undefined}
        value={option.key}
        onSelect={() => onSelect?.(option)}
      >
        {icon}
        <span className="flex-1">{option.label}</span>
        {shortcut}
        <DropdownMenuPrimitive.ItemIndicator>
          <SystemIcon className={MENU_CHECK_CLASSES} name="check-outline" size={12} />
        </DropdownMenuPrimitive.ItemIndicator>
      </DropdownMenuPrimitive.RadioItem>
    );
  }

  return (
    <DropdownMenuPrimitive.Item
      key={option.key}
      className={MENU_ITEM_CLASSES[tone]}
      disabled={option.disabled}
      title={option.disabled ? option.hint : undefined}
      onSelect={() => onSelect?.(option)}
    >
      {icon}
      <span className="flex-1">{option.label}</span>
      {shortcut}
    </DropdownMenuPrimitive.Item>
  );
}

/**
 * Dựng danh sách mục (+ vạch ngăn trước mục `separatorBefore`); các mục có `checked` gom thành MỘT nhóm radio (Radix cần
 * `RadioGroup` bọc `RadioItem`).
 */
function renderMenuOptions(options: readonly MenuOption[], onSelect: MenuSelectHandler) {
  const items = options.map((option, index) =>
    option.separatorBefore && index > 0 ? (
      <Fragment key={option.key}>
        <DropdownMenuPrimitive.Separator className={MENU_SEPARATOR_CLASSES} />
        {renderMenuOption(option, onSelect)}
      </Fragment>
    ) : (
      renderMenuOption(option, onSelect)
    ),
  );
  if (!options.some((option) => option.checked !== undefined)) return items;

  const checkedKey = options.find((option) => option.checked)?.key ?? '';
  return (
    <DropdownMenuPrimitive.RadioGroup value={checkedKey}>{items}</DropdownMenuPrimitive.RadioGroup>
  );
}

/**
 * Menu — danh sách hành động bật ra khi bấm một nút (Radix DropdownMenu): nút "Thao tác", nút ⋯ cuối dòng.
 *
 * Chỉ phát `onSelect`, không giữ trạng thái chọn — chọn GIÁ TRỊ thì dùng `Dropdown` / `MultiSelect`. Cài đặt NHỎ
 * kiểu "chọn một trong vài dạng" (vd kiểu header) thì để caller giữ state và truyền `checked` trong submenu `children`.
 * Mở bằng chuột phải tại con trỏ thì dùng `ContextMenu` (chung kiểu `MenuOption`).
 * Sửa giao diện: khung / dòng / icon / tone danger → `menu.theme.ts` (dựa trên
 * `overlays/popup-surface.theme`) · khối `header` + vạch ngăn → `MENU_HEADER_CLASSES` ·
 * `MENU_SEPARATOR_CLASSES` (cùng `menu.theme.ts`).
 * Lưu ý: click trong menu KHÔNG nổi lên cha (row `Tree` / `Table` không bị kích hoạt), nhưng KHÔNG được
 * chặn `pointerdown` — Radix cần nó để đóng các lớp nổi chồng nhau. Một mục mở tiếp Dialog → `modal={false}`
 * (docs/notes/components/actions.md, mục Menu).
 *
 * @param props.trigger - Phần tử mở menu, thường là `<Button>`; được bọc `asChild` nên phải nhận ref + props.
 * @param props.options - Các mục `MenuOption[]`: `key`, `label`, `icon`, `disabled`, `hint` (lý do khi
 *   disabled), `danger` (tô đỏ), `shortcut` (gợi ý phím tắt cuối dòng), `separatorBefore` (vạch ngăn nhóm phía
 *   trên), `children` (submenu), `checked` (lựa chọn đơn có dấu ✓).
 * @param props.side - Phía bật ra so với trigger: `top` | `right` | `bottom` | `left`. Mặc định `bottom`.
 * @param props.align - Căn theo trigger: `start` | `center` | `end`. Mặc định `start`.
 * @param props.header - Khối tĩnh phía trên danh sách (vd thẻ người dùng), kẻ mảnh bên dưới; không phát
 *   `onSelect`.
 * @param props.modal - `true` → khoá tương tác ngoài menu khi đang mở; đặt `false` khi một mục mở tiếp
 *   Dialog. Mặc định `true`.
 * @param props.open - Điều khiển mở / đóng từ ngoài — cần khi `header` có nút bấm (Radix chỉ tự đóng khi
 *   chọn một mục). Bỏ trống = menu tự quản.
 * @param props.onOpenChange - Gọi với `true` / `false` mỗi khi menu mở / đóng.
 * @param props.onSelect - Gọi với `MenuOption` vừa chọn; menu tự đóng sau đó.
 * @param props.onCloseAutoFocus - Chạy khi đóng, trước lúc trả focus về trigger; `(e) => e.preventDefault()`
 *   giữ focus cho ô nhập mở từ một mục (đổi tên inline).
 * @param props.contentClassName - Class thêm cho khung danh sách (bề rộng, chiều cao tối đa…).
 * @param props.ref - Trỏ tới khung danh sách (`role="menu"`) khi đang mở.
 *
 * @example
 * <Menu
 *   trigger={<Button size="sm" variant="stroke">Thao tác</Button>}
 *   options={[
 *     { key: 'edit', label: 'Sửa', icon: <SystemIcon name="pen-outline" />, shortcut: 'Ctrl+E' },
 *     { key: 'delete', label: 'Xoá', icon: <SystemIcon name="trash-outline" />, danger: true, separatorBefore: true },
 *   ]}
 *   onSelect={(option) => handleAction(option.key)}
 * />
 */
function Menu({
  trigger,
  options,
  side = 'bottom',
  align = 'start',
  header,
  modal,
  open,
  onOpenChange,
  onSelect,
  onCloseAutoFocus,
  contentClassName,
  ref,
}: MenuProps) {
  const optionElements = useMemo(() => renderMenuOptions(options, onSelect), [onSelect, options]);

  const panelClassName = cn(MENU_CONTENT_CLASSES, MENU_PANEL_ORIGIN_CLASSES, contentClassName);

  return (
    <DropdownMenuPrimitive.Root modal={modal} open={open} onOpenChange={onOpenChange}>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          ref={ref}
          align={align}
          className={panelClassName}
          collisionPadding={8}
          side={side}
          sideOffset={4}
          onClick={(e) => e.stopPropagation()}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          {header && (
            <>
              <DropdownMenuPrimitive.Label className={MENU_HEADER_CLASSES}>
                {header}
              </DropdownMenuPrimitive.Label>
              <DropdownMenuPrimitive.Separator className={MENU_SEPARATOR_CLASSES} />
            </>
          )}
          {optionElements}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

export default Menu;
