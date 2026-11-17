import { memo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import { useEffectiveTheme, useThemeStore } from '@/domains/preferences';

import {
  Button,
  ContextMenu,
  Menu,
  SegmentToggle,
  Text,
  ThemeToggle,
  type MenuOption,
  type SegmentOption,
  type SystemIconName,
} from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  BUTTON_SIZES,
  BUTTON_SKINS,
  BUTTON_VARIANTS,
  ICON_SEGMENT_ITEMS,
  MENU_ITEMS,
  SEGMENT_OPTIONS,
  SEGMENT_SIZES,
  SEGMENT_SKINS,
  SEGMENT_STATE_OPTIONS,
  SEGMENT_VARIANTS,
  THEME_TOGGLE_SIZES,
} from '../../constants/actions-inputs/actions.constants';

function withIcon<T extends { iconName?: SystemIconName }>({ iconName, ...option }: T) {
  return { ...option, icon: iconName ? <SystemIcon name={iconName} size={14} /> : undefined };
}

const MENU_OPTIONS: MenuOption[] = MENU_ITEMS.map(withIcon);
const ICON_SEGMENT_OPTIONS: SegmentOption[] = ICON_SEGMENT_ITEMS.map(withIcon);

/** ActionsSection — mục "Hành động" của `/demo`: Button · Menu · ContextMenu · SegmentToggle · ThemeToggle. */
const ActionsSection = memo(function ActionsSection() {
  const [segment, setSegment] = useState('week');
  const handleSegment = useCallback((key: string) => setSegment(key), []);

  const theme = useEffectiveTheme();
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <DemoSection
      description="Button 4 kiểu × 4 tông × 5 cỡ (ma trận đủ ở mục Nút) · Menu · ContextMenu · SegmentToggle · ThemeToggle."
      importPath="@/shared/ui"
      title="Hành động"
    >
      <DemoRow label="Button · variant" note="ma trận đủ variant×skin×size ở mục Nút bên dưới">
        {BUTTON_VARIANTS.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </DemoRow>

      <DemoRow label="Button · skin">
        {BUTTON_SKINS.map((skin) => (
          <Button key={skin} skin={skin} variant="primary">
            {skin}
          </Button>
        ))}
      </DemoRow>

      <DemoRow label="Button · size">
        {BUTTON_SIZES.map((size) => (
          <Button key={size} size={size} variant="secondary">
            {size}
          </Button>
        ))}
      </DemoRow>

      <DemoRow label="Button · trạng thái, phụ kiện & asChild">
        <Button startIcon={<SystemIcon name="plus-outline" size={16} />}>Thêm mới</Button>
        <Button endIcon={<SystemIcon name="angle-right-outline" size={16} />} variant="stroke">
          Tiếp
        </Button>
        <Button loading>Đang lưu</Button>
        <Button disabled>Không bấm được</Button>
        <Button aria-label="Cài đặt" iconOnly title="Cài đặt" variant="ghost">
          <SystemIcon name="gear-outline" size={16} />
        </Button>
        <Button asChild variant="stroke">
          <Link to="#actions">Liên kết thật (asChild)</Link>
        </Button>
      </DemoRow>

      <DemoRow label="Button · fullWidth" stacked>
        <div className="max-w-xs">
          <Button fullWidth variant="primary">
            Chiếm hết bề ngang
          </Button>
        </div>
      </DemoRow>

      <DemoRow label="SegmentToggle · variant" note="mặt trượt · ←/→ · đoạn khoá mờ" stacked>
        <div className="flex flex-wrap items-center gap-3">
          {SEGMENT_VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-col gap-1">
              <Text className="font-mono" size="extraTiny" skin="muted">
                {variant}
              </Text>
              <SegmentToggle
                options={SEGMENT_STATE_OPTIONS}
                value={segment}
                variant={variant}
                onValueChange={handleSegment}
              />
            </div>
          ))}
        </div>
      </DemoRow>

      <DemoRow
        label="SegmentToggle · size / skin (subtle) / fullWidth / fitContent / icon-only"
        stacked
      >
        <div className="flex flex-wrap items-center gap-3">
          {SEGMENT_SIZES.map((size) => (
            <SegmentToggle
              key={size}
              options={SEGMENT_OPTIONS}
              size={size}
              value={segment}
              onValueChange={handleSegment}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {SEGMENT_SKINS.map((skin) => (
            <SegmentToggle
              key={skin}
              options={SEGMENT_OPTIONS}
              skin={skin}
              value={segment}
              variant="subtle"
              onValueChange={handleSegment}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentToggle
            fitContent
            options={SEGMENT_OPTIONS}
            value={segment}
            onValueChange={handleSegment}
          />
          <SegmentToggle
            options={ICON_SEGMENT_OPTIONS}
            value="grid"
            onValueChange={() => undefined}
          />
        </div>
        <SegmentToggle
          fullWidth
          options={SEGMENT_OPTIONS}
          value={segment}
          onValueChange={handleSegment}
        />
      </DemoRow>

      <DemoRow label="Menu · header / side / ContextMenu · modal / ThemeToggle · size">
        <Menu
          header={
            <Text size="tiny" weight="medium">
              Admin · quản trị viên
            </Text>
          }
          options={MENU_OPTIONS}
          side="right"
          trigger={
            <Button endIcon={<SystemIcon name="angle-down-outline" size={12} />} variant="stroke">
              Mở menu
            </Button>
          }
        />
        <ContextMenu modal={false} options={MENU_OPTIONS}>
          <div className="flex h-9 items-center rounded-md border border-dashed border-border-strong px-3">
            <Text size="tiny" skin="muted">
              Chuột phải (modal=false)
            </Text>
          </div>
        </ContextMenu>
        {THEME_TOGGLE_SIZES.map((size) => (
          <ThemeToggle key={size} size={size} theme={theme} onToggle={toggleTheme} />
        ))}
      </DemoRow>
    </DemoSection>
  );
});

export default ActionsSection;
