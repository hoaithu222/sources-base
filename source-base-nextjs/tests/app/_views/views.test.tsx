/**
 * View của route — `src/app/_views`. Chữ lấy từ `messages/<locale>`, nên mỗi view kiểm cả `vi` lẫn `en`: tiêu đề phải KHÁC nhau
 * và không được lộ khoá thô kiểu `landing.hero.title` (next-intl trả chính đường khoá khi thiếu thông điệp).
 */

import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import { GET as healthCheck } from '@/app/api/health/route';
import CatchAllPage from '@/app/[locale]/[...rest]/page';
import DemoPage from '@/app/[locale]/(workspace)/(app)/demo/page';
import AboutView from '@/app/_views/marketing/AboutView';
import DashboardView from '@/app/_views/DashboardView';
import LandingView from '@/app/_views/marketing/LandingView';
import ModuleHomeView from '@/app/_views/ModuleHomeView';
import ProfileView from '@/app/_views/ProfileView';
import SettingsView from '@/app/_views/SettingsView';
import {
  ForbiddenView,
  NotFoundView,
  SessionUnavailableView,
  StatusView,
} from '@/app/_views/status';
import type { Locale } from '@/core/i18n';
import { useDisplayStore, useThemeStore } from '@/domains/preferences';
import { establishSession, useSessionStore } from '@/domains/session';
import enMessages from '@/messages/en';
import viMessages from '@/messages/vi';
import { Button } from '@/shared/ui';
import { useWorkTabsStore } from '@/shared/widgets/work-tabs';
import { mockHttp } from '@tests/helpers/http-mock';
import { navigationMock } from '@tests/helpers/navigation-mock';
import { renderInRouter, renderWithIntl } from '@tests/helpers/render';

const config = vi.hoisted(() => ({ isDemo: true }));

vi.mock('@/core/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/config')>();
  return {
    ...actual,
    appConfig: {
      ...actual.appConfig,
      get isDemo() {
        return config.isDemo;
      },
    },
  };
});

const MESSAGES = { vi: viMessages, en: enMessages } satisfies Record<Locale, unknown>;
const LOCALES = ['vi', 'en'] as const;

/** Namespace của `messages/` — thấy `namespace.khoa` trong DOM nghĩa là một khoá bị thiếu. */
const RAW_KEY =
  /\b(?:landing|about|shell|account|errors|auth|common|site|metadata|validation)\.[a-z][A-Za-z]*\b/;

let consoleError: MockInstance<typeof console.error>;

beforeEach(() => {
  config.isDemo = true;
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  localStorage.clear();
  useWorkTabsStore.setState({ tabs: [] });
  useThemeStore.setState(useThemeStore.getInitialState(), true);
  useDisplayStore.setState(useDisplayStore.getInitialState(), true);
  useSessionStore.setState(useSessionStore.getInitialState(), true);
  window.history.replaceState({}, '', '/');
});

afterEach(() => vi.restoreAllMocks());

function expectNoMissingMessages() {
  expect(document.body.textContent).not.toMatch(RAW_KEY);
  const missing = consoleError.mock.calls.filter(([first]) =>
    String(first).includes('MISSING_MESSAGE'),
  );
  expect(missing).toEqual([]);
}

describe('LandingView', () => {
  it.each(LOCALES)('có ĐÚNG MỘT <h1> với tiêu đề hero (%s) và không lộ khoá thô', (locale) => {
    renderWithIntl(<LandingView />, { locale });

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(MESSAGES[locale].landing.hero.title);
    expectNoMissingMessages();
  });

  it('thứ bậc heading h1 → h2 → h3: mỗi tính năng là một h3', () => {
    renderWithIntl(<LandingView />);

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
  });

  it('tiêu đề tiếng Việt và tiếng Anh khác nhau', () => {
    expect(viMessages.landing.hero.title).not.toBe(enMessages.landing.hero.title);
  });

  it('lời kêu gọi dẫn tới đăng ký / giới thiệu, đúng tiền tố ngôn ngữ', () => {
    const view = renderWithIntl(<LandingView />);
    expect(screen.getByRole('link', { name: viMessages.landing.hero.primaryCta })).toHaveAttribute(
      'href',
      '/register',
    );
    expect(
      screen.getByRole('link', { name: viMessages.landing.hero.secondaryCta }),
    ).toHaveAttribute('href', '/about');
    view.unmount();

    renderWithIntl(<LandingView />, { locale: 'en' });
    expect(screen.getByRole('link', { name: enMessages.landing.hero.primaryCta })).toHaveAttribute(
      'href',
      '/en/register',
    );
    expect(screen.getByRole('link', { name: enMessages.landing.cta.action })).toHaveAttribute(
      'href',
      '/en/register',
    );
  });
});

