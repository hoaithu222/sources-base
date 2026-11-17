import {
  CHART_DIVERGING_TOKENS,
  CHART_OTHER_TOKEN,
  CHART_SEMANTIC,
  CHART_SEQUENTIAL_TOKENS,
  CHART_SERIES_TOKENS,
  CHART_STATUS,
} from '@/shared/charts';

/**
 * Các nhóm màu của bảng "Bảng màu chart" — chỉ để TRÌNH BÀY; nguồn thật là `chart-palette.constants.ts` của
 * `@/shared/charts`. `pairs`: `adjacent` = chỉ cặp kề nhau chạm nhau (cột chồng, đường, donut) · `all` =
 * mọi cặp có thể chạm (3 đường KH/TT/dự báo, 4 trạng thái cùng một biểu đồ).
 */
export interface DemoPaletteItem {
  label: string;
  token: string;
}

export interface DemoPaletteGroup {
  id: string;
  title: string;
  note: string;
  pairs: 'adjacent' | 'all';
  /** Nhóm xếp vòng (donut) → kiểm thêm cặp cuối ↔ đầu. */
  ring?: boolean;
  /** Thang liên tục (sequential / diverging): bước kề nhau CỐ Ý gần nhau — không áp ngưỡng phân loại. */
  scale?: boolean;
  items: readonly DemoPaletteItem[];
}

const labelled = (tokens: readonly string[]): DemoPaletteItem[] =>
  tokens.map((token, i) => ({ label: String(i + 1), token }));

const named = (map: Record<string, string>): DemoPaletteItem[] =>
  Object.entries(map).map(([label, token]) => ({ label, token }));

export const DEMO_PALETTE_GROUPS: readonly DemoPaletteGroup[] = [
  {
    id: 'series',
    title: 'Series — 8 slot cố định',
    note: 'danh tính (đường, cột, lát); quá 8 → "Khác", không quay vòng',
    pairs: 'adjacent',
    ring: true,
    items: labelled(CHART_SERIES_TOKENS),
  },
  {
    id: 'other',
    title: '"Khác" — xám trung tính',
    note: 'một hex cho cả hai theme; luôn cuối, không tô màu hue',
    pairs: 'adjacent',
    items: [{ label: 'Khác', token: CHART_OTHER_TOKEN }],
  },
  {
    id: 'semantic',
    title: 'Kế hoạch / Thực tế / Dự báo',
    note: 'nét đứt = kế hoạch · dự báo, nét liền = thực tế (kênh phụ cho mù màu)',
    pairs: 'all',
    items: named(CHART_SEMANTIC),
  },
  {
    id: 'status',
    title: 'Trạng thái tiến độ',
    note: 'nghĩa cố định — luôn kèm chữ / icon, không dùng cho "series 4"',
    pairs: 'all',
    items: named(CHART_STATUS),
  },
  {
    id: 'sequential',
    title: 'Sequential — độ lớn (1 hue)',
    note: 'bậc 1 = thấp → bậc 6 = cao; dark đảo neo: thấp = tối, cao = sáng',
    pairs: 'adjacent',
    scale: true,
    items: labelled(CHART_SEQUENTIAL_TOKENS),
  },
  {
    id: 'diverging',
    title: 'Diverging — hai phía quanh mốc',
    note: 'lạnh (âm) ← xám trung tính → nóng (dương); 3 bậc mỗi phía',
    pairs: 'adjacent',
    scale: true,
    items: labelled(CHART_DIVERGING_TOKENS),
  },
];
