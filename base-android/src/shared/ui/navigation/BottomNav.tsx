import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColor } from '@/shared/theme';
import { cn } from '@/shared/utils/style/cn';

import { bottomNav, MIN_BOTTOM_PADDING, RIPPLE_ALPHA_HEX } from './bottom-nav.styles';
import { BottomNavGradient } from './BottomNavGradient';

/** Một mục trên thanh tab. `icon`/`activeIcon` để trống được — khe chờ bộ icon chung. */
export interface BottomNavItem {
  activeIcon?: ReactNode;
  /** Số chưa đọc. `0` hoặc bỏ trống ⇒ không vẽ huy hiệu. */
  badge?: number;
  icon?: ReactNode;
  key: string;
  label: string;
}

/**
 * Thanh điều hướng dưới cùng — nền gradient xanh đậm, chữ trắng (`Type=Menu`).
 *
 * Số đo và công thức class nằm ở `bottom-nav.styles.ts`.
 *
 * ── Thuần trình bày, KHÔNG tự gọi `router` ───────────────────────────────────
 * Nơi dùng truyền `onSelect`. Nhờ vậy cùng một component dùng được cho cả
 * `<Tabs tabBar={…}>` của expo-router (nơi điều hướng do navigator quản) lẫn màn
 * hình tự quản trạng thái (ví dụ bước trong một luồng mở tài khoản). Nếu nhét
 * `router.push` vào đây thì ca thứ hai phải viết lại một thanh y hệt.
 *
 * ⛔ `insets.bottom` là bắt buộc. Trên iPhone có vạch gạt ngang, thiếu nó thì
 * hàng tab nằm ngay dưới vạch: hệ điều hành nuốt cú chạm để làm cử chỉ vuốt về
 * màn chính, và người dùng thấy "bấm tab không ăn" chứ không đoán được vì sao.
 *
 * ⛔ Icon truyền từ nơi gọi phải nhuộm bằng `fg-on-nav-accent` (đang mở) /
 * `fg-on-nav-muted` (không) để đi CÙNG CẶP với nhãn — nền thanh là màu tối ở cả
 * hai chế độ, ghép chéo sang `primary-*` là icon chìm hẳn.
 */
