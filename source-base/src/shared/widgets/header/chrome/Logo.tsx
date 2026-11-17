import { memo, useCallback } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { isModifiedClick } from '@/shared/utils/browser/link.utils';
import { cn } from '@/shared/utils/style/cn';

import { HEADER_CONTROL_HEIGHT } from '../header.theme';

interface LogoProps {
  label?: string;
  tagline?: string;
  mark?: ReactNode;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
}

const LOGO_ROOT_CLASSES = cn(
  'group inline-flex shrink-0 select-none items-center outline-none',
  HEADER_CONTROL_HEIGHT,
  'gap-1.5 px-1.5 md:px-2 wide:gap-2 wide:pl-2 wide:pr-3',
  'transition-[background-color,box-shadow] duration-200 ease-out',
  'focus-visible:ring-2 focus-visible:ring-ring-focus',
);

const LOGO_INTERACTIVE_CLASSES = cn(
  'cursor-pointer hover:bg-bg-nav-hover',
  'dark:hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-primary-4)_60%,transparent),inset_0_0_16px_var(--color-bg-primary-soft)]',
);

const LOGO_MARK_CLASSES = cn(
  'flex shrink-0 items-center text-primary-6 dark:text-primary-5',
  'dark:drop-shadow-[0_0_6px_color-mix(in_srgb,var(--color-primary-4)_55%,transparent)]',
  '[&>svg]:size-4! md:[&>svg]:size-5! wide:[&>svg]:size-6!',
);

const LOGO_TEXT_BLOCK_CLASSES =
  'flex min-w-0 flex-col justify-center gap-px leading-none max-md:hidden';

const LOGO_TEXT_CLASSES = cn(
  'text-fg-on-chrome leading-none!',
  'text-caption-12-bold tracking-tight md:text-body-14-bold wide:text-body-18-bold wide:tracking-[0.02em]',
  'dark:[text-shadow:0_0_10px_color-mix(in_srgb,var(--color-hud-4)_35%,transparent)]',
);

const LOGO_TAGLINE_CLASSES = cn(
  'hidden max-w-[11rem] truncate leading-none! wide:block',
  'text-caption-10-medium uppercase tracking-[0.04em] text-fg-on-nav-subtle',
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
 * @param props.label - Wordmark; ẩn dưới `md` để nhường chỗ cho chip của page. Mặc định "APP".
 * @param props.tagline - Dòng phụ viết hoa dưới wordmark (tên đầy đủ của hệ thống); chỉ hiện từ `wide` ≥ 1800px —
 *   màn nhỏ hơn không đủ chỗ cạnh cụm tâm. Bỏ trống → logo một dòng.
 * @param props.mark - Emblem đứng trước wordmark — `<Image>` / `<SystemIcon>` do app truyền.
 * @param props.href - Đích điều hướng → render `<Link>`.
 * @param props.onClick - Lệnh khi click trái (thay điều hướng nếu có `href`).
 * @param props.ariaLabel - Nhãn trợ năng. Mặc định theo `label`.
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
      <span className={LOGO_TEXT_BLOCK_CLASSES}>
        <span className={LOGO_TEXT_CLASSES}>{label}</span>
        {tagline && <span className={LOGO_TAGLINE_CLASSES}>{tagline}</span>}
      </span>
    </>
  );

  const a11yLabel = ariaLabel ?? label;

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
