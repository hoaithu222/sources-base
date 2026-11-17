import { Text, View } from 'react-native';

import { THEME_COLOR_KEYS, useThemeColors, type ThemeColorKey } from '@/shared/theme';

import { DemoGrid } from './DemoGrid';
import { DemoSection } from './DemoSection';

/**
 * Các nhóm token màu THEO VAI TRÒ — nhóm duy nhất đảo theo chế độ sáng/tối.
 *
 * ⛔ Cố ý KHÔNG bày thang số (`primary-1…10`, `error-*`, `neutral-*`). Thang số
 * giống hệt nhau ở hai chế độ, nên bày chúng ở đây là mời người ta lấy
 * `bg-primary-8` làm nền nút — và ở chế độ tối nút đó thành nền đậm trên nền
 * đậm (đo được 1.20:1 trên `bg-base`, 1.09:1 trên thẻ `bg-1`). Cần một bậc cụ
 * thể thì tra `src/styles/colors/colors.json`.
 */
const ROLE_GROUPS = [
  { label: 'Nền màn hình / bề mặt', namespace: 'bg' },
  { label: 'Chữ', namespace: 'fg' },
  { label: 'Nút và control', namespace: 'action' },
  { label: 'Nền phủ đặc theo ngữ cảnh', namespace: 'surface' },
  { label: 'Viền', namespace: 'border' },
] as const;

/**
 * `action-base` → `action`.
 *
 * ⚠️ Cố ý cắt bằng `split` thay vì viết hằng số `'action-'` cho gọn: chuỗi có
 * dấu gạch trông y hệt một class Tailwind, và `npm run check:classes` sẽ đọc
 * `'bg-'` thành một class chết rồi báo đỏ. Bộ soát đúng khi làm vậy — nó không
 * có cách nào biết chuỗi đó là tiền tố tên token; đây là phía gọi phải tránh.
 */
const namespaceOf = (key: string) => key.split('-')[0];

export function TokenColorsSection() {
  const colors = useThemeColors();

  return (
    <DemoSection
      description="Đổi Cài đặt → Giao diện để xem cùng token cho ra màu khác. Tên dưới mỗi ô là TÊN TOKEN; class thì là tên thuộc tính ghép với tên token (token bg-1 ⇒ class bg-bg-1)."
      title="Màu theo vai trò"
    >
      {ROLE_GROUPS.map((group) => {
        const keys = THEME_COLOR_KEYS.filter((key) => namespaceOf(key) === group.namespace);

        return (
          /**
           * ⚠️ Số cột do `DemoGrid` TÍNH từ bề rộng thật, không viết cứng.
           *
           * 90 là sàn để máy HẸP NHẤT vẫn ra 3 cột: 320dp − lề 16×2 = 288dp
           * khung, trừ hai khe 8 còn 272 chia 3 = 90,6dp. Đặt sàn cao hơn (96)
           * là máy 320dp tụt xuống 2 cột và mỗi ô phình thành 140dp — ô màu to
           * gấp rưỡi mà bảng lại dài gấp rưỡi.
           *
           * Ở đầu kia: máy tính bảng 1000dp ra 9 cột thay vì 3 cột cộng một dải
           * trống 700dp.
           */
          <DemoGrid key={group.namespace} label={group.label} minItemWidth={90}>
            {keys.map((key) => (
              <Swatch key={key} name={key} value={colors[key]} />
            ))}
          </DemoGrid>
        );
      })}
    </DemoSection>
  );
}

/**
 * Ô màu.
 *
 * ⚠️ Màu đi qua `style` chứ không qua `className`: tên token chỉ biết được LÚC
 * CHẠY, mà Tailwind sinh CSS lúc BUILD từ chuỗi class đọc được trong mã nguồn.
 * `className={\`bg-\${key}\`}` không sinh ra class nào và ô sẽ trong suốt —
 * đúng cái bẫy "NativeWind bỏ qua âm thầm". Giá trị vẫn lấy từ hook token nên
 * vẫn đổi theo chế độ sáng/tối.
 *
 * ⛔ KHÔNG còn `w-[104px]`: 104 là số đo vừa khít trên máy 360dp và chỉ trên
 * máy 360dp. Bề rộng ô nay do `DemoGrid` cấp qua lớp bọc ngoài, nên ô tự lấy
 * trọn chỗ được chia — xem chú thích đầu `DemoGrid.tsx`.
 */
function Swatch({ name, value }: { name: ThemeColorKey; value: string }) {
  return (
    <View className="gap-3xs">
      <View
        className="h-10 rounded-2xs border-hairline border-border-1"
        style={{ backgroundColor: value }}
      />
      <Text className="text-label-xs text-fg-2" numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}
