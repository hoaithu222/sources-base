/**
 * Giao diện đang hiệu lực trên `<html>` — `AppearanceSync` (sau hydrate) và `appearanceInitScript` (trước hydrate) PHẢI cho
 * cùng một kết quả, nếu không trang nháy sáng → tối ngay khi mở.
 *
 * `storesHydrated` là biến cấp module (đặt một lần ở `rehydratePersistedStores`) nên mỗi ca nạp lại module — không thì ca sau
 * thấy store "đã nạp" của ca trước và không kiểm được chuyện CHỜ nạp.
 */

import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { applyAppearance } from '@/app/_providers/appearance/appearance.utils';
import { appearanceInitScript } from '@/domains/preferences/appearance-script';

const html = document.documentElement;

const THEME_KEY = 'next-base:theme';
const DISPLAY_KEY = 'next-base:display';

interface Saved {
  theme?: string;
  accent?: string;
  mode?: string;
  uiScale?: number;
}

function seed({ theme, accent, mode, uiScale }: Saved) {
  if (theme !== undefined || accent !== undefined) {
    localStorage.setItem(THEME_KEY, JSON.stringify({ state: { theme, accent }, version: 1 }));
  }
  if (mode !== undefined || uiScale !== undefined) {
    localStorage.setItem(DISPLAY_KEY, JSON.stringify({ state: { mode, uiScale }, version: 2 }));
  }
}

function snapshot() {
  return {
    dark: html.classList.contains('dark'),
    tv: html.classList.contains('tv'),
    accent: html.dataset.accent ?? null,
    uiScale: html.style.getPropertyValue('--ui-scale'),
    lhScale: html.style.getPropertyValue('--lh-scale'),
  };
}

function resetHtml() {
  html.className = '';
  delete html.dataset.accent;
  html.style.removeProperty('--ui-scale');
  html.style.removeProperty('--lh-scale');
}

/** Nạp lại module → `storesHydrated` về `false` và mỗi ca có store riêng. */
async function loadAppearance() {
  vi.resetModules();
  const [{ default: AppearanceSync }, storage, preferences] = await Promise.all([
    import('@/app/_providers/appearance/AppearanceSync'),
    import('@/shared/utils/browser/storage.utils'),
    import('@/domains/preferences'),
  ]);
  return { AppearanceSync, ...storage, ...preferences };
}

function runInitScript() {
  const script = document.createElement('script');
  script.textContent = appearanceInitScript();
  document.head.append(script);
  script.remove();
}

beforeEach(() => {
  localStorage.clear();
  resetHtml();
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  localStorage.clear();
  resetHtml();
  window.history.replaceState({}, '', '/');
});

describe('AppearanceSync', () => {
  it('⛔ CHỜ store nạp xong mới ghi đè — không xoá giao diện mà script khởi tạo đã áp', async () => {
    const { AppearanceSync, rehydratePersistedStores } = await loadAppearance();
    seed({ theme: 'dark', accent: 'blue' });
    html.classList.add('dark');
    html.dataset.accent = 'blue';

    render(<AppearanceSync />);

    expect(html).toHaveClass('dark');
    expect(html.dataset.accent).toBe('blue');

    act(() => rehydratePersistedStores());

    expect(html).toHaveClass('dark');
    expect(html.dataset.accent).toBe('blue');
  });

  it('sau khi nạp: áp lựa chọn ĐÃ LƯU (kể cả khi khác với thứ đang có trên <html>)', async () => {
    const { AppearanceSync, rehydratePersistedStores } = await loadAppearance();
    seed({ theme: 'light', accent: 'purple' });
    html.classList.add('dark');

    render(<AppearanceSync />);
    expect(html).toHaveClass('dark');

    act(() => rehydratePersistedStores());

    expect(html).not.toHaveClass('dark');
    expect(html.dataset.accent).toBe('purple');
  });

  it('đổi theme / màu nhấn → <html> đổi theo; màu VCI gỡ thuộc tính', async () => {
    const { AppearanceSync, rehydratePersistedStores, useThemeStore } = await loadAppearance();
    render(<AppearanceSync />);
    act(() => rehydratePersistedStores());

    act(() => useThemeStore.getState().setTheme('dark'));
    expect(html).toHaveClass('dark');

    act(() => useThemeStore.getState().setAccent('pink'));
    expect(html.dataset.accent).toBe('pink');

    act(() => useThemeStore.getState().setAccent('vci'));
    expect(html.dataset.accent).toBeUndefined();

    act(() => useThemeStore.getState().setTheme('light'));
    expect(html).not.toHaveClass('dark');
  });

  it('chế độ TV ép tối + bật class `tv` + scale; tắt TV thì lựa chọn đã lưu quay lại và scale về 1', async () => {
    const { AppearanceSync, rehydratePersistedStores, useDisplayStore, useThemeStore } =
      await loadAppearance();
    render(<AppearanceSync />);
    act(() => rehydratePersistedStores());
    act(() => useThemeStore.getState().setTheme('light'));

    act(() => {
      useDisplayStore.getState().setUiScale(1.2);
      useDisplayStore.getState().setMode('tv');
    });
    expect(html).toHaveClass('dark', 'tv');
    expect(html.style.getPropertyValue('--ui-scale')).toBe('1.2');
    expect(html.style.getPropertyValue('--lh-scale')).toBe('1.1');

    act(() => useDisplayStore.getState().setMode('standard'));
    expect(html).not.toHaveClass('dark');
    expect(html).not.toHaveClass('tv');
    expect(html.style.getPropertyValue('--ui-scale')).toBe('1');
    expect(html.style.getPropertyValue('--lh-scale')).toBe('1');
    expect(useThemeStore.getState().theme).toBe('light');
  });
});

