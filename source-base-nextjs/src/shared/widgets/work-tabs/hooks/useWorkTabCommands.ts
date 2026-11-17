'use client';

import { useCallback } from 'react';
import { useRouter, usePathname } from '@/core/i18n';

import { useWorkTabsStore } from '../work-tabs.store';
import type { WorkTab, WorkTabCommand } from '../work-tabs.types';
import { byRecency } from '../work-tabs.utils';

const keeps = (command: WorkTabCommand, path: string, index: number) =>
  function keep(tab: WorkTab, i: number) {
    if (command === 'close') return tab.path !== path;
    if (command === 'close-others') return tab.path === path || Boolean(tab.pinned);
    return i <= index || Boolean(tab.pinned);
  };

/**
 * useWorkTabCommands — chạy lệnh trên một thẻ (`WorkTabCommand`: đóng · đóng các thẻ khác · đóng bên phải · ghim) cho
 * bảng lịch sử thẻ. Lệnh làm mất thẻ của màn đang mở → ĐIỀU HƯỚNG TRƯỚC rồi mới xoá khỏi store: đóng → sang thẻ mở gần
 * nhất còn lại (như lùi một bước lịch sử), lệnh khác → sang chính thẻ được bấm; không còn thẻ nào thì về `homeHref`.
 * Màn đang đứng không phải thẻ (Trang chủ, trang không tên) → đóng gì cũng đứng yên.
 *
 * @param homeHref - Đích khi đóng thẻ cuối cùng của màn đang mở.
 *
 * @example
 * const runCommand = useWorkTabCommands('/');
 * runCommand('close', '/tai-chinh/so-cai');
 */
export function useWorkTabCommands(homeHref: string) {
  const pathname = usePathname();
  const router = useRouter();

  return useCallback(
    (command: WorkTabCommand, path: string) => {
      const store = useWorkTabsStore.getState();
      if (command === 'pin') {
        store.togglePin(path);
        return;
      }
      const { tabs } = store;
      const index = tabs.findIndex((tab) => tab.path === path);
      const remaining = tabs.filter(keeps(command, path, index));
      const isOpenTab = (tab: WorkTab) => tab.path === pathname;
      if (tabs.some(isOpenTab) && !remaining.some(isOpenTab)) {
        const target = command === 'close' ? byRecency(remaining)[0] : tabs[index];
        router.push(target ? target.path + target.search : homeHref);
      }
      if (command === 'close') store.close(path);
      else if (command === 'close-others') store.closeOthers(path);
      else store.closeRight(path);
    },
    [homeHref, router, pathname],
  );
}
