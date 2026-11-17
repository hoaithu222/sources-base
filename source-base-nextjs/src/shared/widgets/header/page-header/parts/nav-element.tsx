'use client';

import { memo } from 'react';
import type { AnchorHTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';
import { Link } from '@/core/i18n';

import { isModifiedClick, NEW_TAB_LINK_PROPS } from '@/shared/utils/browser/link.utils';

interface NavElementProps extends Omit<
  AnchorHTMLAttributes<HTMLElement>,
  'href' | 'onSelect' | 'children'
> {
  className: string;
  href?: string;
  newTab?: boolean;
  disabled?: boolean;
  ariaCurrent?: boolean;
  ariaPressed?: boolean;
  onActivate?: () => void;
  children: ReactNode;
  ref?: Ref<HTMLElement>;
}

/**
 * NavElement — NƠI DUY NHẤT quyết định một tab / nút của page trên header render `<a>` (có `href`) hay `<button>` (lệnh
 * tại chỗ); control mới đi qua đây (`docs/rules/interaction/navigable-controls.md`). Phần nội bộ của `PageHeader`.
 *
 * Nhận thêm mọi thuộc tính HTML còn lại (`aria-label`, `title`…) — Radix `Tooltip` bơm vào qua `...rest`.
 * Lưu ý: handler `return` SỚM khi `isModifiedClick(e)`, TRƯỚC `preventDefault`; chip `disabled` KHÔNG
 * có href (`<a>` không có `disabled`, bàn phím vẫn tới được). Làm trigger `asChild` của `<Tooltip>` cần
 * nhận `ref` + spread `...rest` (không thì tooltip không bao giờ mở); `onClick` của Radix gọi TRƯỚC
 * `onActivate`. Prop kích hoạt tên `onActivate`, không phải `onSelect` (trùng sự kiện DOM).
 *
 * @param props.className - Class của control (thường từ `PAGE_HEADER_CLASSES`).
 * @param props.href - Có → render `<Link>` (khi không `disabled`). Không → `<button>`.
 * @param props.newTab - Mở tab mới (`target="_blank"` + `rel="noopener noreferrer"`).
 * @param props.disabled - Khoá control; luôn render `<button disabled>`.
 * @param props.ariaCurrent - `true` → `aria-current="page"` (TAB đang mở).
 * @param props.ariaPressed - `aria-pressed` cho control TOGGLE.
 * @param props.onActivate - Gọi khi bấm trái thường (không phím bổ trợ, không `newTab`).
 * @param props.children - Nội dung (icon + nhãn).
 * @param props.ref - Trỏ tới `<a>` / `<button>` (React 19: `ref` là prop thường).
 *
 * @example
 * <NavElement className={tabClassName} href="/settings" onActivate={openSettings}>Cài đặt</NavElement>
 */
const NavElement = memo(function NavElement({
  className,
  href,
  newTab,
  disabled,
  ariaCurrent,
  ariaPressed,
  onActivate,
  onClick,
  children,
  ref,
  ...rest
}: NavElementProps) {
  const shared = {
    'aria-current': ariaCurrent ? ('page' as const) : undefined,
    'aria-pressed': ariaPressed,
    className,
  };

  if (href && !disabled) {
    const handleAnchorClick = (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      if (newTab || isModifiedClick(e)) return;
      e.preventDefault();
      onActivate?.();
    };

    return (
      <Link
        {...rest}
        {...shared}
        {...(newTab ? NEW_TAB_LINK_PROPS : null)}
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        onClick={handleAnchorClick}
      >
        {children}
      </Link>
    );
  }

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    onActivate?.();
  };

  return (
    <button
      {...rest}
      {...shared}
      ref={ref as Ref<HTMLButtonElement>}
      disabled={disabled}
      type="button"
      onClick={handleButtonClick}
    >
      {children}
    </button>
  );
});

export default NavElement;
