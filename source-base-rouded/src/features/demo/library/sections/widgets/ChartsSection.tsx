import { memo } from 'react';

import { Callout, Surface } from '@/shared/ui';

import SCurveChart from '../../../shared/charts/SCurveChart';
import WorkVolumeChart from '../../../shared/charts/WorkVolumeChart';
import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import { DEMO_S_CURVE, DEMO_WORK_VOLUME } from '../../constants/widgets/charts.constants';

/**
 * ChartsSection — mục "Biểu đồ": hai biểu đồ mẫu của `chart-conventions.md`, CÙNG component với màn
 * `/demo/tong-quan` (`SCurveChart`, `WorkVolumeChart`) nên sửa quy ước chart là cả hai nơi đổi theo.
 */
const ChartsSection = memo(function ChartsSection() {
  return (
    <DemoSection
      description="Thang mật độ + bảng màu + style trục/lưới/tooltip/chú giải dùng chung cho mọi chart Recharts."
      importPath="@/shared/charts"
      title="Biểu đồ"
    >
      <Callout
        intent="warning"
        title="Không viết fontSize bằng số trong file chart"
        variant="tinted"
      >
        Mọi cỡ chữ đi qua <code className="font-mono">m.axisTick</code> /{' '}
        <code className="font-mono">m.barLabel</code> / <code className="font-mono">m.scale.*</code>
        . Số cứng làm chart đứng yên khi phóng to — bấm xem toàn màn hình mà chữ không to lên thì
        phóng to chẳng để làm gì.
      </Callout>

      <DemoGrid min="xl">
        <DemoRow
          label="Lũy kế Kế hoạch / Thực tế"
          note="kế hoạch = nét đứt xanh dương, thực tế = nét liền lục + vùng gradient cùng hue"
          stacked
        >
          <Surface padding="sm">
            <SCurveChart
              ariaLabel="Đường S lũy kế 8 tháng: kế hoạch và thực tế"
              className="h-56 w-full"
              points={DEMO_S_CURVE}
            />
          </Surface>
        </DemoRow>

        <DemoRow
          label="Cột chồng + nhãn tổng"
          note="thân cột gradient -5 → -6; nhãn tổng treo trên cột neo trong suốt"
          stacked
        >
          <Surface padding="sm">
            <WorkVolumeChart
              ariaLabel="Số đầu việc hoàn thành / đang làm / chậm theo 5 hạng mục"
              className="h-56 w-full"
              data={DEMO_WORK_VOLUME}
            />
          </Surface>
        </DemoRow>
      </DemoGrid>
    </DemoSection>
  );
});

export default ChartsSection;
