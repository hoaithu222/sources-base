import { router } from 'expo-router';
import { View } from 'react-native';

import { AppBar } from '@/shared/ui/navigation';
import { Screen } from '@/shared/ui/screen';

import { DemoBreakpointSection } from '../components/DemoBreakpointSection';
import { TokenColorsSection } from '../components/TokenColorsSection';
import { TokenGeometrySection } from '../components/TokenGeometrySection';
import { TokenIconsSection } from '../components/TokenIconsSection';
import { TokenTypographySection } from '../components/TokenTypographySection';

/**
 * Nền tảng — bày ra hệ token đang chạy.
 *
 * Mọi con số trên màn này đọc từ `src/styles/*.json` qua file sinh, nên trang
 * không bao giờ lệch với thực tế: sửa token rồi chạy generator là nó đổi theo.
 * ⛔ Đừng chép số vào đây để "cho nhanh" — lúc đó nó thành tài liệu chết.
 *
 * ⚠️ Mục breakpoint đứng ĐẦU có chủ đích: nó là mục duy nhất phản ứng ngay khi
 * xoay máy, nên để người mở trang gặp nó trước thì họ tự thử xoay và tự thấy cả
 * trang co giãn thật, không phải đọc lời hứa.
 */
export function DemoFoundationScreen() {
  return (
    <Screen header={<AppBar title="Nền tảng (token)" onBack={router.back} />}>
      <View className="gap-xl py-xs">
        <DemoBreakpointSection />
        <TokenColorsSection />
        <TokenTypographySection />
        <TokenGeometrySection />
        <TokenIconsSection />
      </View>
    </Screen>
  );
}
