import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingScreen } from '@/app/components';
import SessionUnavailablePage from '@/app/pages/status/SessionUnavailablePage';
import { selectEndReason, useSessionStore } from '@/domains/session';
import { PATHS } from '@/shared/constants/paths.constants';

import { createReturnState } from './return-path.utils';
import { useSessionGate } from './useSessionGate';

/**
 * AuthGuard — chặn route cần đăng nhập; làm `element` của route cha, layout do route con chọn.
 *
 * Nơi DUY NHẤT đưa người dùng về `/login`, kể cả ngay sau `logout()` (nơi gọi không tự điều hướng).
 * Ghi đích quay lại khi phiên hết hạn / bị đăng xuất từ tab khác; đăng xuất CHỦ ĐỘNG thì không.
 * Lưu ý: phiên `unavailable` hiện `SessionUnavailablePage` và GIỮ URL, không đá về `/login` —
 * docs/rules/structure/routing-conventions.md §10 · docs/notes/code/app.md (## guards).
 */
function AuthGuard() {
  const location = useLocation();
  const gate = useSessionGate();
  const endReason = useSessionStore(selectEndReason);

  switch (gate) {
    case 'open':
    case 'signed-in':
      return <Outlet />;
    case 'pending':
      return <LoadingScreen level="app" />;
    case 'unavailable':
      return <SessionUnavailablePage />;
    case 'signed-out':
      return (
        <Navigate
          replace
          state={endReason === 'logout' ? undefined : createReturnState(location)}
          to={PATHS.LOGIN}
        />
      );
  }
}

export default AuthGuard;
