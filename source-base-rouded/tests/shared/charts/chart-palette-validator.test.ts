/**
 * Bảng màu chart ĐÃ QUA validator (skill dataviz, `validate_palette.js`) — khoá kết quả bằng máy.
 *
 * ── Vì sao cần bài kiểm này ──────────────────────────────────────────────────
 * "Trông đủ khác nhau" không phải bằng chứng: mô phỏng mù màu đỏ–lục làm cam ↔ lục ↔ đỏ dồn về cùng một vàng
 * đục mà mắt thường không thấy. Bài này chạy ĐÚNG công thức của validator (ΔE OKLab ×100, Machado 2009 mức 1.0)
 * trên hex ĐÃ GIẢI của từng theme: ai đổi một bậc trong `colors-theme.json` hay `CHART_SERIES_TOKENS` mà làm
 * tụt ngưỡng thì đỏ ở đây, không phải lúc khách hàng mù màu báo lỗi. Số "đã ghim" là số validator in ra khi
 * chọn bảng (chart-conventions.md §1.2.1) — chúng khớp từng chữ số nên `chart-color-distance.utils` đúng.
 *
 * Ngưỡng: dải L light 0.43–0.77 · dark 0.48–0.67; C ≥ 0.10; ΔE mù màu kề nhau ≥ 8 (mục tiêu) · mắt thường ≥ 15;
 * tương phản ≥ 3:1 (dưới mức đó phải có nhãn trực tiếp / bảng số — `RELIEF` liệt kê token được phép).
 */

import { describe, expect, it } from 'vitest';

import {
  CHART_DIVERGING_MID_INDEX,
  CHART_DIVERGING_TOKENS,
  CHART_OTHER_TOKEN,
  CHART_SEMANTIC,
  CHART_SEQUENTIAL_TOKENS,
  CHART_SERIES_TOKENS,
  CHART_STATUS,
  contrastRatio,
  deltaE,
  oklchOf,
  worstCvdDeltaE,
  worstDeltaE,
} from '@/shared/charts';
import { DARK_COLORS, LIGHT_COLORS, type ThemeColorKey } from '@/shared/theme';
import { ROOT_FILES } from '@tests/helpers/source-files';

type Mode = 'light' | 'dark';

const PALETTES: Record<Mode, Record<ThemeColorKey, string>> = {
  light: LIGHT_COLORS,
  dark: DARK_COLORS,
};
const BAND: Record<Mode, readonly [number, number]> = { light: [0.43, 0.77], dark: [0.48, 0.67] };
const MODES: readonly Mode[] = ['light', 'dark'];

const hexes = (mode: Mode, tokens: readonly string[]) =>
  tokens.map((token) => PALETTES[mode][token as ThemeColorKey]);
const surface = (mode: Mode) => PALETTES[mode]['bg-surface'];

/** Token dưới 3:1 trên nền SÁNG — được phép vì luôn đi kèm nhãn trực tiếp / chữ / icon (quy tắc "relief"). */
const LIGHT_RELIEF = new Set<string>([CHART_STATUS.done, CHART_STATUS.slow]);

describe.each(MODES)('8 slot series — theme %s', (mode) => {
  const series = hexes(mode, CHART_SERIES_TOKENS);

  it('mọi slot trong dải sáng L và đủ bão hoà (không đọc thành xám)', () => {
    const [lo, hi] = BAND[mode];
    const bad = series
      .map((hex, i) => ({ token: CHART_SERIES_TOKENS[i], ...oklchOf(hex) }))
      .filter(({ l, c }) => l < lo || l > hi || c < 0.1)
      .map(({ token, l, c }) => `${token} L${l.toFixed(3)} C${c.toFixed(3)}`);
    expect(bad).toEqual([]);
  });

  it('cặp kề nhau: mù màu đỏ–lục ≥ 8, mắt thường ≥ 15 — số đã ghim từ validator', () => {
    expect(worstCvdDeltaE(series)).toBeCloseTo(21.1, 1);
    expect(worstDeltaE(series)).toBeCloseTo(28.4, 1);
  });

  it('vòng donut khép kín: slot 8 ↔ slot 1 cũng đủ xa (lát đầu và lát cuối chạm nhau)', () => {
    const ring = [series[7], series[0]];
    expect(worstCvdDeltaE(ring)).toBeGreaterThanOrEqual(8);
    expect(worstDeltaE(ring)).toBeGreaterThanOrEqual(15);
  });

  it('3 slot đầu đạt cả kiểm MỌI CẶP — scatter / bản đồ / small multiples chịu được 3 series', () => {
    const first3 = series.slice(0, 3);
    expect(worstCvdDeltaE(first3, 'all')).toBeCloseTo(8.4, 1);
    expect(worstDeltaE(first3, 'normal', 'all')).toBeCloseTo(19.9, 1);
  });

  it('tương phản với nền chart ≥ 3:1 (trừ token trong danh sách relief của nền sáng)', () => {
    const low = CHART_SERIES_TOKENS.filter(
      (token, i) =>
        contrastRatio(series[i], surface(mode)) < 3 &&
        !(mode === 'light' && LIGHT_RELIEF.has(token)),
    );
    expect(low).toEqual([]);
  });

  it('"Khác" xám đủ thấy trên nền và tách khỏi slot cuối', () => {
    const other = hexes(mode, [CHART_OTHER_TOKEN])[0];
    expect(contrastRatio(other, surface(mode))).toBeGreaterThanOrEqual(3);
    expect(oklchOf(other).c).toBeLessThan(0.05);
    expect(worstDeltaE([series[7], other])).toBeGreaterThanOrEqual(15);
    expect(worstCvdDeltaE([series[7], other])).toBeGreaterThanOrEqual(8);
  });
});

