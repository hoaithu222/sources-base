/**
 * Khôi phục `useHeaderSkinStore` (kiểu khung header) từ localStorage — dữ liệu lưu là đầu vào KHÔNG tin cậy.
 *
 * Lỗi cần chặn: zustand `persist` chỉ gọi `migrate` khi `version` đổi, còn cùng version thì trộn thẳng JSON vào store —
 * `skin: 'garbage'` làm `HEADER_SKIN_SPECS[skin]` ra `undefined`, cả thanh header mất hình lúc vẽ. Cùng khuôn với
 * `dock-settings.store.test.ts`.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  HEADER_SKIN_SPECS,
  type HeaderSkinSpec,
} from '@/shared/widgets/header/page-header/header-skin.theme';
import {
  HEADER_SKIN_ORDER,
  useHeaderSkinStore,
  type HeaderSkin,
} from '@/shared/widgets/header/header-skin.store';

const HEADER_KEY = 'header-skin-storage';

/** Chín biến hình học mọi kiểu PHẢI khai (`header-skin.theme.ts`). */
const REQUIRED_VARS = [
  '--chip-cut',
  '--chip-notch',
  '--chip-gap',
  '--plate-cut-sided',
  '--plate-cut-free',
  '--plate-tuck',
  '--plate-notch',
  '--plate-pad',
  '--nav-pad',
] as const;
const VERSION = 2;

/** Bảng cấu hình ở dạng kiểu rộng (`HEADER_SKIN_SPECS` giữ kiểu literal nên các kiểu cũ không có `nav`). */
const SPECS: Record<HeaderSkin, HeaderSkinSpec> = HEADER_SKIN_SPECS;

/** Ba bậc cỡ của thanh: cao thanh · cao chip (`--chip-h`) — mặc định, `xl` (≥1280px), `wide`. */
const TIERS = [
  { prefix: '', bar: 40, chip: 22 },
  { prefix: 'xl:', bar: 44, chip: 22 },
  { prefix: 'wide:', bar: 52, chip: 26 },
] as const;

/** Giá trị px của biến ở bậc `tierIndex` — bậc lớn hơn ghi đè (cascade mobile-first). */
function varAt(vars: string, name: string, tierIndex: number): number {
  let value = Number.NaN;
  TIERS.slice(0, tierIndex + 1).forEach(({ prefix }) => {
    const match = new RegExp(`(?:^|\\s)${prefix}\\[${name}:(-?[\\d.]+)(px|rem)?\\]`).exec(vars);
    if (match) value = Number(match[1]) * (match[2] === 'rem' ? 16 : 1);
  });
  return value;
}

const envelope = (state: unknown, version: number) => JSON.stringify({ state, version });

async function restoreHeader(raw: string) {
  localStorage.setItem(HEADER_KEY, raw);
  await useHeaderSkinStore.persist.rehydrate();
  return useHeaderSkinStore.getState();
}

function resetStore() {
  useHeaderSkinStore.setState(useHeaderSkinStore.getInitialState(), true);
  localStorage.clear();
}

beforeEach(resetStore);
afterEach(resetStore);

describe('header skin store — mặc định + hành động', () => {
  it('mặc định `tray` (Khay); setSkin đổi kiểu', () => {
    expect(useHeaderSkinStore.getState().skin).toBe('tray');

    useHeaderSkinStore.getState().setSkin('hex');

    expect(useHeaderSkinStore.getState().skin).toBe('hex');
  });

  it('danh sách kiểu hợp lệ gồm 15 dạng, mặc định đứng đầu, KHÔNG còn "pill" / "bracket"', () => {
    expect(HEADER_SKIN_ORDER).toEqual([
      'tray',
      'tray-flip',
      'tray-slant',
      'command',
      'facet',
      'slant',
      'chevron',
      'hex',
      'tag',
      'stair',
      'square',
      'folder',
      'solid',
      'gauge',
      'line',
    ]);
    expect(Object.keys(HEADER_SKIN_SPECS).sort()).toEqual([...HEADER_SKIN_ORDER].sort());
  });

  it.each(HEADER_SKIN_ORDER)(
    'kiểu "%s" khai ĐỦ chín biến hình học — thiếu một biến là hình vỡ im lặng',
    (skin) => {
      const { vars } = HEADER_SKIN_SPECS[skin];

      for (const name of REQUIRED_VARS) expect(vars).toContain(`[${name}:`);
    },
  );

  it.each(['chevron', 'stair'] as const)(
    'kiểu "%s" (đa giác bảng tên cần cao chip) khai thêm --chip-h',
    (skin) => {
      expect(HEADER_SKIN_SPECS[skin].vars).toContain('[--chip-h:1.375rem]');
      expect(HEADER_SKIN_SPECS[skin].vars).toContain('wide:[--chip-h:1.625rem]');
    },
  );
});