export function BottomNav({
  activeKey,
  className,
  contentClassName,
  items,
  onSelect,
}: {
  activeKey: string;
  /**
   * Lớp cho khối NGOÀI CÙNG — nơi có nền, dải màu và vùng an toàn.
   *
   * ⚠️ Trần bề rộng 600dp KHÔNG nằm ở đây mà ở hàng mục bên trong, nên đặt
   * `tablet:max-w-none` vào prop này là **không có tác dụng nào và cũng không
   * có lỗi nào báo**. Muốn bỏ trần thì dùng `contentClassName`.
   */
  className?: string;
  /**
   * Lớp cho HÀNG MỤC bên trong — nơi mang trần `tablet:max-w-screen-tablet`.
   *
   * Đây là đường DUY NHẤT để nơi gọi bỏ trần đó:
   * `contentClassName="tablet:max-w-none"`.
   *
   * ⛔ Cố ý không gộp vào `className`: nền đặc, dải màu và đệm vùng an toàn
   * phải phủ hết bề ngang màn hình, chỉ riêng HÀNG MỤC mới bị kẹp. Gộp một
   * prop cho hai node là mọi lớp nền rơi lên cả hai.
   */
  contentClassName?: string;
  items: BottomNavItem[];
  onSelect: (key: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const base = bottomNav();
  // Gợn sóng theo TOKEN của thanh (chữ-trên-nav, trắng ~12%): ripple mặc định của hệ điều hành là
  // xám/đen trong suốt, trên nền xanh đậm gần như không thấy phản hồi nào.
  const rippleColor = `${useThemeColor('fg-on-nav-accent')}${RIPPLE_ALPHA_HEX}`;

  return (
    <View
      /**
       * `tablist` gom cả hàng thành một nhóm để trình đọc màn hình đọc "tab 2
       * trên 5" — không có nó thì mỗi tab là một nút rời rạc, người dùng khiếm
       * thị không biết hàng có bao nhiêu mục.
       */
      accessibilityRole="tablist"
      className={cn(base.root(), className)}
      /**
       * ⛔ Vùng an toàn đủ BA chiều. Ai cũng nhớ `bottom` và quên `left`/`right`:
       * xoay ngang thì tai thỏ ăn vào mép trái/phải và nuốt luôn cú chạm ở đó —
       * mục tab ngoài cùng thành "bấm không ăn" mà không ai đoán ra vì sao.
       *
       * ⚠️ Đệm ở `root` làm dải màu (`absolute inset-0`) hụt vào đúng ngần ấy dp,
       * vì con `absolute` lấy mốc từ hộp ĐỆM của cha. Chấp nhận được: phần hụt
       * là rìa ngoài của một gradient TOẢ TRÒN, ở đó màu đã gần trùng `nav-to`
       * mà `root` đang đổ sẵn làm lớp lót.
       */
      style={{
        paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_PADDING),
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {/* Dải màu là TRANG TRÍ: vẽ trước để nằm DƯỚI hàng mục, không ăn cú chạm,
          và im lặng với trình đọc màn hình. ⚠️ Khai CẢ HAI prop trợ năng —
          `accessibilityElementsHidden` chỉ iOS nghe, `importantForAccessibility`
          chỉ Android nghe. */}
      <View
        accessibilityElementsHidden
        className={base.gradient()}
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
      >
        <BottomNavGradient />
      </View>

      <View className={base.row({ className: contentClassName })}>
        {items.map((item) => {
          const selected = item.key === activeKey;
          const styles = bottomNav({ selected });
          const unread = item.badge ?? 0;
          // Trên 99 thì ô đỏ không đủ chỗ, nhưng nhãn trợ năng vẫn đọc số THẬT.
          const badgeText = unread > 99 ? '99+' : String(unread);

          return (
            <Pressable
              key={item.key}
              /**
               * ⛔ Huy hiệu phải được GỘP vào nhãn.
               *
               * Con số vẽ trong ô đỏ là hình ảnh — trình đọc màn hình không đọc
               * nó (và ở dưới ta còn chủ động giấu ô đó đi để nó không bị đọc
               * tách rời thành "3"). Không gộp thì người dùng khiếm thị hoàn
               * toàn không biết có thông báo chưa đọc.
               */
              accessibilityLabel={
                unread > 0 ? `${item.label}, ${String(unread)} mục chưa đọc` : item.label
              }
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              /**
               * Phản hồi khi chạm. `borderless` để gợn sóng KHÔNG bị cắt thành
               * một ô chữ nhật đè lên dải màu — mục tab không có nền riêng.
               * (Bản vẽ chỉ có Default/Active nên đây là phần thêm cho cảm giác
               * bấm, không phải yêu cầu thiết kế.) ⛔ Có `color` theo token — xem `rippleColor`.
               *
               * ⛔ Đổi tab là ĐIỀU HƯỚNG nên KHÔNG rung (haptic): chỉ rung ở hành động có ý nghĩa.
               */
              android_ripple={{ borderless: true, color: rippleColor }}
              className={styles.item()}
              onPress={() => onSelect(item.key)}
            >
              <View className={styles.iconBox()}>
                {selected ? (item.activeIcon ?? item.icon) : item.icon}
                {unread > 0 ? (
                  <View
                    /**
                     * Giấu khỏi trình đọc màn hình: nội dung của nó đã nằm trong
                     * `accessibilityLabel` của cả tab. Để lộ ra thì người dùng
                     * nghe "Thông báo" rồi "3" như hai phần tử không liên quan.
                     */
                    accessibilityElementsHidden
                    className={styles.badge()}
                    importantForAccessibility="no-hide-descendants"
                  >
                    {/* ⛔ `maxFontSizeMultiplier`: hộp huy hiệu là `min-h-lg`
                        nên nó NỞ theo chữ — trần này chỉ để nó đừng nở quá ô
                        icon 24dp. Android cho phóng cỡ chữ tới 2×: bỏ trần thì
                        ở mức "Cỡ chữ: Lớn nhất" nhãn 12px thành 24px, huy hiệu
                        cao ~28dp và trùm lên chính biểu tượng bên dưới. Trần
                        1.3 là CÙNG con số và cùng lý do với `Badge.tsx`. ⚠️ Đây
                        là TRẦN chứ không phải hệ số: chữ thường không nhỏ đi. */}
                    <Text
                      className={styles.badgeLabel()}
                      maxFontSizeMultiplier={1.3}
                      numberOfLines={1}
                    >
                      {badgeText}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text className={styles.label()} ellipsizeMode="tail" numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
