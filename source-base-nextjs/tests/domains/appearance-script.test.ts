/**
 * Script giao diện chạy TRƯỚC lần vẽ đầu — `appearanceInitScript()` (`domains/preferences/appearance-script.ts`).
 *
 * Server không biết localStorage của người dùng, nên theme · TV · màu nhấn · cỡ chữ đã lưu được áp bằng MỘT đoạn JS đồng bộ trong
 * `<head>`; thiếu nó trang mở ra sáng rồi nháy sang tối. Đoạn JS này là bản VIẾT LẠI THỦ CÔNG của `applyAppearance` (chạy sau khi
 * store nạp xong) — hai bên lệch nhau là trang đổi diện mạo ngay sau khi tải. Bài kiểm chạy script thật trong jsdom với nhiều
 * trạng thái localStorage / URL, rồi so từng kết quả với `applyAppearance` nhận giá trị suy ra từ chính hàm của domain.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { applyAppearance } from '@/app/_providers/appearance/appearance.utils';
import { appearanceInitScript } from '@/domains/preferences/appearance-script';
import {
  DISPLAY_STORAGE,
  UI_SCALE_VALUES as SCALES,
} from '@/domains/preferences/display/display.constants';
import { THEME_STORAGE } from '@/domains/preferences/theme/theme.constants';
import {
  ACCENT_COLORS,
  readDisplayOverrides,
  resolveEffectiveTheme,
  selectEffectiveUiScale,
  UI_SCALE_VALUES,
} from '@/domains/preferences';
import { sanitizeDisplayState } from '@/domains/preferences/display/display.utils';
import { sanitizeThemeState } from '@/domains/preferences/theme/theme.utils';
import { SOURCE_CODE } from '@tests/helpers/source-files';

const html = document.documentElement;

interface Snapshot {
  dark: boolean;
  tv: boolean;
  accent: string | undefined;
  uiScale: string;
  lhScale: string;
}

const snapshot = (): Snapshot => ({
  dark: html.classList.contains('dark'),
  tv: html.classList.contains('tv'),
  accent: html.dataset.accent,
  uiScale: html.style.getPropertyValue('--ui-scale'),
  lhScale: html.style.getPropertyValue('--lh-scale'),
});

function resetDocument() {
  html.className = '';
  html.removeAttribute('style');
  delete html.dataset.accent;
  localStorage.clear();
  window.history.replaceState({}, '', '/');
}

/** Giả `prefers-color-scheme: dark` (jsdom không có `matchMedia` thật). */
function setPrefersDark(prefersDark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: prefersDark && query.includes('dark'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

const envelope = (state: unknown) => JSON.stringify({ state, version: 1 });

interface Scenario {
  /** Phần `state` lưu ở khoá theme; `undefined` = chưa lưu. */
  theme?: unknown;
  /** Phần `state` lưu ở khoá display. */
  display?: unknown;
  /** Query string của URL, vd `?display=tv&scale=1.2`. */
  search?: string;
  prefersDark?: boolean;
}

/** Dựng trạng thái trình duyệt rồi chạy script thật; trả về ảnh chụp `<html>`. */
function runScript({ theme, display, search = '', prefersDark = false }: Scenario): Snapshot {
  resetDocument();
  setPrefersDark(prefersDark);
  if (theme !== undefined) localStorage.setItem(THEME_STORAGE.key, envelope(theme));
  if (display !== undefined) localStorage.setItem(DISPLAY_STORAGE.key, envelope(display));
  window.history.replaceState({}, '', `/${search}`);

  (0, eval)(appearanceInitScript());
  return snapshot();
}

/** Cùng kịch bản qua đường "sau khi store nạp": giá trị hiệu lực suy bằng hàm của domain → `applyAppearance`. */
function runApplyAppearance({
  theme,
  display,
  search = '',
  prefersDark = false,
}: Scenario): Snapshot {
  resetDocument();
  const themeState = sanitizeThemeState(theme);
  const displayState = { ...sanitizeDisplayState(display), ...readDisplayOverrides(search) };

  applyAppearance({
    theme: resolveEffectiveTheme(themeState.theme, displayState.mode, prefersDark),
    accent: themeState.accent,
    isTv: displayState.mode === 'tv',
    uiScale: selectEffectiveUiScale(displayState),
  });
  return snapshot();
}

beforeEach(resetDocument);
afterEach(() => {
  vi.unstubAllGlobals();
  resetDocument();
});

describe('appearanceInitScript — chuỗi mã', () => {
  it('là một biểu thức hàm tự gọi, parse được, mang đúng khoá lưu trữ / tên param từ hằng số', () => {
    const script = appearanceInitScript();
    expect(() => new Function(script)).not.toThrow();
    expect(script).toContain(THEME_STORAGE.key);
    expect(script).toContain(DISPLAY_STORAGE.key);
    for (const scale of UI_SCALE_VALUES) expect(script).toContain(String(scale));
  });

  it('nhúng an toàn vào `<script>`: không có `</script` nào để thoát khỏi thẻ', () => {
    expect(appearanceInitScript().toLowerCase()).not.toContain('</script');
  });

  it('⛔ chỉ import hằng số, KHÔNG import store / React — file này được Server Component (root layout) nạp', () => {
    const source = SOURCE_CODE['src/domains/preferences/appearance-script.ts'];
    const imports = [...source.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
    expect(imports.length).toBeGreaterThan(0);
    for (const path of imports) {
      expect(path, `import ${path}`).toMatch(/^\.\/(display|theme)\/[\w.-]+\.constants$/);
    }
  });
});

describe('appearanceInitScript — chưa lưu gì', () => {
  it('giao diện sáng, không TV, không màu nhấn, cỡ chữ 1 (mặc định của base)', () => {
    expect(runScript({})).toEqual({
      dark: false,
      tv: false,
      accent: undefined,
      uiScale: '1',
      lhScale: '1',
    });
  });
});

describe('appearanceInitScript — theme', () => {
  it.each([
    ['dark', false, true],
    ['light', false, false],
    ['light', true, false],
    ['system', true, true],
    ['system', false, false],
  ] as const)('theme lưu `%s`, HĐH tối=%s → tối=%s', (theme, prefersDark, dark) => {
    expect(runScript({ theme: { theme, accent: 'vci' }, prefersDark }).dark).toBe(dark);
  });

  it('theme lưu rác → sáng (không đoán)', () => {
    for (const theme of ['sepia', 1, null, {}, ['dark']]) {
      expect(runScript({ theme: { theme } }).dark, JSON.stringify(theme)).toBe(false);
    }
  });

  it('xoá lớp `dark` cũ khi trạng thái là sáng (script chạy lại khi điều hướng không để sót)', () => {
    resetDocument();
    html.classList.add('dark', 'tv');
    localStorage.setItem(THEME_STORAGE.key, envelope({ theme: 'light' }));
    (0, eval)(appearanceInitScript());
    expect(snapshot()).toMatchObject({ dark: false, tv: false });
  });
});

describe('appearanceInitScript — màu nhấn', () => {
  it.each(ACCENT_COLORS.filter((accent) => accent !== 'vci'))(
    'màu nhấn `%s` → `data-accent`',
    (accent) => {
      expect(runScript({ theme: { theme: 'light', accent } }).accent).toBe(accent);
    },
  );

  it('`vci` (mặc định) KHÔNG đặt `data-accent`; màu lạ cũng không', () => {
    expect(runScript({ theme: { accent: 'vci' } }).accent).toBeUndefined();
    expect(runScript({ theme: { accent: 'neon' } }).accent).toBeUndefined();
    expect(runScript({ theme: { accent: 7 } }).accent).toBeUndefined();
  });
});

describe('appearanceInitScript — TV + cỡ chữ', () => {
  it.each(SCALES)(
    'lưu TV, mức %s → tối, lớp `tv`, `--ui-scale` đúng, `--lh-scale` = 1 + (scale − 1) / 2',
    (scale) => {
      expect(
        runScript({ theme: { theme: 'light' }, display: { mode: 'tv', uiScale: scale } }),
      ).toEqual({
        dark: true,
        tv: true,
        accent: undefined,
        uiScale: String(scale),
        lhScale: String(1 + (scale - 1) * 0.5),
      });
    },
  );

  it('standard: cỡ chữ luôn 1 dù store còn nhớ mức TV cũ', () => {
    const result = runScript({ display: { mode: 'standard', uiScale: 1.3 } });
    expect(result).toMatchObject({ tv: false, uiScale: '1', lhScale: '1' });
  });

  it('TV mà mức lưu ngoài dải (hoặc sai kiểu) → mức thấp nhất', () => {
    for (const uiScale of [99, 1, 0, '1.2', null, undefined]) {
      expect(runScript({ display: { mode: 'tv', uiScale } }).uiScale, String(uiScale)).toBe(
        String(SCALES[0]),
      );
    }
  });

  it('chế độ lưu rác → không TV', () => {
    for (const mode of ['TV', 'cinema', 1, null]) {
      expect(runScript({ display: { mode, uiScale: 1.2 } }).tv, String(mode)).toBe(false);
    }
  });
});

describe('appearanceInitScript — URL ?display= / ?scale= thắng giá trị đã lưu', () => {
  it('`?display=tv&scale=1.2` bật TV mức 1.2 dù đã lưu standard', () => {
    expect(
      runScript({
        theme: { theme: 'light' },
        display: { mode: 'standard', uiScale: 1.1 },
        search: '?display=tv&scale=1.2',
      }),
    ).toMatchObject({ dark: true, tv: true, uiScale: '1.2', lhScale: '1.1' });
  });

  it('`?display=tv` không kèm scale dùng mức đã lưu', () => {
    expect(
      runScript({ display: { mode: 'standard', uiScale: 1.3 }, search: '?display=tv' }),
    ).toMatchObject({
      tv: true,
      uiScale: '1.3',
    });
  });

  it('`?display=standard` tắt TV đã lưu', () => {
    expect(
      runScript({ display: { mode: 'tv', uiScale: 1.3 }, search: '?display=standard' }),
    ).toMatchObject({ tv: false, uiScale: '1' });
  });

  it('tham số rác bị bỏ, giá trị đã lưu vẫn dùng', () => {
    const display = { mode: 'tv', uiScale: 1.3 };
    expect(runScript({ display, search: '?display=cinema&scale=9' })).toMatchObject({
      tv: true,
      uiScale: '1.3',
    });
    expect(runScript({ display, search: '?scale=abc' })).toMatchObject({
      tv: true,
      uiScale: '1.3',
    });
  });

  it('`?scale=` một mình không bật TV', () => {
    expect(runScript({ search: '?scale=1.2' })).toMatchObject({ tv: false, uiScale: '1' });
  });

  it('theme + màu nhấn đã lưu vẫn áp dưới TV (màu nhấn giữ, theme bị TV ép tối)', () => {
    expect(
      runScript({ theme: { theme: 'light', accent: 'pink' }, search: '?display=tv&scale=1.1' }),
    ).toMatchObject({ dark: true, tv: true, accent: 'pink' });
  });
});

describe('appearanceInitScript — localStorage hỏng không làm nổ trang', () => {
  it.each([
    ['không phải JSON', '{hỏng'],
    ['JSON null', 'null'],
    ['thiếu `state`', '{"version":1}'],
    ['`state` là chuỗi', '{"state":"dark","version":1}'],
  ])('dữ liệu %s → giao diện mặc định', (_name, raw) => {
    resetDocument();
    setPrefersDark(false);
    localStorage.setItem(THEME_STORAGE.key, raw);
    localStorage.setItem(DISPLAY_STORAGE.key, raw);

    expect(() => (0, eval)(appearanceInitScript())).not.toThrow();
    expect(snapshot()).toEqual({
      dark: false,
      tv: false,
      accent: undefined,
      uiScale: '1',
      lhScale: '1',
    });
  });

  it('localStorage bị chặn (getItem ném) → nuốt lỗi, vẫn áp được URL', () => {
    resetDocument();
    setPrefersDark(false);
    const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Bị chặn', 'SecurityError');
    });
    window.history.replaceState({}, '', '/?display=tv&scale=1.3');

    expect(() => (0, eval)(appearanceInitScript())).not.toThrow();
    expect(snapshot()).toMatchObject({ tv: true, dark: true, uiScale: '1.3' });
    read.mockRestore();
  });
});

describe('parity với applyAppearance — script và đường "sau khi store nạp" cho cùng kết quả', () => {
  const THEMES: unknown[] = [
    undefined,
    { theme: 'light', accent: 'vci' },
    { theme: 'dark', accent: 'vci' },
    { theme: 'system', accent: 'blue' },
    { theme: 'dark', accent: 'graphite' },
    { theme: 'sepia', accent: 'neon' },
    'rác',
  ];
  const DISPLAYS: unknown[] = [
    undefined,
    { mode: 'standard', uiScale: 1.1 },
    { mode: 'tv', uiScale: 1.1 },
    { mode: 'tv', uiScale: 1.3 },
    { mode: 'standard', uiScale: 1.2 },
    { mode: 'tv', uiScale: 99 },
    { mode: 'cinema', uiScale: 'x' },
  ];
  const SEARCHES = [
    '',
    '?display=tv&scale=1.2',
    '?display=standard',
    '?scale=1.3',
    '?display=tv',
    '?display=x&scale=9',
  ];

  const CASES = THEMES.flatMap((theme) =>
    DISPLAYS.flatMap((display) =>
      SEARCHES.flatMap((search) =>
        [false, true].map((prefersDark) => ({ theme, display, search, prefersDark })),
      ),
    ),
  );

  it(`khớp ở mọi tổ hợp (${CASES.length} ca: theme × display × URL × HĐH tối)`, () => {
    const mismatches = CASES.flatMap((scenario) => {
      const fromScript = runScript(scenario);
      const fromApply = runApplyAppearance(scenario);
      return JSON.stringify(fromScript) === JSON.stringify(fromApply)
        ? []
        : [
            `${JSON.stringify(scenario)}\n    script: ${JSON.stringify(fromScript)}\n    apply : ${JSON.stringify(fromApply)}`,
          ];
    });
    expect(
      mismatches,
      `Script ≠ applyAppearance:\n  ${mismatches.slice(0, 5).join('\n  ')}`,
    ).toEqual([]);
  });
});