describe('header skin store — họ kiểu "khay" (thanh khay bẻ ngang)', () => {
  const TRAYS = ['tray', 'tray-flip', 'tray-slant', 'command', 'facet'] as const;
  /** Hai kiểu V (rãnh chữ V của bảng tên) — còn lại là tab bình hành bám cạnh vát bảng tên. */
  const V_TRAYS = ['tray', 'tray-flip'] as const;
  const SLANT_TRAYS = ['tray-slant', 'facet'] as const;
  const TIER_CASES = TIERS.map((tier, index) => [tier.prefix || 'mặc định', index] as const);
  const TRAY_TIERS = TRAYS.flatMap((skin) =>
    TIER_CASES.map(([label, index]) => [skin, label, index] as const),
  );

  it('CHỈ họ khay bật thanh khay (`nav.shelf`) + khai `--shelf-rise` 6 / 8px; chỉ "tray-flip" vẽ gạch đứt, chỉ "facet" vẽ đường đôi, vật trang trí: command vạch xiên · facet cánh', () => {
    for (const skin of HEADER_SKIN_ORDER) {
      const isTray = (TRAYS as readonly string[]).includes(skin);

      expect(SPECS[skin].nav?.shelf === true).toBe(isTray);
      expect(SPECS[skin].vars.includes('[--shelf-rise:')).toBe(isTray);
      expect(SPECS[skin].nav?.dashed === true).toBe(skin === 'tray-flip');
      expect(SPECS[skin].nav?.double === true).toBe(skin === 'facet');
      expect(SPECS[skin].nav?.ornament).toBe(
        { command: 'hatch', facet: 'wedge' }[skin as 'command' | 'facet'],
      );
    }

    for (const skin of TRAYS) {
      expect(varAt(SPECS[skin].vars, '--shelf-rise', 0)).toBe(6);
      expect(varAt(SPECS[skin].vars, '--shelf-rise', 1)).toBe(8);
      expect(varAt(SPECS[skin].vars, '--shelf-rise', 2)).toBe(8);
    }
  });

  it.each(TRAY_TIERS)(
    'kiểu "%s", bậc "%s": `--header-h` và `--chip-h` khớp cao thanh / cao chip thật (đơn vị rem như HEADER_HEIGHT_CLASS)',
    (skin, _label, index) => {
      expect(varAt(SPECS[skin].vars, '--header-h', index)).toBe(TIERS[index].bar);
      expect(varAt(SPECS[skin].vars, '--chip-h', index)).toBe(TIERS[index].chip);
    },
  );

  it.each(TRAY_TIERS.filter(([skin]) => (V_TRAYS as readonly string[]).includes(skin)))(
    'kiểu "%s", bậc "%s": rãnh chữ V của bảng tên đi đúng dốc cạnh trên mũi chip từ đường khay tới mũi chip (≤ 1px) — một nét liền, không nét đứng',
    (skin, _label, index) => {
      const { vars } = SPECS[skin];
      const { chip } = TIERS[index];
      const rise = varAt(vars, '--shelf-rise', index);
      const slope = varAt(vars, '--chip-cut', index) / (chip / 2);

      // Lệch ngang từ đường khay tới ngang mũi chip = độ sâu rãnh `--plate-cut-sided`.
      expect(
        Math.abs(varAt(vars, '--plate-cut-sided', index) - slope * (chip / 2 + rise)),
      ).toBeLessThanOrEqual(1);
    },
  );

  it.each(TIER_CASES)(
    'bậc "%s": "tray" thu vào `--plate-inset` ở đáy theo cùng dốc (≤ 1px) — một cạnh chéo thẳng từ đường khay xuống đáy',
    (_label, index) => {
      const { vars } = SPECS.tray;
      const { chip } = TIERS[index];
      const slope = varAt(vars, '--chip-cut', index) / (chip / 2);
      const rise = varAt(vars, '--shelf-rise', index);

      expect(
        Math.abs(varAt(vars, '--plate-inset', index) - slope * (chip + rise)),
      ).toBeLessThanOrEqual(1);
    },
  );

  it.each(
    SLANT_TRAYS.flatMap((skin) =>
      TIER_CASES.map(([label, index]) => [skin, label, index] as const),
    ),
  )(
    'kiểu "%s", bậc "%s": cạnh chéo bảng tên song song cạnh vát chip (inset = chip-cut × (cao chip + rise) / cao chip, ≤ 1px), tuck = inset, nav-pad = chip-cut',
    (skin, _label, index) => {
      const { vars } = SPECS[skin];
      const { chip } = TIERS[index];
      const cut = varAt(vars, '--chip-cut', index);
      const rise = varAt(vars, '--shelf-rise', index);

      expect(
        Math.abs(varAt(vars, '--plate-inset', index) - (cut * (chip + rise)) / chip),
      ).toBeLessThanOrEqual(1);
      expect(varAt(vars, '--plate-tuck', index)).toBe(varAt(vars, '--plate-inset', index));
      expect(varAt(vars, '--nav-pad', index)).toBe(cut);
    },
  );

  it.each(TRAY_TIERS.filter(([skin]) => (V_TRAYS as readonly string[]).includes(skin)))(
    'kiểu "%s", bậc "%s": khe mũi chip ↔ chip = chip ↔ bảng tên (`--plate-tuck` = rãnh − khe + `--nav-pad`)',
    (skin, _label, index) => {
      const { vars } = SPECS[skin];
      const gap = varAt(vars, '--chip-cut', index) + varAt(vars, '--chip-overlap', index);

      expect(varAt(vars, '--plate-tuck', index)).toBe(
        varAt(vars, '--plate-cut-sided', index) - gap + varAt(vars, '--nav-pad', index),
      );
    },
  );
  it.each(TIER_CASES)(
    'bậc "%s": nét viền trang không tab = đoạn chéo gốc KÉO THẲNG lên mép trên — họ "hang" `--plate-ext` = `--plate-inset` × cao đoạn thẳng đứng (`--shelf-y`) / (cao chip + rise); "tray-flip" `--plate-ext` = (cao thanh − ½ cao chip) / `--plate-slope` − `--plate-cut-sided` (≤ 1px)',
    (_label, index) => {
      const { chip, bar } = TIERS[index];

      for (const skin of ['tray', 'tray-slant', 'command', 'facet'] as const) {
        const { vars } = SPECS[skin];
        const rise = varAt(vars, '--shelf-rise', index);
        const straight = bar - chip - rise;
        const expected = (varAt(vars, '--plate-inset', index) * straight) / (chip + rise);

        expect(SPECS[skin].plate.solo).toBe('lean');
        expect(Math.abs(varAt(vars, '--plate-ext', index) - expected)).toBeLessThanOrEqual(1);
      }

      const flip = SPECS['tray-flip'].vars;
      const flipExpected =
        (bar - chip / 2) / varAt(flip, '--plate-slope', index) -
        varAt(flip, '--plate-cut-sided', index);

      expect(SPECS['tray-flip'].plate.solo).toBe('leanVee');
      expect(Math.abs(varAt(flip, '--plate-ext', index) - flipExpected)).toBeLessThanOrEqual(1);
    },
  );

  it.each(TIER_CASES)(
    'bậc "%s": "command" — tab bình hành TRỌN xếp song song: khe chip ↔ chip = khe chip ↔ bảng tên = `--nav-pad` (`--chip-overlap` = −(cut − nav-pad)), bảng tên song song cạnh tab (inset ≤ 1px, tuck = inset)',
    (_label, index) => {
      const { vars } = SPECS.command;
      const { chip } = TIERS[index];
      const cut = varAt(vars, '--chip-cut', index);
      const rise = varAt(vars, '--shelf-rise', index);
      const pad = varAt(vars, '--nav-pad', index);

      expect(varAt(vars, '--chip-overlap', index)).toBe(pad - cut);
      expect(
        Math.abs(varAt(vars, '--plate-inset', index) - (cut * (chip + rise)) / chip),
      ).toBeLessThanOrEqual(1);
      expect(varAt(vars, '--plate-tuck', index)).toBe(varAt(vars, '--plate-inset', index));
    },
  );
});

