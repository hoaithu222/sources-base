import { memo, useDeferredValue, useMemo, useState } from 'react';

import { EmptyState, Input, Text, type SystemIconName } from '@/shared/ui';
import { systemIcons } from '@/shared/ui/icons';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { useImeSafeSearchInput } from '@/shared/hooks';
import { includesNormalized, normalizeSearch } from '@/shared/utils/format/string.utils';
import { cn } from '@/shared/utils/style/cn';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';

const ALL_ICON_NAMES = Object.keys(systemIcons) as SystemIconName[];

const ICON_TILE_CLASSES = cn(
  'flex flex-col items-center gap-1 border border-border-default bg-bg-surface p-2',
  'transition-[background-color,border-color] duration-150 ease-out',
  'hover:border-primary-5/60 hover:bg-bg-nav-hover',
);

/**
 * IconsSection — mục "Biểu tượng" của trang `/demo`: toàn bộ registry `SystemIcon`, tra cứu gõ không dấu.
 */
const IconsSection = memo(function IconsSection() {
  const [search, setSearch] = useState('');
  const { inputProps } = useImeSafeSearchInput(search, setSearch);
  const deferredSearch = useDeferredValue(search);

  const matched = useMemo(() => {
    const needle = normalizeSearch(deferredSearch);
    if (!needle) return ALL_ICON_NAMES;
    return ALL_ICON_NAMES.filter((n) => includesNormalized(n, needle));
  }, [deferredSearch]);

  return (
    <DemoSection
      description="Registry sinh tự động từ src/assets/icons/*.svg. Thêm SVG rồi chạy npm run generate:icons."
      importPath="<SystemIcon name=… />"
      title="Biểu tượng"
    >
      <DemoRow
        label="Quy ước"
        note="mặc định biến thể -outline; -bold chỉ cho gem / KPI / lớp phủ ảnh"
      >
        <div className="flex items-center gap-2">
          <SystemIcon className="text-fg-subheading" name="house-outline" size={20} />
          <Text className="font-mono" size="extraTiny" skin="muted">
            house-outline
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <SystemIcon className="text-primary-5" name="house-bold" size={20} />
          <Text className="font-mono" size="extraTiny" skin="muted">
            house-bold
          </Text>
        </div>
      </DemoRow>

      <DemoRow label="Cỡ" note="mặc định 16px; màu điều khiển bằng class text-*">
        {[12, 14, 16, 20, 24, 32].map((size) => (
          <div key={size} className="flex flex-col items-center gap-1">
            <SystemIcon className="text-fg-subheading" name="gear-outline" size={size} />
            <Text className="tabular-nums" size="extraTiny" skin="muted">
              {size}
            </Text>
          </div>
        ))}
      </DemoRow>

      <DemoRow label={`Tra cứu — ${matched.length}/${ALL_ICON_NAMES.length} biểu tượng`} stacked>
        <Input
          {...inputProps}
          clearable
          placeholder="Tìm biểu tượng… (gõ không dấu vẫn ra)"
          startIcon={<SystemIcon name="magnifying-glass-outline" size={14} />}
          wrapperClassName="max-w-md"
        />
        {matched.length === 0 ? (
          <EmptyState
            description="Thử từ khoá ngắn hơn, vd “arrow”, “chart”."
            icon="magnifying-glass-bold"
            title="Không có biểu tượng nào khớp"
          />
        ) : (
          <div className="grid max-h-80 grid-cols-3 gap-1 overflow-y-auto overscroll-contain sm:grid-cols-5 lg:grid-cols-8">
            {matched.map((name) => (
              <div key={name} className={ICON_TILE_CLASSES} title={name}>
                <SystemIcon className="text-fg-subheading" name={name} size={20} />
                <Text
                  className="w-full truncate text-center font-mono"
                  size="extraTiny"
                  skin="muted"
                >
                  {name}
                </Text>
              </div>
            ))}
          </div>
        )}
      </DemoRow>
    </DemoSection>
  );
});

export default IconsSection;
