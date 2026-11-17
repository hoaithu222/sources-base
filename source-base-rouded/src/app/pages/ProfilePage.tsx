import { memo } from 'react';

import { selectUser, useSessionStore } from '@/domains/session';
import {
  Avatar,
  Badge,
  EmptyState,
  PageShell,
  SectionHeader,
  Surface,
  Text,
  TitleScreen,
} from '@/shared/ui';
import type { BadgeColor } from '@/shared/ui';

interface BadgeRowProps {
  label: string;
  items: readonly string[];
  emptyText: string;
  color: BadgeColor;
}

/**
 * BadgeRow — một hàng của thẻ hồ sơ: nhãn + số đếm + dãy `Badge` (vai trò, quyền).
 *
 * @param props.label - Nhãn của hàng.
 * @param props.items - Giá trị, mỗi giá trị một `Badge`; số lượng hiện cạnh nhãn.
 * @param props.emptyText - Chữ hiện thay dãy `Badge` khi `items` rỗng.
 * @param props.color - Màu của `Badge`.
 */
const BadgeRow = memo(function BadgeRow({ label, items, emptyText, color }: BadgeRowProps) {
  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center gap-2">
        <Text size="small" weight="medium">
          {label}
        </Text>
        <Badge className="tabular-nums" color="neutral" size="xs" variant="outline">
          {items.length}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-1">
        {items.length === 0 ? (
          <Text size="tiny" skin="muted">
            {emptyText}
          </Text>
        ) : (
          items.map((item) => (
            <Badge key={item} color={color} variant="tinted">
              {item}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
});

/**
 * ProfilePage — hồ sơ chỉ đọc của người đang đăng nhập (đọc từ session); chưa đăng nhập hiện trạng
 * thái rỗng. Chức năng chỉnh sửa hồ sơ riêng của dự án đặt trong `features/profile`.
 */
function ProfilePage() {
  const user = useSessionStore(selectUser);

  if (!user) {
    return (
      <PageShell variant="center">
        <EmptyState
          description="Đăng nhập để xem thông tin tài khoản. Chế độ demo chưa có hồ sơ người dùng."
          icon="user-bold"
          iconColor="sky"
          size="md"
          title="Chưa đăng nhập"
        />
      </PageShell>
    );
  }

  return (
    <PageShell variant="flow">
      <TitleScreen
        icon="user-bold"
        iconColor="sky"
        subtitle="TÀI KHOẢN"
        title="Thông tin cá nhân"
      />

      <section className="flex max-w-2xl flex-col gap-2">
        <SectionHeader accent icon="user-outline" iconColor="sky" title="Hồ sơ cá nhân" />
        <Surface className="flex flex-col divide-y divide-divider-default">
          <div className="flex items-center gap-3 p-3">
            <Avatar name={user.name} size="lg" src={user.avatar ?? undefined} variant="brand" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <Text ellipsis size="medium" weight="medium">
                {user.name}
              </Text>
              <Text ellipsis size="tiny" skin="muted">
                {user.email}
              </Text>
            </div>
          </div>

          <BadgeRow
            color="primary"
            emptyText="Chưa được gán vai trò nào"
            items={user.roles}
            label="Vai trò"
          />
          <BadgeRow
            color="neutral"
            emptyText="Chưa có quyền chi tiết nào"
            items={user.permissions}
            label="Quyền chi tiết"
          />
        </Surface>
      </section>
    </PageShell>
  );
}

export default ProfilePage;
