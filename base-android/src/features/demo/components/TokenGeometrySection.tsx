import { Text, View } from 'react-native';

import { CONTROL_HEIGHT, RADIUS, SPACING } from '@/shared/theme';

import { DemoGrid } from './DemoGrid';
import { DemoSection } from './DemoSection';

export function TokenGeometrySection() {
  return (
    <DemoSection
      description="Thang bo góc GHI ĐÈ thang của Tailwind — rounded-lg ở đây là 32dp, không phải 8. Class copy từ tài liệu Tailwind sẽ sai ÂM THẦM chứ không gãy."
      title="Bo góc · giãn cách · cỡ control"
    >
      <View className="gap-sm">
        {/* ⛔ Bỏ `w-[76px]`: bảy bậc bo góc × 76 không bao giờ chia hết cho một
            bề rộng nào — 3 cột + dải trống 60dp trên máy 320dp, 4 cột + 40dp
            trên 390dp. Ô 76dp còn quá hẹp cho nhãn `full · 9999`, chữ tràn ra
            hai dòng chỉ ở đúng ô cuối. Chia theo bề rộng thật thì hàng luôn kín
            và nhãn có đủ chỗ. */}
        <DemoGrid label="Bo góc — class rounded-*" minItemWidth={76}>
          {Object.entries(RADIUS).map(([name, value]) => (
            <View key={name} className="items-center gap-3xs">
              <View
                className="h-14 w-full border-hairline border-border-brand bg-surface-primary"
                /* Bo góc đi qua `style`: tên bậc chỉ biết lúc chạy. Giá trị vẫn
                   là số THẬT trong `layout.json`, không phải số chép tay. */
                style={{ borderRadius: value }}
              />
              <Text className="text-label-xs text-fg-2">{`${name} · ${String(value)}`}</Text>
            </View>
          ))}
        </DemoGrid>

        <Text className="text-caption-sm text-fg-2">Giãn cách — class p-* và gap-*</Text>
        <View className="gap-3xs">
          {Object.entries(SPACING).map(([name, value]) => (
            <View key={name} className="flex-row items-center gap-xs">
              {/* ⚠️ `min-w-…` chứ ⛔ không phải `w-[64px]`: đây là khối CHỨA CHỮ.
                  Android cho phóng cỡ chữ hệ thống tới 2× — bề rộng cứng thì
                  nhãn "6xl" bị cắt còn "6x" và người dùng tưởng thiếu token.
                  Sàn 64dp vẫn đủ để mọi thanh đo bắt đầu thẳng hàng ở cỡ chữ
                  mặc định. */}
              <Text className="min-w-[64px] text-label-xs text-fg-2">{name}</Text>
              <View className="h-2 rounded-full bg-action-base" style={{ width: value }} />
              <Text className="text-label-xs text-fg-2">{String(value)}</Text>
            </View>
          ))}
        </View>

        <Text className="text-caption-sm text-fg-2">
          Cỡ control — class h-control-*. ⚠️ Chỉ có ở h-, KHÔNG có min-h-control-*
        </Text>
        <View className="gap-2xs">
          {Object.entries(CONTROL_HEIGHT).map(([name, value]) => (
            <View
              key={name}
              className="flex-row items-center rounded-2xs border-hairline border-border-1 bg-bg-1 px-sm"
              style={{ height: value }}
            >
              <Text className="text-label-xs text-fg-2">{`control-${name} · ${String(value)}dp`}</Text>
            </View>
          ))}
        </View>
      </View>
    </DemoSection>
  );
}
