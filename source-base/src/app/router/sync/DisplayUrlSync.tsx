import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  nextDisplaySearch,
  readDisplayOverrides,
  selectEffectiveUiScale,
  selectIsTv,
  useDisplayStore,
} from '@/domains/preferences';

/**
 * DisplayUrlSync — đồng bộ chế độ hiển thị giữa URL (`?display=tv&scale=1.2`) và display store; mount
 * MỘT lần ở route gốc (`setup/app-routes.tsx`).
 *
 * Location MỚI mang `display` / `scale` hợp lệ thì URL thắng store; không mang thì giữ lựa chọn đã lưu;
 * sau đó URL luôn được viết lại cho khớp store. Param rác (`?display=abc`) coi như không có.
 * Chi tiết: docs/rules/display/tv-display-mode.md · docs/notes/code/app.md (## router/sync).
 */
function DisplayUrlSync() {
  const location = useLocation();
  const navigate = useNavigate();

  const isTv = useDisplayStore(selectIsTv);
  const uiScale = useDisplayStore(selectEffectiveUiScale);

  const appliedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (appliedKeyRef.current !== location.key) {
      appliedKeyRef.current = location.key;
      useDisplayStore.getState().applyDisplayOverrides(readDisplayOverrides(location.search));
    }

    const search = nextDisplaySearch(location.search, useDisplayStore.getState());
    if (search === null) return;

    void navigate(
      { search: search ? `?${search}` : '', hash: location.hash },
      { replace: true, state: location.state },
    );
  }, [location, navigate, isTv, uiScale]);

  return null;
}

export default DisplayUrlSync;
