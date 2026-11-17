'use client';

import { useEffect } from 'react';
import { useRouter } from '@/core/i18n';

import { useKeyboardShortcut } from '@/shared/hooks';

import type { HeaderLevel, HeaderModule, HeaderNavItem } from './module-nav.types';
import { useRecentModulesStore } from './recent-modules.store';

interface HeaderModuleStateInput {
  level: HeaderLevel;
  modules: readonly HeaderModule[];
  activeModuleId?: string;
  moduleNav: readonly HeaderNavItem[];
  moduleHref?: string;
  backHref?: string;
}

/** Mục LÁ đang mở của dải màn hình (nhóm → tìm trong con). */
function findActiveNavItem(items: readonly HeaderNavItem[]): HeaderNavItem | undefined {
  for (const item of items) {
    if (item.children) {
      const child = findActiveNavItem(item.children);
      if (child) return child;
    } else if (item.active) {
      return item;
    }
  }
  return undefined;
}

/**
 * useHeaderModuleState — trạng thái PHÂN HỆ của header: phân hệ đang mở (`active`), màn hình đang mở (`activeItem`), có ở
 * cấp ≥ 2 không (`deep` — hiện nút ‹). Ghi phân hệ vào "Gần đây" (`recent-modules.store`) để bảng ⊞ đưa lên đầu; cấp ≥ 2:
 * Ctrl/⌘ + ↑ lên một cấp như Finder (bỏ qua khi đang gõ). Chỉ `Header` gọi.
 *
 * @param input - `level` · `modules` · `activeModuleId` · `moduleNav` · `moduleHref` · `backHref` (như props của `Header`).
 * @returns `{ active, activeItem, deep }`.
 *
 * @example
 * const { active, activeItem, deep } = useHeaderModuleState({ level, modules, activeModuleId, moduleNav, moduleHref, backHref });
 */
export function useHeaderModuleState({
  level,
  modules,
  activeModuleId,
  moduleNav,
  moduleHref,
  backHref,
}: HeaderModuleStateInput) {
  const router = useRouter();
  useEffect(() => {
    if (activeModuleId) useRecentModulesStore.getState().record(activeModuleId);
  }, [activeModuleId]);

  const active = modules.find((module) => module.id === activeModuleId);
  const deep = Boolean(level >= 2 && active && moduleHref && backHref);

  useKeyboardShortcut({
    code: 'ArrowUp',
    mods: ['mod'],
    capture: true,
    ignoreWhileTyping: true,
    enabled: deep,
    onTrigger: () => {
      if (backHref) router.push(backHref);
    },
  });

  const activeItem = active && moduleHref ? findActiveNavItem(moduleNav) : undefined;
  return { active, activeItem, deep };
}
