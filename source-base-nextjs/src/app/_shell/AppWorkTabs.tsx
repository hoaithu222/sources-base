'use client';

import { memo, useLayoutEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import { useActiveModule, useScreenTitle } from '@/app/_navigation';
import { usePathname } from '@/core/i18n';
import { selectIsTv, useDisplayStore } from '@/domains/preferences';
import { PATHS } from '@/shared/constants/paths.constants';
import { useIsCoarsePointer } from '@/shared/hooks';
import { useDockSettingsStore } from '@/shared/widgets/dock';
import { useWorkTabsStore, WorkTabsRail, type WorkTabsEdgeInset } from '@/shared/widgets/work-tabs';

/** Tầm Dock chiếm ở cạnh neo (px) — khớp chỗ chừa `DOCK_RESERVE_CLASSES` của Dock (`5rem`: neo 12 + khay + khe). */
const DOCK_REACH_PX = 80;

/** Dock đang hiện ở đáy / phải → bảng lịch sử thẻ né mép đó (máy chạm luôn ghim Dock). Dock trái xếp DƯỚI thanh, không né. */
function useDockEdgeInset(): WorkTabsEdgeInset {
  const mode = useDockSettingsStore((state) => state.mode);
  const position = useDockSettingsStore((state) => state.position);
  const isCoarsePointer = useIsCoarsePointer();
  const shown = isCoarsePointer || mode !== 'hidden';
  return useMemo(
    () => (shown && position !== 'left' ? { [position]: DOCK_REACH_PX } : {}),
    [position, shown],
  );
}

/**
 * AppWorkTabs — nối LỊCH SỬ THẺ LÀM VIỆC (`WorkTabsRail`) với điều hướng: mỗi lần đổi màn, đẩy màn đang mở vào store (`visit`)
 * với tên ngắn = tên màn (`useScreenTitle`), dòng phụ = `Phân hệ · Màn con`, ô màu = phân hệ đang mở (ngoài phân hệ: icon
 * của mục menu). Đẩy TRƯỚC khi vẽ (`useLayoutEffect`): khung hình đầu của màn mới đã có ô của nó trên thanh. Trả về THANH
 * DỌC 32px sát mép trái dưới header (vị trí không đổi theo Dock); bảng của nó né Dock đáy / phải qua `edgeInset` (80px).
 * Layout gắn MỘT lần (bọc `<Suspense>` vì đọc `useSearchParams`). Trang chủ không thành thẻ (có dòng "Trang chủ" trong bảng).
 * Ẩn ở chế độ TV; tắt bằng `setEnabled(false)` thì widget không dựng gì.
 */
const AppWorkTabs = memo(function AppWorkTabs() {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const search = query ? `?${query}` : '';
  const { module } = useActiveModule();
  const screen = useScreenTitle();
  const isTv = useDisplayStore(selectIsTv);
  const edgeInset = useDockEdgeInset();

  const title = screen?.title;
  const fullTitle = screen?.fullTitle;
  const icon = module?.icon ?? screen?.icon;
  const tone = module?.tone ?? 'neutral';

  useLayoutEffect(() => {
    if (!title || pathname === PATHS.DASHBOARD) return;
    useWorkTabsStore.getState().visit({ path: pathname, search, title, fullTitle, icon, tone });
  }, [fullTitle, icon, pathname, search, title, tone]);

  if (isTv) return null;
  return <WorkTabsRail edgeInset={edgeInset} homeHref={PATHS.DASHBOARD} />;
});

export default AppWorkTabs;
