import { memo, useLayoutEffect, useMemo } from 'react';
import { useLocation, useMatches } from 'react-router-dom';

import { readHandle, resolvePageTitle, titledMatches } from '@/app/router/definition';
import { useActiveModule } from '@/app/router/menu';
import { resolveScreenTitle } from '@/app/router/sync';
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
 * AppWorkTabs — nối LỊCH SỬ THẺ LÀM VIỆC (`WorkTabsRail`) với router: mỗi lần đổi màn, đẩy màn đang mở vào store (`visit`)
 * với tên ngắn = tiêu đề route sâu nhất, dòng phụ = `Phân hệ · Màn con`, ô màu = phân hệ đang mở (ngoài phân hệ: icon của
 * route). Đẩy TRƯỚC khi vẽ (`useLayoutEffect`): khung hình đầu của màn mới đã có ô của nó trên thanh. Trả về THANH DỌC 32px
 * sát mép trái dưới header (vị trí không đổi theo Dock); bảng của nó né Dock đáy / phải qua `edgeInset` (80px).
 * Layout gắn MỘT lần và chừa mép trái cho `<main>` theo `useWorkTabsRailVisible` + `WORK_TABS_RAIL_WIDTH`. Trang chủ không
 * thành thẻ (có dòng "Trang chủ" trong bảng). Ẩn ở chế độ TV; tắt bằng `setEnabled(false)` thì widget không dựng gì.
 */
const AppWorkTabs = memo(function AppWorkTabs() {
  const matches = useMatches();
  const { pathname, search } = useLocation();
  const { module } = useActiveModule();
  const isTv = useDisplayStore(selectIsTv);
  const edgeInset = useDockEdgeInset();

  const title = resolvePageTitle(matches);
  const fullTitle = resolveScreenTitle(matches, search);
  const leaf = titledMatches(matches).at(-1);
  const icon = module?.icon ?? (leaf ? readHandle(leaf).icon : undefined);
  const tone = module?.tone ?? 'neutral';

  useLayoutEffect(() => {
    if (!title || pathname === PATHS.HOME) return;
    useWorkTabsStore.getState().visit({ path: pathname, search, title, fullTitle, icon, tone });
  }, [fullTitle, icon, pathname, search, title, tone]);

  if (isTv) return null;
  return <WorkTabsRail edgeInset={edgeInset} homeHref={PATHS.HOME} />;
});

export default AppWorkTabs;
