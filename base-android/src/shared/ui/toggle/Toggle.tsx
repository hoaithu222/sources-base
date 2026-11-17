import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { toggleStyles as toggle } from './toggle.styles';

export type ToggleSize = 'md' | 'sm';

/**
 * Quãng chạy của núm = rộng ray − 2×viền − rộng núm − 2×lề núm = 36 − 2 − 16 − 2 = 16 (`sm`: 12).
 * ⚠️ Phải là SỐ, không phải class: nó đi vào `translateX` của Reanimated, mà
 * `useAnimatedStyle` chạy trên luồng UI nên không đọc được className.
 */
const TRAVEL: Record<ToggleSize, number> = { md: 16, sm: 12 };

/** Đủ để mắt thấy núm TRƯỢT, chưa đủ để người dùng phải chờ nó xong. */
const DURATION_MS = 160;

export interface ToggleProps {
  /** Nhãn cho trình đọc màn hình khi công tắc không có `label` nhìn thấy được. */
  accessibilityLabel?: string;
  /**
   * Đang lưu: GIỮ nguyên dáng (không xám như `disabled`) nhưng chặn bấm đôi/đua — không `onChange` —
   * và báo `accessibilityState.busy`. `disabled` = không được đổi; `busy` = đang đổi, đợi.
   * Tuỳ chọn, mặc định `false` ⇒ hành vi cũ không đổi.
   */
  busy?: boolean;
  className?: string;
  /** Dòng phụ dưới nhãn ("Message text" trong Figma). */
  description?: string;
  disabled?: boolean;
  /** Nhãn bên trái. Bỏ trống thì công tắc đứng một mình — nhớ `accessibilityLabel`. */
  label?: string;
  onChange?: (value: boolean) => void;
  size?: ToggleSize;
  /** Đang bật hay tắt. Component KHÔNG tự giữ state — nơi gọi giữ. */
  value: boolean;
}

/**
 * Công tắc bật/tắt. Số đo, bốn trạng thái màu và lý do từng lựa chọn: xem `toggle.styles.ts`.
 *
 * ⚠️ Hình núm là một `View` thường LỒNG trong lớp trượt `Animated.View` — xem chú thích ở chỗ vẽ.
 */
export function Toggle({
  accessibilityLabel,
  busy = false,
  className,
  description,
  disabled = false,
  label,
  onChange,
  size = 'md',
  value,
}: ToggleProps) {
  /**
   * ── Vì sao Reanimated, và vì sao một `SharedValue` riêng ─────────────────
   * Reanimated ghi thẳng vào luồng UI — núm vẫn trượt mượt kể cả khi luồng JS
   * đang bận. Ca hay gặp: bật công tắc "Nhận thông báo" kích một lượt gọi mạng
   * ngay tại chỗ.
   *
   * `progress` (0 = tắt, 1 = bật) khởi tạo THEO `value`: công tắc bật sẵn lúc mở
   * màn đứng đúng chỗ ngay, không trượt từ trái. Effect chạy lại mỗi khi `value`
   * đổi — kể cả đổi từ NGOÀI (hoàn lại sau lỗi mạng, đồng bộ từ máy chủ), không
   * chỉ khi người dùng bấm.
   */
  const progress = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: DURATION_MS });
  }, [progress, value]);
  const slideStyle = useAnimatedStyle(
    () => ({ transform: [{ translateX: progress.value * TRAVEL[size] }] }),
    [progress, size],
  );

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="switch"
      /** ⚠️ Vai `switch` đọc khoá `checked` (giống checkbox), không phải `selected`. */
      accessibilityState={{ busy, checked: value, disabled }}
      className={toggle().pressable()}
      disabled={disabled}
      /**
       * Ray chỉ cao 20dp. Có nhãn thì cả hàng đã đủ cao, nhưng công tắc đứng một
       * mình thì thiếu hẳn 20dp so với ngưỡng chạm 44dp.
       */
      hitSlop={{ bottom: 12, left: 8, right: 8, top: 12 }}
      onPress={() => {
        if (busy) return;
        onChange?.(!value);
      }}
    >
      {({ pressed }) => {
        const styles = toggle({ disabled, pressed: pressed && !busy, size, value });

        return (
          <View className={styles.root({ className })}>
            {label || description ? (
              <View className={styles.content()}>
                {label ? <Text className={styles.label()}>{label}</Text> : null}
                {description ? <Text className={styles.description()}>{description}</Text> : null}
              </View>
            ) : null}
            <View className={styles.frame()}>
              <View className={styles.track()}>
                {/*
                  ⛔ `Animated.View` CHỈ mang `style` (translateX); hình núm (kích thước, bo, màu) là
                  `View className` LỒNG BÊN TRONG. Đặt `className` lên `Animated.View` có
                  `useAnimatedStyle` thì NativeWind chỉ giữ `transform` còn `h/w/rounded/bg` biến mất
                  — núm 0×0, vô hình trên máy thật (web không tái hiện). `cssInterop` KHÔNG cứu được.
                */}
                <Animated.View style={slideStyle}>
                  <View className={styles.knob()} testID="toggle-knob" />
                </Animated.View>
              </View>
            </View>
          </View>
        );
      }}
    </Pressable>
  );
}
