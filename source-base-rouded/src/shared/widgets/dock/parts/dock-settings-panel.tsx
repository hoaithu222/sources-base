import { memo } from 'react';
import type { ReactNode } from 'react';

import { Divider, Text, Toggle } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import { DOCK_MODE_OPTIONS, useDockSettingsStore } from '../dock-settings.store';
import type { DockDisplayMode } from '../dock.types';
import DockOptionTile from './dock-option-tile';
import DockPositionPicker from './dock-position-picker';
import { DOCK_SETTINGS_SELECTED_CLASSES, DOCK_SETTINGS_SLOT_CLASSES } from '../dock-settings.theme';

export interface DockSettingsPanelProps {
  mode: DockDisplayMode;
  modeLocked?: boolean;
}

const RadioIndicator = memo(function RadioIndicator({ selected }: { selected: boolean }) {
  const stateClassName = cn(
    DOCK_SETTINGS_SLOT_CLASSES.optionState,
    selected && DOCK_SETTINGS_SELECTED_CLASSES.optionState,
  );

  return (
    <span aria-hidden className={stateClassName}>
      {selected && <SystemIcon name="check-bold" size={10} />}
    </span>
  );
});

const SectionLabel = memo(function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text as="span" className={DOCK_SETTINGS_SLOT_CLASSES.sectionLabel}>
      {children}
    </Text>
  );
});

/**
 * DockSettingsPanel — nội dung `Popover` cấu hình Dock: cạnh neo (trái · đáy · phải) + chế độ hiển thị + công tắc phóng icon. Phần
 * nội bộ của `DockSettingsButton`.
 *
 * Tự đọc / ghi store cục bộ `dock-settings.store` (`magnify`, `position`, `setMode`, `setMagnify`, `setPosition`); chỉ chế độ ĐANG VẼ
 * vào qua prop (máy chạm bị ép `pinned`, khác giá trị đã lưu).
 * Sửa giao diện: khung · tiêu đề · nhãn nhóm → `DOCK_SETTINGS_SLOT_CLASSES` · hàng → `dock-option-tile.tsx`
 * · nhãn chế độ → `DOCK_MODE_OPTIONS`.
 *
 * @param props.mode - Chế độ đang hiệu lực (hàng được đánh dấu chọn).
 * @param props.modeLocked - Khoá phần chọn chế độ (máy chạm bị ép `pinned`): các hàng vẫn hiện, chỉ mờ
 *   kèm một dòng giải thích. Mặc định `false`.
 *
 * @example
 * <DockSettingsPanel mode="pinned" modeLocked={isCoarsePointer} />
 */
const DockSettingsPanel = memo(function DockSettingsPanel({
  mode,
  modeLocked = false,
}: DockSettingsPanelProps) {
  const magnify = useDockSettingsStore((s) => s.magnify);
  const setMode = useDockSettingsStore((s) => s.setMode);
  const setMagnify = useDockSettingsStore((s) => s.setMagnify);
  const position = useDockSettingsStore((s) => s.position);
  const setPosition = useDockSettingsStore((s) => s.setPosition);

  return (
    <div className={DOCK_SETTINGS_SLOT_CLASSES.panel}>
      <div className={DOCK_SETTINGS_SLOT_CLASSES.panelHeader}>
        <span className={DOCK_SETTINGS_SLOT_CLASSES.panelHeaderIcon}>
          <SystemIcon name="sliders-simple-bold" />
        </span>
        <Text as="span" className={DOCK_SETTINGS_SLOT_CLASSES.panelTitle}>
          Tuỳ chỉnh Dock
        </Text>
      </div>

      <Divider className="mb-1" />

      <SectionLabel>Vị trí trên màn hình</SectionLabel>
      <DockPositionPicker value={position} onChange={setPosition} />

      <Divider className="my-2" />

      <SectionLabel>Chế độ hiển thị</SectionLabel>

      {modeLocked && (
        <Text as="span" className="block px-2 pb-1 text-fg-on-chrome-muted" size="extraTiny">
          Trên máy tính bảng, Dock luôn hiện để không bị mất khi chạm.
        </Text>
      )}

      <div className={DOCK_SETTINGS_SLOT_CLASSES.optionList}>
        {DOCK_MODE_OPTIONS.map((opt) => {
          const isSelected = mode === opt.value;
          return (
            <DockOptionTile
              key={opt.value}
              description={opt.description}
              icon={opt.icon}
              locked={modeLocked && !isSelected}
              selected={isSelected}
              title={opt.label}
              trailing={<RadioIndicator selected={isSelected} />}
              onClick={() => setMode(opt.value)}
            />
          );
        })}
      </div>

      <Divider className="my-2" />

      <SectionLabel>Hiệu ứng</SectionLabel>
      <DockOptionTile
        accent={magnify}
        as="label"
        description="Icon nở to dần khi rê chuột"
        icon="magnifying-glass-bold"
        title="Phóng to icon"
        trailing={<Toggle checked={magnify} size="sm" onCheckedChange={setMagnify} />}
      />
    </div>
  );
});

export default DockSettingsPanel;
