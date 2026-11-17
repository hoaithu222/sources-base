'use client';

import { useMemo } from 'react';

import { usePathname } from '@/core/i18n';

import { resolveScreenTitle } from './screen-title.utils';
import type { ScreenTitle } from './screen-title.utils';
import { useAppMenu } from './useAppMenu';

/**
 * useScreenTitle — tên màn đang mở theo ngôn ngữ hiện tại (`Phân hệ · Màn con`); `undefined` khi URL không thuộc mục menu nào.
 *
 * Dùng:   const title = useScreenTitle()?.title ?? APP_NAME;
 */
export function useScreenTitle(): ScreenTitle | undefined {
  const pathname = usePathname();
  const { pages, modules } = useAppMenu();

  return useMemo(() => resolveScreenTitle(pathname, pages, modules), [pathname, pages, modules]);
}
