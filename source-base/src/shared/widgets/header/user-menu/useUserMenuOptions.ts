import { createElement, useCallback, useMemo } from 'react';

import type { MenuOption, SystemIconName } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import {
  HEADER_SKIN_ORDER,
  useHeaderSkin,
  useHeaderSkinStore,
  type HeaderSkin,
} from '../header-skin.store';
import HeaderSkinOption from './skin-preview/HeaderSkinOption';
import {
  HEADER_SKIN_MENU_KEY,
  HEADER_SKIN_MENU_LABEL,
  HEADER_SKIN_OPTION_PREFIX,
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
  /** Điện thoại: bỏ submenu kiểu header (top bar điện thoại không có khung để đổi kiểu). */
  phone?: boolean;
}

const NO_EXTRA_OPTIONS: readonly UserMenuExtraOption[] = [];

const icon = (name: SystemIconName) => createElement(SystemIcon, { name, size: 16 });

const toOption = (action: UserMenuActionConfig): MenuOption => ({
  key: action.key,
  label: action.label,
  danger: action.danger,
  icon: icon(action.icon),
});

const isStaticKey = (key: string): key is UserMenuStaticKey =>
  USER_MENU_ACTIONS.some((action) => action.key === key);

/** Mỗi kiểu hợp lệ một dòng chọn đơn (ảnh xem trước + tên), khoá `skin:<giá trị>`; dòng của kiểu đang dùng có dấu ✓. */
const skinOptions = (current: HeaderSkin): MenuOption[] =>
  HEADER_SKIN_ORDER.map((skin) => ({
    key: `${HEADER_SKIN_OPTION_PREFIX}${skin}`,
    label: createElement(HeaderSkinOption, { skin }),
    checked: skin === current,
  }));

/** Kiểu đứng sau tiền tố, chỉ khi nằm trong danh sách hợp lệ (khoá lạ không bao giờ chạm store). */
const skinFromKey = (key: string): HeaderSkin | undefined => {
  if (!key.startsWith(HEADER_SKIN_OPTION_PREFIX)) return undefined;
  const raw = key.slice(HEADER_SKIN_OPTION_PREFIX.length);
  return HEADER_SKIN_ORDER.find((skin) => skin === raw);
};

/**
 * useUserMenuOptions — danh sách mục + handler của `<UserMenu>`: mục tĩnh · mục app gắn thêm · submenu "Kiểu header" ·
 * "Đăng xuất" (luôn CUỐI).
 *
 * Dùng:   const { options, handleSelect } = useUserMenuOptions({ extraOptions, onSelect });
 * Lưu ý:  submenu "Kiểu header" đọc / ghi THẲNG store cục bộ `header-skin.store` (không qua prop, kẻo mỗi nơi gọi
 *         `<Header>` ghi đè lựa chọn của người dùng). Store của widget khác (Dock…) KHÔNG đọc ở đây — app gắn
 *         mục qua `extraOptions`.
 */
export function useUserMenuOptions({
  extraOptions = NO_EXTRA_OPTIONS,
  onSelect,
  phone = false,
}: UseUserMenuOptionsParams = {}) {
  const headerSkin = useHeaderSkin();
  const setHeaderSkin = useHeaderSkinStore((s) => s?.setSkin);

  const options = useMemo<MenuOption[]>(
    () => [
      ...USER_MENU_ACTIONS.filter((a) => a.key !== 'logout').map(toOption),
      ...extraOptions,
      ...(phone
        ? []
        : [
            {
              key: HEADER_SKIN_MENU_KEY,
              label: HEADER_SKIN_MENU_LABEL,
              icon: icon('palette-outline'),
              children: skinOptions(headerSkin),
            },
          ]),
      ...USER_MENU_ACTIONS.filter((a) => a.key === 'logout').map(toOption),
    ],
    [extraOptions, headerSkin, phone],
  );

  const handleSelect = useCallback(
    (key: string) => {
      const skin = skinFromKey(key);
      if (skin) {
        setHeaderSkin?.(skin);
        return;
      }
      const extra = extraOptions.find((option) => option.key === key);
      if (extra) {
        extra.onSelect();
        return;
      }
      if (isStaticKey(key)) onSelect?.(key);
    },
    [extraOptions, onSelect, setHeaderSkin],
  );

  return { options, handleSelect };
}
