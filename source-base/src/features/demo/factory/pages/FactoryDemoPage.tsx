import { memo, useCallback, useState } from 'react';

import {
  Button,
  CapsuleChart,
  NoticeBoard,
  PageBody,
  PageShell,
  PanelCard,
  StatusBoard,
  showToast,
} from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { formatNumber } from '@/shared/utils/format/format.utils';
import { PageHeader } from '@/shared/widgets/header';

import ShareDonutChart from '../../shared/charts/ShareDonutChart';
import FactoryKpiStrip from '../components/FactoryKpiStrip';
import FactoryPlanPanel from '../components/FactoryPlanPanel';
import FactoryScene from '../components/FactoryScene';
import FactorySteelTable from '../components/FactorySteelTable';
import {
  FACTORY_EQUIPMENT,
  FACTORY_NOTICES,
  FACTORY_REMAIN,
  FACTORY_SHARE_SLICES,
  FACTORY_TABS,
  FACTORY_TABS_SPLIT,
  type FactoryTab,
} from '../constants/factory-metrics.constants';
import {
  FACTORY_BOTTOM_GRID_CLASSES,
  FACTORY_MAIN_GRID_CLASSES,
  FACTORY_PANEL_SLOT_CLASSES,
} from '../factory.theme';

const formatTon = (value: number) => formatNumber(value, 2);

const showAll = () => showToast('info', 'Mở danh sách đầy đủ (bản demo)');

const SEE_ALL = (
  <Button
    endIcon={<SystemIcon name="angle-right-outline" size={12} />}
    size="xs"
    variant="ghost"
    onClick={showAll}
  >
    Xem tất cả
  </Button>
);

/**
 * FactoryDemoPage — màn `/demo/xuong` ("Gia công"): dashboard điều hành xưởng gia công cốt thép theo mẫu Precast MES —
 * bảng tên + 6 tab hai cánh trên header, 4 KPI, kế hoạch ↔ thực hiện, cơ cấu sản lượng, sơ đồ xưởng có nhãn ghim,
 * điểm cần chú ý, trạng thái thiết bị, tiến độ + khối lượng còn lại theo loại thép. Dựng hoàn toàn bằng UI kit.
 * Lưu ý: tab chỉ đổi trạng thái chọn (bản demo, mọi tab cùng nội dung); từ `xl` trang vừa một màn hình 1080p.
 */
const FactoryDemoPage = memo(function FactoryDemoPage() {
  const [tab, setTab] = useState<FactoryTab>('dashboard');
  const handleTab = useCallback((key: string) => setTab(key as FactoryTab), []);

  return (
    <PageShell>
      <PageHeader
        nav={{ items: FACTORY_TABS, active: tab, onSelect: handleTab, splitAt: FACTORY_TABS_SPLIT }}
        subtitle="Gia công cốt thép, lồng thép trong nhà xưởng"
        title="Gia công"
        tone="teal"
      />

      <PageBody className="relative">
        <FactoryKpiStrip />

        <div className={FACTORY_MAIN_GRID_CLASSES}>
          <FactoryPlanPanel />

          <PanelCard
            className={FACTORY_PANEL_SLOT_CLASSES.share}
            frameWeight="hairline"
            title="Sản lượng theo khu vực"
            tone="sky"
          >
            <ShareDonutChart
              ariaLabel="Cơ cấu khối lượng đã gia công theo khu vực, tấn"
              centerCaption="Tổng đã GC"
              className="h-full"
              slices={FACTORY_SHARE_SLICES}
              unit="t"
            />
          </PanelCard>

          <PanelCard
            className={FACTORY_PANEL_SLOT_CLASSES.scene}
            flushBody
            frame="prime"
            sweep
            title="Xưởng gia công cốt thép"
            tone="teal"
          >
            <FactoryScene />
          </PanelCard>

          <PanelCard
            bodyClassName="overflow-y-auto"
            className={FACTORY_PANEL_SLOT_CLASSES.notices}
            frameWeight="hairline"
            right={SEE_ALL}
            title="Điểm cần chú ý"
            tone="orange"
          >
            <NoticeBoard items={FACTORY_NOTICES} />
          </PanelCard>

          <PanelCard
            bodyClassName="overflow-y-auto"
            className={FACTORY_PANEL_SLOT_CLASSES.equipment}
            frameWeight="hairline"
            right={SEE_ALL}
            title="Trạng thái thiết bị chính"
            tone="sky"
          >
            <StatusBoard items={FACTORY_EQUIPMENT} />
          </PanelCard>
        </div>

        <div className={FACTORY_BOTTOM_GRID_CLASSES}>
          <PanelCard
            className={FACTORY_PANEL_SLOT_CLASSES.steel}
            flushBody
            frameWeight="hairline"
            title="Tiến độ theo loại thép"
            tone="sky"
          >
            <FactorySteelTable />
          </PanelCard>

          <PanelCard
            className={FACTORY_PANEL_SLOT_CLASSES.remain}
            frameWeight="hairline"
            title="KL còn lại theo loại thép"
            titleNote="tấn"
            tone="sky"
          >
            <CapsuleChart items={FACTORY_REMAIN} tone="sky" unit="t" valueFormat={formatTon} />
          </PanelCard>
        </div>
      </PageBody>
    </PageShell>
  );
});

export default FactoryDemoPage;
