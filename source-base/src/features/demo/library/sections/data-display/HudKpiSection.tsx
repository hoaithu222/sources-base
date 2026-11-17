import { memo, useCallback, useState } from 'react';

import { CellBar, HudKpiCard, StackBar, TrendBadge, showToast } from '@/shared/ui';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  COMPANY_COLOR,
  DEMO_COST_TILES,
  DEMO_STOCK_KPIS,
  OUTSOURCE_COLOR,
  type DemoStockKpi,
} from '../../constants/data-display/hud-kpi.constants';

const UNIT = 'máy';

const BILLION = 1_000_000_000;
const MILLION = 1_000_000;
const COMPACT_FORMAT = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });

/** `8.120.000.000` → "8,12 tỷ"; `-479.000.000` → "−479 tr". */
function formatMoneyShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  if (abs >= BILLION) return `${sign}${COMPACT_FORMAT.format(abs / BILLION)} tỷ`;
  return `${sign}${COMPACT_FORMAT.format(abs / MILLION)} tr`;
}

const ownershipBar = (kpi: DemoStockKpi) => [
  { value: kpi.company, color: COMPANY_COLOR, label: 'Công ty' },
  { value: kpi.outsource, color: OUTSOURCE_COLOR, label: 'Thuê ngoài' },
];

const ownershipLegend = (kpi: DemoStockKpi) => [
  { label: 'Công ty', value: `${kpi.company} ${UNIT}`, color: COMPANY_COLOR },
  { label: 'Thuê ngoài', value: `${kpi.outsource} ${UNIT}`, color: OUTSOURCE_COLOR },
];

/**
 * HudKpiSection — mục "Thẻ KPI HUD" của trang `/demo`: `HudKpiCard` · `StackBar` · `CellBar` · `TrendBadge`.
 */
const HudKpiSection = memo(function HudKpiSection() {
  const [loading, setLoading] = useState(false);
  const handleDetail = useCallback(() => showToast('info', 'Mở biểu đồ theo tháng'), []);
  const toggleLoading = useCallback(() => setLoading((value) => !value), []);

  return (
    <DemoSection
      description="HudKpiCard · StackBar · CellBar · TrendBadge."
      importPath="@/shared/ui"
      title="Thẻ KPI HUD"
    >
      <DemoRow
        label="HudKpiCard — hàng thẻ đầu trang"
        note="labelNote = ngày của số dư · badge = TrendBadge · bar + legend tách Công ty / Thuê ngoài · onDetail = nút góc phải"
        stacked
      >
        <DemoGrid min="md">
          {DEMO_STOCK_KPIS.map((kpi) => (
            <HudKpiCard
              key={kpi.key}
              badge={
                kpi.previous === undefined ? undefined : (
                  <TrendBadge current={kpi.value} previous={kpi.previous} versus="tháng 9/2026" />
                )
              }
              bar={ownershipBar(kpi)}
              color={kpi.color}
              detailLabel={`Xem ${kpi.label.toLowerCase()} theo tháng`}
              icon={kpi.icon}
              label={kpi.label}
              labelNote={kpi.asOf}
              legend={ownershipLegend(kpi)}
              unit={UNIT}
              value={kpi.value}
              onDetail={kpi.asOf ? handleDetail : undefined}
            />
          ))}
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label='HudKpiCard · density="compact" — dải một dòng'
        note="không có chân thẻ; valueClassName tô ô chênh lệch theo kết quả"
        stacked
      >
        <DemoGrid min="md">
          {DEMO_COST_TILES.map((tile) => (
            <HudKpiCard
              key={tile.label}
              color="gray"
              density="compact"
              format={formatMoneyShort}
              icon={tile.icon}
              label={tile.label}
              value={tile.value}
              valueClassName={tile.signed ? 'text-orange-6 dark:text-orange-4' : undefined}
            />
          ))}
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="HudKpiCard · trạng thái"
        note='barVariant="cells" + barTotal (thanh tiến độ) · caption · loading (bấm thẻ đầu) · value={null}'
        stacked
      >
        <DemoGrid min="md">
          <HudKpiCard
            bar={[{ value: 68, color: 'var(--color-green-5)', label: 'Đã nghiệm thu' }]}
            barTotal={100}
            barVariant="cells"
            caption="68 / 100 hạng mục"
            color="green"
            detailIcon="arrows-rotate-outline"
            detailLabel="Bật / tắt trạng thái đang tải"
            icon="circle-check-bold"
            label="Tiến độ nghiệm thu"
            legend={[{ label: 'Đã nghiệm thu', value: '68%', color: 'var(--color-green-5)' }]}
            loading={loading}
            unit="%"
            value={68}
            onDetail={toggleLoading}
          />
          <HudKpiCard
            bar={[]}
            caption="Không có quyền xem"
            color="red"
            icon="triangle-exclamation-bold"
            label="Công nợ quá hạn"
            unit="tỷ"
            value={null}
          />
          <HudKpiCard
            caption="+3 so với tuần trước"
            color="blue"
            density="compact"
            icon="users-bold"
            label="compact + caption"
            unit="người"
            value={128}
          />
        </DemoGrid>
      </DemoRow>

      <DemoRow label="StackBar · CellBar · TrendBadge — dùng rời" stacked>
        <DemoGrid min="md">
          <StackBar
            ariaLabel="Công ty 305, thuê ngoài 71"
            segments={[
              { value: 305, color: COMPANY_COLOR, title: 'Công ty 305' },
              { value: 71, color: OUTSOURCE_COLOR, title: 'Thuê ngoài 71' },
            ]}
          />
          <StackBar
            emphasis
            height={20}
            max={100}
            segments={[{ value: 62, color: 'var(--color-sky-5)', label: '62%' }]}
            ticks
          />
          <CellBar
            segments={[
              { value: 45, color: 'var(--color-sky-5)' },
              { value: 25, color: 'var(--color-yellow-5)' },
            ]}
            total={100}
          />
          <div className="flex flex-wrap items-center gap-3">
            <TrendBadge current={120} previous={100} versus="tháng trước" />
            <TrendBadge current={73} previous={315} />
            <TrendBadge current={80} positive="down" previous={100} />
            <TrendBadge current={100.2} previous={100} />
            <TrendBadge current={5} previous={0} />
          </div>
        </DemoGrid>
      </DemoRow>
    </DemoSection>
  );
});

export default HudKpiSection;