describe('contrast thấp nhất đã ghim', () => {
  it('nền sáng: vàng kim yellow-7 3,35:1 là điểm thấp nhất của 8 slot — cả 8 slot đều ≥ 3:1, không cần relief', () => {
    const ratios = hexes('light', CHART_SERIES_TOKENS).map((h) =>
      contrastRatio(h, surface('light')),
    );
    expect(Math.min(...ratios)).toBeCloseTo(3.35, 2);
  });
});

describe.each(MODES)('trạng thái & kế hoạch/thực tế — theme %s', (mode) => {
  const status = hexes(mode, [
    CHART_STATUS.done,
    CHART_STATUS.running,
    CHART_STATUS.slow,
    CHART_STATUS.late,
  ]);
  const semantic = hexes(mode, [
    CHART_SEMANTIC.plan,
    CHART_SEMANTIC.actual,
    CHART_SEMANTIC.forecast,
  ]);

  it('4 trạng thái: cặp kề (xong→đang làm→chậm→trễ) đủ khác — cam ↔ đỏ là cặp yếu nhất', () => {
    expect(worstCvdDeltaE(status)).toBeCloseTo(15.7, 1);
    expect(worstDeltaE(status)).toBeCloseTo(18.4, 1);
    expect(worstDeltaE(status, 'normal', 'all')).toBeGreaterThanOrEqual(15);
  });

  it('mọi cặp trạng thái mù màu ≥ 6 (sàn — luôn kèm chữ / icon); xong ↔ chậm là cặp sát sàn', () => {
    expect(worstCvdDeltaE(status, 'all')).toBeGreaterThanOrEqual(6);
  });

  it('kế hoạch / thực tế / dự báo: mắt thường ≥ 15 giữa mọi cặp (nét đứt / liền là kênh phụ cho mù màu)', () => {
    expect(worstDeltaE(semantic, 'normal', 'all')).toBeGreaterThanOrEqual(15);
    expect(worstCvdDeltaE(semantic, 'all')).toBeGreaterThanOrEqual(6);
  });

  it('tương phản nền ≥ 3:1 (nền sáng: xong / chậm là relief — luôn kèm chữ)', () => {
    const tokens = [...Object.values(CHART_STATUS), ...Object.values(CHART_SEMANTIC)];
    const low = tokens.filter(
      (token) =>
        contrastRatio(hexes(mode, [token])[0], surface(mode)) < 3 &&
        !(mode === 'light' && LIGHT_RELIEF.has(token)),
    );
    expect(low).toEqual([]);
  });

  it('trạng thái KHÔNG trùng hex với series (không mạo danh danh tính)', () => {
    const seriesHex = new Set(hexes(mode, CHART_SERIES_TOKENS));
    expect(status.filter((hex) => seriesHex.has(hex))).toEqual([]);
  });
});

describe.each(MODES)('sequential — theme %s', (mode) => {
  const seq = hexes(mode, CHART_SEQUENTIAL_TOKENS);
  const lightness = seq.map((hex) => oklchOf(hex).l);

  it('≥ 5 bậc, không trùng màu', () => {
    expect(seq.length).toBeGreaterThanOrEqual(5);
    expect(new Set(seq).size).toBe(seq.length);
  });

  it('đơn điệu theo ĐỘ LỚN: light thấp → cao = sáng → tối, dark đảo neo (thấp = gần nền = tối)', () => {
    const sign = mode === 'light' ? -1 : 1;
    const gaps = lightness.slice(1).map((l, i) => (l - lightness[i]) * sign);
    expect(gaps.every((gap) => gap >= 0.06)).toBe(true);
  });

  it('một hue (độ lệch hue ≤ 40°)', () => {
    const hues = seq.map((hex) => oklchOf(hex).h);
    expect(Math.max(...hues) - Math.min(...hues)).toBeLessThanOrEqual(40);
  });

  it('đầu "gần 0" vẫn tách khỏi nền (≥ 1,2:1 sáng · ≥ 2:1 tối); đầu "cao" tương phản mạnh (≥ 4,5:1)', () => {
    const low = contrastRatio(seq[0], surface(mode));
    const high = contrastRatio(seq[seq.length - 1], surface(mode));
    expect(low).toBeGreaterThanOrEqual(mode === 'light' ? 1.2 : 2);
    expect(high).toBeGreaterThanOrEqual(4.5);
  });
});