describe('applyAppearance — meta theme-color', () => {
  afterEach(() => {
    document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
    html.style.removeProperty('--color-bg-page');
  });

  it('ghi màu token nền vào MỌI meta theme-color (không phụ thuộc prefers-color-scheme)', () => {
    document.head.innerHTML =
      '<meta name="theme-color" content="red" media="(prefers-color-scheme: light)"><meta name="theme-color" content="red" media="(prefers-color-scheme: dark)">';
    html.style.setProperty('--color-bg-page', 'rgb(1, 2, 3)');

    applyAppearance({ theme: 'dark', accent: 'vci', isTv: false, uiScale: 1 });

    const colors = [
      ...document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    ].map((meta) => meta.content);
    expect(colors).toEqual(['rgb(1, 2, 3)', 'rgb(1, 2, 3)']);
  });

  it('CSS chưa nạp (token rỗng) thì không đụng tới meta', () => {
    document.head.innerHTML = '<meta name="theme-color" content="red">';

    applyAppearance({ theme: 'light', accent: 'vci', isTv: false, uiScale: 1 });

    expect(document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content).toBe(
      'red',
    );
  });
});

describe('appearanceInitScript khớp AppearanceSync', () => {
  const CASES: { name: string; saved: Saved; url?: string }[] = [
    { name: 'mặc định (chưa lưu gì)', saved: {} },
    {
      name: 'sáng + VCI',
      saved: { theme: 'light', accent: 'vci', mode: 'standard', uiScale: 1.1 },
    },
    {
      name: 'tối + màu nhấn xanh',
      saved: { theme: 'dark', accent: 'blue', mode: 'standard', uiScale: 1.1 },
    },
    {
      name: 'TV đã lưu (ép tối, scale 1.2)',
      saved: { theme: 'light', accent: 'purple', mode: 'tv', uiScale: 1.2 },
    },
    {
      name: 'URL ?display=tv&scale=1.3 thắng giá trị đã lưu',
      saved: { theme: 'light', mode: 'standard', uiScale: 1.1 },
      url: '/?display=tv&scale=1.3',
    },
    {
      name: 'param URL rác → giữ lựa chọn đã lưu',
      saved: { theme: 'dark', mode: 'tv', uiScale: 1.3 },
      url: '/?display=invalid&scale=99',
    },
    { name: 'màu nhấn lạ → bỏ qua', saved: { theme: 'light', accent: 'khong-co' } },
  ];

  it.each(CASES)('$name', async ({ saved, url }) => {
    if (url) window.history.replaceState({}, '', url);
    seed(saved);

    runInitScript();
    const fromScript = snapshot();
    resetHtml();

    const { AppearanceSync, rehydratePersistedStores, readDisplayOverrides, useDisplayStore } =
      await loadAppearance();
    render(<AppearanceSync />);
    act(() => {
      rehydratePersistedStores();
      useDisplayStore
        .getState()
        .applyDisplayOverrides(readDisplayOverrides(window.location.search));
    });

    expect(snapshot()).toEqual(fromScript);
  });

  it('URL ?display=tv không ghi đè theme đã lưu trong store', async () => {
    window.history.replaceState({}, '', '/?display=tv&scale=1.2');
    seed({ theme: 'light', mode: 'standard', uiScale: 1.1 });

    runInitScript();
    expect(html).toHaveClass('tv', 'dark');
    expect(html.style.getPropertyValue('--ui-scale')).toBe('1.2');

    const { rehydratePersistedStores, useThemeStore } = await loadAppearance();
    rehydratePersistedStores();
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('localStorage hỏng (JSON rác) → không ném, giữ giao diện sáng mặc định', () => {
    localStorage.setItem(THEME_KEY, '{không phải json');
    localStorage.setItem(DISPLAY_KEY, '{không phải json');

    expect(runInitScript).not.toThrow();
    expect(snapshot()).toEqual({
      dark: false,
      tv: false,
      accent: null,
      uiScale: '1',
      lhScale: '1',
    });
  });
});
