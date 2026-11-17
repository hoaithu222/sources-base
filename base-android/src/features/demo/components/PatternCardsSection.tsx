import { ScrollView, Text, View } from 'react-native';

import { useResponsiveValue } from '@/shared/theme';
import { Card, Thumbnail } from '@/shared/ui/card';
import { SliderDot } from '@/shared/ui/pagination';

import { CARD_TYPE_2_MIN_WIDTH } from '../utils/grid-columns';
import { DemoGrid } from './DemoGrid';
import { DemoSection } from './DemoSection';

/**
 * Số đo bóc từ bộ slide "Quy định hiển thị các màn hình webview" của BIDV
 * SmartBanking (Figma `JKRCweXTvHehczYn87NOWK`, section `193:25214`).
 *
 * ⚠️ THAM CHIẾU, không phải luật của base. Dự án khác thì đối chiếu lại với bản
 * vẽ của chính nó — xem `docs/rules/webview.md`. Giữ lại ở đây vì hai lý do
 * đáng học: banner khoá TỈ LỆ chứ không khoá pixel, và bề rộng cột tính RA chứ
 * không viết cứng.
 *
 * ⛔ **Ô ảnh dùng `<Thumbnail>`, KHÔNG dựng tay.** File này từng chép lại bố
 * cục ô ảnh ba lần với ba giá trị KHÁC nhau (nền `bg-3` thay vì `bg-2`, glyph
 * 40/32/28 thay vì cỡ cố định 40, và không có nhánh `onError`) — bản thứ ba của
 * cùng một thứ, ngay tại màn mà người ta vào để ĐỐI CHIẾU. `Thumbnail` nhận
 * `source` tuỳ chọn nên không cần ảnh mẫu vẫn dựng được ô giữ chỗ.
 *
 * Mục này minh hoạ LUẬT LƯỚI (tỉ lệ, số cột, cách cuộn ngang); thẻ có ảnh ở màn
 * hình THẬT thì dùng `<MediaCard>`.
 */
const CARD_TYPE_1_WIDTH = 276; // slide 5: "W: 276px"
const GRID_GAP = 12; // slide 5: 12px giữa hai cột
const SCREEN_PADDING = 16; // lề ngang của mọi khung nội dung

