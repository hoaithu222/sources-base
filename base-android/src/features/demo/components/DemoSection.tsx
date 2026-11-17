import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

/**
 * Khung một mục trong thư viện component.
 *
 * ⚠️ CỐ Ý không dùng `Card` của bộ chung. Trang demo phải bày ra chính các
 * component trên nền của màn hình; bọc chúng trong `Card` là thêm một lớp nền
 * và một lớp bo góc không có trong bản vẽ của chúng, và người xem sẽ tưởng đó
 * là hình dáng thật của component.
 *
 * Cả thư mục `src/features/demo/` là ⛔ ĐỒ BỎ ĐI khi giao dự án thật — xem
 * `PATHS.DEMO`. Vì vậy ở đây không có gì được import ngược từ feature khác.
 */
export function DemoSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  /** Một câu nói rõ khi nào DÙNG component này — không mô tả lại hình dáng. */
  description?: string;
  title: string;
}) {
  return (
    <View className="gap-sm">
      <View className="gap-3xs">
        {/* `header` để trình đọc màn hình nhảy được giữa các mục thay vì đọc
            tuần tự cả trang — trang này rất dài. */}
        <Text accessibilityRole="header" className="text-label-lg font-semibold text-fg-1">
          {title}
        </Text>
        {description ? <Text className="text-caption-lg text-fg-2">{description}</Text> : null}
      </View>
      {children}
    </View>
  );
}
