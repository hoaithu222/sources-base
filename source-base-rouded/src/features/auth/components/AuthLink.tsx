import { memo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/shared/utils/style/cn';

interface AuthLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

const AUTH_LINK_CLASSES = cn(
  'relative text-link underline-offset-2 hover:underline',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
  "touch:after:absolute touch:after:-inset-x-1 touch:after:-inset-y-3 touch:after:content-['']",
);

/**
 * AuthLink — liên kết chữ của trang xác thực ("Quên mật khẩu?", "Đăng ký"): màu link, gạch chân khi rê.
 *
 * Lưu ý: chữ giữ nguyên cỡ; trên máy chạm hộp bấm được nới ≥ 40px dọc bằng `::after` trong suốt
 * (`docs/rules/display/ipad-responsive.md §3.3`). Cỡ chữ truyền qua `className` (`text-caption-12`…).
 *
 * @param props.to - Đường dẫn đích (`PATHS.*`).
 * @param props.children - Chữ của liên kết.
 * @param props.className - Class thêm (cỡ chữ).
 *
 * @example
 * <AuthLink className="text-caption-12" to={PATHS.FORGOT_PASSWORD}>Quên mật khẩu?</AuthLink>
 */
const AuthLink = memo(function AuthLink({ to, children, className }: AuthLinkProps) {
  return (
    <Link className={cn(AUTH_LINK_CLASSES, className)} to={to}>
      {children}
    </Link>
  );
});

export default AuthLink;
