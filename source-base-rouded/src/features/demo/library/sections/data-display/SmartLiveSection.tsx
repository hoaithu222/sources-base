import { memo, useCallback, useMemo, useState } from 'react';

import {
  AnimatedNumber,
  Badge,
  Button,
  CapsuleChart,
  LiquidGauge,
  RankingBoard,
  ScrollBoard,
  Surface,
  Text,
} from '@/shared/ui';
import type { ScrollBoardColumn } from '@/shared/ui';
import { formatMoneyCompactRaw } from '@/shared/utils/format/money.utils';
import { formatNumber } from '@/shared/utils/format/format.utils';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import DemoStatTile from '../../components/showcase/DemoStatTile';
import {
  DEMO_CAPSULE,
  DEMO_FEED_ROWS,
  DEMO_RANKING,
  DEMO_TANKS,
  type SmartFeedRow,
} from '../../constants/data-display/smart-live.constants';

const LEVEL_COLOR = { info: 'info', warn: 'warning', error: 'error' } as const;

/**
 * SmartLiveSection — mục "Sống & tự chạy" của trang `/demo`: `AnimatedNumber` · `ScrollBoard` · `RankingBoard` · `CapsuleChart` · `LiquidGauge`.
 */
const SmartLiveSection = memo(function SmartLiveSection() {
  const [seed, setSeed] = useState(0);
  const shuffle = useCallback(() => setSeed((s) => s + 1), []);

  const factor = 1 + (seed % 4) * 0.23;
  const scale = useCallback((v: number) => Math.round(v * factor), [factor]);

  const ranking = useMemo(
    () => DEMO_RANKING.map((r) => ({ ...r, value: scale(r.value) })),
    [scale],
  );
  const capsule = useMemo(
    () => DEMO_CAPSULE.map((c) => ({ ...c, value: scale(c.value) })),
    [scale],
  );

  const feedColumns = useMemo<ScrollBoardColumn<SmartFeedRow>[]>(
    () => [
      {
        key: 'time',
        header: 'Giờ',
        width: 76,
        cell: (r) => <span className="tabular-nums">{r.time}</span>,
      },
      { key: 'device', header: 'Thiết bị', cell: (r) => r.device },
      { key: 'event', header: 'Sự kiện', cell: (r) => r.event },
      {
        key: 'level',
        header: 'Mức',
        width: 92,
        align: 'right',
        cell: (r) => (
          <Badge color={LEVEL_COLOR[r.level]} size="xs" variant="tinted">
            {r.level}
          </Badge>
        ),
      },
    ],
    [],
  );

  const feedRowKey = useCallback((row: SmartFeedRow) => row.id, []);

  return (
    <DemoSection
      description="Số tự chạy · bảng tự cuộn · xếp hạng · capsule có trục · đồng hồ mức nước. Tất cả tự tắt khi máy bật giảm chuyển động."
      importPath="@/shared/ui — nhóm sống"
      title="Sống & tự chạy"
    >
      <DemoRow label="Bấm để đổi toàn bộ số liệu — xem thứ gì vừa đổi">
        <Button size="sm" variant="stroke" onClick={shuffle}>
          <span className="tabular-nums">{`Đổi dữ liệu (lần ${seed})`}</span>
        </Button>
      </DemoRow>

      <DemoRow label="AnimatedNumber · format tuỳ biến" stacked>
        <DemoGrid min="sm">
          <DemoStatTile caption="mặc định" variant="widget">
            <AnimatedNumber value={scale(128_450)} />
          </DemoStatTile>
          <DemoStatTile caption="rút gọn tiền" variant="widget">
            <AnimatedNumber
              format={(n) => {
                const m = formatMoneyCompactRaw(n, 1);
                return `${m.text} ${m.suffix}`;
              }}
              value={scale(119_710_000_000)}
            />
          </DemoStatTile>
          <DemoStatTile caption="có đơn vị" variant="widget">
            <AnimatedNumber suffix=" m³" value={scale(8_420)} />
          </DemoStatTile>
          <DemoStatTile caption="disabled (in thẳng)" variant="widget">
            <AnimatedNumber disabled value={scale(128_450)} />
          </DemoStatTile>
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="ScrollBoard · 14 dòng trong khung 6 dòng"
        note="rê chuột vào bảng để nó DỪNG — thả ra chạy tiếp"
        stacked
      >
        <ScrollBoard columns={feedColumns} data={DEMO_FEED_ROWS} rowCount={6} rowKey={feedRowKey} />
      </DemoRow>

      <DemoRow
        label="ScrollBoard · dữ liệu vừa khung thì KHÔNG cuộn"
        note="4 dòng trong khung 6 dòng — bảng đứng yên hoàn toàn"
        stacked
      >
        <ScrollBoard
          columns={feedColumns}
          data={DEMO_FEED_ROWS.slice(0, 4)}
          rowCount={6}
          rowKey={feedRowKey}
        />
      </DemoRow>

      <DemoRow label="RankingBoard · thanh đo theo giá trị LỚN NHẤT" stacked>
        <DemoGrid min="lg">
          <Surface padding="md">
            <RankingBoard items={ranking} />
          </Surface>
          <Surface padding="md">
            <RankingBoard highlightTop={false} items={ranking} tone="teal" />
          </Surface>
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="CapsuleChart · có TRỤC nên đọc được con số tuyệt đối"
        note="trục tự làm tròn lên mốc đẹp (1 · 2 · 5 × 10ⁿ)"
        stacked
      >
        <DemoGrid min="xl">
          <Surface padding="md">
            <CapsuleChart items={capsule} unit="m³" />
          </Surface>
          <Surface padding="md">
            <CapsuleChart items={capsule} max={5000} tone="green" unit="m³ / 5.000" />
          </Surface>
        </DemoGrid>
      </DemoRow>

      <DemoRow label="LiquidGauge · shape × tone" stacked>
        <div className="flex flex-wrap items-center gap-4">
          {DEMO_TANKS.map((t) => (
            <LiquidGauge key={t.id} label={t.label} tone={t.tone} value={t.value} />
          ))}
          <LiquidGauge shape="roundRect" size={100} tone="green" value={64} />
          <LiquidGauge hideValue shape="rect" size={100} tone="purple" value={88} />
        </div>
      </DemoRow>

      <Text size="extraTiny" skin="muted">
        Ba thẻ KPI sẵn có (<code className="font-mono">SummaryCard</code>,{' '}
        <code className="font-mono">CompactKpiCard</code>,{' '}
        <code className="font-mono">SummaryPill</code>) nay cũng đếm số MẶC ĐỊNH — xem mục “Thẻ số
        liệu”. Tắt từng chỗ bằng <code className="font-mono">animate={'{false}'}</code>. Tổng đội:{' '}
        <AnimatedNumber format={formatNumber} value={scale(11_437)} />.
      </Text>
    </DemoSection>
  );
});

export default SmartLiveSection;
