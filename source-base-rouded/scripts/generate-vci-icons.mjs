// scripts/generate-vci-icons.mjs — Sinh dữ liệu bộ icon VCI từ src/assets/vci-icons/*.svg
// Ra ĐÚNG 1 file: src/shared/ui/icons/vci-icon/vci-icons.generated.ts (dữ liệu từng lớp, không component riêng).
// SVG nguồn: viewBox 0 0 24 24 · <title> = nhãn tiếng Việt · data-group = nhóm · tối đa 3 lớp
//   <g data-layer="duo">  mảng tô nhạt (chỉ hiện ở biến thể duo)
//   <g data-layer="line"> nét 1.75, đầu tròn — thân icon
//   <g data-layer="dot">  chấm nhấn (chấm đỏ của logo VCI) — <circle> hoặc <path> tô đặc
// Chạy:   npm run generate:vci-icons        (ghi file)
//         npm run generate:vci-icons -- --check   (chỉ so — lệch thì exit 1, dùng trong CI / test)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = path.resolve(__dirname, '../src/assets/vci-icons');
const OUT = path.resolve(__dirname, '../src/shared/ui/icons/vci-icon/vci-icons.generated.ts');
const GROUPS = ['brand', 'module', 'business', 'action'];
const LAYERS = ['duo', 'line', 'dot'];

const HEADER = `// ⚠️  AUTO-GENERATED — DO NOT EDIT MANUALLY
// Source: src/assets/vci-icons/*.svg
// Regenerate: npm run generate:vci-icons`;

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

function parseLayer(svg, layer, file) {
  const match = svg.match(new RegExp(`<g[^>]*data-layer="${layer}"[^>]*>([\\s\\S]*?)</g>`));
  if (!match) return [];
  const shapes = [];
  for (const [tag, kind] of match[1].matchAll(/<(path|circle)\b[^>]*\/?>/g)) {
    if (kind === 'path') {
      const d = attr(tag, 'd');
      if (!d) throw new Error(`${file}: <path> thiếu d ở lớp ${layer}`);
      shapes.push(d);
    } else {
      const [cx, cy, r] = ['cx', 'cy', 'r'].map((name) => Number(attr(tag, name)));
      if ([cx, cy, r].some(Number.isNaN))
        throw new Error(`${file}: <circle> thiếu cx/cy/r ở lớp ${layer}`);
      shapes.push({ cx, cy, r });
    }
  }
  return shapes;
}

async function parseIcon(file) {
  const svg = await fs.readFile(path.join(ICONS_DIR, file), 'utf8');
  const name = path.basename(file, '.svg');
  const root = svg.match(/<svg\b[^>]*>/)?.[0] ?? '';
  if (attr(root, 'viewBox') !== '0 0 24 24')
    throw new Error(`${file}: viewBox phải là "0 0 24 24"`);
  const group = attr(root, 'data-group');
  if (!GROUPS.includes(group))
    throw new Error(`${file}: data-group phải thuộc ${GROUPS.join(' | ')}`);
  const label = svg.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
  if (!label) throw new Error(`${file}: thiếu <title> (nhãn tiếng Việt)`);
  const layers = Object.fromEntries(LAYERS.map((layer) => [layer, parseLayer(svg, layer, file)]));
  if (layers.line.length === 0) throw new Error(`${file}: lớp line rỗng`);
  return { name, label, group, ...layers };
}

const json = (value) => JSON.stringify(value).replace(/"(cx|cy|r)":/g, '$1:');

function render(icons) {
  const entries = icons.map(
    ({ name, label, group, duo, line, dot }) =>
      `  '${name}': {\n    label: '${label}',\n    group: '${group}',\n    duo: ${json(duo)},\n    line: ${json(line)},\n    dot: ${json(dot)},\n  },`,
  );
  return [
    HEADER,
    `import type { VciIconData } from './vci-icon.types';`,
    ``,
    `export const VCI_ICONS = {`,
    ...entries,
    `} as const satisfies Record<string, VciIconData>;`,
    ``,
    `export type VciIconName = keyof typeof VCI_ICONS;`,
    ``,
  ].join('\n');
}

async function main() {
  const files = (await fs.readdir(ICONS_DIR)).filter((f) => f.endsWith('.svg')).sort();
  if (files.length === 0) throw new Error(`Không có SVG trong ${ICONS_DIR}`);
  const content = render(await Promise.all(files.map(parseIcon)));

  if (process.argv.includes('--check')) {
    const current = await fs.readFile(OUT, 'utf8').catch(() => '');
    if (current !== content) {
      console.error(
        '❌ vci-icons.generated.ts lệch SVG nguồn — chạy `npm run generate:vci-icons`.',
      );
      process.exit(1);
    }
    console.log(`✅ ${files.length} icon VCI khớp nguồn`);
    return;
  }
  await fs.writeFile(OUT, content, 'utf8');
  console.log(`✅ ${files.length} icon VCI → ${path.relative(process.cwd(), OUT)}`);
}

main().catch((err) => {
  console.error('❌ generate-vci-icons:', err.message);
  process.exit(1);
});
