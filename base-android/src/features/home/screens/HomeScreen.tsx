import { Text, View } from 'react-native';

import { appConfig } from '@/core/config/env.config';
import { Alert } from '@/shared/ui/alert';
import { Card } from '@/shared/ui/card';
import { ListItem } from '@/shared/ui/list';
import { AppBar } from '@/shared/ui/navigation';
import { Screen } from '@/shared/ui/screen';
import { useAuthStore } from '@/shell/store/slices/auth';

/**
 * Trang chủ — màn hình khung.
 *
 * ⚠️ CỐ Ý gần như trống. Base không đoán hộ dự án cần dashboard gì; nội dung
 * thật thay vào đây. Thứ nó làm được ngay là bày ra trạng thái cấu hình, để lần
 * chạy đầu tiên trả lời được câu "base đã nối đúng chưa" mà không phải mở
 * DevTools.
 *
 * ⚠️ Màn hình này cũng là BẢN MẪU về cách dựng một màn: `Screen` lo nền +
 * gradient + vùng an toàn + vùng cuộn, `AppBar` lo thanh tiêu đề, nội dung dùng
 * component của `@/shared/ui`. ⛔ Đừng quay lại `<ScrollView>` + `<View>` trần
 * — mỗi màn tự dựng khung là mỗi màn lệch một kiểu.
 */
export function HomeScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <Screen header={<AppBar title={user ? `Xin chào, ${user.name}` : 'Xin chào'} />}>
      <View className="gap-md py-xs">
        <Text className="text-body-md text-fg-2">
          Base React Native đã chạy. Thay màn hình này bằng nội dung của dự án.
        </Text>

        {/**
         * ── ⛔ MỘT cột ở mọi bề rộng — cố ý, và đây là lý do ───────────────────
         *
         * Chỗ này từng là `tablet:flex-row`, biện hộ bằng "một cột kéo hết
         * 1000dp bề ngang". Triệu chứng đó KHÔNG THỂ XẢY RA: `Screen` mặc định
         * `constrained`, tức nội dung đã bị kẹp ở 600dp từ đúng bậc `tablet:`.
         * Hai luật chồng lên nhau thành một VÁCH ĐÁ ngay tại ngưỡng — đo được
         * ở cột giá trị của `ListItem`: **263dp ở 599dp, còn 118dp ở 600dp**.
         * Kéo thanh chia đôi màn hình qua mốc đó là thẻ co lại chưa tới một nửa,
         * và người dùng đọc ra là "app vỡ khi chỉnh cửa sổ".
         *
         * Hai cột chỉ có nghĩa nếu bỏ trần 600dp (`<Screen constrained={false}>`)
         * — nhưng ở 600dp thì hai cột cũng chỉ còn 276dp mỗi cột, HẸP HƠN cả
         * điện thoại 390dp. Nội dung ở đây là bảng "nhãn — giá trị" để ĐỌC, mà
         * 600dp đã là bề rộng tối đa của một cột chữ (xem `screen.styles.ts`).
         * Nên hướng đúng là để trần 600dp làm việc của nó và bỏ hẳn hai cột.
         *
         * ✅ Nhờ vậy bề rộng chỉ TĂNG theo màn: 567dp ở 599dp → 568dp ở 600dp →
         * đứng yên 568dp từ đó lên, không có bậc nào tụt.
         * ⚠️ Màn nào thật sự cần tràn hết bề ngang (lưới, bảng biểu, bản đồ) thì
         * tắt `constrained` — mẫu ở `DemoPatternsScreen`.
         */}
        <View className="gap-md">
          <Card title="Cấu hình đang dùng">
            <ListItem divider label="Môi trường" value={appConfig.env} />
            <ListItem divider label="API" value={appConfig.apiBaseUrl || '(chưa đặt)'} />
            <ListItem
              divider
              label="Kiểm đăng nhập"
              value={appConfig.authEnabled ? 'BẬT' : 'TẮT'}
            />
            <ListItem label="Làm mới token" value={appConfig.enableRefreshToken ? 'Bật' : 'Tắt'} />
          </Card>

          {/* ⛔ Cảnh báo này phải ở lại trong base. Cờ `authEnabled=false` mở mọi
              màn hình cho người chưa đăng nhập — tiện lúc dựng giao diện, nhưng
              lọt lên bản phát hành là lỗ hổng, và không có gì khác nhắc. */}
          {!appConfig.authEnabled ? (
            <Alert
              description="Mọi màn hình đang mở cho người chưa đăng nhập. Đặt EXPO_PUBLIC_AUTH_ENABLED=true trong .env trước khi phát hành."
              title="Kiểm đăng nhập đang TẮT"
              tone="warning"
            />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
