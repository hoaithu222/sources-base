'use client';

import { memo, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import {
  selectAccentColor,
  selectIsTv,
  selectThemeMode,
  useDisplayStore,
  useEffectiveTheme,
  useThemeStore,
  type AccentColor,
  type ThemePreference,
} from '@/domains/preferences';
import { ChoiceTiles, InsetGroup, InsetGroupRow, type ChoiceTileOption } from '@/shared/ui';

import { ACCENT_FILL, ACCENT_ORDER } from './settings.constants';
import ThemeThumb from './ThemeThumb';

/** Dòng phụ của "Chủ đề": TV khoá · Tự động nói rõ HĐH đang sáng hay tối · còn lại câu chung. */
function themeHintKeyOf(preference: ThemePreference, isTv: boolean): 'tv' | 'system' | 'fixed' {
  if (isTv) return 'tv';
  return preference === 'system' ? 'system' : 'fixed';
}

/**
 * AppearanceGroup — nhóm "Giao diện" của trang Cài đặt theo System Settings › Appearance của macOS: ô ảnh Tự động /
 * Sáng / Tối + dải chấm Màu nhấn. `Tự động` theo `prefers-color-scheme` của HĐH; TV ép tối nên khoá ô chọn theme
 * (vẫn đổi được màu nhấn). Đọc / ghi thẳng `useThemeStore`. Chữ ở `messages/<locale>/account.json` (`settings.appearance`).
 */
const AppearanceGroup = memo(function AppearanceGroup() {
  const t = useTranslations('account.settings.appearance');
  const preference = useThemeStore(selectThemeMode);
  const accent = useThemeStore(selectAccentColor);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setAccent = useThemeStore((s) => s.setAccent);
  const effective = useEffectiveTheme();
  const isTv = useDisplayStore(selectIsTv);

  const themeChoices = useMemo<readonly ChoiceTileOption<ThemePreference>[]>(
    () => [
      { value: 'system', label: t('themes.system'), preview: <ThemeThumb mode="system" /> },
      { value: 'light', label: t('themes.light'), preview: <ThemeThumb mode="light" /> },
      { value: 'dark', label: t('themes.dark'), preview: <ThemeThumb mode="dark" /> },
    ],
    [t],
  );
  const accentChoices = useMemo<readonly ChoiceTileOption<AccentColor>[]>(
    () =>
      ACCENT_ORDER.map((value) => ({
        value,
        label: t(`accents.${value}`),
        fill: ACCENT_FILL[value],
      })),
    [t],
  );

  const themeHint = t(`themeHint.${themeHintKeyOf(preference, isTv)}`, {
    mode: t(`modes.${effective}`),
  });

  return (
    <InsetGroup footer={t('footer')} title={t('title')}>
      <InsetGroupRow
        control={
          <ChoiceTiles
            aria-label={t('title')}
            disabled={isTv}
            options={themeChoices}
            value={isTv ? 'dark' : preference}
            onValueChange={setTheme}
          />
        }
        description={themeHint}
        icon={effective === 'dark' ? 'moon-bold' : 'sun-bold'}
        title={t('theme')}
        tone="neutral"
        wideControl
      />
      <InsetGroupRow
        control={
          <ChoiceTiles
            aria-label={t('accent')}
            options={accentChoices}
            value={accent}
            variant="swatch"
            onValueChange={setAccent}
          />
        }
        description={t(`accents.${accent}`)}
        icon="palette-bold"
        title={t('accent')}
        tone="primary"
        wideControl
      />
    </InsetGroup>
  );
});

export default AppearanceGroup;
