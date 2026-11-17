'use client';

import { memo } from 'react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/core/i18n';

import { SystemIcon, type SystemIconName } from '@/shared/ui/icons/Icons';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import { cn } from '@/shared/utils/style/cn';

export type NoticeBoardTone = 'warning' | 'error' | 'info' | 'success';

export interface NoticeBoardItem {
  /** Khoá ổn định của mục (làm key). */
  id: string;
  title: string;
  description?: ReactNode;
  /** Con số / chữ ngắn canh phải, tô theo `tone` (vd "150,18 t"). */
  value?: ReactNode;
  tone?: NoticeBoardTone;
  /** Đi tới trang chi tiết → hàng là `<Link>` (chuột phải mở tab mới được). */
  href?: string;
  /** Lệnh tại chỗ (mở drawer, lọc…) khi không có `href`. */
  onSelect?: () => void;
}

export interface NoticeBoardProps {
  items: readonly NoticeBoardItem[];
  emptyText?: string;
  className?: string;
}

type NoticeBoardSlot =
  | 'list'
  | 'row'
  | 'interactive'
  | 'icon'
  | 'body'
  | 'title'
  | 'description'
  | 'value'
  | 'chevron'
  | 'empty';

const NOTICE_BOARD_CLASSES = {
  list: 'm-0 flex list-none flex-col gap-1.5 p-0',
  row: cn(
    'group/notice relative flex w-full min-w-0 items-center gap-3 px-3 py-2 text-left outline-none',
    'overflow-hidden rounded-lg border border-transparent bg-bg-subtle',
    "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-(--notice-tone) before:content-['']",
  ),
  interactive: cn(
    'cursor-pointer transition-[border-color,box-shadow,background-color] duration-150 ease-out',
    'hover:border-[color-mix(in_srgb,var(--notice-tone)_45%,transparent)] hover:bg-bg-nav-hover',
    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
  ),
  icon: 'flex shrink-0 items-center justify-center [&>svg]:size-5!',
  body: 'flex min-w-0 flex-1 flex-col gap-0.5',
  title: cn(TEXT_ELLIPSIS_CLASSES, 'text-body-14-semibold text-fg-heading'),
  description: cn(TEXT_ELLIPSIS_CLASSES, 'text-caption-12 text-fg-muted'),
  value: 'shrink-0 text-body-14-bold tabular-nums',
  chevron: cn(
    'shrink-0 text-fg-faint transition-[color,translate] duration-150 ease-out',
    'group-hover/notice:translate-x-0.5 group-hover/notice:text-fg-heading',
  ),
  empty: 'px-1 py-3 text-center text-caption-12 text-fg-muted',
} satisfies Record<NoticeBoardSlot, string>;

/** Biến tone `--notice-tone` (vạch trái, viền khi rê) — một class literal mỗi tone. */
const NOTICE_TONE_VAR_CLASSES = {
  warning: '[--notice-tone:var(--color-warning)]',
  error: '[--notice-tone:var(--color-error)]',
  info: '[--notice-tone:var(--color-info)]',
  success: '[--notice-tone:var(--color-success)]',
} satisfies Record<NoticeBoardTone, string>;

/** Icon + giá trị: bậc đậm ở sáng (≥ 4.5:1 trên trắng), bậc sáng ở tối. */
const NOTICE_TONE_TEXT_CLASSES = {
  warning: {
    icon: 'text-warning-7 dark:text-warning-5',
    value: 'text-warning-7 dark:text-yellow-4',
  },
  error: {
    icon: 'text-error-7 dark:text-red-4',
    value: 'text-error-7 dark:text-red-3',
  },
  info: {
    icon: 'text-info-7 dark:text-blue-4',
    value: 'text-info-7 dark:text-blue-3',
  },
  success: {
    icon: 'text-success-8 dark:text-success-5',
    value: 'text-success-8 dark:text-green-3',
  },
} satisfies Record<NoticeBoardTone, Record<'icon' | 'value', string>>;

const NOTICE_TONE_ICONS = {
  warning: 'circle-exclamation-outline',
  error: 'triangle-exclamation-outline',
  info: 'bell-outline',
  success: 'circle-check-outline',
} satisfies Record<NoticeBoardTone, SystemIconName>;

interface NoticeRowProps {
  item: NoticeBoardItem;
}