export function PatternCardsSection() {
  const cardType2MinWidth = useResponsiveValue(CARD_TYPE_2_MIN_WIDTH);

  return (
    <DemoSection
      description="Bản vẽ tham chiếu chỉ cho phép HAI loại card. Không có loại thứ ba — thêm một cỡ nữa là bắt đầu mỗi màn một kiểu."
      title="Banner và card thông tin"
    >
      <View className="gap-2xs">
        <Text className="text-caption-sm text-fg-2">
          Banner — khoá TỈ LỆ 343:192, ⛔ không khoá pixel
        </Text>
        <Thumbnail aspect="banner" className="border-hairline border-border-1" />
        {/* Slide 4: từ 2 ảnh trở lên thì phải có chấm chỉ vị trí dưới banner. */}
        <SliderDot activeIndex={0} className="self-center" count={3} />
      </View>

      <View className="gap-2xs">
        <Text className="text-caption-sm text-fg-2">Loại 1 — rộng 276, cuộn ngang</Text>
        {/**
         * ⚠️ 276 là bề rộng CỐ ĐỊNH và cố ý giữ nguyên — bản vẽ khoá con số này,
         * và hàng này CUỘN NGANG nên bề rộng cứng không gây tràn như ở lưới.
         *
         * Đã kiểm lại trên máy hẹp nhất 320dp: vùng cuộn chạy sát hai mép màn
         * (`-mx-md`) nên card đầu nằm ở 16 → 292, card kế bắt đầu ở 304 và còn
         * 16dp lộ ra ngoài mép phải — đúng tín hiệu "còn cuộn được nữa" mà bản
         * vẽ muốn. ⛔ Dưới 292dp bề rộng màn (chia đôi màn hình rất hẹp) thì
         * card chạm mép và tín hiệu đó mất; lúc đó phải đổi sang lưới dọc,
         * ⛔ không phải thu nhỏ card.
         */}
        <ScrollView
          /* `-mx-md` kéo vùng cuộn ra sát mép màn: hàng card ngang phải chạy hết
             bề ngang, còn lề 16 thì trả lại bằng padding của chính ScrollView. */
          className="-mx-md"
          contentContainerStyle={{ gap: GRID_GAP, paddingHorizontal: SCREEN_PADDING }}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {[1, 2, 3].map((index) => (
            // ⛔ Bề rộng đặt ở lớp BỌC NGOÀI `Card`, không phải bên trong nó.
            // Gốc `Card` là `w-full` (= 100%), mà phần trăm thì Yoga giải theo bề
            // rộng của CHA. Cha ở đây là khung nội dung của một `ScrollView` NẰM
            // NGANG — trục chính không có bề rộng xác định, nên `100%` giải ra
            // cái gì là tuỳ phiên bản, và cách hỏng thì im lặng: thẻ rộng bằng cả
            // màn trong khi ruột chỉ 276, ra một mảng trắng thừa bên phải mỗi thẻ.
            // Bọc ngoài một `<View>` có bề rộng THẬT thì `w-full` luôn có mốc để
            // bám — cùng cách `DemoGrid` cấp bề rộng ô cho lưới bên dưới.
            <View key={index} style={{ width: CARD_TYPE_1_WIDTH }}>
              <Card className="overflow-hidden" padded={false}>
                {/* ⚠️ Vẫn giữ MỘT `<View>` bọc trong: gốc `Card` có `gap-sm`, bỏ
                    lớp này đi là ảnh và cụm chữ tách nhau 12dp — bản vẽ cho chúng
                    dính liền. */}
                <View>
                  <Thumbnail aspect="wide" className="rounded-none" />
                  <View className="gap-2xs p-sm">
                    <Text className="text-label-lg font-semibold text-fg-1">Ưu đãi {index}</Text>
                    <Text className="text-body-md text-fg-2">Giảm 100.000 ₫ khi nạp tiền</Text>
                  </View>
                </View>
              </Card>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Sáu ô thay vì bốn: bốn ô trên máy tính bảng 840dp+ vừa đúng một hàng,
          không còn thấy lưới xuống dòng ra sao.

          ⛔ Lưới này chỉ đúng khi màn hình chứa nó đặt `<Screen constrained={false}>`
          — `DemoPatternsScreen` có. Bật lại trần 600dp là khung đứng yên ở 568dp
          trong khi sàn `CARD_TYPE_2_MIN_WIDTH` vẫn nới theo bậc, và số cột ĐẢO:
          3 cột ở 600dp nhưng 2 cột ở 840dp. Xem `../utils/grid-columns.ts`. */}
      <DemoGrid
        gap={GRID_GAP}
        label="Loại 2 — lưới xuống dòng, ảnh vuông 1:1, số cột TÍNH RA từ bề rộng khung"
        metrics
        minItemWidth={cardType2MinWidth}
      >
        {[1, 2, 3, 4, 5, 6].map((index) => (
          // ⛔ Không đặt bề rộng ở đây nữa: `DemoGrid` cấp bề rộng ô qua lớp bọc
          // ngoài, và gốc `Card` vốn đã `w-full` nên thẻ tự lấp trọn ô.
          // ⚠️ Vẫn giữ MỘT `<View>` bọc trong: gốc `Card` có `gap-sm`, bỏ lớp
          // này đi là ảnh và cụm chữ tách nhau 12dp — bản vẽ cho chúng dính liền.
          <Card key={index} className="overflow-hidden" padded={false}>
            <View>
              <Thumbnail aspect="square" className="rounded-none" />
              <View className="gap-2xs p-sm">
                <Text className="text-label-md font-semibold text-fg-1" numberOfLines={2}>
                  Quà tặng {index}
                </Text>
                <Text className="text-caption-lg text-fg-2">500.000 điểm</Text>
              </View>
            </View>
          </Card>
        ))}
      </DemoGrid>
    </DemoSection>
  );
}
