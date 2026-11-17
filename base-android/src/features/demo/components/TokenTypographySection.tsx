import { Text, View } from 'react-native';

import { TEXT_STYLES, TYPOGRAPHY_ROLES } from '@/shared/theme';

import { DemoSection } from './DemoSection';

/** Câu mẫu có ĐỦ dấu chồng hai tầng — chỗ Android hay cắt cụt nếu lineHeight sát quá. */
const SAMPLE = 'Ngân hàng Việt — Ẳ Ộ Ữ 0123';

export function TokenTypographySection() {
  return (
    <DemoSection
      description="Thang theo VAI TRÒ, và nó THAY THẾ thang mặc định của Tailwind — text-sm / text-lg không tồn tại. Số trong ngoặc là cỡ/lineHeight thật, đọc từ typography.json."
      title="Thang chữ"
    >
      <View className="gap-sm">
        {TYPOGRAPHY_ROLES.map((role) => {
          const style = TEXT_STYLES[role];

          return (
            <View key={role} className="gap-3xs">
              <Text className="text-label-xs text-fg-2">
                {`text-${role} · ${String(style.fontSize)}/${String(style.lineHeight)}`}
              </Text>
              {/**
               * ⚠️ Ở ĐÂY dùng `style` chứ không dùng `className={\`text-${role}\`}`
               * vì tên vai trò chỉ biết lúc chạy — cùng lý do với ô màu.
               * `TEXT_STYLES` sinh từ chính `typography.json`, nên con số hiện ra
               * luôn là con số thật, kể cả sau khi ai đó đổi thang.
               *
               * ⛔ KHÔNG `numberOfLines={1}` ở đây. Câu mẫu dài 27 ký tự, còn
               * vai trò `display` là 36px: trên MỌI điện thoại nó không đủ một
               * dòng, nên vai trò LỚN NHẤT của thang là vai trò duy nhất không
               * bao giờ xem trọn được — đúng thứ mục này sinh ra để bày. Cho
               * xuống dòng còn tiện thêm một việc: `lineHeight` in ở nhãn trên
               * chỉ kiểm chứng được khi có từ hai dòng trở lên.
               */}
              <Text style={style}>{SAMPLE}</Text>
            </View>
          );
        })}
      </View>
    </DemoSection>
  );
}