describe('AboutView', () => {
  it.each(LOCALES)('một <h1>, hai mục <h2>, ba nguyên tắc (%s)', (locale) => {
    renderWithIntl(<AboutView />, { locale });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      MESSAGES[locale].about.title,
    );
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expectNoMissingMessages();
  });

  it('tiêu đề tiếng Việt và tiếng Anh khác nhau', () => {
    expect(viMessages.about.title).not.toBe(enMessages.about.title);
  });
});

describe('status views', () => {
  it.each(LOCALES)('NotFoundView: mã 404, h1 + mô tả (%s), nút Về trang chủ', (locale) => {
    renderWithIntl(<NotFoundView />, { locale });
    const { title, description } = MESSAGES[locale].errors.screens.notFound;

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: MESSAGES[locale].errors.screens.homeAction }),
    ).toHaveAttribute('href', locale === 'vi' ? '/' : '/en');
    expectNoMissingMessages();
  });

  it('nút Quay lại gọi `router.back`', async () => {
    renderWithIntl(<NotFoundView />);

    await userEvent.click(
      screen.getByRole('button', { name: viMessages.errors.screens.backAction }),
    );

    expect(navigationMock.back).toHaveBeenCalledTimes(1);
  });

  it.each(LOCALES)('ForbiddenView: mã 403 và tiêu đề (%s)', (locale) => {
    renderWithIntl(<ForbiddenView />, { locale });

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: MESSAGES[locale].errors.screens.forbidden.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('403')).toBeInTheDocument();
    expectNoMissingMessages();
  });

  it('tiêu đề 404 / 403 tiếng Việt khác tiếng Anh', () => {
    expect(viMessages.errors.screens.notFound.title).not.toBe(
      enMessages.errors.screens.notFound.title,
    );
    expect(viMessages.errors.screens.forbidden.title).not.toBe(
      enMessages.errors.screens.forbidden.title,
    );
  });

  it('StatusView có `children` thì THAY cặp nút điều hướng mặc định', () => {
    renderWithIntl(
      <StatusView description="Mô tả" title="Tiêu đề">
        <Button>Nút riêng</Button>
      </StatusView>,
    );

    expect(screen.getByRole('button', { name: 'Nút riêng' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: viMessages.errors.screens.backAction })).toBeNull();
    expect(screen.queryByText(/^\d{3}$/)).toBeNull();
  });

  it('SessionUnavailableView: nút "Thử lại" khôi phục phiên lần nữa', async () => {
    const http = vi.fn(() => ({ status: 401, data: {} }));
    const restore = mockHttp(http);
    useSessionStore.setState({ status: 'unavailable' });
    renderWithIntl(<SessionUnavailableView />);

    await userEvent.click(
      screen.getByRole('button', { name: viMessages.errors.screens.sessionUnavailable.action }),
    );

    expect(http).toHaveBeenCalledTimes(1);
    expect(useSessionStore.getState().status).toBe('anonymous');
    restore();
  });
});

describe('ProfileView', () => {
  const USER = {
    id: 'u1',
    email: 'an@congty.vn',
    name: 'Nguyễn Văn An',
    roles: ['editor', 'auditor'],
    permissions: ['report:view'],
  };

  it.each(LOCALES)('chưa đăng nhập → trạng thái rỗng (%s)', (locale) => {
    renderWithIntl(<ProfileView />, { locale });
    const { title, description } = MESSAGES[locale].account.profile.signedOut;

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.queryByText(USER.email)).not.toBeInTheDocument();
    expectNoMissingMessages();
  });

  it.each(LOCALES)('đã đăng nhập → tên, email, vai trò, quyền (%s)', (locale) => {
    establishSession({ accessToken: 't', user: USER });
    renderWithIntl(<ProfileView />, { locale });
    const { roles, permissions } = MESSAGES[locale].account.profile;

    expect(screen.getByText(USER.name)).toBeInTheDocument();
    expect(screen.getByText(USER.email)).toBeInTheDocument();
    expect(screen.getByText('editor')).toBeInTheDocument();
    expect(screen.getByText('auditor')).toBeInTheDocument();
    expect(screen.getByText('report:view')).toBeInTheDocument();
    expect(screen.getByText(roles.label)).toBeInTheDocument();
    expect(screen.getByText(permissions.label)).toBeInTheDocument();
    expectNoMissingMessages();
  });

  it('không có vai trò / quyền → hiện câu "chưa có" thay cho dãy nhãn', () => {
    establishSession({ accessToken: 't', user: { ...USER, roles: [], permissions: [] } });
    renderWithIntl(<ProfileView />);

    expect(screen.getByText(viMessages.account.profile.roles.empty)).toBeInTheDocument();
    expect(screen.getByText(viMessages.account.profile.permissions.empty)).toBeInTheDocument();
  });

  it('đăng xuất khi đang xem → quay về trạng thái rỗng', () => {
    establishSession({ accessToken: 't', user: USER });
    renderWithIntl(<ProfileView />);
    expect(screen.getByText(USER.email)).toBeInTheDocument();

    act(() => {
      useSessionStore.setState({ user: null, status: 'anonymous' });
    });

    expect(screen.queryByText(USER.email)).not.toBeInTheDocument();
    expect(screen.getByText(viMessages.account.profile.signedOut.title)).toBeInTheDocument();
  });
});

