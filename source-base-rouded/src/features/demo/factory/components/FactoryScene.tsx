import { memo } from 'react';

import { HudCallout } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import {
  FACTORY_CALLOUTS,
  FACTORY_OVERVIEW,
  FACTORY_ZONES,
} from '../constants/factory-scene.constants';
import { FACTORY_SCENE_CLASSES, FACTORY_ZONE_TONE_CLASSES } from '../factory.theme';

/**
 * FactoryScene — sơ đồ xưởng gia công 2.5D: sàn lưới nghiêng, các khu sản xuất (ô viền sáng theo tone), nhãn ghim
 * trạng thái từng khu (`HudCallout`) và dải "Tổng quan xưởng" 4 ô ở mép trên. Không có ảnh — toàn bộ vẽ bằng CSS token.
 */
const FactoryScene = memo(function FactoryScene() {
  return (
    <div
      aria-label="Sơ đồ xưởng gia công cốt thép"
      className={FACTORY_SCENE_CLASSES.root}
      role="group"
    >
      <span aria-hidden className={FACTORY_SCENE_CLASSES.grid} />

      <div aria-hidden className={FACTORY_SCENE_CLASSES.plane}>
        {FACTORY_ZONES.map((zone) => (
          <div
            key={zone.key}
            className={cn(FACTORY_SCENE_CLASSES.zone, FACTORY_ZONE_TONE_CLASSES[zone.tone])}
            style={{
              gridColumn: `${zone.col} / span ${zone.colSpan}`,
              gridRow: `${zone.row} / span ${zone.rowSpan}`,
            }}
          >
            <span className={FACTORY_SCENE_CLASSES.zoneLabel}>{zone.label}</span>
          </div>
        ))}
      </div>

      {FACTORY_CALLOUTS.map((callout) => (
        <HudCallout
          key={callout.key}
          status={callout.status}
          statusLabel={callout.statusLabel}
          subtitle={callout.subtitle}
          title={callout.title}
          tone={callout.tone}
          x={callout.x}
          y={callout.y}
        />
      ))}

      <section aria-label="Tổng quan xưởng" className={FACTORY_SCENE_CLASSES.overview}>
        {FACTORY_OVERVIEW.map((stat) => (
          <div key={stat.key} className={FACTORY_SCENE_CLASSES.stat}>
            <span aria-hidden className={FACTORY_SCENE_CLASSES.statIcon}>
              <SystemIcon name={stat.icon} />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className={FACTORY_SCENE_CLASSES.statValue}>{stat.value}</span>
              <span className={FACTORY_SCENE_CLASSES.statLabel} title={stat.label}>
                {stat.label}
              </span>
            </span>
          </div>
        ))}
      </section>
    </div>
  );
});

export default FactoryScene;
