import { memo } from 'react';
import { cn } from '@/shared/utils/style/cn';

export type IllustrationAccentColor = 'neutral' | 'primary' | 'sky' | 'green' | 'yellow' | 'red';

export interface TableEmptyIllustrationProps {
  accentColor?: IllustrationAccentColor;
  width?: number;
  height?: number;
  className?: string;
}

const ILLUSTRATION_ACCENT_COLORS = {
  neutral: 'var(--color-fg-faint)',
  primary: 'var(--color-primary-5)',
  sky: 'var(--color-sky-5)',
  green: 'var(--color-green-5)',
  yellow: 'var(--color-yellow-5)',
  red: 'var(--color-red-5)',
} satisfies Record<IllustrationAccentColor, string>;

const ILLUSTRATION_PALETTE = {
  bg: 'var(--color-bg-subtle)',
  frame: 'var(--color-border-default)',
  chrome: 'var(--color-bg-track)',
  bar: 'var(--color-fg-faint)',
  lines: 'var(--color-border-strong)',
};

const ILLUSTRATION_DOTS = [
  {
    d: `M5.29564 5.94856C6.15115 5.94856 6.84427 5.25547 6.84427 4.40719C6.84427 3.54857
        6.15115 2.85547 5.29564 2.85547C4.44115 2.85547 3.74805 3.54857 3.74805 4.40719
        C3.74805 5.25547 4.44115 5.94856 5.29564 5.94856Z`,
    opacity: 1,
  },
  {
    d: `M10.1033 5.94856C10.9588 5.94856 11.6519 5.25547 11.6519 4.40719C11.6519 3.54857
        10.9588 2.85547 10.1033 2.85547C9.24877 2.85547 8.55566 3.54857 8.55566 4.40719
        C8.55566 5.25547 9.24877 5.94856 10.1033 5.94856Z`,
    opacity: 0.6,
  },
  {
    d: `M14.992 5.94856C15.8464 5.94856 16.5395 5.25547 16.5395 4.40719C16.5395 3.54857
        15.8464 2.85547 14.992 2.85547C14.1364 2.85547 13.4434 3.54857 13.4434 4.40719
        C13.4434 5.25547 14.1364 5.94856 14.992 5.94856Z`,
    opacity: 0.4,
  },
];

const ILLUSTRATION_TITLE_BAR = `M50.1411 23.7009H10.6984C10.4015 23.7009 10.1035 23.4009 10.1035 23.1112
  V21.2285C10.1035 20.9285 10.4015 20.6284 10.6984 20.6284H50.1411
  C50.438 20.6284 50.7349 20.9285 50.7349 21.2285V23.1112
  C50.6366 23.5043 50.438 23.7009 50.1411 23.7009Z`;

const ILLUSTRATION_COLUMNS = [
  'M30.1228 30.9419H10.1035V76.759H30.1228V30.9419Z',
  'M108.412 30.9419H89.3848V76.759H108.412V30.9419Z',
];

const ILLUSTRATION_GRID_LINES = [
  'M108.412 30.9419V76.759H10.1035V30.9419H108.412Z',
  'M10.4004 39.8691H108.114',
  'M10.4004 49.1899H108.114',
  'M10.4004 58.4175H108.114',
  'M10.4004 67.7388H108.114',
  'M30.1213 31.438V76.7586',
  'M49.843 31.438V76.7586',
  'M69.6619 31.438V76.7586',
  'M89.3848 31.438V76.7586',
];

/**
 * TableEmptyIllustration — minh hoạ trang trí "bảng trống" (cửa sổ + lưới bảng, Figma 2746:11634), đặt
 * vào `EmptyState.illustration` cho bảng / danh sách rỗng.
 *
 * Chỉ trang trí (`aria-hidden`); chữ "chưa có dữ liệu" đặt ở `EmptyState.title`.
 * Sửa giao diện: màu ba chấm cửa sổ → `ILLUSTRATION_ACCENT_COLORS` · màu nền / khung / lưới →
 * `ILLUSTRATION_PALETTE` · hình (chấm, thanh tiêu đề, cột, lưới) → `ILLUSTRATION_DOTS` /
 * `ILLUSTRATION_TITLE_BAR` / `ILLUSTRATION_COLUMNS` / `ILLUSTRATION_GRID_LINES`.
 * Lưu ý: KHÔNG sửa toạ độ path (xuất từ Figma); khung / lưới chỉ dùng token theo vai trò (`bg-*` ·
 * `border-*` · `fg-*`) qua `var(--color-…)` nên tự đổi theo theme, không hex — chỉ chấm màu là bậc cố định.
 * Đổi cỡ bằng `width` / `height` theo tỉ lệ 118 × 89 — lệch tỉ lệ thì hình co vào giữa, chừa lề trống.
 *
 * @param props.accentColor - Màu ba chấm cửa sổ: `neutral` | `primary` | `sky` | `green` | `yellow` | `red`.
 *   Mặc định `neutral`.
 * @param props.width - Bề ngang, px. Mặc định `118`.
 * @param props.height - Chiều cao, px. Mặc định `89`.
 * @param props.className - Class thêm cho `<svg>`.
 *
 * @example
 * <EmptyState illustration={<TableEmptyIllustration accentColor="sky" />} title="Chưa có gói thầu" />
 *
 * <TableEmptyIllustration accentColor="green" width={96} height={72} />
 */
const TableEmptyIllustration = memo(function TableEmptyIllustration({
  accentColor = 'neutral',
  width = 118,
  height = 89,
  className,
}: TableEmptyIllustrationProps) {
  const dotColor = ILLUSTRATION_ACCENT_COLORS[accentColor];

  return (
    <svg
      aria-hidden
      className={cn('shrink-0', className)}
      fill="none"
      height={height}
      viewBox="0 0 117.87 88.738"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill={ILLUSTRATION_PALETTE.bg} height="88.738" width="117.87" />
      <rect fill={ILLUSTRATION_PALETTE.chrome} height="8.72069" width="117.869" />

      {ILLUSTRATION_DOTS.map((dot) => (
        <path key={dot.opacity} d={dot.d} fill={dotColor} opacity={dot.opacity} />
      ))}

      <path d={ILLUSTRATION_TITLE_BAR} fill={ILLUSTRATION_PALETTE.bar} />

      {ILLUSTRATION_COLUMNS.map((d) => (
        <path key={d} d={d} fill={ILLUSTRATION_PALETTE.chrome} />
      ))}

      {ILLUSTRATION_GRID_LINES.map((d) => (
        <path
          key={d}
          d={d}
          stroke={ILLUSTRATION_PALETTE.lines}
          strokeMiterlimit="10"
          strokeWidth="1.55172"
        />
      ))}

      <rect height="87.738" stroke={ILLUSTRATION_PALETTE.frame} width="116.87" x="0.5" y="0.5" />
    </svg>
  );
});

export default TableEmptyIllustration;
