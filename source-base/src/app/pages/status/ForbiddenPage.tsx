import StatusPage from './StatusPage';

/**
 * ForbiddenPage — trang 403, nằm ngoài mọi guard / layout; `PermissionGuard` điều hướng tới đây khi
 * thiếu quyền.
 */
function ForbiddenPage() {
  return (
    <StatusPage
      code="403"
      description="Tài khoản của bạn chưa được cấp quyền vào khu vực này. Liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn."
      title="Không có quyền truy cập"
    />
  );
}

export default ForbiddenPage;
