import { createElement, useCallback, useMemo } from 'react';

import type { MenuOption, SystemIconName } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import {
  HEADER_APPEARANCE_ORDER,
  useHeaderAppearance,
  useHeaderAppearanceStore,
  type HeaderAppearance,
} from '../chrome/header-appearance.store';
import HeaderAppearanceOption from './HeaderAppearanceOption';
import {
  HEADER_APPEARANCE_MENU_KEY,
  HEADER_APPEARANCE_MENU_LABEL,
  HEADER_APPEARANCE_OPTION_PREFIX,
  USER_MENU_ACTIONS,
} from './user-menu.constants';
import type {
  UserMenuActionConfig,
  UserMenuExtraOption,
  UserMenuStaticKey,
} from './user-menu.types';

interface UseUserMenuOptionsParams {
  /** Mục app gắn thêm (vd "Ẩn thanh Dock") — giữ identity ổn định (`useMemo`). */
  extraOptions?: readonly UserMenuExtraOption[];
  /** Chỉ nhận key TĨNH (hồ sơ / cài đặt / đăng xuất); mục thêm và kiểu header xử lý tại chỗ. */
  onSelect?: (key: UserMenuStaticKey) => void;
  /** Điện thoại: bỏ submenu kiểu header (top bar điện thoại phẳng, không đổi kiểu). */
  phone?: boolean;
}

const NO_EXTRA_OPTIONS: readonly UserMenuExtraOption[] = [];

/**
 * Mục "Giao diện tối / sáng" đầu menu tài khoản — thay nút đổi theme riêng trên thanh (thanh gọn như console Feishu /
 * Alibaba Cloud: đổi theme là việc hiếm, không chiếm chỗ thường trực).
 */
export function themeMenuOption(
  theme: 'light' | 'dark',
  onToggle: () => void,
): UserMenuExtraOption {
  const toDark = theme === 'light';
  return {
    key: 'theme-toggle',
    label: toDark ? 'Chuyển giao diện tối' : 'Chuyển giao diện sáng',
    icon: createElement(SystemIcon, { name: toDark ? 'moon-bold' : 'sun-bold', size: 16 }),
    onSelect: onToggle,
  };
}

const icon = (name: SystemIconName) => createElement(SystemIcon, { name, size: 16 });

const toOption = (action: UserMenuActionConfig): MenuOption => ({
  key: action.key,
  label: action.label,
  danger: action.danger,
  icon: icon(action.icon),
});

const isStaticKey = (key: string): key is UserMenuStaticKey =>
  USER_MENU_ACTIONS.some((action) => action.key === key);

/** Mỗi kiểu hợp lệ một dòng chọn đơn (dải xem trước + tên), khoá `appearance:<giá trị>`; kiểu đang dùng có dấu ✓. */
const appearanceOptions = (current: HeaderAppearance): MenuOption[] =>
  HEADER_APPEARANCE_ORDER.map((appearance) => ({
    key: `${HEADER_APPEARANCE_OPTION_PREFIX}${appearance}`,
    label: createElement(HeaderAppearanceOption, { appearance }),
    checked: appearance === current,
  }));

/** Kiểu đứng sau tiền tố, chỉ khi nằm trong danh sách hợp lệ (khoá lạ không bao giờ chạm store). */
const appearanceFromKey = (key: string): HeaderAppearance | undefined => {
  if (!key.startsWith(HEADER_APPEARANCE_OPTION_PREFIX)) return undefined;
  const raw = key.slice(HEADER_APPEARANCE_OPTION_PREFIX.length);
  return HEADER_APPEARANCE_ORDER.find((appearance) => appearance === raw);
};

/**
 * useUserMenuOptions — danh sách mục + handler của `<UserMenu>`: mục tĩnh · mục app gắn thêm · submenu "Kiểu header" ·
 * "Đăng xuất" (luôn CUỐI).
 *
 * Dùng:   const { options, handleSelect } = useUserMenuOptions({ extraOptions, onSelect });
 * Lưu ý:  submenu "Kiểu header" đọc / ghi THẲNG store cục bộ `chrome/header-appearance.store` (không qua prop, kẻo mỗi nơi gọi
 *         `<Header>` ghi đè lựa chọn của người dùng). Store của widget khác (Dock…) KHÔNG đọc ở đây — app gắn
 *         mục qua `extraOptions`.
 */
export function useUserMenuOptions({
  extraOptions = NO_EXTRA_OPTIONS,
  onSelect,
  phone = false,
}: UseUserMenuOptionsParams = {}) {
  const appearance = useHeaderAppearance();
  const setAppearance = useHeaderAppearanceStore((s) => s?.setAppearance);

  const options = useMemo<MenuOption[]>(
    () => [
      ...USER_MENU_ACTIONS.filter((a) => a.key !== 'logout').map(toOption),
      ...extraOptions,
      ...(phone
        ? []
        : [
            {
              key: HEADER_APPEARANCE_MENU_KEY,
              label: HEADER_APPEARANCE_MENU_LABEL,
              icon: icon('palette-outline'),
              children: appearanceOptions(appearance),
            },
          ]),
      ...USER_MENU_ACTIONS.filter((a) => a.key === 'logout').map(toOption),
    ],
    [extraOptions, appearance, phone],
  );

  const handleSelect = useCallback(
    (key: string) => {
      const nextAppearance = appearanceFromKey(key);
      if (nextAppearance) {
        setAppearance?.(nextAppearance);
        return;
      }
      const extra = extraOptions.find((option) => option.key === key);
      if (extra) {
        extra.onSelect();
        return;
      }
      if (isStaticKey(key)) onSelect?.(key);
    },
    [extraOptions, onSelect, setAppearance],
  );

  return { options, handleSelect };
}
