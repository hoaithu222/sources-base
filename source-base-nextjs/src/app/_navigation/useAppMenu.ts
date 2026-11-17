'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { selectUser, useSessionStore } from '@/domains/session';

import { buildMenu } from './build-menu.utils';
import type { AppMenu } from './build-menu.utils';
import { NAV_MODULES, NAV_PAGES } from './navigation.config';
import type { NavId, NavLabelResolver } from './navigation.types';

/**
 * useAppMenu — menu của app (trang tĩnh + phân hệ) đã DỊCH theo ngôn ngữ hiện tại và lọc theo quyền người dùng bằng CHÍNH
 * `canAccess` của guard, nên mục nào hiện ra thì bấm vào là vào được.
 *
 * Dùng:   const { modules } = useAppMenu()  (Dock, header) · const { pages, modules } = useAppMenu()  (bảng lệnh, tab bar)
 * Lưu ý:  chữ lấy từ `messages/<locale>/shell.json` → `nav.<id>`; `subtitle` / `description` tuỳ chọn (không khai thì bỏ).
 */
export function useAppMenu(): AppMenu {
  const t = useTranslations('shell.nav');
  const user = useSessionStore(selectUser);

  return useMemo(() => {
    /** `subtitle` / `description` là tuỳ chọn theo từng mục nên khoá có thể không tồn tại — `has` nhận chuỗi tự do. */
    const has = t.has as (key: string) => boolean;
    const optional = (id: NavId, field: 'subtitle' | 'description') => {
      const key = `${id}.${field}`;
      return has(key) ? t(key as Parameters<typeof t>[0]) : undefined;
    };
    const labelOf: NavLabelResolver = (id) => ({
      title: t(`${id}.title`),
      subtitle: optional(id, 'subtitle'),
      description: optional(id, 'description'),
    });
    return buildMenu(NAV_PAGES, NAV_MODULES, labelOf, user);
  }, [t, user]);
}
