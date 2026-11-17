/**
 * Public API của feature `customers` (khách hàng) — ví dụ sống cho một màn CRUD: danh sách lọc trên URL · tạo · sửa · xoá.
 *
 * Dùng:   `src/app/[locale]/(workspace)/(app)/demo/customers/<trang>/page.tsx` import view: `import { CustomerListView } from '@/features/customers';`
 * Lưu ý:  view danh sách / sửa đọc `useSearchParams` → `page.tsx` bọc `<Suspense>`. Hướng dẫn nhân bản: `docs/guides/crud-feature.md`.
 */

export { default as CustomerCreateView } from './views/CustomerCreateView';
export { default as CustomerEditView } from './views/CustomerEditView';
export { default as CustomerListView } from './views/CustomerListView';
