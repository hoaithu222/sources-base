import { memo } from 'react';

import { Surface } from '@/shared/ui';

import BarCompareChart from '../../../shared/charts/BarCompareChart';
import ShareDonutChart from '../../../shared/charts/ShareDonutChart';
import TrendChart from '../../../shared/charts/TrendChart';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import DemoSparkTile from '../../components/showcase/DemoSparkTile';
import {
  DEMO_AREA_ROWS,
  DEMO_AREA_SERIES,
  DEMO_GROUP_ROWS,
  DEMO_GROUP_SERIES,
  DEMO_SHARE_SLICES,
  DEMO_SPARK_TILES,
  DEMO_STACK_ROWS,
  DEMO_STACK_SERIES,
  DEMO_TREND_ROWS,
  DEMO_TREND_SERIES,
} from '../../constants/widgets/chart-gallery.constants';

/**
 * ChartGallerySection — mục "Thư viện biểu đồ": đường · vùng chồng · cột nhóm · cột chồng · donut cơ cấu · sparkline,
 * tất cả bằng palette 8 slot đã validator. Cùng component với hàng điện thoại 360px của `ChartPhoneSection`; đổi theme
 * (sáng / tối) để soi cả hai bản màu.
 */
const ChartGallerySection = memo(function ChartGallerySection() {
  return (
    <DemoSection
      description="Palette 8 slot + thang cỡ chữ theo mật độ; trục X thưa theo bề rộng thật, legend luôn có, tooltip ăn lần chạm đầu."
      importPath="@/shared/charts"
      title="Thư viện biểu đồ"
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <DemoRow
          label="Đường · 4 series"
          note="legend + nhãn trực tiếp ở cuối đường (≤ 4 series, khung đủ rộng)"
          stacked
        >
          <Surface padding="md">
            <TrendChart
              ariaLabel="Chi phí lũy kế 12 tháng theo 4 hạng mục"
              className="h-64 w-full"
              rows={DEMO_TREND_ROWS}
              series={DEMO_TREND_SERIES}
              unit="tỷ"
            />
          </Surface>
        </DemoRow>

        <DemoRow label="Vùng chồng · 5 series" note="lát cuối là «Khác» xám" stacked>
          <Surface padding="md">
            <TrendChart
              ariaLabel="Chi phí theo tháng, vùng chồng 5 nhóm"
              className="h-64 w-full"
              rows={DEMO_AREA_ROWS}
              series={DEMO_AREA_SERIES}
              unit="tỷ"
              variant="area"
            />
          </Surface>
        </DemoRow>

        <DemoRow label="Cột nhóm · 3 series" note="cột ≤ 24px, nhãn số nguyên trên đỉnh" stacked>
          <Surface padding="md">
            <BarCompareChart
              ariaLabel="Doanh thu 3 khu vực theo quý"
              className="h-64 w-full"
              rows={DEMO_GROUP_ROWS}
              series={DEMO_GROUP_SERIES}
              unit="tỷ"
            />
          </Surface>
        </DemoRow>

        <DemoRow label="Cột chồng · nhãn tổng" note="khoảng hở 2px màu nền giữa các đoạn" stacked>
          <Surface padding="md">
            <BarCompareChart
              ariaLabel="Chi phí 4 nhóm theo 5 gói thầu, cột chồng"
              className="h-64 w-full"
              rows={DEMO_STACK_ROWS}
              series={DEMO_STACK_SERIES}
              stacked
              unit="tỷ"
            />
          </Surface>
        </DemoRow>

        <DemoRow label="Donut cơ cấu" note="chú giải HTML: không nhãn nào nằm ngoài vành" stacked>
          <Surface padding="md">
            <ShareDonutChart
              ariaLabel="Cơ cấu chi phí theo 5 hạng mục và Khác"
              centerCaption="tỷ đồng"
              slices={DEMO_SHARE_SLICES}
              unit="tỷ"
            />
          </Surface>
        </DemoRow>

        <DemoRow
          label="Sparkline trong thẻ KPI"
          note="kiểu widget: nhãn in hoa · một số lớn · chênh kỳ trước · chấm = hiện tại (sparkline chỉ cho hình dạng)"
          stacked
        >
          <div className="grid grid-cols-2 gap-2">
            {DEMO_SPARK_TILES.map((tile) => (
              <DemoSparkTile key={tile.key} tile={tile} />
            ))}
          </div>
        </DemoRow>
      </div>
    </DemoSection>
  );
});

export default ChartGallerySection;