describe('DashboardView', () => {
  it.each(LOCALES)('hiện nhóm Phân hệ, Mở gần đây và Bắt đầu (%s), không lộ khoá thô', (locale) => {
    renderWithIntl(<DashboardView />, { locale });
    const { dashboard } = MESSAGES[locale].shell;

    expect(screen.getByRole('heading', { level: 2, name: dashboard.modules })).toBeInTheDocument();
    expect(screen.getByText(dashboard.recent)).toBeInTheDocument();
    expect(screen.getByText(dashboard.recentEmpty)).toBeInTheDocument();
    expect(screen.getByText(dashboard.start.title)).toBeInTheDocument();
    expectNoMissingMessages();
  });

  it('chữ tiếng Việt và tiếng Anh của bàn làm việc khác nhau', () => {
    expect(viMessages.shell.dashboard.title).not.toBe(enMessages.shell.dashboard.title);
  });

  it('mỗi phân hệ trong menu là một thẻ có liên kết tới trang chủ phân hệ (đúng tiền tố ngôn ngữ)', () => {
    const view = renderWithIntl(<DashboardView />);
    const card = screen.getByRole('region', { name: viMessages.shell.nav.demo.title });
    expect(
      within(card).getByRole('link', { name: new RegExp(viMessages.shell.nav.demo.title) }),
    ).toHaveAttribute('href', '/demo');
    view.unmount();

    renderWithIntl(<DashboardView />, { locale: 'en' });
    const cardEn = screen.getByRole('region', { name: enMessages.shell.nav.demo.title });
    expect(
      within(cardEn).getByRole('link', { name: new RegExp(enMessages.shell.nav.demo.title) }),
    ).toHaveAttribute('href', '/en/demo');
  });

  it('"Mở gần đây" liệt kê thẻ làm việc, mới nhất trước, link giữ cả query', () => {
    const { visit } = useWorkTabsStore.getState();
    visit({ path: '/settings', search: '', title: 'Cài đặt' });
    visit({
      path: '/demo',
      search: '?tab=2',
      title: 'Thư viện UI',
      fullTitle: 'Thư viện UI · Mục',
    });

    renderWithIntl(<DashboardView />);

    expect(screen.queryByText(viMessages.shell.dashboard.recentEmpty)).not.toBeInTheDocument();
    const recent = screen
      .getAllByRole('listitem')
      .map((row) => row.getAttribute('href'))
      .filter((href) => href === '/settings' || href === '/demo?tab=2');
    expect(recent).toEqual(['/demo?tab=2', '/settings']);
  });

  it('chế độ demo → có lối tắt tới thư viện giao diện; bản `app` thì không', () => {
    const libraryRow = () =>
      screen
        .queryAllByRole('listitem')
        .find((row) => row.textContent?.includes(viMessages.shell.dashboard.start.library));
    const view = renderWithIntl(<DashboardView />);
    expect(libraryRow()).toHaveAttribute('href', '/demo');
    view.unmount();

    config.isDemo = false;
    renderWithIntl(<DashboardView />);
    expect(libraryRow()).toBeUndefined();
  });
});

