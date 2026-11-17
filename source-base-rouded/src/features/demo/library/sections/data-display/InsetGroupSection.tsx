import { memo, useState } from 'react';

import { InsetGroup, InsetGroupRow, SegmentToggle, Toggle, TrendBadge, VciIcon } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';

const DENSITY_OPTIONS = [
  { key: 'compact', label: 'Gọn' },
  { key: 'regular', label: 'Vừa' },
];

/** Dải nền màu để thấy kính mờ "ăn" màu phía sau — như widget macOS trên hình nền. */
const GLASS_BACKDROP_CLASSES = cn(
  'relative isolate grid gap-4 overflow-hidden rounded-2xl p-4 md:grid-cols-2',
  'bg-linear-to-br from-primary-5 via-primary-7 to-primary-8',
  "before:absolute before:-top-16 before:-right-10 before:-z-10 before:size-56 before:rounded-full before:bg-accent-5/45 before:blur-2xl before:content-['']",
  "after:absolute after:-bottom-20 after:left-10 after:-z-10 after:size-64 after:rounded-full after:bg-primary-3/50 after:blur-2xl after:content-['']",
);

const WIDGET_CLASSES = cn(
  'rim-glass relative flex flex-col gap-1 rounded-2xl bg-bg-glass p-4 backdrop-blur-xl backdrop-saturate-150',
  'shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_60%,transparent),0_10px_28px_-14px_var(--color-shadow-glass)]',
);

/**
 * InsetGroupSection — mục "Hộp nhóm macOS" của `/demo`: `InsetGroup` cho cài đặt, danh sách đi sâu có số đếm, cặp nhãn –
 * giá trị của bản ghi, và bản kính mờ trên dải màu (kèm widget số liệu kiểu macOS).
 */
const InsetGroupSection = memo(function InsetGroupSection() {
  const [autoApprove, setAutoApprove] = useState(true);
  const [density, setDensity] = useState('compact');

  return (
    <DemoSection
      description="Hộp nhóm kiểu System Settings: tiêu đề ngoài hộp, dòng = ô icon · tên + dòng phụ · giá trị / điều khiển, vạch ngăn thụt vào; dòng có href là liên kết thật kèm ›."
      importPath="<InsetGroup> · <InsetGroupRow>"
      title="Hộp nhóm macOS"
    >
      <DemoRow label="Cài đặt" note="dòng tĩnh + điều khiển bên phải" stacked>
        <InsetGroup
          className="max-w-xl"
          footer="Phiếu dưới hạn mức được duyệt ngay khi lưu."
          title="Phê duyệt"
        >
          <InsetGroupRow
            control={
              <Toggle
                aria-label="Tự động duyệt"
                checked={autoApprove}
                onCheckedChange={setAutoApprove}
              />
            }
            description="Phiếu nhập kho dưới 5.000.000 ₫"
            icon="approval"
            title="Tự động duyệt"
          />
          <InsetGroupRow
            control={
              <SegmentToggle
                options={DENSITY_OPTIONS}
                size="sm"
                value={density}
                onValueChange={setDensity}
              />
            }
            icon="settings"
            title="Mật độ bảng"
            tone="neutral"
          />
        </InsetGroup>
      </DemoRow>

      <DemoRow label="Đi sâu" note="số đếm + › — nhìn là biết bên trong có gì" stacked>
        <InsetGroup className="max-w-xl" title="Quyền theo phân hệ">
          <InsetGroupRow
            description="Sổ cái, công nợ, ngân quỹ"
            href="#finance"
            icon="finance"
            title="Tài chính"
            value="4"
          />
          <InsetGroupRow
            description="Đề nghị, đơn mua"
            href="#purchase"
            icon="purchase"
            title="Mua hàng"
            tone="orange"
            value="2"
          />
          <InsetGroupRow
            description="Chưa cấp quyền"
            href="#warehouse"
            icon="warehouse"
            title="Kho vận"
            tone="yellow"
            value="0"
          />
          <InsetGroupRow href="#hr" icon="hr" title="Nhân sự" tone="pink" value="11 người" />
        </InsetGroup>
      </DemoRow>

      <DemoRow label="Bản ghi" note="sunken — hộp xám nhạt khi nằm trong bề mặt trắng" stacked>
        <div className="max-w-xl rounded-xl border border-border-default bg-bg-surface p-4">
          <InsetGroup surface="sunken" title="Phiếu nhập kho PNK-2026-1017">
            <InsetGroupRow title="Kho nhận" value="Kho tổng Đông Anh" />
            <InsetGroupRow title="Nhà cung cấp" value="Thép Hoà Phát" />
            <InsetGroupRow title="Tổng tiền" value="705.425.000 ₫" />
            <InsetGroupRow description="Chờ kế toán kho" title="Trạng thái" value="Chờ duyệt" />
          </InsetGroup>
        </div>
      </DemoRow>

      <DemoRow
        label="Viền bắt sáng"
        note="sáng từ trên-trái: rim-soft · rim-tile · rim-glass (cả hai theme — tối mờ hơn, không neon)"
      >
        <div className="rim-soft flex size-24 items-end rounded-xl border border-border-default bg-bg-surface p-2 text-caption-12 text-fg-muted shadow-(--elev-1)">
          rim-soft
        </div>
        <div className="rim-tile relative flex size-24 items-end rounded-xl bg-linear-to-b from-primary-5 via-primary-6 to-primary-8 p-2 text-caption-12 text-neutral-0">
          rim-tile
        </div>
        <div className="flex size-28 items-center justify-center rounded-2xl bg-linear-to-br from-primary-5 to-primary-8">
          <div className="rim-glass relative flex size-20 items-end rounded-xl bg-bg-glass p-2 text-caption-12 text-fg-body backdrop-blur-xl">
            rim-glass
          </div>
        </div>
      </DemoRow>

      <DemoRow label="Kính mờ" note="glass chỉ đặt trên nền có màu — kính lấy màu phía sau" stacked>
        <div className={GLASS_BACKDROP_CLASSES}>
          <InsetGroup surface="glass">
            <InsetGroupRow
              href="#pending"
              icon="pending"
              title="Chờ duyệt"
              tone="orange"
              value="12"
            />
            <InsetGroupRow href="#alert" icon="alert" title="Chậm tiến độ" tone="red" value="3" />
            <InsetGroupRow
              href="#done"
              icon="approval"
              title="Đã nghiệm thu"
              tone="green"
              value="28"
            />
          </InsetGroup>
          <div className="grid grid-cols-2 gap-4">
            <div className={WIDGET_CLASSES}>
              <span className="text-caption-12-semibold uppercase tracking-[0.06em] text-fg-muted">
                Dòng tiền
              </span>
              <span className="text-h4-bold tabular-nums text-fg-heading">+1,8 tỷ</span>
              <span className="flex items-center gap-2">
                <TrendBadge current={18} previous={15} versus="tuần trước" />
                <VciIcon className="text-primary-7" name="analytics" size={20} variant="duo" />
              </span>
            </div>
            <div className={cn(WIDGET_CLASSES, 'items-center justify-center text-center')}>
              <VciIcon className="text-primary-7" name="bell" size={28} variant="duo" />
              <span className="text-body-14-semibold text-fg-heading">Không có nhắc việc</span>
              <span className="text-caption-12 text-fg-muted">Việc mới sẽ hiện ở đây</span>
            </div>
          </div>
        </div>
      </DemoRow>
    </DemoSection>
  );
});

export default InsetGroupSection;
