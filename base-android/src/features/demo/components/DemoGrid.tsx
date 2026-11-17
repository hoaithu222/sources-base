import { Children, useState, type ReactNode } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';

import { SPACING } from '@/shared/theme';

import { gridColumns } from '../utils/grid-columns';

/**
 * Lưới chia cột theo BỀ RỘNG THẬT của khung chứa.
 *
 * ── Vì sao có component cục bộ này (⛔ luật: tra `src/shared/ui/` trước) ─────
 * Đã tra `src/shared/ui/index.ts`: bộ chung KHÔNG có component lưới nào
 * (`Card`, `ListItem`, `Tabs`… đều là nội dung, không phải bố cục). Cả thư mục
 * `src/features/demo/` là ⛔ ĐỒ BỎ ĐI khi giao dự án thật, nên đưa một helper
 * bố cục chỉ phục vụ trang demo lên `src/shared/ui/` là để lại rác cho dự án
 * thật. Vì vậy nó nằm ở đây và ⛔ không được import ra ngoài feature demo.
 *
 * ── Vì sao ĐO thay vì viết `w-[104px]` ──────────────────────────────────────
 * Bề rộng cứng hỏng ở CẢ HAI đầu thang:
 *   ❌ máy 320dp — 3 ô × 104 + 2 khe 8 = 328 > 288dp khung nội dung ⇒ chỉ còn
 *      2 ô/hàng và dư một dải trống 80dp bên phải;
 *   ❌ máy tính bảng 1000dp — 9 ô/hàng rồi dư 100dp, hoặc tệ hơn là ô vẫn 104
 *      trong khi khung rộng gấp ba.
 * Đo khung rồi chia là đúng ở mọi bề rộng, kể cả bề rộng KHÔNG PHẢI bề rộng màn
 * hình (ô này nằm trong `Card`, trong chia đôi màn hình, trong bottom sheet).
 *
 * ⛔ Vì vậy KHÔNG dùng `Dimensions.get()` và cũng không dùng `useWindowDimensions`
 * ở đây: cả hai trả về bề rộng MÀN HÌNH, không phải bề rộng khung chứa — lệch
 * đúng bằng phần lề mà nơi gọi tình cờ đang có.
 *
 * ⚠️ Nhịp vẽ ĐẦU TIÊN chưa có số đo (`onLayout` chỉ chạy sau khi bố cục xong),
 * nên ô rơi về bề rộng tự nhiên đúng một khung hình rồi mới vào lưới. Cố ý
 * KHÔNG ẩn nội dung trong nhịp đó: trên trang cuộn dài, một mảng trống chớp lên
 * dễ thấy hơn nhiều so với một lần sắp lại.
 */
interface DemoGridProps {
  children: ReactNode;
  /** Khe giữa hai ô. Mặc định `SPACING.xs` = 8dp — cùng số với class `gap-xs`. */
  gap?: number;
  /** Nhãn đứng trên lưới, giống `DemoRow` — để nơi gọi khỏi tự dựng lại. */
  label?: string;
  /**
   * Hiện dòng "N cột × Xdp" dưới lưới. Chỉ bật ở mục demo đang NÓI VỀ chính
   * phép chia cột — xoay máy là thấy số đổi, đó là bằng chứng bố cục sống thật.
   */
  metrics?: boolean;
  /**
   * Bề rộng TỐI THIỂU của một ô. Số cột suy ra từ đây, nên đây là con số duy
   * nhất nơi gọi phải nghĩ: "ô này hẹp hơn ngần này thì chữ bị cắt".
   */
  minItemWidth: number;
}

export function DemoGrid({
  children,
  gap = SPACING.xs,
  label,
  metrics = false,
  minItemWidth,
}: DemoGridProps) {
  const [width, setWidth] = useState(0);

  /**
   * ⚠️ Chặn cập nhật khi lệch dưới 1dp. `onLayout` bắn lại sau mỗi lần vẽ, và
   * bề rộng đo được hay lệch vài phần nghìn dp do làm tròn pixel — không chặn
   * thì `setState` chạy vòng vô tận và màn hình đứng hình.
   */
  const handleLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    setWidth((previous) => (Math.abs(previous - next) < 1 ? previous : next));
  };

  // Phép chia nằm ở `../utils/grid-columns` để test được ⛔ điều kiện "số cột
  // KHÔNG BAO GIỜ giảm khi màn rộng ra" — thứ đã từng sai âm thầm ở đây.
  const columns = gridColumns(width, minItemWidth, gap);
  const itemWidth = columns > 0 ? (width - gap * (columns - 1)) / columns : undefined;

  return (
    <View className="gap-2xs">
      {label ? <Text className="text-caption-sm text-fg-2">{label}</Text> : null}

      <View className="flex-row flex-wrap" style={{ gap }} onLayout={handleLayout}>
        {Children.toArray(children).map((child, index) => (
          // Danh sách tĩnh, không sắp xếp lại và không thêm/bớt giữa chừng ⇒
          // khoá theo vị trí là an toàn.
          <View key={index} style={{ width: itemWidth }}>
            {child}
          </View>
        ))}
      </View>

      {metrics && itemWidth !== undefined ? (
        <Text className="text-label-xs text-fg-2">
          {`${String(columns)} cột × ${String(Math.round(itemWidth))}dp — tính từ ${String(Math.round(width))}dp khung chứa`}
        </Text>
      ) : null}
    </View>
  );
}
