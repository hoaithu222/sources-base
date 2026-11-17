import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Card } from '@/shared/ui/card';
import { Icon } from '@/shared/ui/icon';
import { ListItem } from '@/shared/ui/list';
import { AppBar } from '@/shared/ui/navigation';
import { Radio, RadioGroup } from '@/shared/ui/radio';
import { Screen } from '@/shared/ui/screen';
import { PATHS } from '@/shell/config';
import { useThemeStore, type ThemePreference } from '@/shell/store/slices/theme';

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { value: 'system', label: 'Theo hệ thống' },
  { value: 'light', label: 'Sáng' },
  { value: 'dark', label: 'Tối' },
];

/**
 * Cài đặt — chọn giao diện sáng/tối và lối vào thư viện component.
 *
 * Màn hình này cũng là bản kiểm tra nhanh cho hệ token: bấm đổi giữa ba lựa
 * chọn, MỌI màu trên màn hình phải đổi theo tức thì. Chỗ nào không đổi là chỗ
 * đó viết màu cứng thay vì dùng token.
 *
 * ⚠️ Ba hàng chọn KHÔNG có biểu tượng. Bộ icon của repo không có "mặt trời" /
 * "mặt trăng", mà luật của base là ⛔ đừng tự vẽ và đừng lấy tên gần đúng —
 * xem `src/shared/ui/AGENTS.md`. Chữ đủ rõ, thiếu icon không mất nghĩa nào.
 */
export function SettingsScreen() {
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);

  return (
    <Screen header={<AppBar title="Cài đặt" />}>
      <View className="gap-lg py-xs">
        {/**
         * ── ⛔ MỘT cột ở mọi bề rộng — cùng lý do với `HomeScreen` ─────────────
         *
         * Chỗ này từng là `tablet:flex-row`, biện hộ bằng "ba dòng radio kéo dài
         * 1000dp". Triệu chứng đó KHÔNG THỂ XẢY RA: `Screen` mặc định
         * `constrained` nên nội dung đã bị kẹp ở 600dp từ đúng bậc `tablet:`.
         * Hai luật chồng nhau thành một vách đá ngay tại ngưỡng — qua mốc 600dp
         * là mỗi thẻ tụt từ 567dp xuống 276dp, hẹp hơn cả điện thoại 390dp.
         *
         * Nội dung ở đây (danh sách chọn + một hàng danh mục) là thứ để ĐỌC theo
         * chiều dọc, đúng loại mà trần 600dp sinh ra để phục vụ. Giữ một cột thì
         * bề rộng chỉ TĂNG theo màn rồi dừng ở 568dp, không có bậc nào tụt.
         */}
        <View className="gap-lg">
          <Card title="Giao diện">
            {/**
             * ⛔ Dùng `RadioGroup` chứ không tự dựng ba hàng `Pressable`.
             *
             * Nhóm radio phải báo cho trình đọc màn hình biết đây là "chọn 1 trong
             * 3" và phải nối trạng thái chọn giữa các hàng với nhau. Ba `Pressable`
             * rời thì mỗi hàng là một nút độc lập — người dùng khiếm thị không
             * nghe được đây là một nhóm loại trừ nhau, và cũng không biết đang
             * chọn cái nào.
             */}
            <RadioGroup
              accessibilityLabel="Chế độ hiển thị"
              value={preference}
              onChange={(value) => setPreference(value as ThemePreference)}
            >
              {THEME_OPTIONS.map((option) => (
                <Radio key={option.value} label={option.label} value={option.value} />
              ))}
            </RadioGroup>
          </Card>

          <Card title="Nhà phát triển">
            <ListItem
              description="Xem toàn bộ component dùng chung và các biến thể của chúng"
              label="Thư viện component"
              /* Mũi tên thuần trang trí: ý nghĩa "mở ra" đã nằm trong vai trò
                 nút của cả hàng. Để lộ ra là trình đọc màn hình đọc thêm một
                 ô "›". */
              trailing={<Icon color="fg-3" name="arrow-right-small" size="sm" />}
              onPress={() => router.push(PATHS.DEMO)}
            />
          </Card>
        </View>

        <Text className="text-caption-sm text-fg-4">
          &quot;Theo hệ thống&quot; đổi theo cài đặt sáng/tối của máy, kể cả lịch tự chuyển buổi
          tối.
        </Text>
      </View>
    </Screen>
  );
}
