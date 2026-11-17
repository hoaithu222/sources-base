import { memo, type ReactNode } from 'react';

import { TITLE_BAR_CLASS, TITLE_BAR_STYLE } from '@/shared/constants/auth-motifs.constants';
import { Heading, Text } from '@/shared/ui/primitives';

interface AuthPageHeadingProps {
  title: string;
  description?: ReactNode;
}

/**
 * AuthPageHeading — cụm tiêu đề của mọi trang xác thực: tiêu đề + câu phụ, kèm gạch dọc nhấn.
 *
 * Lưu ý: gạch dọc là mô-típ `TITLE_BAR_*` dùng chung với khoang giới thiệu của layout — sửa ở
 * `@/shared/constants/auth-motifs.constants`, đừng chép style ra từng trang. Lý do thiết kế:
 * `docs/notes/code/auth.md`.
 *
 * @param props.title - Tiêu đề trang, vẽ bằng `Heading size="medium"`.
 * @param props.description - Câu phụ dưới tiêu đề; bỏ trống thì không sinh thẻ phụ và gạch dọc ngắn
 *   lại theo.
 *
 * @example
 * <AuthPageHeading description="Nhập email và mật khẩu để tiếp tục." title="Đăng nhập" />
 */
const AuthPageHeading = memo(function AuthPageHeading({
  title,
  description,
}: AuthPageHeadingProps) {
  return (
    <div className={TITLE_BAR_CLASS} style={TITLE_BAR_STYLE}>
      <Heading size="medium">{title}</Heading>
      {description && (
        <Text size="tiny" skin="muted">
          {description}
        </Text>
      )}
    </div>
  );
});

export default AuthPageHeading;
