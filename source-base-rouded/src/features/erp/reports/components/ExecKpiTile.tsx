import { memo } from 'react';

import { CHART_SERIES_TOKENS } from '@/shared/charts';
import { Surface, TrendBadge } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import type { ExecKpiTileModel } from '../utils/executive.utils';
import TrendSparkline from './charts/TrendSparkline';

interface ExecKpiTileProps {
  tile: ExecKpiTileModel;
  versus: string;
  className?: string;
}

const SPARK_TOKEN = CHART_SERIES_TOKENS[0];

const EXEC_KPI_TILE_CLASSES = {
  root: 'squircle flex min-w-0 flex-col gap-3 rounded-2xl',
  head: 'flex min-w-0 flex-wrap items-center justify-between gap-x-1.5 gap-y-1',
  label: 'min-w-0 truncate text-caption-12-semibold tracking-wide text-fg-muted uppercase',
  delta: 'rounded-full bg-bg-subtle px-1.5 py-0.5',
  figure: 'flex min-w-0 flex-col gap-1',
  value: 'flex min-w-0 items-baseline gap-1',
  number: 'truncate text-h2-bold text-fg-heading tabular-nums',
  unit: 'shrink-0 text-body-14-medium text-fg-muted',
  note: 'truncate text-caption-12 text-fg-muted',
  noteAlert: 'text-error',
  spark: 'h-10 w-full',
} satisfies Record<string, string>;

/**
 * ExecKpiTile — ô KPI kiểu widget macOS của màn "Dashboard điều hành": nhãn nhỏ IN HOA giãn chữ + huy hiệu biến động
 * so kỳ trước (▲/▼, màu theo chiều tốt / xấu của chỉ tiêu) · MỘT con số lớn `tabular-nums` + đơn vị mờ · dòng phụ (kế
 * hoạch, biên, quá hạn — tô màu lỗi khi là cảnh báo) · sparkline tối giản có chấm ở điểm hiện tại.
 * Lưu ý: số đã định dạng sẵn ở `buildKpiTiles` — ô không đếm lên, đổi kỳ là đổi số ngay.
 *
 * @param props.tile - Dữ liệu ô (`ExecKpiTileModel` từ `buildKpiTiles(period)`).
 * @param props.versus - Tên mốc so sánh cho tooltip của huy hiệu, vd "cùng kỳ tháng 9/2026".
 * @param props.className - Class thêm cho ô (thường là số cột chiếm trong lưới KPI).
 *
 * @example
 * <ExecKpiTile tile={tiles[0]} versus="cùng kỳ tháng 9/2026" />
 */
const ExecKpiTile = memo(function ExecKpiTile({ tile, versus, className }: ExecKpiTileProps) {
  return (
    <Surface
      aria-label={tile.label}
      as="article"
      className={cn(EXEC_KPI_TILE_CLASSES.root, className)}
      padding="md"
    >
      <div className={EXEC_KPI_TILE_CLASSES.head}>
        <span className={EXEC_KPI_TILE_CLASSES.label}>{tile.label}</span>
        <TrendBadge
          className={EXEC_KPI_TILE_CLASSES.delta}
          current={tile.current}
          positive={tile.positive}
          previous={tile.previous}
          versus={versus}
        />
      </div>

      <div className={EXEC_KPI_TILE_CLASSES.figure}>
        <p className={EXEC_KPI_TILE_CLASSES.value}>
          <span className={EXEC_KPI_TILE_CLASSES.number}>{tile.valueText}</span>
          <span className={EXEC_KPI_TILE_CLASSES.unit}>{tile.unit}</span>
        </p>
        <p
          className={cn(
            EXEC_KPI_TILE_CLASSES.note,
            tile.noteAlert && EXEC_KPI_TILE_CLASSES.noteAlert,
          )}
        >
          {tile.note}
        </p>
      </div>

      <TrendSparkline
        ariaLabel={`Xu hướng ${tile.label.toLowerCase()}`}
        className={EXEC_KPI_TILE_CLASSES.spark}
        token={SPARK_TOKEN}
        unit={tile.unit}
        values={tile.spark}
      />
    </Surface>
  );
});

export default ExecKpiTile;
