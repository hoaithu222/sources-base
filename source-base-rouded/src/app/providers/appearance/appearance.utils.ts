import {
  prefersDarkScheme,
  readDisplayOverrides,
  resolveEffectiveTheme,
  selectAccentColor,
  selectEffectiveUiScale,
  selectIsTv,
  selectThemeMode,
  useDisplayStore,
  useThemeStore,
} from '@/domains/preferences';
import type { AccentColor, EffectiveUiScale, ThemeMode } from '@/domains/preferences';

/**
 * appearance — áp giao diện ĐANG CÓ HIỆU LỰC lên `<html>` (class `dark` · `tv`, `data-accent` = màu nhấn khác VCI — CSS ở
 * `styles/overrides/accent.css`, biến `--ui-scale` · `--lh-scale`) và
 * đồng bộ màu thanh trình duyệt `<meta name="theme-color">` theo token nền `--color-bg-page`.
 *
 * Dùng:   initializeAppearance()  MỘT lần trước render (bootstrapApp) — URL `?display` / `?scale` hợp lệ
 *                                 thắng lựa chọn đã lưu, rồi áp;
 *         applyAppearance(…)      `AppearanceSync` gọi mỗi khi preferences đổi.
 * Lưu ý:  nhận giá trị đã quy về hiệu lực (TV ép tối, standard scale 1) — không tự suy lại từ `mode`. `index.html`
 *         chỉ có meta theo `prefers-color-scheme` của HĐH; không ghi lại ở đây thì theme app khác HĐH sẽ lệch màu
 *         thanh trạng thái. Màu đọc từ token (không hex rải rác), bỏ qua khi CSS chưa nạp.
 */

interface Appearance {
  theme: ThemeMode;
  accent: AccentColor;
  isTv: boolean;
  uiScale: EffectiveUiScale;
}

function syncThemeColor(root: HTMLElement): void {
  const color = getComputedStyle(root).getPropertyValue('--color-bg-page').trim();
  if (!color) return;
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = color;
  });
}

export function applyAppearance({ theme, accent, isTv, uiScale }: Appearance): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  if (accent === 'vci') delete root.dataset.accent;
  else root.dataset.accent = accent;
  root.classList.toggle('tv', isTv);
  root.style.setProperty('--ui-scale', String(uiScale));
  root.style.setProperty('--lh-scale', String(1 + (uiScale - 1) * 0.5));
  syncThemeColor(root);
}

export function initializeAppearance(): void {
  useDisplayStore.getState().applyDisplayOverrides(readDisplayOverrides(window.location.search));

  const display = useDisplayStore.getState();
  const themeState = useThemeStore.getState();
  applyAppearance({
    theme: resolveEffectiveTheme(selectThemeMode(themeState), display.mode, prefersDarkScheme()),
    accent: selectAccentColor(themeState),
    isTv: selectIsTv(display),
    uiScale: selectEffectiveUiScale(display),
  });
}