const NoticeRow = memo(function NoticeRow({ item }: NoticeRowProps) {
  const tone = item.tone ?? 'warning';
  const interactive = Boolean(item.href || item.onSelect);
  const rowClassName = cn(
    NOTICE_BOARD_CLASSES.row,
    NOTICE_TONE_VAR_CLASSES[tone],
    interactive && NOTICE_BOARD_CLASSES.interactive,
  );

  const content = (
    <>
      <span
        aria-hidden
        className={cn(NOTICE_BOARD_CLASSES.icon, NOTICE_TONE_TEXT_CLASSES[tone].icon)}
      >
        <SystemIcon name={NOTICE_TONE_ICONS[tone]} />
      </span>
      <span className={NOTICE_BOARD_CLASSES.body}>
        <span className={NOTICE_BOARD_CLASSES.title}>{item.title}</span>
        {item.description != null && (
          <span className={NOTICE_BOARD_CLASSES.description}>{item.description}</span>
        )}
      </span>
      {item.value != null && (
        <span className={cn(NOTICE_BOARD_CLASSES.value, NOTICE_TONE_TEXT_CLASSES[tone].value)}>
          {item.value}
        </span>
      )}
      {interactive && (
        <SystemIcon className={NOTICE_BOARD_CLASSES.chevron} name="angle-right-outline" size={14} />
      )}
    </>
  );

  if (item.href) {
    return (
      <Link className={rowClassName} href={item.href} onClick={item.onSelect}>
        {content}
      </Link>
    );
  }
  if (item.onSelect) {
    return (
      <button className={rowClassName} type="button" onClick={item.onSelect}>
        {content}
      </button>
    );
  }
  return <div className={rowClassName}>{content}</div>;
});

/**
 * NoticeBoard — danh sách "điểm cần chú ý" của màn điều hành: icon theo mức (cảnh báo · lỗi · thông tin · ổn), tiêu đề,
 * mô tả một dòng, con số canh phải và mũi tên khi bấm được.
 *
 * Mỗi mục là MỘT việc cần người xem để ý (tồn lớn, chậm kế hoạch, máy dừng…), không phải nhật ký — nhật ký dài dùng
 * `ScrollBoard` / `Table`. Mục có `href` là liên kết thật (`<Link>`), chỉ `onSelect` là nút, không có gì là hàng tĩnh.
 * Sửa giao diện: `NOTICE_BOARD_CLASSES` · màu theo mức → `NOTICE_TONE_VAR_CLASSES` (vạch, viền khi rê) +
 * `NOTICE_TONE_TEXT_CLASSES` (icon, con số) · icon → `NOTICE_TONE_ICONS`.
 * Lưu ý: hàng nền xám nhạt (`bg-subtle`) KHÔNG viền / bóng (nằm trong panel mà không thành hộp lồng hộp) + vạch trái
 * theo mức; hai theme cùng hình, chỉ màu đổi.
 * Tiêu đề / mô tả một dòng (cắt "…") — viết ngắn, đủ ý ở ~40 ký tự.
 *
 * @param props.items - Các mục `{ id, title, description?, value?, tone?, href?, onSelect? }`; `tone` mặc định `warning`.
 * @param props.emptyText - Câu hiện khi không có mục nào. Mặc định theo ngôn ngữ (`ui.dataDisplay` →
 *   `noticeBoard.empty`).
 * @param props.className - Class thêm cho `<ul>`.
 *
 * @example
 * <NoticeBoard
 *   items={[
 *     { id: 'd25', title: 'D25 còn khối lượng lớn', description: 'Còn 150,18 t chưa gia công', value: '150,18 t', href: '/kho/d25' },
 *     { id: 't10', title: 'T10 chưa đạt kế hoạch', value: '0 / 600 t', tone: 'error' },
 *   ]}
 * />
 */
const NoticeBoard = memo(function NoticeBoard({ items, emptyText, className }: NoticeBoardProps) {
  const t = useTranslations('ui.dataDisplay');

  if (items.length === 0) {
    return (
      <p className={cn(NOTICE_BOARD_CLASSES.empty, className)}>
        {emptyText ?? t('noticeBoard.empty')}
      </p>
    );
  }

  return (
    <ul className={cn(NOTICE_BOARD_CLASSES.list, className)}>
      {items.map((item) => (
        <li key={item.id}>
          <NoticeRow item={item} />
        </li>
      ))}
    </ul>
  );
});

export default NoticeBoard;
