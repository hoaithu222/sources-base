import { renderHook } from '@testing-library/react-native';
import { useWindowDimensions } from 'react-native';

import { CARD_TYPE_2_MIN_WIDTH, gridColumns } from '@/features/demo/utils/grid-columns';
import { useResponsiveValue } from '@/shared/theme';

/**
 * Lưới card của trang demo — điều kiện DUY NHẤT nó phải giữ: **số cột không bao
 * giờ giảm khi màn hình rộng ra**.
 *
 * ⛔ Đã có lúc nó sai đúng chiều ngược lại: sàn bề rộng ô nới theo bậc
 * (138 → 170 → 190) trong khi khung chứa bị `Screen` kẹp cứng ở 568dp, nên máy
 * 840dp cho 2 cột còn máy 600dp cho 3. Không lỗi nào báo — `tsc`, `eslint`,
 * `check:classes` đều mù với một phép chia. Chỉ có test này bắt được.
 */

/**
 * ⛔ Mock ở tầng MODULE của React Native, không mock `Dimensions` — lý do đầy
 * đủ ở `tests/theme/breakpoints.test.ts`.
 */
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedUseWindowDimensions = useWindowDimensions as jest.MockedFunction<
  typeof useWindowDimensions
>;

function setWindow(width: number, height = 900) {
  mockedUseWindowDimensions.mockReturnValue({ width, height, scale: 2, fontScale: 1 });
}

/** Cùng con số với `PatternCardsSection`: khe 12dp, lề ngang 16dp của `Screen`. */
const GRID_GAP = 12;
const SCREEN_PADDING = 16;

/**
 * Bề rộng khung chứa lưới trên một màn `<Screen constrained={false} padded>`.
 *
 * ⚠️ Không trừ vùng an toàn: nó chỉ làm khung HẸP đi vài dp và không đổi chiều
 * của phép so sánh mà test này quan tâm.
 */
const containerFor = (screenWidth: number): number => screenWidth - SCREEN_PADDING * 2;

/** Số cột thật sự hiện ra ở một bề rộng màn hình — đi qua chính hook của base. */
async function columnsAt(screenWidth: number): Promise<number> {
  setWindow(screenWidth);
  const { result } = await renderHook(() => useResponsiveValue(CARD_TYPE_2_MIN_WIDTH));
  return gridColumns(containerFor(screenWidth), result.current, GRID_GAP);
}

describe('lưới card loại 2 — bốn cỡ màn bắt buộc phải thử', () => {
  it.each([
    [320, 2], // máy hẹp nhất — vẫn phải giữ đúng 2 cột của bản vẽ
    [390, 2], // điện thoại mốc chuẩn
    [600, 3], // máy tính bảng (sw600dp)
    [840, 4], // máy tính bảng nằm ngang (sw840dp)
    [1000, 4], // ⛔ KHÔNG được là 2 cột khổng lồ
  ])('màn %idp ⇒ %i cột', async (screenWidth, expected) => {
    expect(await columnsAt(screenWidth)).toBe(expected);
  });
});

describe('số cột KHÔNG BAO GIỜ giảm khi màn rộng ra', () => {
  /**
   * Quét cả thang, dày ở hai NGƯỠNG BẬC (600 và 840) vì đó là chỗ sàn nhảy một
   * nấc — và cũng đúng chỗ lỗi cũ nằm.
   */
  const widths = [
    ...Array.from({ length: 61 }, (_, index) => 320 + index * 16),
    389,
    390,
    599,
    600,
    601,
    839,
    840,
    841,
    1000,
    1280,
  ].sort((a, b) => a - b);

  it('quét từ 320dp tới 1280dp, không có bề rộng nào tụt cột', async () => {
    const measured: { columns: number; width: number }[] = [];
    for (const width of widths) {
      measured.push({ columns: await columnsAt(width), width });
    }

    /**
     * So cả DÃY với chính nó đã lấy max luỹ tiến, thay vì so từng cặp liền kề:
     * lúc đỏ, Jest in ra đúng bề rộng nào tụt và tụt xuống mấy cột — chứ không
     * phải một dòng "2 không bằng 3" rồi phải tự dò lại cả thang.
     */
    let ceiling = 0;
    const nonDecreasing = measured.map(({ width }, index) => {
      ceiling = Math.max(ceiling, measured[index]?.columns ?? 0);
      return { columns: ceiling, width };
    });

    expect(measured).toEqual(nonDecreasing);
  });
});

describe('vì sao màn demo phải đặt Screen constrained={false}', () => {
  /**
   * Đây là LỖI CŨ được đóng khung lại: khi `Screen` kẹp nội dung ở 600dp thì
   * khung chứa đứng yên ở 568dp ở MỌI máy tính bảng, trong khi sàn vẫn nới theo
   * bậc. Kết quả là bậc rộng hơn cho ÍT cột hơn.
   *
   * ⛔ Test này KHÔNG mô tả hành vi mong muốn — nó chốt lý do `constrained`
   * phải tắt. Ai bật lại trần cho màn lưới thì đọc ngay được hậu quả ở đây.
   */
  it('khung bị kẹp 568dp: bậc tablet cho 3 cột nhưng tablet-lg chỉ còn 2', () => {
    const CLAMPED_CONTAINER = 600 - SCREEN_PADDING * 2;

    expect(gridColumns(CLAMPED_CONTAINER, 170, GRID_GAP)).toBe(3);
    expect(gridColumns(CLAMPED_CONTAINER, 190, GRID_GAP)).toBe(2);
  });

  it('thả trần ra: máy 840dp lên 4 cột đúng như chú thích hứa', () => {
    expect(gridColumns(containerFor(840), 190, GRID_GAP)).toBe(4);
  });
});

describe('gridColumns', () => {
  /** Nhịp vẽ đầu tiên chưa có số đo — `DemoGrid` cố ý để ô rơi về bề rộng tự nhiên. */
  it('chưa đo được khung ⇒ 0 cột', () => {
    expect(gridColumns(0, 138, GRID_GAP)).toBe(0);
  });

  /** Khung hẹp hơn cả một ô vẫn phải cho MỘT cột — 0 cột là lưới biến mất. */
  it('khung hẹp hơn một ô vẫn cho 1 cột', () => {
    expect(gridColumns(100, 138, GRID_GAP)).toBe(1);
  });

  /** N ô thì chỉ có N−1 khe: không cộng bù là thiếu đúng một ô ở bề rộng vừa khít. */
  it('cộng bù khe cuối — 288dp vừa đúng hai ô 138 + một khe 12', () => {
    expect(gridColumns(288, 138, GRID_GAP)).toBe(2);
  });
});
