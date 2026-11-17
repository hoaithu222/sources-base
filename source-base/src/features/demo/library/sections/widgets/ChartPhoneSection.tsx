import { memo, type ReactNode } from 'react';

import { Surface, Text } from '@/shared/ui';

import BarCompareChart from '../../../shared/charts/BarCompareChart';
import ShareDonutChart from '../../../shared/charts/ShareDonutChart';
import SparklineChart from '../../../shared/charts/SparklineChart';
import TrendChart from '../../../shared/charts/TrendChart';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  DEMO_SHARE_SLICES,
  DEMO_SPARK_TILES,
  DEMO_STACK_ROWS,
  DEMO_STACK_SERIES,
  DEMO_TREND_ROWS,
  DEMO_TREND_SERIES,
} from '../../constants/widgets/chart-gallery.constants';

interface PhoneFrameProps {
  title: string;
  children: ReactNode;
}

/** PhoneFrame — khung CỐ ĐỊNH 360px (viewport điện thoại nhỏ nhất thường gặp) bọc một chart, để soi nhãn chồng / cắt. */
const PhoneFrame = memo(function PhoneFrame({ title, children }: PhoneFrameProps) {
  return (
    <Surface className="flex w-[360px] shrink-0 flex-col gap-2" padding="md">
      <Text size="tiny" weight="medium">
        {title}
      </Text>
      {children}
    </Surface>
  );
});

/**
 * ChartPhoneSection — mục "Chart ở 360px": một hàng khung rộng đúng 360px (cuộn ngang khi trang hẹp hơn) chứa các chart
 * của thư viện. Vùng vẽ ≈ 336px nên `m.narrow` bật: legend gọn, trục X thưa theo bề rộng, nhãn trực tiếp nhường legend,
 * donut đặt chú giải xuống dưới. Không phụ thuộc cỡ viewport của trình duyệt đang xem.
 */
const ChartPhoneSection = memo(function ChartPhoneSection() {
  return (
    <DemoSection
      description="Cùng component với thư viện biểu đồ, nhưng trong khung cố định 360px — kiểm nhãn chồng / cắt khi chart hẹp."
      importPath="@/shared/charts"
      title="Chart ở 360px"
    >
      <DemoRow label="khung 360 × auto" note="cuộn ngang khi trang hẹp hơn 4 khung" stacked>
        <div className="flex items-start gap-3 overflow-x-auto overscroll-x-contain pb-1">
          <PhoneFrame title="Đường 12 tháng · 4 series">
            <TrendChart
              ariaLabel="Chi phí lũy kế 12 tháng theo 4 hạng mục, khung điện thoại"
              className="h-60 w-full"
              rows={DEMO_TREND_ROWS}
              series={DEMO_TREND_SERIES}
              unit="tỷ"
            />
          </PhoneFrame>
          <PhoneFrame title="Cột chồng · 5 gói thầu">
            <BarCompareChart
              ariaLabel="Chi phí 4 nhóm theo 5 gói thầu, khung điện thoại"
              className="h-60 w-full"
              rows={DEMO_STACK_ROWS}
              series={DEMO_STACK_SERIES}
              stacked
              unit="tỷ"
            />
          </PhoneFrame>
          <PhoneFrame title="Donut cơ cấu · 6 lát">
            <ShareDonutChart
              ariaLabel="Cơ cấu chi phí, khung điện thoại"
              centerCaption="tỷ đồng"
              slices={DEMO_SHARE_SLICES}
              unit="tỷ"
            />
          </PhoneFrame>
          <PhoneFrame title="Sparkline · thẻ KPI 2 × 2">
            <div className="grid grid-cols-2 gap-2">
              {DEMO_SPARK_TILES.map((tile) => (
                <div key={tile.key} className="flex flex-col gap-1">
                  <Text size="extraTiny" skin="muted">
                    {tile.label}
                  </Text>
                  <Text className="text-h4-medium tabular-nums">{tile.value}</Text>
                  <SparklineChart
                    ariaLabel={`Xu hướng ${tile.label} 8 kỳ gần nhất`}
                    className="h-10 w-full"
                    token={tile.token}
                    values={tile.values}
                  />
                </div>
              ))}
            </div>
          </PhoneFrame>
        </div>
      </DemoRow>
    </DemoSection>
  );
});

export default ChartPhoneSection;
