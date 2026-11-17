import { Text, View } from 'react-native';

import { BREAKPOINTS, useBreakpoint, useResponsiveValue } from '@/shared/theme';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/utils/style/cn';

import { DemoSection } from './DemoSection';

/**
 * Thang bậc dựng từ chính `BREAKPOINTS` — ⛔ KHÔNG chép số 390/600/840 vào đây.
 *
 * `BREAKPOINTS` sinh từ `src/styles/layout/layout.json`, cùng nguồn với tiền tố
 * class `tablet:`. Chép số vào trang demo là biến nó thành tài liệu chết: đổi
 * bậc trong JSON thì class đổi theo còn bảng này vẫn khoe số cũ, và người xem
 * tin vào cái sai.
 *
 * Bậc hẹp nhất KHÔNG có trong `BREAKPOINTS` vì nó không có tiền tố class — nó
 * chính là "mọi máy", chỗ mobile-first bắt đầu.
 */
const NARROW_TIER = 'base';

export function DemoBreakpointSection() {
  const { height, isLandscape, tier, width } = useBreakpoint();

  /**
   * ⚠️ Đây là chỗ ĐÚNG để dùng hook: số cột của một danh sách đi vào prop
   * `numColumns`, mà prop đó không nhận `className` nào cả. Chỗ nào có
   * `className` thì ⛔ vẫn phải viết `tablet:flex-row` — xem khối bên dưới.
   */
  const columns = useResponsiveValue({ base: 1, tablet: 2, 'tablet-lg': 3 });

  const tiers = [
    { min: 0, name: NARROW_TIER },
    ...Object.entries(BREAKPOINTS).map(([name, min]) => ({ min, name })),
  ];

  return (
    <DemoSection
      description="Xoay máy, hoặc kéo thanh chia đôi màn hình trên Android, rồi nhìn mục này: mọi con số và cả bố cục bên dưới phải đổi NGAY. Chỗ nào đứng yên là chỗ đó đọc số đo một lần rồi thôi."
      title="Bậc màn hình — hệ breakpoint đang chạy"
    >
      <View className="gap-2xs rounded-sm bg-bg-1 p-md">
        <View className="flex-row items-center justify-between gap-xs">
          <Text className="text-label-lg font-semibold text-fg-1">Bậc hiện tại</Text>
          <Badge label={tier} variant="brand" />
        </View>

        <Text className="text-body-md text-fg-2">
          {`${String(Math.round(width))} × ${String(Math.round(height))}dp`} ·{' '}
          {isLandscape ? 'nằm ngang' : 'dựng đứng'}
        </Text>

        <View className="gap-3xs pt-2xs">
          {tiers.map((row) => (
            <View
              key={row.name}
              className={cn(
                'flex-row items-center justify-between gap-xs rounded-2xs px-sm py-2xs',
                // Bậc đang khớp được tô nền. ⚠️ Chỉ MỘT bậc sáng lên: `tier` là
                // bậc RỘNG NHẤT còn khớp, không phải mọi bậc đã vượt qua.
                row.name === tier ? 'bg-surface-primary' : 'bg-bg-2',
              )}
            >
              <Text className="text-label-md text-fg-1">
                {row.name === NARROW_TIER ? `${row.name} — không tiền tố` : `${row.name}:`}
              </Text>
              <Text className="text-label-sm text-fg-2">
                {row.min === 0 ? `< ${String(BREAKPOINTS.phone)}dp` : `≥ ${String(row.min)}dp`}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="gap-2xs">
        <Text className="text-caption-sm text-fg-2">
          Đổi bố cục bằng CLASS — một cột trên điện thoại, ba cột từ 600dp
        </Text>
        {/* ⛔ Mẫu này cố ý KHÔNG dùng hook: chỗ có `className` thì class là cách
            đúng. Hook vẽ lại cả cây con ở mỗi nhịp đổi kích thước — kéo thanh
            chia đôi màn hình là hàng chục nhịp/giây — còn class thì NativeWind
            xử ở tầng style, không vẽ lại component nào. */}
        <View className="gap-xs tablet:flex-row">
          {['Ưu tiên một', 'Ưu tiên hai', 'Ưu tiên ba'].map((label) => (
            <View
              key={label}
              className="items-center justify-center rounded-2xs border-hairline border-border-brand-subtle bg-surface-primary p-md tablet:flex-1"
            >
              <Text className="text-label-md text-fg-1">{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="gap-2xs">
        <Text className="text-caption-sm text-fg-2">
          Ẩn/hiện theo bậc — ⛔ ở React Native là `hidden tablet:flex`, không có `block`
        </Text>
        <View className="hidden rounded-2xs bg-surface-success px-sm py-xs tablet:flex">
          <Text className="text-label-md text-fg-1">
            Khối này chỉ có mặt từ bậc tablet trở lên.
          </Text>
        </View>
        <View className="rounded-2xs bg-surface-neutral px-sm py-xs tablet:hidden">
          <Text className="text-label-md text-fg-1">
            Khối này biến mất khi màn rộng tới bậc tablet.
          </Text>
        </View>
      </View>

      <View className="gap-2xs">
        <Text className="text-caption-sm text-fg-2">
          Hướng máy — `landscape:` và `portrait:` của Tailwind vẫn còn nguyên
        </Text>
        <View className="rounded-2xs bg-surface-info px-sm py-xs landscape:hidden">
          <Text className="text-label-md text-fg-1">Đang DỰNG ĐỨNG. Xoay ngang đi.</Text>
        </View>
        <View className="rounded-2xs bg-surface-warning px-sm py-xs portrait:hidden">
          <Text className="text-label-md text-fg-1">Đang NẰM NGANG.</Text>
        </View>
      </View>

      <Text className="text-caption-lg text-fg-2">
        Prop không nhận className (numColumns, numberOfLines…) thì mới dùng hook. Ở bậc hiện tại,
        useResponsiveValue trả về <Text className="font-semibold text-fg-1">{columns}</Text> cột.
      </Text>
    </DemoSection>
  );
}
