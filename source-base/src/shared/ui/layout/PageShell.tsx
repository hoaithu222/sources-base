import { memo } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/style/cn';

export type PageShellVariant = 'scroll' | 'flow' | 'center';

export interface PageShellProps {
  variant?: PageShellVariant;
  children: ReactNode;
  className?: string;
}

const PAGE_SHELL_BASE_CLASSES = 'flex min-w-0';

const PAGE_SHELL_VARIANT_CLASSES = {
  scroll: 'h-full min-h-0 flex-col gap-2 overflow-hidden',
  flow: 'flex-col gap-2',
  center: 'h-full items-center justify-center',
} satisfies Record<PageShellVariant, string>;

/**
 * PageShell — vỏ ngoài của MỘT trang nội dung: xếp `TitleScreen` · `Toolbar` · `PageBody` theo cột, khe
 * 8px (công thức `flex h-full min-h-0 flex-col gap-2` dùng chung, đừng gõ tay lại).
 *
 * Trang có vùng cuộn riêng (bảng, danh sách dài) để mặc định `scroll` và đặt nội dung trong
 * `<PageBody>`; trang ngắn trôi theo nội dung dùng `flow`; một khối canh giữa (403, 404, đăng nhập)
 * dùng `center`.
 * Sửa giao diện: `PAGE_SHELL_VARIANT_CLASSES`.
 * Lưu ý: KHÔNG thêm đệm (`p-2`) — `AppShellLayout` đã cấp lề ngoài, thêm là cộng dồn và trang lệch
 * nhau 8px; `min-h-0` + `overflow-hidden` của `scroll` là MỘT BỘ — docs/notes/components/layout.md.
 *
 * @param props.variant - `scroll` (vỏ khoá cao, cuộn ở `<PageBody>`) | `flow` (không khoá cao, trang
 *   ngắn) | `center` (một khối canh giữa). Mặc định `scroll`.
 * @param props.children - Các khối của trang (bắt buộc).
 * @param props.className - Class thêm cho vỏ.
 *
 * @example
 * <PageShell>
 *   <TitleScreen icon="house-bold" title="Danh sách gói thầu" />
 *   <Toolbar left={<Input placeholder="Tìm gói thầu" />} right={<Button size="sm">Thêm</Button>} />
 *   <PageBody overflow="hidden" stack={false}>…</PageBody>
 * </PageShell>
 *
 * <PageShell variant="center">
 *   <EmptyState size="lg" title="Không tìm thấy trang" />
 * </PageShell>
 */
const PageShell = memo(function PageShell({
  variant = 'scroll',
  children,
  className,
}: PageShellProps) {
  const pageShellClassName = cn(
    PAGE_SHELL_BASE_CLASSES,
    PAGE_SHELL_VARIANT_CLASSES[variant],
    className,
  );

  return <div className={pageShellClassName}>{children}</div>;
});

export default PageShell;
