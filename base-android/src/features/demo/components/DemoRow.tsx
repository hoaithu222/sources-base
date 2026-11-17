import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

/**
 * Một hàng ví dụ: nhãn biến thể ở trên, các mẫu xếp ngang ở dưới.
 *
 * ⚠️ `flex-wrap` là bắt buộc chứ không phải cho đẹp. Vài biến thể (nút `lg`,
 * chip có avatar) rộng hơn nửa màn 360dp; không cho xuống dòng thì mẫu cuối
 * hàng bị cắt mất một nửa và người xem tưởng component vốn bị cắt như vậy.
 */
export function DemoRow({
  children,
  column = false,
  label,
}: {
  children: ReactNode;
  /**
   * Xếp DỌC — mỗi mẫu một hàng, chiếm hết bề rộng.
   *
   * ⛔ BẮT BUỘC cho `Checkbox` và `Toggle`, không phải tuỳ thẩm mỹ. Nhãn của
   * hai component đó là `flex-1` — đúng bản vẽ: nhãn ăn hết phần còn lại của
   * hàng để công tắc dính mép phải. Mà `flex-1` là `flex-basis: 0`, tức là nhãn
   * KHÔNG đóng góp gì vào bề rộng nội dung của cha. Thả vào hàng ngang bọc dòng
   * (cha rộng theo nội dung) thì cha chỉ còn 24dp ô vẽ + 8dp khe, nhãn co về 0,
   * chữ rớt mỗi dòng một ký tự và ô chọn bị kéo cao cả trăm dp.
   * ⚠️ Không có lỗi nào báo — nhìn class hai bên đều "đúng".
   */
  column?: boolean;
  label?: string;
}) {
  return (
    <View className="gap-2xs">
      {label ? <Text className="text-caption-sm text-fg-2">{label}</Text> : null}
      <View className={column ? 'gap-sm' : 'flex-row flex-wrap items-center gap-xs'}>
        {children}
      </View>
    </View>
  );
}
