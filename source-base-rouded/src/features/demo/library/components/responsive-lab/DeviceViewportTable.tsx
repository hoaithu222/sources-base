import { memo } from 'react';

import { Button, Text } from '@/shared/ui';

import type { DemoDeviceGroup, DemoViewport } from './responsive-lab.types';

interface DeviceViewportTableProps {
  groups: readonly DemoDeviceGroup[];
  active: DemoViewport | null;
  onPick: (viewport: DemoViewport) => void;
}

const isSame = (a: DemoViewport | null, b: DemoViewport) =>
  a !== null && a.width === b.width && a.height === b.height;

/**
 * DeviceViewportTable — bảng "thiết bị → viewport": mỗi nhóm một hàng (tên nhóm + cổng biến thể ở trái, các cỡ
 * CSS px ở phải); bấm một cỡ là dựng khung xem thử đúng cỡ đó.
 *
 * Hẹp thì hàng xếp dọc (tên trên, cỡ dưới) và các nút tự xuống dòng — không cuộn ngang, không ẩn cỡ nào.
 *
 * @param props.groups - Các nhóm thiết bị cùng danh sách viewport của nhóm.
 * @param props.active - Cỡ đang xem trong khung (tô đặc); `null` khi chưa chọn.
 * @param props.onPick - Gọi với viewport vừa bấm.
 *
 * @example
 * <DeviceViewportTable active={viewport} groups={DEMO_DEVICE_GROUPS} onPick={setViewport} />
 */
const DeviceViewportTable = memo(function DeviceViewportTable({
  groups,
  active,
  onPick,
}: DeviceViewportTableProps) {
  return (
    <ul className="flex flex-col border border-divider-default">
      {groups.map((group) => (
        <li
          key={group.id}
          className="grid gap-x-4 gap-y-2 border-b border-divider-default px-3 py-2.5 last:border-b-0 sm:grid-cols-[11rem_1fr]"
        >
          <div className="flex flex-col gap-0.5">
            <Text weight="medium">{group.label}</Text>
            <Text className="font-mono" size="extraTiny" skin="muted">
              {group.gate}
            </Text>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-4">
            {group.viewports.map((viewport) => {
              const selected = isSame(active, viewport);
              return (
                <Button
                  key={`${viewport.width}x${viewport.height}`}
                  aria-label={`Xem ở khung ${viewport.width} × ${viewport.height}${viewport.note ? ` (${viewport.note})` : ''}`}
                  aria-pressed={selected}
                  size="xs"
                  skin="neutral"
                  title="Xem ở khung này"
                  variant={selected ? 'primary' : 'stroke'}
                  onClick={() => onPick(viewport)}
                >
                  <span className="tabular-nums">
                    {viewport.width}×{viewport.height}
                  </span>
                  {viewport.note ? <span className="opacity-70">{viewport.note}</span> : null}
                </Button>
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );
});

export default DeviceViewportTable;
