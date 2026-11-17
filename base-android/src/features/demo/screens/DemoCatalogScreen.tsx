import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Alert } from '@/shared/ui/alert';
import { Card } from '@/shared/ui/card';
import { Icon } from '@/shared/ui/icon';
import { ListItem } from '@/shared/ui/list';
import { AppBar } from '@/shared/ui/navigation';
import { Screen } from '@/shared/ui/screen';
import { PATHS } from '@/shell/config';

const ENTRIES = [
  {
    description: 'Màu, thang chữ, bo góc, giãn cách, cỡ control, bộ icon',
    href: PATHS.DEMO_FOUNDATION,
    label: 'Nền tảng (token)',
  },
  {
    description: 'Toàn bộ component trong @/shared/ui và các biến thể của chúng',
    href: PATHS.DEMO_COMPONENTS,
    label: 'Component',
  },
  {
    description: 'Ghép component thành màn hình theo quy chuẩn thiết kế tham chiếu',
    href: PATHS.DEMO_PATTERNS,
    label: 'Mẫu bố cục màn hình',
  },
] as const;

/**
 * Mục lục thư viện component.
 *
 * ── Vì sao trang này tồn tại ────────────────────────────────────────────────
 * Một bộ component không có chỗ xem thì người ta không tra, và không tra thì
 * người ta tự viết lại — rồi base có hai cái nút. Trang này là chỗ để trả lời
 * "đã có sẵn cái đó chưa" trong mười giây, ngay trên máy thật, ở đúng theme
 * đang bật.
 *
 * ⛔ Đây KHÔNG phải màn hình nghiệp vụ. Nó nằm ngoài nhóm `(app)` nên không có
 * thanh tab và không đi qua hàng rào đăng nhập, và cả cụm bị xoá khi giao dự
 * án — xem chú thích ở `PATHS.DEMO`.
 */
export function DemoCatalogScreen() {
  return (
    <Screen header={<AppBar title="Thư viện component" onBack={router.back} />}>
      <View className="gap-md py-xs">
        <Alert
          description="Trang này đọc thẳng từ hệ token: đổi colors.json hay typography.json rồi chạy generator là các mẫu ở đây đổi theo. Không có số đo nào chép tay."
          title="Bày ra token thật, không phải ảnh chụp"
          tone="info"
        />

        {/*
          ⛔ `padded={false}` KHÔNG có nghĩa "thẻ này không cần lề" — nó có nghĩa
          CON tự lo lề. Bỏ trống thì `<ListItem>` dán sát mép thẻ: nhãn bắt đầu
          ngay trên đường bo 24dp còn mũi tên `>` chạm mép phải. Lề trả lại ở
          TỪNG HÀNG (`px-md` = 16 của bản vẽ) chứ không ở thẻ, vì đường kẻ phân
          cách phải chạy hết bề rộng thẻ — đặt `p-md` lên thẻ là kẻ thụt vào hai
          đầu và trông như vẽ nhầm.

          `gap-0` cũng bắt buộc: mặc định `Card` cách các con 12dp, mà hàng đã bật
          `divider` thì 12dp đó biến đường kẻ thành vạch DÍNH đáy hàng trên và hở
          hẳn với hàng dưới. Khoảng thở chuyển vào `py-sm` của chính hàng.
        */}
        <Card className="gap-0" padded={false}>
          {ENTRIES.map((entry, index) => (
            <ListItem
              key={entry.href}
              className="px-md py-sm"
              description={entry.description}
              divider={index < ENTRIES.length - 1}
              label={entry.label}
              trailing={<Icon color="fg-3" name="arrow-right-small" size="sm" />}
              onPress={() => router.push(entry.href)}
            />
          ))}
        </Card>

        {/**
         * ⛔ `fg-4` (#C5C5C5) trên nền màn `bg-base` (#F0F5F5) chỉ được 1.57:1 —
         * câu này gần như tàng hình trên máy thật. `fg-2` cho 5.22:1.
         *
         * ⚠️ Khối chú thích này phải ở dạng `{/**` với mỗi dòng bắt đầu bằng
         * `*`: `npm run check:classes` bỏ qua dòng chú thích theo dấu mở đầu, mà
         * dòng nối của `{/*` thì không có dấu nào — tên token `bg-base` trong
         * câu văn bị đọc thành một class chết và cổng kiểm báo đỏ.
         */}
        <Text className="text-caption-sm text-fg-2">
          Muốn thử chế độ tối: Cài đặt → Giao diện → Tối. Mọi mẫu ở đây phải đổi màu tức thì; chỗ
          nào không đổi là chỗ đó viết màu cứng thay vì dùng token.
        </Text>
      </View>
    </Screen>
  );
}
