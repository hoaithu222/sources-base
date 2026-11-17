import { useEffect } from 'react';
import { useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/**
 * Chuyển động của `BottomSheet`: trượt lên khi mở, đi theo ngón tay khi vuốt,
 * trượt xuống hết đường rồi mới báo đóng.
 *
 * ── Vì sao KHÔNG dùng `animationType="slide"` của `<Modal>` ──────────────────
 * Hoạt ảnh có sẵn của React Native chạy ở tầng native và KHÔNG cho can thiệp
 * giữa chừng. Mà vuốt-để-đóng thì bắt buộc phải can thiệp: tấm phải bám theo
 * ngón tay từng khung hình, rồi tuỳ quãng đường và vận tốc mà bật lại hay đi
 * tiếp xuống. Nên vị trí do Reanimated giữ, còn `<Modal>` chỉ làm cái khung
 * trong suốt (`animationType="none"`).
 *
 * ── Vì sao Reanimated chứ không phải `Animated` của React Native ────────────
 * Cú vuốt và hoạt ảnh phải chạy trên luồng UI. Với `Animated`, mỗi khung hình
 * của cú vuốt phải đi vòng qua luồng JS — mà đúng lúc đó luồng JS thường đang
 * bận dựng danh sách bên trong tấm, nên tấm giật ngay lúc người dùng nhìn.
 *
 * ── Vì sao `onClose` gọi SAU hoạt ảnh ───────────────────────────────────────
 * `visible` do nơi gọi giữ. Gọi `onClose` ngay lúc bắt đầu thì `<Modal>` biến
 * mất tức thì và cú vuốt trông như app đứng hình. Gọi trong callback của
 * `withTiming` thì tấm đi hết đường xuống rồi mới tháo.
 *
 * ── ⛔ Vì sao KHÔNG có `useCallback`/`useMemo` ở đây ────────────────────────
 * Đã thử và bị chặn: `react-hooks/immutability` (bộ luật của React Compiler,
 * bật ở mức `error`) cấm GHI vào một giá trị đã được truyền làm dependency của
 * một hook khác. Mà shared value thì vừa phải nằm trong deps của `useEffect`
 * bên dưới, vừa phải được ghi trong các hàm này. Bọc `useMemo` là đỏ lint.
 * Bỏ memo hoá không mất gì đáng kể: `BottomSheet` chỉ vẽ lại khi prop đổi (mở,
 * đóng, xoay máy), không phải mỗi khung hình — cú vuốt chạy hoàn toàn trên
 * luồng UI, không đi qua React.
 */

/** Đủ để mắt bám theo, chưa đủ để người dùng phải chờ. */
const OPEN_DURATION_MS = 260;
const CLOSE_DURATION_MS = 200;

/** Vuốt quá 1/3 chiều cao tấm là đóng — dưới mức đó coi như lỡ tay. */
const DISMISS_DISTANCE_RATIO = 1 / 3;

/** Vuốt nhanh thì đóng dù chưa đi đủ quãng đường (dp/giây). */
const DISMISS_VELOCITY = 800;

/** `damping` cao để tấm bật về chỗ cũ mà KHÔNG nảy — nảy trông như lỗi. */
const SPRING_CONFIG = { damping: 20, stiffness: 220 } as const;

export function useSheetTransition(visible: boolean, onClose: () => void) {
  const window = useWindowDimensions();

  /**
   * Chiều cao thật của tấm, đo bằng `onLayout`.
   *
   * Giá trị đầu là chiều cao màn hình: trước lần đo đầu tiên, tấm phải nằm chắc
   * chắn ngoài màn chứ không phải ở một chỗ đoán chừng — nếu không, khung hình
   * đầu tiên loé lên giữa màn rồi mới trượt.
   */
  const sheetHeight = useSharedValue(window.height);
  const translateY = useSharedValue(window.height);

  /** Vị trí lúc đặt ngón tay xuống — để cú vuốt cộng dồn đúng khi kéo nhiều lần. */
  const dragOrigin = useSharedValue(0);

  const onSheetLayout = (event: LayoutChangeEvent) => {
    sheetHeight.value = event.nativeEvent.layout.height;
  };

  const requestClose = () => {
    translateY.value = withTiming(
      sheetHeight.value,
      { duration: CLOSE_DURATION_MS },
      (finished) => {
        // `finished` là false khi có hoạt ảnh khác chen ngang (người dùng mở lại
        // ngay). Gọi `onClose` lúc đó sẽ đóng đúng cái tấm vừa được mở lại.
        if (finished) runOnJS(onClose)();
      },
    );
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      dragOrigin.value = translateY.value;
    })
    .onUpdate((event) => {
      // ⛔ Chặn ở 0: kéo LÊN không được. Cho tấm rời mép dưới thì hở một dải nền
      // mờ bên dưới nó, và không có cách nào đưa tấm về chỗ cũ cho gọn.
      translateY.value = Math.max(0, dragOrigin.value + event.translationY);
    })
    .onEnd((event) => {
      const passedDistance = translateY.value > sheetHeight.value * DISMISS_DISTANCE_RATIO;

      if (passedDistance || event.velocityY > DISMISS_VELOCITY) {
        translateY.value = withTiming(
          sheetHeight.value,
          { duration: CLOSE_DURATION_MS },
          (finished) => {
            if (finished) runOnJS(onClose)();
          },
        );
        return;
      }

      translateY.value = withSpring(0, SPRING_CONFIG);
    });

  useEffect(() => {
    if (!visible) return;
    // Đặt lại điểm xuất phát: `<Modal>` giữ nguyên cây con giữa hai lần mở, nên
    // không đặt lại thì lần mở thứ hai bắt đầu từ 0 và tấm hiện ra không hoạt ảnh.
    translateY.value = sheetHeight.value;
    translateY.value = withTiming(0, { duration: OPEN_DURATION_MS });
  }, [visible, sheetHeight, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return { animatedStyle, onSheetLayout, panGesture, requestClose };
}
