import { memo, useRef } from 'react';

import { selectEffectiveUiScale, selectIsTv, useDisplayStore } from '@/domains/preferences';
import { useIsCoarsePointer, useIsPhone } from '@/shared/hooks';

import DemoStatTile from '../showcase/DemoStatTile';
import DemoGrid from '../shell/DemoGrid';
import { useViewportMetrics } from '../../hooks/useViewportMetrics';
import { classifyViewport } from '../../utils/viewport-group.utils';

const SAFE_PROBE_CLASSES =
  'pointer-events-none invisible fixed top-0 left-0 h-0 w-0 overflow-hidden';

const SAFE_PROBE_STYLE = {
  padding: 'var(--safe-t, 0px) var(--safe-r, 0px) var(--safe-b, 0px) var(--safe-l, 0px)',
} as const;

const fmt = (n: number) => String(Math.round(n * 100) / 100);

/**
 * LiveMetricsPanel — số đo TRỰC TIẾP của khung nhìn đang chạy trang này: viewport CSS, `devicePixelRatio`,
 * nhóm màn theo thang chuẩn, hướng, con trỏ / hover, bốn `--safe-*`, chế độ TV và toàn màn.
 *
 * Số đổi ngay khi kéo cỡ cửa sổ, xoay máy hoặc bật TV. Trong khung xem thử của lab, đây là số của KHUNG
 * (bề rộng / cao mô phỏng), còn con trỏ / hover luôn là của máy thật.
 */
const LiveMetricsPanel = memo(function LiveMetricsPanel() {
  const probeRef = useRef<HTMLDivElement>(null);
  const metrics = useViewportMetrics(probeRef);
  const isPhone = useIsPhone();
  const isTouch = useIsCoarsePointer();
  const isTv = useDisplayStore(selectIsTv);
  const uiScale = useDisplayStore(selectEffectiveUiScale);

  const group = classifyViewport({
    width: metrics.width,
    height: metrics.height,
    isPhone,
    isTouch,
  });
  const { top, right, bottom, left } = metrics.safe;

  return (
    <>
      <div ref={probeRef} aria-hidden className={SAFE_PROBE_CLASSES} style={SAFE_PROBE_STYLE} />
      <DemoGrid min="xs">
        <DemoStatTile caption="viewport CSS (rộng × cao)">
          {metrics.width}×{metrics.height}
        </DemoStatTile>
        <DemoStatTile caption="nhóm màn theo thang chuẩn">{group.label}</DemoStatTile>
        <DemoStatTile caption="devicePixelRatio">{fmt(metrics.dpr)}×</DemoStatTile>
        <DemoStatTile caption="hướng">
          {metrics.height >= metrics.width ? 'Dọc' : 'Ngang'}
        </DemoStatTile>
        <DemoStatTile caption="con trỏ chính · hover">
          {metrics.pointer} · {metrics.hover ? 'hover' : 'no-hover'}
        </DemoStatTile>
        <DemoStatTile caption="--safe-t · r · b · l (px)">
          {fmt(top)} · {fmt(right)} · {fmt(bottom)} · {fmt(left)}
        </DemoStatTile>
        <DemoStatTile caption="chế độ TV (tv:)">{isTv ? `Bật ×${uiScale}` : 'Tắt'}</DemoStatTile>
        <DemoStatTile caption="toàn màn (standalone:)">
          {metrics.standalone ? 'Có' : 'Không'}
        </DemoStatTile>
      </DemoGrid>
    </>
  );
});

export default LiveMetricsPanel;