describe('route mỏng', () => {
  it('URL không khớp route nào dưới [locale] → catch-all đẩy sang 404 theo ngôn ngữ', () => {
    expect(() => CatchAllPage()).toThrow('NEXT_NOT_FOUND');
  });

  it('/demo chỉ tồn tại ở chế độ demo — bản `app` trả 404', () => {
    config.isDemo = false;

    expect(() => DemoPage()).toThrow('NEXT_NOT_FOUND');
  });

  it('GET /api/health → 200 {status: ok}, không cho CDN giữ lại', async () => {
    const response = healthCheck();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});

describe('ModuleHomeView', () => {
  it('đang ở trang chủ phân hệ → h1 là tên phân hệ', () => {
    renderInRouter(<ModuleHomeView />, { pathname: '/demo' });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      viMessages.shell.nav.demo.title,
    );
  });

  it('ngoài mọi phân hệ → không vẽ gì', () => {
    const { container } = renderInRouter(<ModuleHomeView />, { pathname: '/dashboard' });

    expect(container).toBeEmptyDOMElement();
  });
});

describe('SettingsView', () => {
  it.each(LOCALES)(
    'hiện đủ bốn nhóm Ngôn ngữ · Giao diện · Màn hình lớn · Phím tắt (%s)',
    (locale) => {
      renderWithIntl(<SettingsView />, { locale });
      const { settings } = MESSAGES[locale].account;

      for (const title of [
        settings.language.title,
        settings.appearance.title,
        settings.tv.title,
        settings.shortcuts.title,
      ]) {
        expect(screen.getAllByText(title).length).toBeGreaterThan(0);
      }
      expectNoMissingMessages();
    },
  );

  describe('nhóm Ngôn ngữ', () => {
    it('đánh dấu ngôn ngữ đang hiển thị', () => {
      renderInRouter(<SettingsView />, { pathname: '/settings' });

      expect(screen.getByRole('radio', { name: 'Tiếng Việt' })).toBeChecked();
      expect(screen.getByRole('radio', { name: 'English' })).not.toBeChecked();
    });

    it('chọn English → `router.replace` tới bản /en của CHÍNH trang, giữ query string', async () => {
      window.history.replaceState({}, '', '/settings?tab=2');
      renderInRouter(<SettingsView />, { pathname: '/settings', search: '?tab=2' });

      await userEvent.click(screen.getByRole('radio', { name: 'English' }));

      expect(navigationMock.replace).toHaveBeenCalledTimes(1);
      expect(navigationMock.replace).toHaveBeenCalledWith('/en/settings?tab=2');
    });

    it('đang ở tiếng Anh, chọn Tiếng Việt → về bản không tiền tố (qua /vi để ghi đè cookie ngôn ngữ)', async () => {
      window.history.replaceState({}, '', '/en/settings');
      renderInRouter(<SettingsView />, { pathname: '/en/settings', locale: 'en' });

      expect(screen.getByRole('radio', { name: 'English' })).toBeChecked();
      await userEvent.click(screen.getByRole('radio', { name: 'Tiếng Việt' }));

      expect(navigationMock.replace).toHaveBeenCalledWith('/vi/settings');
    });
  });

  describe('nhóm Giao diện', () => {
    it('chọn chủ đề Tối / Sáng / Tự động → ghi vào theme store', async () => {
      renderWithIntl(<SettingsView />);
      const themes = viMessages.account.settings.appearance.themes;

      await userEvent.click(screen.getByRole('radio', { name: themes.dark }));
      expect(useThemeStore.getState().theme).toBe('dark');

      await userEvent.click(screen.getByRole('radio', { name: themes.system }));
      expect(useThemeStore.getState().theme).toBe('system');

      await userEvent.click(screen.getByRole('radio', { name: themes.light }));
      expect(useThemeStore.getState().theme).toBe('light');
    });

    it('chọn màu nhấn → ghi vào theme store', async () => {
      renderWithIntl(<SettingsView />);

      await userEvent.click(
        screen.getByRole('radio', { name: viMessages.account.settings.appearance.accents.purple }),
      );

      expect(useThemeStore.getState().accent).toBe('purple');
    });

    it('chủ đề tiếng Việt và tiếng Anh có nhãn khác nhau', () => {
      renderWithIntl(<SettingsView />, { locale: 'en' });

      expect(
        screen.getByRole('radio', { name: enMessages.account.settings.appearance.themes.dark }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('radio', { name: viMessages.account.settings.appearance.themes.dark }),
      ).not.toBeInTheDocument();
    });
  });

  describe('nhóm Màn hình lớn', () => {
    it('bật TV → ép tối, khoá ô chọn chủ đề (màu nhấn vẫn đổi được) và hiện mức phóng chữ', async () => {
      renderWithIntl(<SettingsView />);
      const { tv, appearance } = viMessages.account.settings;
      expect(screen.queryByText(tv.scale)).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('switch', { name: tv.mode }));

      expect(useDisplayStore.getState().mode).toBe('tv');
      expect(screen.getByRole('radio', { name: appearance.themes.light })).toBeDisabled();
      expect(screen.getByRole('radio', { name: appearance.accents.blue })).toBeEnabled();
      expect(screen.getByText(tv.scale)).toBeInTheDocument();
    });

    it('chọn mức phóng chữ → ghi vào display store; tắt TV → ô chọn chủ đề mở lại', async () => {
      useDisplayStore.setState({ mode: 'tv', uiScale: 1.1 });
      renderWithIntl(<SettingsView />);

      await userEvent.click(screen.getByRole('button', { name: '×1.3' }));
      expect(useDisplayStore.getState().uiScale).toBe(1.3);

      await userEvent.click(
        screen.getByRole('switch', { name: viMessages.account.settings.tv.mode }),
      );
      expect(useDisplayStore.getState().mode).toBe('standard');
      expect(
        screen.getByRole('radio', { name: viMessages.account.settings.appearance.themes.light }),
      ).toBeEnabled();
      expect(screen.queryByRole('button', { name: '×1.3' })).not.toBeInTheDocument();
    });
  });
});
