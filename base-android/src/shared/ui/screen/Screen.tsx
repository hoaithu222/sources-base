import { type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { screen } from './screen.styles';
import { ScreenGradient } from './ScreenGradient';
import { useScreenBodyPadding } from './useScreenBodyPadding';
import { useScreenRefreshControl } from './useScreenRefreshControl';

/**
 * Khung nền cho MỌI màn hình.
 *
 * Công thức class, số đo dải gradient và trần bề rộng cho máy tính bảng nằm ở
 * `screen.styles.ts`. Dải màu vẽ bằng `react-native-svg` — ⛔ KHÔNG cài
 * `expo-linear-gradient`, lý do đầy đủ ở `ScreenGradient.tsx`.
 *
 * ── Vì sao `header` nằm NGOÀI vùng cuộn ─────────────────────────────────────
 * Thanh tiêu đề phải đứng yên khi nội dung cuộn — nếu không, nút "Quay lại"
 * trôi khỏi màn hình và người dùng phải cuộn ngược lên mới thoát được. Nhận
 * `ReactNode` chứ không nhận `title`: nơi gọi tự dựng `<AppBar>` với đúng biến
 * thể của nó, `Screen` không phải mọc thêm một bộ prop song song.
 */
export interface ScreenProps {
  children: ReactNode;
  className?: string;
  /**
   * Trần bề rộng nội dung từ `tablet:` (600dp) trở lên, canh giữa màn.
   *
   * ⚠️ Trên ĐIỆN THOẠI prop này không đổi gì cả — class của nó đều có tiền tố
   * `tablet:`. Nó chỉ có nghĩa trên máy tính bảng và cửa sổ chia đôi rộng: thả
   * tự do thì một dòng chữ kéo dài 900dp, mắt hết dòng không dò lại được đầu.
   * ⛔ Tắt cho màn cần TRÀN hết bề ngang (bảng biểu, lưới ảnh, bản đồ) — ở đó
   * trần 600dp biến máy tính bảng thành cái điện thoại to kèm hai dải trống.
   */
  constrained?: boolean;
  /** Lớp bổ sung cho khối nội dung (không phải cho nền). */
  contentClassName?: string;
  /**
   * Thanh hành động dính đáy — nằm ngoài vùng cuộn.
   *
   * ⛔ `Screen` KHÔNG đệm vùng an toàn cho khe này — cả `bottom` lẫn
   * `left`/`right`; chính component đáy phải tự lo (`BottomActionBar` còn tự bỏ phần
   * `insets.bottom` khi đứng trên `BottomNav` trong `<Tabs>`). `BottomActionBar` và
   * `BottomNav` đều đã cộng bên trong, và cả hai còn được dùng ĐỘC LẬP (trong
   * `KeyboardStickyView`, trong `<Tabs tabBar>`) nên không bỏ phần đó đi được.
   * Cộng thêm ở đây thì `<Screen footer={<BottomActionBar/>}>` cho **68dp**
   * trống dưới nút trên iPhone (bản vẽ chỉ có 16 + 21), còn đệm NGANG thì làm
   * nền đặc của thanh đáy thụt vào và hở một dải trong suốt sát mép.
   *
   * ⚠️ Vì vậy một `<View>` trần đặt vào đây sẽ đè lên vạch gạt ngang, và lúc
   * xoay ngang thì đè cả tai thỏ. Dùng `BottomActionBar` (đúng padding 16/12 +
   * đủ ba chiều vùng an toàn) thay vì tự dựng.
   */
  footer?: ReactNode;
  /** Dải chuyển màu ở đầu màn. Bật sẵn theo ghi chú thiết kế; tắt cho màn có ảnh bìa riêng. */
  gradient?: boolean;
  /**
   * Thường là `<AppBar>`. Đứng yên khi nội dung cuộn.
   *
   * ⚠️ `Screen` KHÔNG chừa khe dưới thanh tiêu đề: khe 8dp theo bản vẽ do KHỐI ĐẦU của màn lo
   * (`py-xs`). Màn nào bỏ `py-xs` thì nội dung dính sát thanh tiêu đề.
   *
   * ⚠️ Với `gradient` đang bật thì ĐỪNG truyền gì thêm cho `AppBar`: nền trong
   * suốt đã là mặc định của nó, và trong Figma thanh tiêu đề KHÔNG có nền riêng
   * (bản vẽ lồng hẳn instance "Background Screen" vào frame "App bar"). Bật
   * `<AppBar opaque />` ở đây là chồng hai lớp `header-from` lệch độ trong lên
   * nhau, cộng thêm một đường viền dưới mà bản vẽ không có.
   *
   * ⛔ Prop tên là `opaque`, KHÔNG phải `transparent` — chú thích cũ ở dòng này
   * viết nhầm, làm theo là `tsc` đỏ.
   */
  header?: ReactNode;
  /**
   * Dùng `KeyboardAwareScrollView` thay cho `ScrollView` — bật cho MÀN CÓ Ô NHẬP.
   *
   * ⛔ Đừng bật đại trà: nó gắn bộ theo dõi bàn phím ở tầng native cho từng màn,
   * và trên màn không có ô nhập thì đó là chi phí không đổi lấy gì. Chỉ có tác
   * dụng khi `scrollable`.
   */
  keyboardAware?: boolean;
  /** Lề ngang 16dp theo Figma. Tắt cho màn hình có danh sách chạy sát mép. */
  padded?: boolean;
  /**
   * KÉO-ĐỂ-LÀM-MỚI: gọi khi người dùng kéo vùng cuộn xuống quá mép trên.
   *
   * ⚠️ `refreshing` là prop ĐIỀU KHIỂN — không tự tắt. Không đặt nó về `false`
   * khi tải xong thì vòng quay chạy mãi. Với React Query:
   *
   * ```tsx
   * const { isRefetching, refetch } = useQuery(...);
   * <Screen refreshing={isRefetching} onRefresh={() => void refetch()}>
   * ```
   *
   * ⛔ Chỉ có tác dụng khi `scrollable` (mặc định đã bật). Truyền cùng
   * `scrollable={false}` thì bị bỏ qua VÀ có cảnh báo ở chế độ dev — kéo mãi
   * không có gì xảy ra là thứ phải nhìn thấy được lúc lập trình.
   */
  onRefresh?: () => void;
  /** Đang tải lại hay không — xem `onRefresh`. */
  refreshing?: boolean;
  scrollable?: boolean;
}

export function Screen({
  children,
  className,
  constrained = true,
  contentClassName,
  footer,
  gradient = true,
  header,
  keyboardAware = false,
  padded = true,
  refreshing,
  scrollable = true,
  onRefresh,
}: ScreenProps) {
  const styles = screen({ constrained, padded });

  /* Bốn cạnh vùng an toàn, mỗi cạnh một luật riêng — xem `useScreenBodyPadding`. */
  const bodyPadding = useScreenBodyPadding({
    hasFooter: Boolean(footer),
    hasHeader: Boolean(header),
  });

  /**
   * ⚠️ Padding của nội dung đặt trên một `<View>` LỒNG BÊN TRONG, không phải
   * bằng `contentContainerClassName`. NativeWind chỉ dịch `className` cho những
   * component nó đã đăng ký; `contentContainerClassName` trên
   * `KeyboardAwareScrollView` (component của thư viện, không phải của RN) bị bỏ
   * qua ÂM THẦM. Một `<View>` thường thì luôn chắc chắn.
   */
  const inner = <View className={styles.content({ className: contentClassName })}>{children}</View>;

  /* Vòng quay kéo-để-làm-mới. `undefined` khi nơi gọi không truyền `onRefresh`
     — xem `useScreenRefreshControl` để biết vì sao nó là HOOK trả về phần tử
     chứ không phải một component bọc. */
  const refreshControl = useScreenRefreshControl({
    offset: bodyPadding.paddingTop,
    refreshing,
    scrollable,
    onRefresh,
  });

  const body = scrollable ? (
    keyboardAware ? (
      <KeyboardAwareScrollView
        bottomOffset={24}
        className={styles.body()}
        contentContainerStyle={{ flexGrow: 1, ...bodyPadding }}
        // Cho phép bấm nút trong khi bàn phím đang mở. Mặc định, cú chạm đầu
        // tiên chỉ đóng bàn phím và KHÔNG tới được nút.
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
      >
        {inner}
      </KeyboardAwareScrollView>
    ) : (
      <ScrollView
        className={styles.body()}
        contentContainerStyle={{ flexGrow: 1, ...bodyPadding }}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
      >
        {inner}
      </ScrollView>
    )
  ) : (
    <View className={styles.body()} style={bodyPadding}>
      {inner}
    </View>
  );

  return (
    <View className={styles.root({ className })}>
      {gradient ? (
        <View
          /* Dải màu là TRANG TRÍ: không được ăn cú chạm (nó phủ lên 20% trên
             cùng của màn, tức phủ cả thanh tiêu đề) và phải im lặng với trình
             đọc màn hình. ⚠️ Khai CẢ HAI prop trợ năng:
             `accessibilityElementsHidden` chỉ iOS nghe,
             `importantForAccessibility` chỉ Android nghe. */
          accessibilityElementsHidden
          className={styles.gradient()}
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
        >
          <ScreenGradient />
        </View>
      ) : null}

      {header}
      {body}

      {/* ⛔ KHÔNG có `paddingBottom` ở đây — component đáy tự lo, xem JSDoc của
          prop `footer`. Cộng ở cả hai chỗ là thừa 68dp trên iPhone. */}
      {footer ? <View className={styles.footer()}>{footer}</View> : null}
    </View>
  );
}
