import { memo } from 'react';

import { Surface } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import SparklineChart from '../../../shared/charts/SparklineChart';

type DemoSparkTileFrame = 'widget' | 'bare';

/** Cùng hình `DemoSparkTile` của `constants/widgets/` — khai lại vì dữ liệu nhóm chỉ import từ section cùng nhóm. */
interface DemoSparkTileData {
  label: string;
  value: string;
  delta: string;
  token: string;
  values: readonly number[];
}

interface DemoSparkTileProps {
  tile: DemoSparkTileData;
  frame?: DemoSparkTileFrame;
}

/** Kiểu widget macOS — nhãn nhỏ IN HOA giãn chữ, MỘT con số lớn đậm, dòng phụ mờ (cả hai theme). */
const DEMO_SPARK_TILE_LABEL_CLASSES =
  'truncate text-caption-12-semibold uppercase tracking-[0.06em] text-fg-muted';

const DEMO_SPARK_TILE_VALUE_CLASSES = {
  widget: 'text-h2-bold tabular-nums text-fg-heading',
  bare: 'text-h4-semibold tabular-nums text-fg-heading',
} satisfies Record<DemoSparkTileFrame, string>;

const DEMO_SPARK_TILE_STACK_CLASSES = 'flex min-w-0 flex-col gap-1';

const DEMO_SPARK_TILE_DELTA_CLASSES = 'truncate text-caption-12 tabular-nums text-fg-muted';

/** `widget` = thẻ đứng riêng bo `2xl` · `bare` = không khung, nằm trong một khung khác (tránh hộp lồng hộp). */
const DEMO_SPARK_TILE_CHART_CLASSES = {
  widget: 'h-12 w-full',
  bare: 'h-10 w-full',
} satisfies Record<DemoSparkTileFrame, string>;

/**
 * DemoSparkTile — thẻ KPI có sparkline của mục "Thư viện biểu đồ" / "Chart ở 360px": nhãn · số hiện tại · chênh so với
 * kỳ trước · sparkline (chấm đặc ở điểm cuối = hiện tại). Số do thẻ in, sparkline chỉ cho hình dạng.
 *
 * @param props.tile - Một thẻ của `DEMO_SPARK_TILES`.
 * @param props.frame - `widget` (thẻ đứng riêng, bo `2xl`) | `bare` (không khung). Mặc định `widget`.
 *
 * @example
 * <DemoSparkTile tile={DEMO_SPARK_TILES[0]} />
 */
const DemoSparkTile = memo(function DemoSparkTile({ tile, frame = 'widget' }: DemoSparkTileProps) {
  const content = (
    <>
      <p className={DEMO_SPARK_TILE_LABEL_CLASSES}>{tile.label}</p>
      <p className={DEMO_SPARK_TILE_VALUE_CLASSES[frame]}>{tile.value}</p>
      <p className={DEMO_SPARK_TILE_DELTA_CLASSES}>
        <span className="text-success">{tile.delta}</span> so với kỳ trước
      </p>
      <SparklineChart
        ariaLabel={`Xu hướng ${tile.label} 8 kỳ gần nhất`}
        className={DEMO_SPARK_TILE_CHART_CLASSES[frame]}
        token={tile.token}
        values={tile.values}
      />
    </>
  );

  if (frame === 'bare') return <div className={DEMO_SPARK_TILE_STACK_CLASSES}>{content}</div>;

  return (
    <Surface className={cn(DEMO_SPARK_TILE_STACK_CLASSES, 'rounded-2xl')} padding="md">
      {content}
    </Surface>
  );
});

export default DemoSparkTile;
