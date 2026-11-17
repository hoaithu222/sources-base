import { Text, View } from 'react-native';

import { appConfig } from '@/core/config/env.config';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Chip } from '@/shared/ui/chip';
import { AppBar } from '@/shared/ui/navigation';
import { Screen } from '@/shared/ui/screen';
// ⛔ Đăng xuất là việc của VỎ ỨNG DỤNG, không phải của phân hệ `auth`. Nhập
// `@/features/auth/...` từ đây là import CHÉO FEATURE — `feature-structure.md`
// cấm cứng, mà `check:imports` lẫn ESLint đều không bắt được ca này.
import { useLogout } from '@/shell/session/useLogout';
import { useAuthStore } from '@/shell/store/slices/auth';

/** Hồ sơ cá nhân — thông tin phiên và nút đăng xuất. */
export function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const { isPending, logout } = useLogout();

  return (
    <Screen header={<AppBar title="Cá nhân" />}>
      {/**
       * ── ⛔ MỘT cột ở mọi bề rộng — cùng lý do với `HomeScreen` ──────────────
       *
       * Chỗ này từng là `tablet:flex-row`, biện hộ bằng "thẻ hồ sơ kéo hết
       * 1000dp bề ngang". Triệu chứng đó KHÔNG THỂ XẢY RA: `Screen` mặc định
       * `constrained` nên nội dung đã bị kẹp ở 600dp từ đúng bậc `tablet:`.
       * Hai luật chồng nhau thành một vách đá ngay tại ngưỡng — qua mốc 600dp
       * là thẻ hồ sơ tụt từ 567dp xuống 276dp, hẹp hơn cả điện thoại 390dp.
       *
       * ⚠️ Nút đăng xuất `fullWidth` vì thế cũng rộng tối đa 568dp, không phải
       * "một thanh dài 1000dp" như chú thích cũ lo — trần 600dp đã chặn từ trước.
       */}
      <View className="gap-lg py-xs">
        <Card>
          <View className="items-center gap-sm py-md">
            {/* ⛔ `Avatar` dùng chung, không tự dựng vòng tròn + chữ viết tắt.
                Bản tự dựng thiếu luật lấy chữ đầu của TÊN GỌI (từ cuối) và
                thiếu cả ảnh — hai thứ `Avatar` đã lo. */}
            <Avatar name={user?.name} size="lg" />

            <View className="items-center gap-2xs">
              <Text className="text-header-sm font-semibold text-fg-1">
                {user?.name ?? 'Khách'}
              </Text>
              <Text className="text-body-md text-fg-2">{user?.email ?? 'Chưa đăng nhập'}</Text>
            </View>

            {user?.roles.length ? (
              <View className="flex-row flex-wrap justify-center gap-xs">
                {user.roles.map((role) => (
                  <Chip key={role} label={role} size="sm" />
                ))}
              </View>
            ) : null}
          </View>
        </Card>

        {/* Không bật xác thực thì không có phiên nào để thoát — hiện nút chỉ làm
            người dùng bấm rồi thấy không có gì xảy ra. */}
        {appConfig.authEnabled ? (
          <Button
            fullWidth
            label="Đăng xuất"
            loading={isPending}
            variant="secondary"
            onPress={() => logout()}
          />
        ) : (
          <Text className="text-center text-caption-sm text-fg-4">
            Kiểm đăng nhập đang tắt — không có phiên nào để đăng xuất.
          </Text>
        )}
      </View>
    </Screen>
  );
}
