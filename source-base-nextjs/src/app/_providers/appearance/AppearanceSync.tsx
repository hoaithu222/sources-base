'use client';

import { useLayoutEffect } from 'react';

import { usePersistedStoresHydrated } from '@/shared/hooks';
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
 * preferences đổi; `AppProviders` gắn một lần. Lần áp đầu (trước khi vẽ) do script khởi tạo trong `<head>` (`appearanceInitScript`); đợi store nạp xong
 * (`usePersistedStoresHydrated`) mới ghi đè, để không xoá giao diện đã lưu bằng giá trị mặc định.
 */
export default function AppearanceSync() {
  const theme = useEffectiveTheme();
  const accent = useThemeStore(selectAccentColor);
  const isTv = useDisplayStore(selectIsTv);
  const uiScale = useDisplayStore(selectEffectiveUiScale);

  const hydrated = usePersistedStoresHydrated();

  useLayoutEffect(() => {
    if (hydrated) applyAppearance({ theme, accent, isTv, uiScale });
  }, [hydrated, theme, accent, isTv, uiScale]);

  return null;
}
