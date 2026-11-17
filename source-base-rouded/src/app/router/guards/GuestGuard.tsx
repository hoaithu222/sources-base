import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingScreen } from '@/app/components';

import { resolveReturnPath } from './return-path.utils';
import { useSessionGate } from './useSessionGate';

/**
 * GuestGuard — bọc các trang khách (đăng nhập, đăng ký, quên mật khẩu); người đã có phiên bị đưa đi.
 *
 * Nơi DUY NHẤT điều hướng sau khi đăng nhập — trang đăng nhập chỉ gọi API (routing-conventions.md §10).
 * Máy chủ không trả lời được (`unavailable`) hoặc chế độ demo vẫn hiện trang: người dùng chủ động vào.
 */
function GuestGuard() {
  const location = useLocation();
  const gate = useSessionGate();

  switch (gate) {
    case 'signed-in':
      return <Navigate replace to={resolveReturnPath(location.state)} />;
    case 'pending':
      return <LoadingScreen level="app" />;
    case 'open':
    case 'unavailable':
    case 'signed-out':
      return <Outlet />;
  }
}

export default GuestGuard;
