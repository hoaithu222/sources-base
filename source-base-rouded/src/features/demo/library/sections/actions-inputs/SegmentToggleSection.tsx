import { memo, useState } from 'react';

import { SegmentToggle } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  SEGMENT_SIZES,
  WAVE_HEADER_OPTIONS,
  WAVE_TAB_OPTIONS,
} from '../../constants/actions-inputs/actions.constants';

/** Thanh mẫu giả header `brand` (gradient VCI + biến `--hdr-*`) — wave đặt trong đó tự đọc màu của thanh. */
const WAVE_HEADER_MOCK_CLASSES = cn(
  'relative flex h-12 items-center gap-4 rounded-2xl px-4 squircle rim-tile',
  'bg-linear-to-r from-bg-brand-from via-bg-brand-via to-bg-brand-to',
  '[--hdr-fg:var(--color-neutral-0)] [--hdr-pill:var(--color-neutral-0)] [--hdr-ring:var(--color-accent-5)]',
  '[--hdr-fg-muted:color-mix(in_srgb,var(--color-neutral-0)_80%,transparent)]',
  '[--hdr-hover:color-mix(in_srgb,var(--color-neutral-0)_13%,transparent)]',
  '[--hdr-divider:color-mix(in_srgb,var(--color-neutral-0)_24%,transparent)]',
  '[--hdr-pill-fg:var(--color-primary-8)]',
);

const WAVE_HEADER_TITLE_CLASSES = 'text-body-14-semibold text-neutral-0';

/** Ẩn vạch nền → chỉ còn nét cười dưới tab đang chọn. */
const WAVE_SMILE_ONLY_CLASSES = '[--seg-wave-track:transparent]';

/**
 * SegmentToggleSection — mục "Tab uốn lượn" của `/demo`: `SegmentToggle variant="wave"` trên nền trắng (3 cỡ, chỉ nét
 * cười, giãn hết bề ngang) và trên thanh header `brand` (tự đọc biến `--hdr-*`).
 */
const SegmentToggleSection = memo(function SegmentToggleSection() {
  const [tab, setTab] = useState('pending');
  const [headerTab, setHeaderTab] = useState('stock');

  return (
    <DemoSection
      description='SegmentToggle variant="wave": vạch nền võng thành đường cong dưới tab đang chọn và trượt theo; rê → viên nền nhạt. Màu qua biến --seg-wave-*; trong header tự đọc --hdr-*.'
      importPath="@/shared/ui"
      title="Tab uốn lượn"
    >
      <DemoRow label='wave · size="sm" / "md" / "lg"' note="badge · đoạn khoá · ←/→" stacked>
        {SEGMENT_SIZES.map((size) => (
          <SegmentToggle
            key={size}
            fitContent
            options={WAVE_TAB_OPTIONS}
            size={size}
            value={tab}
            variant="wave"
            onValueChange={setTab}
          />
        ))}
      </DemoRow>

      <DemoRow label="wave · chỉ nét cười / fullWidth" note="--seg-wave-track: transparent" stacked>
        <SegmentToggle
          className={WAVE_SMILE_ONLY_CLASSES}
          fitContent
          options={WAVE_TAB_OPTIONS}
          value={tab}
          variant="wave"
          onValueChange={setTab}
        />
        <SegmentToggle
          fullWidth
          options={WAVE_HEADER_OPTIONS}
          value={headerTab}
          variant="wave"
          onValueChange={setHeaderTab}
        />
      </DemoRow>

      <DemoRow
        label="wave · trên thanh header brand"
        note='size="sm" + self-end: nhãn giữa thanh 48px'
        stacked
      >
        <div className={WAVE_HEADER_MOCK_CLASSES}>
          <span className={WAVE_HEADER_TITLE_CLASSES}>Kho vận</span>
          <SegmentToggle
            className="self-end"
            options={WAVE_HEADER_OPTIONS}
            size="sm"
            value={headerTab}
            variant="wave"
            onValueChange={setHeaderTab}
          />
          <SegmentToggle
            className={cn('self-end', WAVE_SMILE_ONLY_CLASSES)}
            options={WAVE_HEADER_OPTIONS}
            size="sm"
            value={headerTab}
            variant="wave"
            onValueChange={setHeaderTab}
          />
        </div>
      </DemoRow>
    </DemoSection>
  );
});

export default SegmentToggleSection;
