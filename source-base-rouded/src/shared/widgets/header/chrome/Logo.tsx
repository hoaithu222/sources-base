import { memo, useCallback } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { isModifiedClick } from '@/shared/utils/browser/link.utils';
import { cn } from '@/shared/utils/style/cn';

import { HEADER_CONTROL_HEIGHT, HEADER_FRAME_TRANSITION } from '../header.theme';

interface LogoProps {
  label?: string;
  tagline?: string;
  mark?: ReactNode;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
  compact?: boolean;
  className?: string;
}

const LOGO_ROOT_CLASSES = cn(
  'group inline-flex shrink-0 select-none items-center rounded-full outline-none',
  HEADER_CONTROL_HEIGHT,
  'gap-2 pl-0.5 pr-1.5 wide:pr-2',
  HEADER_FRAME_TRANSITION,
  'focus-visible:ring-2 focus-visible:ring-[var(--hdr-ring)]',
);

const LOGO_INTERACTIVE_CLASSES = 'cursor-pointer hover:bg-[var(--hdr-hover)]';

const LOGO_MARK_CLASSES = 'flex shrink-0 items-center';

const LOGO_TEXT_BLOCK_CLASSES =
  'flex min-w-0 flex-col justify-center gap-0.5 leading-none max-md:hidden';

const LOGO_TEXT_CLASSES = cn(
  'leading-none! text-[var(--hdr-fg)]',
  'text-body-14-bold tracking-[-0.01em] wide:text-body-16-bold',
);

const LOGO_TAGLINE_CLASSES = cn(
  'hidden max-w-[11rem] truncate leading-none! xl:block',
  'text-caption-10-medium uppercase tracking-[0.06em] text-[var(--hdr-fg-muted)]',
);

/**
 * Logo — brand lockup của header: emblem (tuỳ chọn) + wordmark. Phần của `<Header>`.
 *
 * Ba chế độ: có `href` → `<Link>` (chuột phải mở được tab mới) · chỉ `onClick` → `<button>` (lệnh tại
 * chỗ, không đổi URL) · không có gì → `<span>` tĩnh (showcase).
 * Sửa giao diện: khung → `LOGO_ROOT_CLASSES` · hover của chế độ bấm được → `LOGO_INTERACTIVE_CLASSES`
 * · emblem → `LOGO_MARK_CLASSES` · chữ → `LOGO_TEXT_CLASSES` · dòng phụ → `LOGO_TAGLINE_CLASSES`. Logo TRẦN (không khung)
 * như ảnh mẫu — khung ở cụm này là chip ngữ cảnh.
 * Lưu ý: `href` + `onClick`: click TRÁI chỉ chạy `onClick` (chặn điều hướng của `<Link>`); click có phím
 * bổ trợ vẫn mở tab mới. Wordmark fill đặc, KHÔNG `bg-clip-text` (notes/code/widgets-header.md).
 *
 * @param props.label - Wordmark; ẩn dưới `md` để nhường chỗ cho chip của page. `""` → không có chữ (emblem đã là logo
 *   đầy đủ, vd logo VCI). Mặc định "APP".
 * @param props.tagline - Dòng phụ viết hoa dưới wordmark (tên đầy đủ của hệ thống); chỉ hiện từ `wide` ≥ 1800px —
 *   màn nhỏ hơn không đủ chỗ cạnh cụm tâm. Bỏ trống → logo một dòng.
 * @param props.mark - Emblem đứng trước wordmark — `<Image>` / `<SystemIcon>` do app truyền.
 * @param props.href - Đích điều hướng → render `<Link>`.
 * @param props.onClick - Lệnh khi click trái (thay điều hướng nếu có `href`).
 * @param props.ariaLabel - Nhãn trợ năng. Mặc định theo `label`.
 * @param props.compact - Chỉ còn ô thương hiệu (ẩn wordmark + dòng phụ) — header ở cấp ≥ 2 cần chỗ cho vệt ‹. Mặc định `false`.
 * @param props.className - Class thêm cho khung.
 *
 * @example
 * <Logo href="/" label="APP" tagline="Hệ thống quản lý sản xuất" mark={<SystemIcon name="house-outline" />} />
 */
const Logo = memo(function Logo({
  label = 'APP',
  tagline,
  mark,
  href,
  onClick,
  ariaLabel,
  compact = false,
  className,
}: LogoProps) {
  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (!onClick) return;
      if (isModifiedClick(e)) return;
      e.preventDefault();
      onClick();
    },
    [onClick],
  );

  const rootClassName = cn(
    LOGO_ROOT_CLASSES,
    Boolean(href || onClick) && LOGO_INTERACTIVE_CLASSES,
    className,
  );

  const inner = (
    <>
      {mark && <span className={LOGO_MARK_CLASSES}>{mark}</span>}
      <span className={cn(LOGO_TEXT_BLOCK_CLASSES, (compact || !label) && 'hidden')}>
        <span className={LOGO_TEXT_CLASSES}>{label}</span>
        {tagline && <span className={LOGO_TAGLINE_CLASSES}>{tagline}</span>}
      </span>
    </>
  );

  const a11yLabel = ariaLabel ?? (label || undefined);

  if (href) {
    return (
      <Link aria-label={a11yLabel} className={rootClassName} to={href} onClick={handleClick}>
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button aria-label={a11yLabel} className={rootClassName} type="button" onClick={onClick}>
        {inner}
      </button>
    );
  }

  return <span className={rootClassName}>{inner}</span>;
});

export default Logo;
