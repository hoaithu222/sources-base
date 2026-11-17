import { router } from 'expo-router';
import { View } from 'react-native';

import { Alert } from '@/shared/ui/alert';
import { AppBar } from '@/shared/ui/navigation';
import { Screen } from '@/shared/ui/screen';

import { PatternCardsSection } from '../components/PatternCardsSection';
import { PatternLayoutSection } from '../components/PatternLayoutSection';

/**
 * Mẫu bố cục màn hình.
 *
 * Chỗ này trả lời câu hỏi mà danh mục component KHÔNG trả lời được: "ghép chúng
 * lại thành một màn hình thì xếp ra sao". Số đo lấy từ bộ quy định thiết kế của
 * BIDV SmartBanking (xem `docs/rules/webview.md`) và dùng làm THAM CHIẾU — cách
 * chia bố cục là thứ đáng học, mấy con số thì dự án mới phải đối chiếu lại với
 * bản vẽ của chính nó.
 *
 * ── ⛔ Vì sao màn này TẮT `constrained` ─────────────────────────────────────
 * Mặc định `Screen` kẹp nội dung ở 600dp từ bậc `tablet:` — đúng cho màn ĐỌC,
 * sai cho màn có LƯỚI (chính JSDoc của prop đó nói vậy: "tắt cho màn cần tràn
 * hết bề ngang — bảng biểu, lưới ảnh, bản đồ").
 *
 * Ở đây nó không chỉ xấu mà còn SAI: `PatternCardsSection` nới sàn bề rộng ô
 * theo bậc (138 → 170 → 190), nên nếu khung chứa đứng yên ở 568dp thì máy
 * 840dp cho ÍT cột hơn máy 600dp (2 thay vì 3) — lưới đảo bậc, đúng thứ mà
 * chính chú thích của nó nói là phải tránh. Thả trần ra thì khung lớn theo màn
 * và số cột đi đúng chiều: 2 → 3 (600dp) → 4 (840–1000dp).
 */
export function DemoPatternsScreen() {
  return (
    <Screen constrained={false} header={<AppBar title="Mẫu bố cục" onBack={router.back} />}>
      <View className="gap-xl py-xs">
        {/**
         * ⚠️ Chỉ LƯỚI mới cần tràn hết bề ngang. Hai khối dưới đây là CHỮ, nên
         * chúng tự khoác lại đúng cái trần 600dp mà `constrained` vốn lo: bỏ đi
         * thì trên máy tính bảng 1000dp một dòng văn bản kéo dài gần một mét và
         * mắt hết dòng không dò lại được đầu dòng sau.
         *
         * ⛔ Không kèm `self-center`: lưới ở giữa đã chạy sát hai mép, canh giữa
         * hai khối chữ là mép trái của trang nhảy qua nhảy lại giữa các mục.
         */}
        <View className="tablet:max-w-screen-tablet">
          <Alert
            description="Ba tầng cố định: thanh tiêu đề (Screen + AppBar) → vùng nội dung xếp theo mức ưu tiên từ trên xuống → thanh hành động dính đáy. Chính màn hình bạn đang xem cũng dựng đúng như vậy."
            title="Khung ba tầng"
            tone="info"
          />
        </View>

        <PatternCardsSection />

        <View className="tablet:max-w-screen-tablet">
          <PatternLayoutSection />
        </View>
      </View>
    </Screen>
  );
}
