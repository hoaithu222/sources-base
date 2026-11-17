import { memo, useState } from 'react';

import {
  AppIcon,
  AppTile,
  SegmentToggle,
  Text,
  VCI_ICONS,
  VciIcon,
  type AppTileTone,
  type SegmentOption,
  type VciIconGroup,
  type VciIconName,
  type VciIconVariant,
} from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';

const VCI_ICON_NAMES = Object.keys(VCI_ICONS) as VciIconName[];

const GROUP_LABELS = {
  brand: 'Thương hiệu',
  module: 'Phân hệ',
  business: 'Nghiệp vụ',
  action: 'Thao tác & trạng thái',
} satisfies Record<VciIconGroup, string>;

const VARIANT_OPTIONS: SegmentOption[] = [
  { key: 'duo', label: 'Duo' },
  { key: 'line', label: 'Line' },
] satisfies (SegmentOption & { key: VciIconVariant })[];

/** Ba nét nhận diện lấy từ logo — mỗi nét một icon minh hoạ. */
const SIGNATURES: readonly { icon: VciIconName; title: string; note: string }[] = [
  { icon: 'overview', title: 'Vòng hở 3 cung', note: 'khe 10 · 2 · 6 giờ như vòng logo' },
  { icon: 'hr', title: 'Chấm nhấn', note: 'chấm đỏ logo — đầu người, điểm dữ liệu' },
  { icon: 'finance', title: 'Mảng tô nhạt', note: 'chỉ ở duo, 16% màu thân' },
];

const TILE_DEMO: readonly [VciIconName, AppTileTone][] = [
  ['finance', 'primary'],
  ['purchase', 'orange'],
  ['warehouse', 'yellow'],
  ['production', 'indigo'],
  ['hr', 'pink'],
  ['report', 'blue'],
  ['apps', 'purple'],
];

const CARD_CLASSES = cn(
  'flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface p-2 text-link',
  'transition-[border-color,box-shadow] duration-150 ease-out hover:border-border-strong hover:shadow-(--elev-1)',
);

/**
 * VciIconsSection — mục "Bộ icon VCI" của `/demo`: ngôn ngữ thiết kế (vòng hở, chấm nhấn, mảng tô), biến thể line / duo,
 * cỡ, glyph trên `AppTile` và toàn bộ icon theo nhóm.
 */
const VciIconsSection = memo(function VciIconsSection() {
  const [variant, setVariant] = useState<VciIconVariant>('duo');

  return (
    <DemoSection
      description="Lưới 24 · nét 1.75 đầu tròn · vòng hở 3 cung + chấm nhấn lấy từ logo VCI. Nguồn src/assets/vci-icons/*.svg → npm run generate:vci-icons."
      importPath="<VciIcon name=… /> · <AppIcon name=… />"
      title="Bộ icon VCI"
    >
      <DemoRow label="Ngôn ngữ" note="biểu tượng gốc: vòng logo + chữ V + chấm">
        <VciIcon className="text-link" name="home" size={48} variant="duo" />
        {SIGNATURES.map((item) => (
          <div key={item.icon} className="flex items-center gap-2">
            <VciIcon className="text-link" name={item.icon} size={32} variant="duo" />
            <div className="flex flex-col">
              <Text size="tiny" weight="bold">
                {item.title}
              </Text>
              <Text size="extraTiny" skin="muted">
                {item.note}
              </Text>
            </div>
          </div>
        ))}
      </DemoRow>

      <DemoRow label="Cỡ" note="16 · 20 · 24 · 32 · 48 — nét luôn 1.75 trên lưới 24">
        {[16, 20, 24, 32, 48].map((size) => (
          <VciIcon key={size} className="text-fg-heading" name="warehouse" size={size} />
        ))}
      </DemoRow>

      <DemoRow label="AppIcon" note="tên từ cấu hình (meta route) — tự chọn VciIcon hay SystemIcon">
        <AppIcon className="text-fg-heading" name="warehouse" size={24} />
        <AppIcon className="text-fg-heading" name="boxes-stacked-outline" size={24} />
      </DemoRow>

      <DemoRow label="AppTile" note="glyph trắng bản duo, chấm vàng kim; ≤ 16px tự dày nét 2.25">
        {TILE_DEMO.map(([icon, tone]) => (
          <AppTile key={icon} icon={icon} size="lg" tone={tone} />
        ))}
        <AppTile icon="finance" size="sm" />
        <AppTile icon="finance" size="xs" />
      </DemoRow>

      <DemoRow
        label={`Toàn bộ — ${VCI_ICON_NAMES.length} icon`}
        note="duo cho icon nhận diện (thẻ, tiêu đề khối, empty state); line cho nút / menu"
        stacked
      >
        <div className="w-fit">
          <SegmentToggle
            options={VARIANT_OPTIONS}
            size="sm"
            value={variant}
            onValueChange={(value) => setVariant(value as VciIconVariant)}
          />
        </div>
        {(Object.keys(GROUP_LABELS) as VciIconGroup[]).map((group) => (
          <div key={group} className="flex flex-col gap-2">
            <Text size="extraTiny" skin="muted" weight="bold">
              {GROUP_LABELS[group]}
            </Text>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6">
              {VCI_ICON_NAMES.filter((name) => VCI_ICONS[name].group === group).map((name) => (
                <div key={name} className={CARD_CLASSES} title={name}>
                  <VciIcon name={name} size={24} variant={variant} />
                  <div className="flex min-w-0 flex-col">
                    <Text className="truncate" size="tiny" weight="medium">
                      {VCI_ICONS[name].label}
                    </Text>
                    <Text className="truncate font-mono" size="extraTiny" skin="muted">
                      {name}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </DemoRow>
    </DemoSection>
  );
});

export default VciIconsSection;
