// scripts/generate-colors.mjs — Generate CSS variables + Tailwind @theme + TS table from colors-theme.json
//
// Hình dạng colors-theme.json (xem docs/rules/styling/color-system.md §"Cấu trúc file"):
//   ramps  — thang màu theo họ, GIỐNG HỆT ở cả hai theme: { primary: ['#EBFDF0', …] }. VỊ TRÍ trong mảng = BẬC
//            (phần tử đầu là bậc 1); `null` = họ không có bậc đó
//   alias  — tên khác của một họ trong ramps: { success: { of: 'green', steps: [2, 5] } } → success-2 = green-2
//   shared — một màu dùng chung cả hai theme (ring-focus…)
//   theme  — token khác nhau theo theme, mỗi key một cặp [light, dark]
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.join(__dirname, '../src/styles/theme/colors-theme.json');
const CSS_OUTPUT = path.join(__dirname, '../src/styles/theme/generated-colors.css');
const TS_OUTPUT = path.join(__dirname, '../src/shared/theme/colors.generated.ts');

const FILE_HEADER = `/* This file is generated. DO NOT EDIT.\n * Edit "colors-theme.json" instead.\n */`;

const TOP_LEVEL_KEYS = new Set(['_doc', 'ramps', 'alias', 'shared', 'theme']);
const MAX_STEP = 10;
const HEX = /^#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

const isText = (value) => typeof value === 'string' && value.trim() !== '';

/** Kiểm tra cấu hình, giải ramps + alias. Sai là ném lỗi — build KHÔNG được chạy tiếp với bảng màu hỏng. */
const resolveConfig = (config) => {
  const { ramps = {}, alias = {}, shared = {}, theme = {} } = config;
  const errors = [];

  for (const key of Object.keys(config)) {
    if (!TOP_LEVEL_KEYS.has(key)) errors.push(`khoá cấp trên cùng "${key}" không hợp lệ`);
  }

  // ramps → { 'primary-5': '#22C55E' }
  const rampColors = {};
  for (const [family, steps] of Object.entries(ramps)) {
    if (!Array.isArray(steps) || steps.length > MAX_STEP) {
      errors.push(`ramps.${family} phải là mảng tối đa ${MAX_STEP} phần tử (vị trí = bậc)`);
      continue;
    }
    steps.forEach((value, index) => {
      if (value === null) return;
      if (typeof value !== 'string' || !HEX.test(value)) {
        errors.push(
          `ramps.${family}[${index}] (bậc ${index + 1}) không phải mã hex: ${JSON.stringify(value)}`,
        );
        return;
      }
      rampColors[`${family}-${index + 1}`] = value;
    });
  }

  const aliasColors = {};
  const aliasLines = [];
  for (const [name, { of, steps }] of Object.entries(alias)) {
    for (const step of steps) {
      const key = `${name}-${step}`;
      const target = `${of}-${step}`;
      if (!(target in rampColors))
        errors.push(`alias "${key}" trỏ tới "${target}" không có trong ramps`);
      aliasColors[key] = rampColors[target];
      aliasLines.push([key, `var(--color-${target})`]);
    }
  }

  const sharedColors = {};
  for (const [key, value] of Object.entries(shared)) {
    if (!isText(value)) errors.push(`shared.${key} có giá trị rỗng / không phải chuỗi`);
    sharedColors[key] = value;
  }

  const light = {};
  const dark = {};
  for (const [key, pair] of Object.entries(theme)) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(isText)) {
      errors.push(`theme.${key} phải là cặp [light, dark] hai chuỗi`);
      continue;
    }
    [light[key], dark[key]] = pair;
  }

  const groups = { ramps: rampColors, alias: aliasColors, shared: sharedColors, theme: light };
  const seen = new Map();
  for (const [group, entries] of Object.entries(groups)) {
    for (const key of Object.keys(entries)) {
      if (seen.has(key)) errors.push(`key "${key}" khai trùng ở "${seen.get(key)}" và "${group}"`);
      else seen.set(key, group);
    }
  }

  if (errors.length > 0)
    throw new Error(`colors-theme.json không hợp lệ:\n  - ${errors.join('\n  - ')}`);

  const base = { ...rampColors, ...sharedColors, ...aliasColors };
  return {
    rampColors,
    sharedColors,
    aliasLines,
    light,
    dark,
    keys: Object.keys({ ...base, ...light }),
    lightColors: { ...base, ...light },
    darkColors: { ...base, ...dark },
  };
};

const declare = (entries) =>
  entries.map(([key, value]) => `  --color-${key}: ${value};`).join('\n');

const generateCSS = ({ rampColors, sharedColors, aliasLines, light, dark, keys }) => `${FILE_HEADER}

:root {
${declare(Object.entries(rampColors))}
${declare(Object.entries(sharedColors))}
${declare(aliasLines)}
${declare(Object.entries(light))}
}

.dark {
${declare(Object.entries(dark))}
}

/* Tailwind v4: map theme to CSS vars so text-primary-5, bg-bg-surface, etc. work */
@theme inline {
${keys.map((key) => `  --color-${key}: var(--color-${key});`).join('\n')}
}
`;

const generateTS = ({ keys, lightColors, darkColors }) => {
  const typeUnion = keys.map((k) => `  | '${k}'`).join('\n');
  const entries = (colors) => keys.map((k) => `  '${k}': '${colors[k]}',`).join('\n');

  return `/** Generated from colors-theme.json. DO NOT EDIT. */
export type ThemeColorKey =
${typeUnion};

export const THEME_COLOR_KEYS: ThemeColorKey[] = [
${keys.map((k) => `  '${k}',`).join('\n')}
];

export const LIGHT_COLORS: Record<ThemeColorKey, string> = {
${entries(lightColors)}
};

export const DARK_COLORS: Record<ThemeColorKey, string> = {
${entries(darkColors)}
};
`;
};

try {
  const file = await fs.readFile(INPUT_PATH, 'utf-8');
  const resolved = resolveConfig(JSON.parse(file));

  // Generate CSS
  await fs.mkdir(path.dirname(CSS_OUTPUT), { recursive: true });
  await fs.writeFile(CSS_OUTPUT, generateCSS(resolved));
  console.log(`✅ Generated "${CSS_OUTPUT}"`);

  // Generate TypeScript
  await fs.mkdir(path.dirname(TS_OUTPUT), { recursive: true });
  await fs.writeFile(TS_OUTPUT, generateTS(resolved));
  console.log(`✅ Generated "${TS_OUTPUT}"`);
} catch (error) {
  console.error('❌ Failed:', error);
  process.exitCode = 1;
}