describe('header skin store — khôi phục', () => {
  it('⛔ cùng version nhưng `skin` rác → `tray`, không còn `undefined` trong bảng cấu hình', async () => {
    useHeaderSkinStore.setState({ skin: 'line' });

    const { skin } = await restoreHeader(envelope({ skin: 'garbage' }, VERSION));

    expect(skin).toBe('tray');
    expect(HEADER_SKIN_SPECS[skin]).toBeTruthy();
  });

  it.each(HEADER_SKIN_ORDER)('cùng version, `skin` hợp lệ `%s` được giữ', async (skin) => {
    const other = HEADER_SKIN_ORDER.find((value) => value !== skin) ?? 'tray';
    useHeaderSkinStore.setState({ skin: other });

    await restoreHeader(envelope({ skin }, VERSION));
    expect(useHeaderSkinStore.getState().skin).toBe(skin);
  });

  it.each([
    ['`skin` là số', { skin: 1 }],
    ['`skin` là null', { skin: null }],
    ['`skin` sai hoa thường', { skin: 'Hex' }],
    ['thiếu `skin`', {}],
  ])('field sai (%s) → `tray`', async (_name, state) => {
    useHeaderSkinStore.setState({ skin: 'line' });

    await restoreHeader(envelope(state, VERSION));
    expect(useHeaderSkinStore.getState().skin).toBe('tray');
  });

  it.each(['pill', 'bracket'])(
    'kiểu đã gỡ "%s" còn lưu từ bản cũ → về `tray`, không còn `undefined` trong bảng cấu hình',
    async (removed) => {
      const { skin } = await restoreHeader(envelope({ skin: removed }, VERSION));

      expect(skin).toBe('tray');
      expect(HEADER_SKIN_SPECS[skin]).toBeTruthy();
    },
  );

  it('version CŨ → bỏ lựa chọn đã lưu, về mặc định mới (v2 đổi mặc định sang `tray`); version MỚI hơn (rollback) vẫn bị kiểm lại', async () => {
    await restoreHeader(envelope({ skin: 'square' }, VERSION - 1));
    expect(useHeaderSkinStore.getState().skin).toBe('tray');

    await restoreHeader(envelope({ skin: 'hex' }, VERSION + 1));
    expect(useHeaderSkinStore.getState().skin).toBe('hex');

    await restoreHeader(envelope({ skin: 'garbage' }, VERSION + 1));
    expect(useHeaderSkinStore.getState().skin).toBe('tray');
  });

  it('migrate xong thì ghi lại đúng version hiện tại, chỉ còn `skin` (mặc định mới)', async () => {
    await restoreHeader(envelope({ skin: 'line', legacy: true }, VERSION - 1));

    expect(JSON.parse(localStorage.getItem(HEADER_KEY) ?? 'null')).toEqual({
      state: { skin: 'tray' },
      version: VERSION,
    });
  });

  it('⛔ field lạ (kể cả `layout` của bản cũ) bị bỏ, store không nhận thêm khoá nào ngoài state + action', async () => {
    const before = Object.keys(useHeaderSkinStore.getState()).sort();

    await restoreHeader(envelope({ skin: 'hex', layout: 'inline', accent: 'red' }, VERSION));

    expect(Object.keys(useHeaderSkinStore.getState()).sort()).toEqual(before);
    expect(useHeaderSkinStore.getState().skin).toBe('hex');
  });

  it('khôi phục xong action của store vẫn gọi được', async () => {
    await restoreHeader(envelope({ skin: 'hex' }, VERSION));

    useHeaderSkinStore.getState().setSkin('line');

    expect(useHeaderSkinStore.getState().skin).toBe('line');
  });

  it.each([
    ['chuỗi không phải JSON', '{hỏng'],
    ['JSON `null`', 'null'],
    ['state là null', envelope(null, VERSION)],
    ['state là chuỗi', envelope('hex', VERSION)],
    ['state là mảng', envelope(['hex'], VERSION)],
    ['state là số', envelope(42, VERSION)],
    ['thiếu state', JSON.stringify({ version: VERSION })],
  ])('dữ liệu hỏng (%s) → mặc định, không nổ', async (_name, raw) => {
    const state = await restoreHeader(raw);

    expect(state.skin).toBe('tray');
    expect(Object.keys(state).filter((key) => /^\d+$/.test(key))).toEqual([]);
  });
});
