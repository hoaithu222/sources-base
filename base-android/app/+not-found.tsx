import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

import { PATHS } from '@/shell/config';

/**
 * Màn hình cho đường dẫn không tồn tại.
 *
 * Trên di động, đây KHÔNG phải trang 404 hiếm gặp như trên web — người dùng
 * không gõ URL. Nó xuất hiện khi:
 *   · một deep link cũ trong e-mail/thông báo trỏ tới màn hình đã bị xoá;
 *   · thông báo đẩy mang đường dẫn sai;
 *   · bản cập nhật đổi tên route mà máy chủ push chưa cập nhật theo.
 *
 * Vì vậy phải luôn có ĐƯỜNG RA rõ ràng — không có thì người dùng chỉ còn cách
 * tắt app đi.
 */
export default function NotFoundRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Không tìm thấy' }} />
      <View className="flex-1 items-center justify-center gap-md bg-bg-base p-xl">
        <Text className="text-center text-header-sm font-semibold text-fg-1">
          Không tìm thấy màn hình này
        </Text>
        <Text className="text-center text-body-md text-fg-3">
          Liên kết có thể đã cũ hoặc màn hình đã được đổi tên.
        </Text>
        <Link asChild href={PATHS.HOME}>
          <Text className="text-body-lg font-semibold text-primary-6">Về trang chủ</Text>
        </Link>
      </View>
    </>
  );
}
