import type { AccentColor, EffectiveUiScale, ThemeMode } from '@/domains/preferences';

/**
 * appearance — áp giao diện ĐANG CÓ HIỆU LỰC lên `<html>` (class `dark` · `tv`, `data-accent` = màu nhấn khác VCI — CSS ở
 * `styles/overrides/accent.css`, biến `--ui-scale` · `--lh-scale`) và
 * đồng bộ màu thanh trình duyệt `<meta name="theme-color">` theo token nền `--color-bg-page`.
 *
 * Dùng:   applyAppearance(…)  `AppearanceSync` gọi mỗi khi preferences đổi.
 * Lưu ý:  nhận giá trị đã quy về hiệu lực (TV ép tối, standard scale 1) — không tự suy lại từ `mode`. Lần áp ĐẦU (trước khi
 *         vẽ) do `appearanceInitScript` trong `<head>`; `viewport.themeColor` (`@/core/seo`) chỉ theo `prefers-color-scheme` của
 *         HĐH, không ghi lại ở đây thì theme app khác HĐH sẽ lệch màu thanh trạng thái. Màu đọc từ token (không hex rải rác),
 *         bỏ qua khi CSS chưa nạp.
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
