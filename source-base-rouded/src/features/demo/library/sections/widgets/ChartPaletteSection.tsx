import { memo, useMemo } from 'react';

import { useEffectiveTheme } from '@/domains/preferences';
import {
  contrastRatio,
  deltaE,
  sequentialScale,
  sequentialTokenForRatio,
  divergingTokenFor,
  worstCvdDeltaE,
  worstDeltaE,
} from '@/shared/charts';
import { DARK_COLORS, LIGHT_COLORS, type ThemeColorKey } from '@/shared/theme';
import { Callout, Text } from '@/shared/ui';
import { formatNumber } from '@/shared/utils/format/format.utils';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  DEMO_PALETTE_GROUPS,
  type DemoPaletteGroup,
} from '../../constants/widgets/chart-palette.constants';

const GRID_CLASSES = 'grid grid-cols-[repeat(auto-fill,minmax(5.75rem,1fr))] gap-2';
const HEAT_ROWS = 5;
const HEAT_COLS = 12;
const DIVERGING_EXTENT = 6;

const fixed = (value: number) => formatNumber(value, 1, 1);

interface GroupReport {
  hexes: string[];
  summary: string;
}

/** Số đo của một nhóm: ΔE nhỏ nhất theo `pairs` (+ cặp khép vòng) — cùng công thức với `validate_palette.js`. */
function reportGroup(group: DemoPaletteGroup, hexOf: (token: string) => string): GroupReport {
  const hexes = group.items.map((item) => hexOf(item.token));
  const slots = hexes;
  if (slots.length < 2)
    return { hexes, summary: 'Một màu — đo riêng so với slot 8 ở test chart-palette-validator.' };

  if (group.scale) {
    const step = Math.min(...slots.slice(1).map((hex, i) => deltaE(slots[i], hex)));
    return {
      hexes,
      summary: `bước kề nhau: mắt thường ≥ ${fixed(step)} — thang liên tục nên bước gần nhau là CỐ Ý; kiểm bằng độ sáng đơn điệu (test chart-palette-validator)`,
    };
  }

  const scope = group.pairs === 'all' ? 'mọi cặp' : 'cặp kề nhau';
  const ring = group.ring ? [slots[slots.length - 1], slots[0]] : null;
  const cvd = Math.min(worstCvdDeltaE(slots, group.pairs), ring ? worstCvdDeltaE(ring) : Infinity);
  const normal = Math.min(
    worstDeltaE(slots, 'normal', group.pairs),
    ring ? worstDeltaE(ring) : Infinity,
  );
  const tail = ring ? ' (gồm cặp khép vòng 8↔1 cho donut)' : '';
  return {
    hexes,
    summary: `${scope}${tail}: mù màu đỏ–lục ≥ ${fixed(cvd)} · mắt thường ≥ ${fixed(normal)}`,
  };
}

/**
 * ChartPaletteSection — mục "Bảng màu chart": MỌI nhóm màu của `@/shared/charts` (series 8 slot, "Khác", kế hoạch/thực
 * tế, trạng thái, sequential, diverging) với hex ĐÃ GIẢI của theme đang bật, tương phản với nền chart và ΔE tới ô kế
 * bên (mô phỏng mù màu Machado 2009 + mắt thường) — số tính tại chỗ, bằng đúng công thức của validator.
 */
const ChartPaletteSection = memo(function ChartPaletteSection() {
  const theme = useEffectiveTheme();
  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const hexOf = useMemo(() => (token: string) => colors[token as ThemeColorKey], [colors]);
  const surface = hexOf('bg-surface');

  const reports = useMemo(
    () => DEMO_PALETTE_GROUPS.map((group) => ({ group, ...reportGroup(group, hexOf) })),
    [hexOf],
  );

  return (
    <DemoSection
      description="8 slot series + Khác + KH/TT + trạng thái + sequential + diverging — đã chấm bằng validator ở cả hai theme."
      importPath="@/shared/charts"
      title="Bảng màu chart"
    >
      <Callout intent="info" title="Đọc bảng thế nào" variant="tinted">
        Mỗi ô: tương phản với nền chart, rồi ΔE tới ô kế bên (mù màu = min protan / deutan ·
        thường). Ngưỡng cho series: mù màu ≥ 8, mắt thường ≥ 15; tương phản ≥ 3:1 (dưới mức đó luôn
        có chữ / nhãn đi kèm). Sequential / diverging chỉ kiểm độ sáng đơn điệu. Đổi theme để xem
        bản dark chọn riêng.
      </Callout>

      {reports.map(({ group, hexes, summary }) => (
        <DemoRow key={group.id} label={group.title} note={group.note} stacked>
          <div className={GRID_CLASSES}>
            {group.items.map((item, i) => {
              const next = hexes[i + 1];
              const nextText =
                next && group.id !== 'other' && !(group.ring && i === 7)
                  ? `→ ${fixed(Math.min(deltaE(hexes[i], next, 'protan'), deltaE(hexes[i], next, 'deutan')))} · ${fixed(deltaE(hexes[i], next))}`
                  : undefined;
              return (
                <div
                  key={item.label}
                  className="flex min-w-0 flex-col gap-0.5"
                  title={`${item.token} · ${hexes[i]}`}
                >
                  <div
                    className="h-9 w-full rounded-sm border border-border-default"
                    style={{ backgroundColor: `var(--color-${item.token})` }}
                  />
                  <Text className="truncate" size="tiny" weight="medium">
                    {item.label}
                  </Text>
                  <Text className="truncate font-mono" size="extraTiny" skin="muted">
                    {item.token}
                  </Text>
                  <Text className="font-mono tabular-nums" size="extraTiny" skin="muted">
                    {hexes[i]}
                  </Text>
                  <Text className="tabular-nums" size="extraTiny" skin="muted">
                    {`${formatNumber(contrastRatio(hexes[i], surface), 1, 1)}:1`}
                  </Text>
                  <Text className="tabular-nums" size="extraTiny" skin="muted">
                    {nextText ?? '—'}
                  </Text>
                </div>
              );
            })}
          </div>
          <Text size="extraTiny" skin="muted">
            {summary}
          </Text>
        </DemoRow>
      ))}

      <DemoRow
        label="Heatmap mẫu"
        note="sequential: 12 × 5 ô theo tỉ lệ · diverging: lệch so với kế hoạch"
        stacked
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {(['sequential', 'diverging'] as const).map((kind) => (
            <div
              key={kind}
              aria-label={`Heatmap ${kind === 'sequential' ? 'độ lớn' : 'lệch hai phía'}`}
              className="grid gap-0.5"
              role="img"
              style={{ gridTemplateColumns: `repeat(${HEAT_COLS}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: HEAT_ROWS * HEAT_COLS }, (_, i) => {
                const col = i % HEAT_COLS;
                const row = Math.floor(i / HEAT_COLS);
                const wave = (Math.sin(col / 1.7 + row) + 1) / 2;
                const token =
                  kind === 'sequential'
                    ? sequentialTokenForRatio((col / (HEAT_COLS - 1)) * 0.6 + wave * 0.4)
                    : divergingTokenFor((wave - 0.5) * 2 * DIVERGING_EXTENT, DIVERGING_EXTENT);
                return (
                  <span
                    key={i}
                    className="aspect-square rounded-xs"
                    style={{ backgroundColor: `var(--color-${token})` }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <Text size="extraTiny" skin="muted">
          {`Thang 4 lớp cho heatmap ít ô: ${sequentialScale(4).join(' · ')}`}
        </Text>
      </DemoRow>
    </DemoSection>
  );
});

export default ChartPaletteSection;
