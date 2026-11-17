import StatusPage from './StatusPage';

/**
 * NotFoundPage — trang 404, nằm ngoài mọi guard / layout; route `*` điều hướng tới đây.
 */
function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      description="Trang bạn tìm không tồn tại hoặc đã được chuyển đi nơi khác."
      title="Không tìm thấy trang"
    />
  );
}

export default NotFoundPage;