describe.each(MODES)('diverging — theme %s', (mode) => {
  const div = hexes(mode, CHART_DIVERGING_TOKENS);
  const mid = CHART_DIVERGING_MID_INDEX;
  const neg = div.slice(0, mid);
  const pos = div.slice(mid + 1);

  it('7 bậc: 3 mỗi phía + trung tính giữa, mọi bậc khác nhau', () => {
    expect(div).toHaveLength(7);
    expect(neg).toHaveLength(pos.length);
    expect(new Set(div).size).toBe(7);
  });

  it('điểm giữa là xám slate của hệ (C < 0.05, không mang hue), hai phía là hai hue ngược nhau (lạnh ↔ nóng)', () => {
    expect(oklchOf(div[mid]).c).toBeLessThan(0.05);
    const hueOf = (hex: string) => oklchOf(hex).h;
    expect(hueOf(neg[0])).toBeGreaterThan(200);
    expect(hueOf(neg[0])).toBeLessThan(290);
    expect(hueOf(pos[pos.length - 1])).toBeLessThan(40);
  });

  it('mỗi nhánh đơn điệu về độ sáng khi đi vào giữa; hai nhánh cân xứng (ΔL ≤ 0.1)', () => {
    const l = div.map((hex) => oklchOf(hex).l);
    const towardMid = mode === 'light' ? 1 : -1;
    for (let i = 0; i < mid - 1; i += 1) {
      expect((l[i + 1] - l[i]) * towardMid).toBeGreaterThan(0);
      expect((l[div.length - 2 - i] - l[div.length - 1 - i]) * towardMid).toBeGreaterThan(0);
    }
    neg.forEach((_, i) => expect(Math.abs(l[i] - l[div.length - 1 - i])).toBeLessThanOrEqual(0.1));
  });

  it('hai cực tách xa cả với mù màu (lạnh ↔ nóng không bao giờ dồn về một màu)', () => {
    const extremes = [neg[0], pos[pos.length - 1]];
    expect(worstDeltaE(extremes)).toBeGreaterThanOrEqual(30);
    expect(worstCvdDeltaE(extremes)).toBeGreaterThanOrEqual(20);
  });

  it('mỗi bậc tách khỏi bậc kề ≥ 8 (mắt thường)', () => {
    expect(worstDeltaE(div)).toBeGreaterThanOrEqual(8);
  });
});

describe('"chỉ dùng hex của bảng màu" — kiểm cấu trúc số 6 của validator', () => {
  const config = JSON.parse(ROOT_FILES['src/styles/theme/colors-theme.json']) as {
    ramps: Record<string, (string | null)[]>;
    theme: Record<string, [string, string]>;
    shared: Record<string, string>;
  };
  const documented = new Set<string>(
    [
      ...Object.values(config.ramps).flat(),
      ...Object.entries(config.theme)
        .filter(([key]) => !key.startsWith('chart-'))
        .flatMap(([, pair]) => pair),
    ]
      .filter((hex): hex is string => typeof hex === 'string')
      .map((hex) => hex.toUpperCase()),
  );

  it('mọi hex của `chart-*` trùng một hex có sẵn trong ramps / token theme — không màu "nhìn bằng mắt"', () => {
    const chartPairs = Object.entries(config.theme).filter(([key]) => key.startsWith('chart-'));
    const stray = [
      ...chartPairs.flatMap(([key, pair]) => pair.map((hex) => [key, hex] as const)),
      ...Object.entries(config.shared)
        .filter(([key]) => key.startsWith('chart-'))
        .map(([key, hex]) => [key, hex] as const),
    ].filter(([, hex]) => !documented.has(hex.toUpperCase()));
    expect(stray).toEqual([]);
  });

  it('deltaE tự tính khớp một cặp tham chiếu của validator (cyan-6 ↔ cam-6 · deutan 22,5)', () => {
    expect(deltaE('#0F88A6', '#D66900', 'deutan')).toBeCloseTo(22.5, 1);
    expect(deltaE('#0F88A6', '#D66900')).toBeCloseTo(27.3, 1);
  });
});
