import { memo } from 'react';

import { HudKpiCard, showToast } from '@/shared/ui';
import { formatNumber } from '@/shared/utils/format/format.utils';

import { FACTORY_KPIS } from '../constants/factory-metrics.constants';
import { FACTORY_KPI_STRIP_CLASSES } from '../factory.theme';

const formatTon = (value: number) => formatNumber(value, 2);

/**
 * FactoryKpiStrip — 4 thẻ KPI đầu màn "Gia công" (phải gia công · đã gia công · còn lại · % hoàn thành), mỗi thẻ có
 * nút chi tiết góc phải-trên. Bản demo: bấm chi tiết chỉ báo toast.
 */
const FactoryKpiStrip = memo(function FactoryKpiStrip() {
  return (
    <div className={FACTORY_KPI_STRIP_CLASSES}>
      {FACTORY_KPIS.map((kpi) => (
        <HudKpiCard
          key={kpi.key}
          caption={kpi.caption}
          color={kpi.color}
          density="compact"
          detailIcon={kpi.detailIcon}
          detailLabel={kpi.detailLabel}
          format={formatTon}
          icon={kpi.icon}
          label={kpi.label}
          unit={kpi.unit}
          value={kpi.value}
          onDetail={() => showToast('info', kpi.detailLabel)}
        />
      ))}
    </div>
  );
});

export default FactoryKpiStrip;
