import { useCallback } from 'react';
import type { ReactNode } from 'react';

import {
  UI_SCALE_VALUES,
  parseThemeMode,
  parseUiScale,
  selectEffectiveUiScale,
  selectIsTv,
  useDisplayStore,
  useEffectiveTheme,
  useThemeStore,
} from '@/domains/preferences';
import {
  PageShell,
  SectionHeader,
  SegmentToggle,
  Surface,
  Text,
  TitleScreen,
  Toggle,
} from '@/shared/ui';
import type { SystemIconName } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

interface SettingRowProps {
  icon: SystemIconName;
  title: string;
  description: string;
  children: ReactNode;
}

const THEME_OPTIONS = [
  { key: 'light', label: 'Sáng' },
  { key: 'dark', label: 'Tối' },
];

const SCALE_OPTIONS = UI_SCALE_VALUES.map((v) => ({ key: String(v), label: `×${v}` }));

const ROW_ICON_CLASSES =
  'flex size-8 shrink-0 items-center justify-center border border-sky-5/25 bg-sky-5/8 text-sky-7 dark:text-sky-5';

/**
 * SettingRow — một dòng cài đặt: ô icon + tên + mô tả bên trái, điều khiển bên phải.
 *
 * @param props.icon - Icon trong ô vuông đầu dòng.
 * @param props.title - Tên cài đặt.
 * @param props.description - Một câu giải thích; đổi theo trạng thái khi điều khiển bị khoá.
 * @param props.children - Điều khiển của dòng (`Toggle`, `SegmentToggle`…).
 */
function SettingRow({ icon, title, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center gap-3 p-3">
      <span aria-hidden className={ROW_ICON_CLASSES}>
        <SystemIcon name={icon} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Text size="small" weight="medium">
          {title}
        </Text>
        <Text size="tiny" skin="muted">
          {description}
        </Text>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/**
 * SettingsPage — cài đặt giao diện: theme sáng/tối và chế độ màn hình lớn (TV).
 *
 * TV ép giao diện tối và khoá chọn theme; tắt TV thì theme đã lưu quay lại. Mức phóng chữ chỉ hiện ở
 * TV. Giá trị từ điều khiển được `parseThemeMode` / `parseUiScale` kiểm trước khi ghi store.
 */
export default function SettingsPage() {
  const theme = useEffectiveTheme();
  const isTv = useDisplayStore(selectIsTv);
  const uiScale = useDisplayStore(selectEffectiveUiScale);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setMode = useDisplayStore((s) => s.setMode);
  const setUiScale = useDisplayStore((s) => s.setUiScale);

  const handleTheme = useCallback(
    (key: string) => {
      const next = parseThemeMode(key);
      if (!isTv && next) setTheme(next);
    },
    [isTv, setTheme],
  );
  const handleTv = useCallback(
    (checked: boolean) => setMode(checked ? 'tv' : 'standard'),
    [setMode],
  );
  const handleScale = useCallback(
    (key: string) => {
      const scale = parseUiScale(key);
      if (scale !== null) setUiScale(scale);
    },
    [setUiScale],
  );

  return (
    <PageShell variant="flow">
      <TitleScreen
        icon="gear-bold"
        iconColor="sky"
        subtitle="GIAO DIỆN · MÀN HÌNH LỚN"
        title="Cài đặt"
      />

      <section className="flex max-w-2xl flex-col gap-2">
        <SectionHeader
          accent
          description="Giao diện và chế độ màn hình lớn"
          icon="palette-outline"
          iconColor="sky"
          title="Hiển thị"
        />
        <Surface className="flex flex-col divide-y divide-divider-default">
          <SettingRow
            description={
              isTv
                ? 'Chế độ TV luôn dùng giao diện tối. Tắt TV để đổi giao diện.'
                : 'Màu nền sáng hoặc tối'
            }
            icon="palette-outline"
            title="Giao diện"
          >
            <SegmentToggle
              disabled={isTv}
              options={THEME_OPTIONS}
              value={theme}
              onValueChange={handleTheme}
            />
          </SettingRow>

          <SettingRow
            description="Phóng CỠ CHỮ để đọc từ xa. Khung giữ nguyên kích thước nên bố cục không vỡ."
            icon="arrows-maximize-outline"
            title="Chế độ màn hình lớn"
          >
            <Toggle aria-label="Chế độ màn hình lớn" checked={isTv} onCheckedChange={handleTv} />
          </SettingRow>

          {isTv && (
            <SettingRow
              description="Trần ×1.3 — cao hơn thì chữ bắt đầu tràn khỏi nút và ô bảng"
              icon="magnifying-glass-plus-outline"
              title="Mức phóng chữ"
            >
              <SegmentToggle
                options={SCALE_OPTIONS}
                value={String(uiScale)}
                onValueChange={handleScale}
              />
            </SettingRow>
          )}
        </Surface>
      </section>
    </PageShell>
  );
}
