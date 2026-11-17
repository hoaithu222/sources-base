import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Screen } from '@/shared/ui/screen';

/**
 * Khung chung cho 4 màn hình xác thực.
 *
 * ── Còn tồn tại để làm gì, khi đã có `Screen` ───────────────────────────────
 * Chỉ để gom **tiêu đề + phụ đề**, cách căn giữa theo chiều dọc và **trần bề
 * rộng của cột form** — thứ riêng của nhóm màn xác thực, không phải của mọi màn
 * hình. Phần nền, dải chuyển màu, vùng an toàn và xử lý bàn phím đã nằm hết
 * trong `Screen`.
 *
 * ⛔ Đừng thêm prop mới vào đây. Màn hình cần bố cục khác thì gọi thẳng
 * `<Screen>` — một khung chung mọc dần prop sẽ thành thứ không ai dám sửa.
 *
 * ── Vì sao `keyboardAware` ──────────────────────────────────────────────────
 * Cả 4 màn đều có ô nhập. Không bật thì bàn phím che mất nút "Đăng nhập", và
 * trên Android người dùng không cuộn xuống tới được vì nội dung vừa đúng một
 * màn hình.
 */
export function AuthScreenLayout({
  children,
  subtitle,
  title,
}: {
  children: ReactNode;
  subtitle?: string;
  title: string;
}) {
  return (
    /**
     * ── `landscape:` — máy NẰM NGANG, màn thấp ────────────────────────────────
     * Nằm ngang, vùng nhìn thấy chỉ còn ~360dp cao, và bàn phím ăn hơn nửa số
     * đó. `justify-center` + `py-xl` lúc ấy chỉ tổ đẩy form xuống giữa một
     * khung đã chật, người dùng phải cuộn thêm mới tới nút gửi. Nằm ngang thì
     * canh từ TRÊN xuống và bớt lề dọc — mọi thứ vào tầm mắt sớm hơn một nhịp
     * cuộn.
     *
     * ⚠️ Nút gửi vẫn luôn tới được ở cả hai hướng: `Screen` bọc nội dung trong
     * `KeyboardAwareScrollView` (`bottomOffset={24}`,
     * `keyboardShouldPersistTaps="handled"`) và `contentContainerStyle` để
     * `flexGrow: 1` — nội dung cao hơn khung thì khung nở ra theo nội dung, nên
     * `justify-center` KHÔNG bao giờ đẩy phần đầu form ra ngoài vùng cuộn tới
     * được. ⛔ Đừng "sửa" bằng cách bỏ `flexGrow` — bỏ đi là canh giữa mất tác
     * dụng trên màn cao.
     */
    <Screen
      contentClassName="justify-center py-xl landscape:justify-start landscape:py-md"
      keyboardAware
    >
      {/**
       * ── Trần bề rộng: `max-w-`, ⛔ KHÔNG phải `w-` ────────────────────────
       * Trên máy tính bảng 1000dp, ô nhập kéo dài hết bề ngang là không dùng
       * được thật: mắt phải đi hết 1000dp để về đầu dòng kế, và nhãn nằm cách
       * giá trị nửa mét màn hình. 480dp là bề rộng form ở mức vẫn đọc thoải
       * mái — rộng hơn một chút so với điện thoại to nhất (430dp) để không thấy
       * gò bó, chưa tới ngưỡng khó theo dõi.
       *
       * `w-full` + `max-w-…` (không phải `w-[480px]`): máy hẹp 320dp vẫn co lại
       * đúng bề rộng khung, chỉ máy rộng mới bị CHẶN. `self-center` để phần dư
       * chia đều hai bên thay vì dồn hết sang phải.
       */}
      <View className="w-full gap-xl tablet:max-w-[480px] tablet:self-center">
        <View className="gap-xs">
          <Text className="text-header-md font-bold text-fg-1">{title}</Text>
          {subtitle ? <Text className="text-body-md text-fg-2">{subtitle}</Text> : null}
        </View>

        {children}
      </View>
    </Screen>
  );
}
