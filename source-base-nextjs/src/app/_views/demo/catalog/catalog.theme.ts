import { cn } from '@/shared/utils/style/cn';

/**
 * Bảng class của catalog `/demo` — khung hai cột (mục lục + nội dung), mục lục, khung một mục, ô trạng thái, khối import.
 * Sửa giao diện: đổi ở đây, các `*Catalog` chỉ ghép.
 */

export const CATALOG_SLOT_CLASSES = {
  layout:
    'mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-4 lg:grid-cols-[13rem_minmax(0,1fr)]',
  content: 'flex min-w-0 flex-col gap-4',
  toc: 'flex min-w-0 flex-col gap-2 lg:sticky lg:top-0',
  tocList: cn(
    'flex gap-1 overflow-x-auto overscroll-x-contain scrollbar-hidden',
    'lg:flex-col lg:overflow-visible',
  ),
  tocLink: cn(
    'block rounded-md px-2 py-1.5 whitespace-nowrap text-body-14 text-fg-body',
    'hover:bg-bg-subtle hover:text-fg-heading',
    'focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:outline-none',
  ),
  section: 'flex min-w-0 scroll-mt-2 flex-col gap-2',
  examples: 'flex min-w-0 flex-col gap-4',
  row: 'flex flex-wrap items-start gap-3',
  stack: 'flex w-full min-w-0 flex-col gap-2',
  grid: 'grid grid-cols-1 gap-4 md:grid-cols-2',
  state: 'flex min-w-0 flex-col items-start gap-1.5',
  meta: 'flex flex-col gap-1.5 border-t border-divider-default pt-3',
  metaRow: 'flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1',
  metaList: 'flex min-w-0 flex-col items-start gap-1',
  code: 'max-w-full rounded-xs bg-bg-subtle px-1 font-mono text-caption-12 break-words text-fg-subheading',
  codeBlock: cn(
    'block max-w-full overflow-x-auto rounded-md bg-bg-subtle px-2 py-1.5',
    'font-mono text-caption-12 whitespace-nowrap text-fg-subheading',
  ),
  introLink: cn(
    'text-link underline underline-offset-2',
    'focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:outline-none',
  ),
} as const;
