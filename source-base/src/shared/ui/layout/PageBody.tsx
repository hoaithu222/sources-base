import { memo } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/style/cn';

export type PageBodyOverflow = 'scroll' | 'hidden';

export interface PageBodyProps {
  overflow?: PageBodyOverflow;
  stack?: boolean;
  children: ReactNode;
  className?: string;
}

const PAGE_BODY_BASE_CLASSES = 'relative min-h-0 min-w-0 flex-1';

const PAGE_BODY_OVERFLOW_CLASSES = {
  scroll: 'overflow-y-auto overscroll-contain',
  hidden: 'overflow-hidden',
} satisfies Record<PageBodyOverflow, string>;

/**
 * PageBody — vùng chiếm phần còn lại của trang và là chỗ CUỘN thật; nửa trong của `<PageShell>`, đứng
 * sau `TitleScreen` / `Toolbar`.
 *
 * Là khung neo (`relative`) của mọi phần tử `absolute` bên trong — kể cả span `sr-only` của
 * `AnimatedNumber` / `RankingBoard` — nên chúng không kéo dài `<main>` bên ngoài.
 * Sửa giao diện: `PAGE_BODY_BASE_CLASSES` · `PAGE_BODY_OVERFLOW_CLASSES`.
 * Lưu ý: `min-h-0` + `min-w-0` bắt buộc — thiếu thì trang dài ra thay vì cuộn; con đã tự cuộn (`Table`
 * ảo hoá, `Tree`, `Splitter`) thì `overflow="hidden"`, không thì hai thanh cuộn lồng nhau
 * — docs/notes/components/layout.md.
 *
 * @param props.overflow - `scroll` (tự cuộn dọc: danh sách thẻ, form dài) | `hidden` (con tự quản cuộn).
 *   Mặc định `scroll`.
 * @param props.stack - `true` → xếp con theo cột, khe 8px | `false` → con tự lo bố cục (vd `Splitter`,
 *   hàng ngang tự dựng). Mặc định `true`.
 * @param props.children - Nội dung trang (bắt buộc).
 * @param props.className - Class thêm (vd `flex gap-3` khi `stack={false}`).
 *
 * @example
 * <PageShell>
 *   <TitleScreen icon="house-bold" title="Tổng quan" />
 *   <PageBody>…</PageBody>
 * </PageShell>
 *
 * <PageBody overflow="hidden" stack={false}>
 *   <Table … />
 * </PageBody>
 */
const PageBody = memo(function PageBody({
  overflow = 'scroll',
  stack = true,
  children,
  className,
}: PageBodyProps) {
  const pageBodyClassName = cn(
    PAGE_BODY_BASE_CLASSES,
    PAGE_BODY_OVERFLOW_CLASSES[overflow],
    stack && 'flex flex-col gap-2',
    className,
  );

  return <div className={pageBodyClassName}>{children}</div>;
});

export default PageBody;
