import { memo, type ReactNode } from 'react';

import { Text } from '@/shared/ui';

import AuthLink from './AuthLink';
import AuthPageHeading from './AuthPageHeading';

interface AuthFooterLink {
  label: string;
  to: string;
  prefix?: string;
}

interface AuthPageFrameProps {
  title: string;
  description?: ReactNode;
  footer?: AuthFooterLink;
  children: ReactNode;
}

/**
 * AuthPageFrame — khung chung của mọi trang xác thực: tiêu đề, nội dung, hàng liên kết cuối trang.
 *
 * Lưu ý: `footer` khai thành hằng ở module của trang (object tĩnh). Lý do thiết kế:
 * `docs/notes/code/auth.md`.
 *
 * @param props.title - Tiêu đề trang (truyền xuống `AuthPageHeading`).
 * @param props.description - Câu phụ dưới tiêu đề; bỏ trống thì không có.
 * @param props.footer - Hàng liên kết cuối trang `{ label, to, prefix? }`; `prefix` là câu dẫn đứng
 *   trước liên kết, vd "Chưa có tài khoản?". Bỏ trống thì không có hàng này.
 * @param props.children - Nội dung trang: Callout kết quả, form.
 *
 * @example
 * <AuthPageFrame description="Nhập email và mật khẩu để tiếp tục." footer={FOOTER} title="Đăng nhập">
 *   <Form form={form} onSubmit={handleSubmit}>…</Form>
 * </AuthPageFrame>
 */
const AuthPageFrame = memo(function AuthPageFrame({
  title,
  description,
  footer,
  children,
}: AuthPageFrameProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <AuthPageHeading description={description} title={title} />
      {children}
      {footer && (
        <Text className="text-center" size="tiny" skin="muted">
          {footer.prefix && `${footer.prefix} `}
          <AuthLink to={footer.to}>{footer.label}</AuthLink>
        </Text>
      )}
    </div>
  );
});

export default AuthPageFrame;
