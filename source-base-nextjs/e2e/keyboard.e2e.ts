import { dashboardMarker } from './support/flows';
import { vi } from './support/messages';
import { expect, test } from './support/test';

/**
 * Bàn phím trên bản production: bảng lệnh (Radix Dialog) mở bằng phím, Tab bị giữ trong hộp thoại, Esc đóng và TRẢ focus,
 * Ctrl/⌘+K và `/` mở từ bất kỳ đâu, Enter trên mục là điều hướng thật. Jsdom không có focus thật / bẫy focus của trình duyệt.
 */

const palette = {
  title: vi('ui.widgets.commandPalette.title'),
  placeholder: vi('ui.widgets.commandPalette.placeholder'),
};

test.describe('bảng lệnh (Ctrl/⌘+K)', () => {
  test.beforeEach(async ({ page, api }) => {
    await api.seedReturningVisitor();
    await page.goto('/dashboard');
    await expect(dashboardMarker(page)).toBeVisible();
  });

  test('mở bằng Enter trên nút, focus vào ô tìm, Tab không thoát khỏi hộp thoại, Esc đóng và trả focus về nút', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: palette.title });
    const dialog = page.getByRole('dialog', { name: palette.title });

    await trigger.focus();
    await page.keyboard.press('Enter');

    await expect(dialog).toBeVisible();
    await expect(dialog.getByPlaceholder(palette.placeholder)).toBeFocused();

    for (const key of ['Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab']) {
      await page.keyboard.press(key);
      await expect(
        dialog.locator(':focus'),
        `sau ${key} focus vẫn nằm trong hộp thoại`,
      ).toHaveCount(1);
    }

    await page.keyboard.press('Escape');

    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('Ctrl/⌘+K bật tắt, phím / mở khi không gõ chữ; tìm không dấu rồi Enter đi tới trang đã chọn', async ({
    page,
  }) => {
    const dialog = page.getByRole('dialog', { name: palette.title });
    const search = dialog.getByPlaceholder(palette.placeholder);

    await page.keyboard.press('ControlOrMeta+K');
    await expect(search).toBeFocused();
    await page.keyboard.press('ControlOrMeta+K');
    await expect(dialog).toBeHidden();

    await page.keyboard.press('/');
    await expect(search).toBeFocused();

    await search.fill('cai dat');
    await expect(dialog.getByRole('link', { name: vi('shell.nav.settings.title') })).toBeVisible();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL('/settings');
    await expect(dialog).toBeHidden();
  });
});
