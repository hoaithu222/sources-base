import { memo } from 'react';

import {
  selectAccentColor,
  selectIsTv,
  selectThemeMode,
  useDisplayStore,
  useEffectiveTheme,
  useThemeStore,
  type ThemeMode,
  type ThemePreference,
} from '@/domains/preferences';
import { ChoiceTiles, InsetGroup, InsetGroupRow, type ChoiceTileOption } from '@/shared/ui';

import { ACCENT_CHOICES, accentLabelOf } from './settings.constants';
import ThemeThumb from './ThemeThumb';

/** Dòng phụ của "Chủ đề": TV khoá · Tự động nói rõ HĐH đang sáng hay tối · còn lại câu chung. */
function themeHintOf(preference: ThemePreference, effective: ThemeMode, isTv: boolean): string {
  if (isTv) return 'Chế độ TV luôn dùng giao diện tối — tắt TV để đổi.';
  if (preference !== 'system') return 'Màu nền sáng hoặc tối';
  return `Theo hệ điều hành — đang ${effective === 'dark' ? 'tối' : 'sáng'}`;
}

const THEME_CHOICES: readonly ChoiceTileOption<ThemePreference>[] = [
  { value: 'system', label: 'Tự động', preview: <ThemeThumb mode="system" /> },
  { value: 'light', label: 'Sáng', preview: <ThemeThumb mode="light" /> },
  { value: 'dark', label: 'Tối', preview: <ThemeThumb mode="dark" /> },
];

/**
 * AppearanceGroup — nhóm "Giao diện" của trang Cài đặt theo System Settings › Appearance của macOS: ô ảnh Tự động /
 * Sáng / Tối + dải chấm Màu nhấn. `Tự động` theo `prefers-color-scheme` của HĐH; TV ép tối nên khoá ô chọn theme
 * (vẫn đổi được màu nhấn). Đọc / ghi thẳng `useThemeStore`.
 */
const AppearanceGroup = memo(function AppearanceGroup() {
  const preference = useThemeStore(selectThemeMode);
  const accent = useThemeStore(selectAccentColor);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setAccent = useThemeStore((s) => s.setAccent);
  const effective = useEffectiveTheme();
  const isTv = useDisplayStore(selectIsTv);

  return (
    <InsetGroup
      footer="Màu nhấn đổi nút chính, liên kết, mục đang chọn và vòng focus; màu trạng thái (lỗi, cảnh báo) giữ nguyên."
      title="Giao diện"
    >
      <InsetGroupRow
        control={
          <ChoiceTiles
            aria-label="Giao diện"
            disabled={isTv}
            options={THEME_CHOICES}
            value={isTv ? 'dark' : preference}
            onValueChange={setTheme}
          />
        }
        description={themeHintOf(preference, effective, isTv)}
        icon={effective === 'dark' ? 'moon-bold' : 'sun-bold'}
        title="Chủ đề"
        tone="neutral"
        wideControl
      />
      <InsetGroupRow
        control={
          <ChoiceTiles
            aria-label="Màu nhấn"
            options={ACCENT_CHOICES}
            value={accent}
            variant="swatch"
            onValueChange={setAccent}
          />
        }
        description={accentLabelOf(accent)}
        icon="palette-bold"
        title="Màu nhấn"
        tone="primary"
        wideControl
      />
    </InsetGroup>
  );
});

export default AppearanceGroup;
