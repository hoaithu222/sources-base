/**
 * `DockSettingsPanel` — panel cấu hình Dock: cạnh neo, chế độ hiển thị, công tắc phóng icon. Nhãn / mô tả theo ngôn ngữ
 * (`ui.widgets` → `dock.*`); đọc / ghi thẳng store cục bộ `dock-settings.store`.
 */

import { act, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import enMessages from '@/messages/en';
import viMessages from '@/messages/vi';
import {
  DEFAULT_DOCK_SETTINGS,
  DOCK_MODE_OPTIONS,
  useDockSettingsStore,
} from '@/shared/widgets/dock/dock-settings.store';
import DockSettingsPanel from '@/shared/widgets/dock/parts/dock-settings-panel';
import { renderWithIntl } from '@tests/helpers/render';

afterEach(() => {
  act(() => {
    useDockSettingsStore.setState(useDockSettingsStore.getInitialState(), true);
  });
  localStorage.clear();
});

describe('DockSettingsPanel — chữ theo ngôn ngữ', () => {
  it.each([
    ['vi', viMessages],
    ['en', enMessages],
  ] as const)(
    '%s: tiêu đề, nhóm, mỗi chế độ (nhãn + mô tả) và mỗi cạnh lấy từ bản dịch',
    (locale, messages) => {
      const { dock } = messages.ui.widgets;
      renderWithIntl(<DockSettingsPanel mode="pinned" />, { locale });

      expect(screen.getByText(dock.settings.title)).toBeInTheDocument();
      expect(screen.getByText(dock.settings.positionSection)).toBeInTheDocument();
      expect(screen.getByText(dock.settings.modeSection)).toBeInTheDocument();
      expect(screen.getByText(dock.settings.effectsSection)).toBeInTheDocument();
      for (const { value } of DOCK_MODE_OPTIONS) {
        const row = screen.getByRole('button', { name: new RegExp(dock.modes[value].label) });
        expect(row).toHaveTextContent(dock.modes[value].description);
      }
      const group = screen.getByRole('radiogroup', { name: dock.positionLabel });
      for (const label of Object.values(dock.positions)) {
        expect(within(group).getByRole('radio', { name: label })).toBeInTheDocument();
      }
    },
  );

  it('`modeLocked`: hiện dòng giải thích theo ngôn ngữ và khoá các chế độ không được chọn', () => {
    renderWithIntl(<DockSettingsPanel mode="pinned" modeLocked />, { locale: 'en' });

    expect(
      screen.getByText(enMessages.ui.widgets.dock.settings.modeLockedHint),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Auto-hide/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^Pinned/ })).toBeEnabled();
  });
});

describe('DockSettingsPanel — ghi vào store', () => {
  it('bấm một chế độ → `setMode`', () => {
    renderWithIntl(<DockSettingsPanel mode="pinned" />);

    fireEvent.click(screen.getByRole('button', { name: /^Tự ẩn/ }));

    expect(useDockSettingsStore.getState().mode).toBe('autohide');
  });

  it('chọn cạnh → `setPosition`; ô đang chọn có `aria-checked`', () => {
    renderWithIntl(<DockSettingsPanel mode="pinned" />);
    const group = screen.getByRole('radiogroup', { name: 'Vị trí Dock' });

    expect(within(group).getByRole('radio', { name: 'Đáy' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    fireEvent.click(within(group).getByRole('radio', { name: 'Trái' }));

    expect(useDockSettingsStore.getState().position).toBe('left');
    expect(within(group).getByRole('radio', { name: 'Trái' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('công tắc "Phóng to icon" đổi `magnify`', () => {
    renderWithIntl(<DockSettingsPanel mode="pinned" />);
    expect(useDockSettingsStore.getState().magnify).toBe(DEFAULT_DOCK_SETTINGS.magnify);

    fireEvent.click(screen.getByRole('switch'));

    expect(useDockSettingsStore.getState().magnify).toBe(!DEFAULT_DOCK_SETTINGS.magnify);
  });
});
