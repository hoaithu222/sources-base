import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import SettingsPage from '@/app/pages/SettingsPage';
import AppearanceSync from '@/app/providers/appearance/AppearanceSync';
import { applyAppearance, initializeAppearance } from '@/app/providers/appearance/appearance.utils';
import {
  resolveEffectiveTheme,
  useDisplayStore,
  useEffectiveTheme,
  useThemeStore,
} from '@/domains/preferences';

function resetPreferences() {
  useDisplayStore.setState(useDisplayStore.getInitialState(), true);
  useThemeStore.setState(useThemeStore.getInitialState(), true);
}

describe('appearance và cài đặt TV', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    resetPreferences();
    useThemeStore.getState().setTheme('light');
  });

  afterEach(() => {
    window.history.replaceState({}, '', '/');
    resetPreferences();
    document.documentElement.classList.remove('dark', 'tv');
    delete document.documentElement.dataset.accent;
    document.documentElement.style.removeProperty('--ui-scale');
    document.documentElement.style.removeProperty('--lh-scale');
  });

  it('URL TV áp class và scale ngay trước render, không ghi đè theme đã lưu', () => {
    window.history.replaceState({}, '', '/?display=tv&scale=1.2');
    initializeAppearance();
    expect(document.documentElement).toHaveClass('tv', 'dark');
    expect(document.documentElement.style.getPropertyValue('--ui-scale')).toBe('1.2');
    expect(document.documentElement.style.getPropertyValue('--lh-scale')).toBe('1.1');
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('param sai giữ lựa chọn hợp lệ đã lưu', () => {
    useDisplayStore.setState({ mode: 'tv', uiScale: 1.3 });
    window.history.replaceState({}, '', '/?display=invalid&scale=99');
    initializeAppearance();
    expect(useDisplayStore.getState()).toMatchObject({ mode: 'tv', uiScale: 1.3 });
    expect(document.documentElement.style.getPropertyValue('--ui-scale')).toBe('1.3');
  });

  it('TV khoá chuyển sáng; tắt TV khôi phục light và scale 1', () => {
    useDisplayStore.setState({ mode: 'tv', uiScale: 1.3 });
    render(
      <>
        <AppearanceSync />
        <SettingsPage />
      </>,
    );
    expect(screen.getByRole('radio', { name: 'Sáng' })).toBeDisabled();
    expect(document.documentElement).toHaveClass('dark', 'tv');
    fireEvent.click(screen.getByRole('switch'));
    expect(screen.getByRole('radio', { name: 'Sáng' })).toBeEnabled();
    expect(document.documentElement).not.toHaveClass('dark');
    expect(document.documentElement).not.toHaveClass('tv');
    expect(document.documentElement.style.getPropertyValue('--ui-scale')).toBe('1');
    expect(document.documentElement.style.getPropertyValue('--lh-scale')).toBe('1');
  });

  it('chọn màu nhấn ở Cài đặt → `data-accent` trên <html>; VCI gỡ thuộc tính', () => {
    render(
      <>
        <AppearanceSync />
        <SettingsPage />
      </>,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Tím' }));
    expect(useThemeStore.getState().accent).toBe('purple');
    expect(document.documentElement.dataset.accent).toBe('purple');

    fireEvent.click(screen.getByRole('radio', { name: 'VCI' }));
    expect(document.documentElement.dataset.accent).toBeUndefined();
  });

  it('chọn "Tự động" lưu `system` và hiển thị theo HĐH', () => {
    render(
      <>
        <AppearanceSync />
        <SettingsPage />
      </>,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Tự động' }));
    expect(useThemeStore.getState().theme).toBe('system');
    expect(screen.getByText('Theo hệ điều hành — đang sáng')).toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass('dark');
  });
});

describe('theme-color của thanh trình duyệt', () => {
  afterEach(() => {
    document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
    document.documentElement.style.removeProperty('--color-bg-page');
    document.documentElement.classList.remove('dark', 'tv');
  });

  it('ghi lại màu token nền vào MỌI meta theme-color khi áp giao diện (không phụ thuộc prefers-color-scheme)', () => {
    document.head.innerHTML =
      '<meta name="theme-color" content="#EEF3F7" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#04162A" media="(prefers-color-scheme: dark)">';
    document.documentElement.style.setProperty('--color-bg-page', '#04162A');

    applyAppearance({ theme: 'dark', accent: 'vci', isTv: false, uiScale: 1 });

    const colors = [
      ...document.head.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'),
    ].map((meta) => meta.content);
    expect(colors).toEqual(['#04162A', '#04162A']);
  });

  it('CSS chưa nạp (token rỗng) thì không đụng tới meta', () => {
    document.head.innerHTML = '<meta name="theme-color" content="#EEF3F7">';

    applyAppearance({ theme: 'light', accent: 'vci', isTv: false, uiScale: 1 });

    expect(document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content).toBe(
      '#EEF3F7',
    );
  });
});

describe('theme đang hiển thị', () => {
  afterEach(resetPreferences);

  it.each([
    ['light', 'standard', 'light'],
    ['dark', 'standard', 'dark'],
    ['light', 'tv', 'dark'],
    ['dark', 'tv', 'dark'],
  ] as const)('lựa chọn %s + chế độ %s → %s', (theme, mode, expected) => {
    expect(resolveEffectiveTheme(theme, mode)).toBe(expected);
  });

  it.each([
    [false, 'standard', 'light'],
    [true, 'standard', 'dark'],
    [false, 'tv', 'dark'],
  ] as const)('`system` + HĐH tối=%s + chế độ %s → %s', (prefersDark, mode, expected) => {
    expect(resolveEffectiveTheme('system', mode, prefersDark)).toBe(expected);
  });

  it('`useEffectiveTheme` theo cả hai store; tắt TV trả lại lựa chọn đã lưu', () => {
    useThemeStore.getState().setTheme('light');
    const { result } = renderHook(() => useEffectiveTheme());
    expect(result.current).toBe('light');

    act(() => useDisplayStore.getState().setMode('tv'));
    expect(result.current).toBe('dark');
    expect(useThemeStore.getState().theme).toBe('light');

    act(() => useDisplayStore.getState().setMode('standard'));
    expect(result.current).toBe('light');
  });
});
