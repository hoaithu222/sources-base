import { memo, useEffect, useRef } from 'react';

import { usePrefersReducedMotion } from '@/shared/hooks';
import { Button, EmptyState, SegmentToggle, Text } from '@/shared/ui';
import type { SegmentOption } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import type { DemoFrameTarget, DemoViewport } from './responsive-lab.types';
import ViewportFrame from './ViewportFrame';

interface ViewportFramePanelProps {
  viewport: DemoViewport | null;
  targets: readonly DemoFrameTarget[];
  targetKey: string;
  presets: readonly DemoViewport[];
  onTargetChange: (key: string) => void;
  onPickViewport: (viewport: DemoViewport) => void;
  onRotate: () => void;
}

const sizeKey = (v: DemoViewport) => `${v.width}x${v.height}`;

/**
 * ViewportFramePanel — thanh công cụ + khung xem thử của Responsive lab: chọn trang nạp vào khung, chọn nhanh
 * một trong vài cỡ chuẩn, xoay dọc/ngang, mở trang ở tab mới; bên dưới là `ViewportFrame` hoặc lời mời chọn cỡ.
 *
 * Chọn cỡ ở bảng thiết bị thì khung tự cuộn vào tầm nhìn; thanh chọn nhanh cuộn ngang trong khung riêng nên
 * không đẩy trang tràn ngang ở điện thoại.
 *
 * @param props.viewport - Cỡ đang dựng; `null` → chưa dựng khung.
 * @param props.targets - Các trang có thể nạp vào khung.
 * @param props.targetKey - Khoá trang đang nạp.
 * @param props.presets - Các cỡ chọn nhanh.
 * @param props.onTargetChange - Đổi trang nạp.
 * @param props.onPickViewport - Chọn một cỡ chọn nhanh.
 * @param props.onRotate - Đổi chỗ rộng ↔ cao của cỡ đang dựng.
 *
 * @example
 * <ViewportFramePanel presets={DEMO_QUICK_VIEWPORTS} targetKey="composed" targets={DEMO_FRAME_TARGETS} viewport={viewport} … />
 */
const ViewportFramePanel = memo(function ViewportFramePanel({
  viewport,
  targets,
  targetKey,
  presets,
  onTargetChange,
  onPickViewport,
  onRotate,
}: ViewportFramePanelProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const target = targets.find((t) => t.key === targetKey) ?? targets[0];

  const width = viewport?.width;
  const height = viewport?.height;
  useEffect(() => {
    if (width === undefined) return;
    rootRef.current?.scrollIntoView?.({
      block: 'nearest',
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [width, height, reducedMotion]);

  const targetOptions: SegmentOption[] = targets.map((t) => ({ key: t.key, label: t.label }));
  const presetOptions: SegmentOption[] = presets.map((p) => ({
    key: sizeKey(p),
    label: String(p.width),
    title: `${p.width} × ${p.height}`,
  }));
  const handlePreset = (key: string) => {
    const next = presets.find((p) => sizeKey(p) === key);
    if (next) onPickViewport(next);
  };

  return (
    <div ref={rootRef} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="max-w-full overflow-x-auto overscroll-x-contain">
          <SegmentToggle
            options={targetOptions}
            size="sm"
            value={target.key}
            onValueChange={onTargetChange}
          />
        </div>
        <div className="max-w-full overflow-x-auto overscroll-x-contain">
          <SegmentToggle
            options={presetOptions}
            size="sm"
            value={viewport ? sizeKey(viewport) : ''}
            onValueChange={handlePreset}
          />
        </div>
        <Button
          disabled={!viewport}
          size="sm"
          skin="neutral"
          startIcon={<SystemIcon name="arrows-rotate-outline" size={14} />}
          variant="stroke"
          onClick={onRotate}
        >
          Xoay
        </Button>
        <Button asChild size="sm" skin="neutral" variant="stroke">
          <a href={target.path} rel="noreferrer" target="_blank">
            Mở tab mới
          </a>
        </Button>
      </div>

      {viewport ? (
        <>
          <ViewportFrame
            src={target.path}
            title={`${target.label} ở ${viewport.width} × ${viewport.height}`}
            viewport={viewport}
          />
          <Text size="extraTiny" skin="muted">
            {viewport.width} × {viewport.height} CSS px — khung chỉ mô phỏng KÍCH THƯỚC; touch: và
            hover vẫn đọc con trỏ thật của máy này.
          </Text>
        </>
      ) : (
        <EmptyState
          description="Bấm một cỡ ở bảng trên hoặc chọn nhanh ở thanh công cụ — khung dựng đúng cỡ viewport đó."
          icon="grid-2-bold"
          size="sm"
          title="Chưa chọn cỡ khung"
        />
      )}
    </div>
  );
});

export default ViewportFramePanel;
