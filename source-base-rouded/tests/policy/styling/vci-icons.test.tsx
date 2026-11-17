/**
 * Bộ icon VCI — nguồn SVG (`src/assets/vci-icons/*.svg`) và dữ liệu sinh (`vci-icons.generated.ts`) là một bộ.
 *
 * Giữ: lưới 24 · nét 1.75 đầu tròn · đủ `<title>` + `data-group` · chỉ 3 lớp `duo` / `line` / `dot` · hình nằm trong
 * vùng an toàn 1–23 · dữ liệu sinh khớp nguồn (CI: `npm run generate:vci-icons -- --check`) · `VciIcon` vẽ đúng lớp theo
 * biến thể · `AppIcon` rẽ đúng bộ · `AppTile` nhận tên VCI.
 */

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppIcon, AppTile, VCI_ICONS, VciIcon, type VciIconName } from '@/shared/ui';
import { isVciIconName } from '@/shared/ui/icons/app-icon';

const SVG_SOURCES = import.meta.glob('/src/assets/vci-icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;
const fileOf = (path: string) => path.split('/').pop() ?? path;
const SVG_FILES = Object.keys(SVG_SOURCES).map(fileOf);
const svgOf = (file: string) => SVG_SOURCES[`/src/assets/vci-icons/${file}`];
const NAMES = Object.keys(VCI_ICONS) as VciIconName[];

/** `d` của mọi `<path>` trong một lớp — cùng cách đọc của `scripts/generate-vci-icons.mjs`. */
const pathsIn = (svg: string, layer: string) => {
  const body =
    svg.match(new RegExp(`<g[^>]*data-layer="${layer}"[^>]*>([\\s\\S]*?)</g>`))?.[1] ?? '';
  return [...body.matchAll(/<path\b[^>]*\sd="([^"]*)"/g)].map((m) => m[1]);
};

describe('nguồn SVG', () => {
  it('có ít nhất 40 icon, tên file kebab-case', () => {
    expect(SVG_FILES.length).toBeGreaterThanOrEqual(40);
    const bad = SVG_FILES.filter((file) => !/^[a-z]+(-[a-z]+)*\.svg$/.test(file));
    expect(bad).toEqual([]);
  });

  it.each(SVG_FILES)('%s: lưới 24, có nhãn + nhóm, nét 1.75 đầu tròn, chỉ 3 lớp', (file) => {
    const svg = svgOf(file);
    expect(svg).toMatch(/<svg[^>]*viewBox="0 0 24 24"/);
    expect(svg).toMatch(/<title>[^<]+<\/title>/);
    expect(svg).toMatch(/data-group="(brand|module|business|action)"/);
    expect(svg).toMatch(
      /data-layer="line"[^>]*stroke-width="1.75"[^>]*stroke-linecap="round"[^>]*stroke-linejoin="round"/,
    );
    const layers = [...svg.matchAll(/data-layer="([a-z]+)"/g)].map((m) => m[1]);
    expect(layers.every((layer) => ['duo', 'line', 'dot'].includes(layer))).toBe(true);
    expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });
});

describe('dữ liệu sinh', () => {
  it('khớp nguồn SVG: đủ tên, nhãn, nhóm, nét từng lớp (nguồn đổi → chạy generate:vci-icons)', () => {
    expect([...NAMES].sort()).toEqual(SVG_FILES.map((file) => file.replace('.svg', '')).sort());
    const stale = NAMES.filter((name) => {
      const svg = svgOf(`${name}.svg`);
      const icon = VCI_ICONS[name];
      return (
        svg.match(/<title>([^<]+)<\/title>/)?.[1].trim() !== icon.label ||
        svg.match(/data-group="([^"]+)"/)?.[1] !== icon.group ||
        JSON.stringify(pathsIn(svg, 'line')) !== JSON.stringify(icon.line) ||
        JSON.stringify(pathsIn(svg, 'duo')) !== JSON.stringify(icon.duo)
      );
    });
    expect(stale).toEqual([]);
  });

  it('chấm nhấn tròn nằm trong vùng an toàn 1–23', () => {
    const outside = NAMES.flatMap((name) =>
      VCI_ICONS[name].dot
        .filter((dot) => typeof dot !== 'string')
        .filter(
          (dot) =>
            dot.cx - dot.r < 1 || dot.cy - dot.r < 1 || dot.cx + dot.r > 23 || dot.cy + dot.r > 23,
        )
        .map(() => name),
    );
    expect(outside).toEqual([]);
  });

  it('tên VCI không trùng tên icon hệ thống (luôn có đuôi -bold / -outline)', () => {
    expect(NAMES.filter((name) => /-(bold|outline)$/.test(name))).toEqual([]);
    expect(NAMES.every(isVciIconName)).toBe(true);
    expect(isVciIconName('wallet-bold')).toBe(false);
  });
});

describe('VciIcon · AppIcon · AppTile', () => {
  it('line: không vẽ lớp duo, chấm theo màu thân; duo: thêm lớp tô + chấm màu nhấn', () => {
    const line = render(<VciIcon name="finance" />).container;
    expect(line.querySelector('[data-layer="duo"]')).toHaveClass('hidden');
    expect(line.querySelector('[data-layer="dot"]')).toHaveClass('fill-current');
    expect(line.querySelector('[data-layer="line"]')).toHaveAttribute('stroke-width', '1.75');

    const duo = render(<VciIcon name="finance" size={24} variant="duo" weight="bold" />).container;
    expect(duo.querySelector('[data-layer="duo"]')).toHaveClass('opacity-16');
    expect(duo.querySelector('[data-layer="dot"]')).toHaveClass('fill-icon-accent');
    expect(duo.querySelector('[data-layer="line"]')).toHaveAttribute('stroke-width', '2.25');
    expect(duo.querySelector('svg')).toHaveStyle({ width: '24px', height: '24px' });
  });

  it('AppIcon rẽ đúng bộ; AppTile nhận tên VCI và tự dày nét ở cỡ nhỏ', () => {
    const vci = render(<AppIcon name="warehouse" />).container;
    expect(vci.querySelector('[data-layer="line"]')).not.toBeNull();
    const system = render(<AppIcon name="wallet-bold" />).container;
    expect(system.querySelector('[data-layer]')).toBeNull();
    expect(system.querySelector('svg')).not.toBeNull();

    const tile = render(<AppTile icon="finance" size="xs" />).container;
    expect(tile.querySelector('[data-layer="line"]')).toHaveAttribute('stroke-width', '2.25');
    expect(tile.querySelector('[data-layer="duo"]')).toHaveClass('opacity-16');
  });
});
