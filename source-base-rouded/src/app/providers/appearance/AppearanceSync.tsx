import { useLayoutEffect } from 'react';

import {
  selectAccentColor,
  selectEffectiveUiScale,
  selectIsTv,
  useDisplayStore,
  useEffectiveTheme,
  useThemeStore,
} from '@/domains/preferences';

import { applyAppearance } from './appearance.utils';

/**
 * AppearanceSync — áp theme / TV / scale ĐANG CÓ HIỆU LỰC lên `<html>` trước lần vẽ kế tiếp mỗi khi
 * preferences đổi; `AppProvider` gắn một lần. Lần áp đầu (trước render React) do `initializeAppearance`.
 */
export default function AppearanceSync() {
  const theme = useEffectiveTheme();
  const accent = useThemeStore(selectAccentColor);
  const isTv = useDisplayStore(selectIsTv);
  const uiScale = useDisplayStore(selectEffectiveUiScale);

  useLayoutEffect(() => {
    applyAppearance({ theme, accent, isTv, uiScale });
  }, [theme, accent, isTv, uiScale]);

  return null;
}
