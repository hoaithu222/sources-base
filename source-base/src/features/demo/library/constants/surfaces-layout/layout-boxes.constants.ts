/**
 * `options` của `<Dropdown>` lọc trạng thái — khai ở phạm vi module để tham chiếu ổn định
 * giữa các lần render (mảng mới mỗi lượt làm mất memo danh sách bên trong).
 */
export const DEMO_STATUS_FILTER = [
  { value: 'all', label: 'Mọi trạng thái' },
  { value: 'draft', label: 'Nháp' },
  { value: 'running', label: 'Đang chạy' },
  { value: 'done', label: 'Hoàn thành' },
];
