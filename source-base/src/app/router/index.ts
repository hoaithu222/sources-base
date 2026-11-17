/**
 * Public API của router: `AppRouter` (gắn vào `App`) và `appRoutes` (cây route — test dựng router
 * bộ nhớ từ đây).
 *
 * Lưu ý:  thứ khác import thẳng thư mục con (`@/app/router/menu`, `/modules`, `/definition`, `/guards`,
 *         `/sync`, `/setup`). File mà chính route nạp (trang ở `app/pages`, shell) KHÔNG đi qua file
 *         này — nó export `appRoutes`, đi qua là import vòng.
 */

export { AppRouter, appRoutes } from './setup';
