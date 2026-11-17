import { Pressable, Text, View, type Insets } from 'react-native';

import type { ThemeColorKey } from '@/shared/theme';
import { Icon } from '@/shared/ui/icon';

import { tabItemStyles as tabItem } from './tab-item.styles';
import type { TabItemData, TabsVariant } from './tab.types';

/**
 * Màu icon phải là TOKEN dạng chuỗi, không phải className: `<Icon>` nhuộm SVG
 * qua prop `color`, mà prop đó không nhận class.
 */
function iconColor(variant: TabsVariant, selected: boolean): ThemeColorKey {
  if (!selected) return 'fg-2';
  return variant === 'pill' ? 'action-fg' : 'fg-brand';
}

/**
 * Item kiểu viên nén cao đúng 40dp theo Figma (`259:93807`) — thiếu 4dp so với
 * ngưỡng chạm 44dp của `docs/rules/mobile-ux.md`. Nới 2dp trên/dưới thay vì
 * phóng to hình: phóng to thì khay ngoài 48dp sai theo cả hàng.
 * ⚠️ Kiểu gạch chân đã cao 48dp nên KHÔNG nới — nới thêm là vùng chạm ăn sang
 * nội dung ngay dưới hàng tab.
 */
const PILL_HIT_SLOP: Insets = { bottom: 2, top: 2 };

/**
 * Trần hệ số phóng cỡ chữ của NHÃN tab.
 *
 * ⚠️ Chiều cao tab là RÀNG BUỘC THIẾT KẾ: kiểu `pill` nằm trong một khay bo
 * tròn cao 48dp (tab 40 + đệm 4 mỗi bên), tab nào cao hơn là phá khay. Nên ⛔
 * không đổi sang `min-h-` — chặn cỡ chữ.
 *
 * Số lấy từ chỗ trống thật: (chiều cao tab − 4dp thở) ÷ lineHeight 20 của
 * `text-label-md` ⇒ pill 40 → 1.8 · underline 48 → 2.2, mà 2.0 đã là mức phóng
 * tối đa của Android nên ghi 2. Bỏ trần thì ở mức "Cỡ chữ: Lớn nhất" nhãn cao
 * 40dp khít đúng tab `pill` và bị cắt mất chân dấu tiếng Việt.
 */
const LABEL_MAX_FONT_SCALE: Record<TabsVariant, number> = { pill: 1.8, underline: 2 };

/**
 * Trần cho con số trong badge. Hộp badge đã là `min-h-` nên nó nở theo chữ —
 * trần này chỉ để nó không nở quá tab: 16 × 1.3 ≈ 21dp, còn thừa chỗ trong tab
 * 40dp kể cả khi nhãn bên cạnh cũng đang phóng to.
 */
const BADGE_MAX_FONT_SCALE = 1.3;

interface TabItemProps {
  grow: boolean;
  item: TabItemData;
  onPress: () => void;
  selected: boolean;
  variant: TabsVariant;
}

export function TabItem({ grow, item, onPress, selected, variant }: TabItemProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      /** ⚠️ Vai `tab` đọc khoá `selected` — `checked` là của checkbox/switch. */
      accessibilityState={{ selected }}
      className={tabItem({ grow }).pressable()}
      hitSlop={variant === 'pill' ? PILL_HIT_SLOP : undefined}
      onPress={onPress}
    >
      {({ pressed }) => {
        const styles = tabItem({ pressed, selected, variant });

        return (
          <View className={styles.root()}>
            {item.icon ? <Icon color={iconColor(variant, selected)} name={item.icon} /> : null}
            {/* `numberOfLines={1}`: nhãn dài làm tab cao gấp đôi và cả hàng so le.
                `maxFontSizeMultiplier`: chiều cao tab là số cứng — xem
                `LABEL_MAX_FONT_SCALE`. */}
            <Text
              className={styles.label()}
              maxFontSizeMultiplier={LABEL_MAX_FONT_SCALE[variant]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
            {item.badge == null ? null : (
              <View className={styles.badge()}>
                <Text
                  className={styles.badgeLabel()}
                  maxFontSizeMultiplier={BADGE_MAX_FONT_SCALE}
                  numberOfLines={1}
                >
                  {item.badge}
                </Text>
              </View>
            )}
            {variant === 'underline' && selected ? <View className={styles.indicator()} /> : null}
          </View>
        );
      }}
    </Pressable>
  );
}
