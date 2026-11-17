'use client';

import { useWorkTabsStore } from '../work-tabs.store';

/**
 * useWorkTabsRailVisible — thanh dọc lịch sử thẻ (`WorkTabsRail`) có dựng không: lịch sử đang bật VÀ đã có ít nhất một
 * thẻ (Trang chủ không thành thẻ). Layout dùng để chừa mép trái cho `<main>` (`WORK_TABS_RAIL_WIDTH`).
 * Lưu ý: chỉ đọc store — chế độ TV / điện thoại (nơi tầng app không dựng thanh) do nơi gọi tự cộng điều kiện.
 *
 * @example
 * const railVisible = useWorkTabsRailVisible() && !isTv;
 */
export function useWorkTabsRailVisible(): boolean {
  return useWorkTabsStore((state) => state.enabled && state.tabs.length > 0);
}
