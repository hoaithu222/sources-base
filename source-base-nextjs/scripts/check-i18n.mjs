#!/usr/bin/env node
/**
 * Kiểm thông điệp đa ngôn ngữ (next-intl) — `npm run check:i18n`, nằm trong `npm run check` và CI.
 *
 * Bốn phép kiểm (⛔ = làm lệnh đỏ):
 *   ⛔ KHOÁ LỆCH   mỗi ngôn ngữ phải có ĐÚNG tập khoá của tiếng Việt (nguồn) — thiếu / thừa khoá ở `en`.
 *   ⛔ BIẾN LỆCH   cùng một khoá, hai ngôn ngữ phải dùng CÙNG tập biến ICU (`{count}`, `{name}`…) — dịch quên / đổi tên biến là lỗi lúc chạy.
 *   ⛔ THIẾU KHOÁ  `t('khoá')` trong code trỏ tới khoá không tồn tại trong tiếng Việt (TypeScript đã bắt phần lớn, đây bắt khoá dựng bằng chuỗi).
 *   ⚠️ MỒ CÔI     khoá có trong thông điệp mà không đâu trong code nhắc tới (chỉ cảnh báo — khoá dựng động `t(\`a.${x}\`)` được coi là dùng
 *                 mọi khoá bắt đầu bằng `a.`; thêm `--strict` để biến cảnh báo thành lỗi).
 *
 * Cấu trúc: `src/messages/<locale>/<ns>.json` → tiền tố khoá = tên file, `ui.form.json` → `ui.form.*` (xem `src/messages/vi/index.ts`).
 * Quét code: `const x = useTranslations('ns')` / `await getTranslations({ namespace: 'ns' })` rồi `x('khoá')` trong cùng file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MESSAGES_DIR = path.join(ROOT, 'src/messages');
const SOURCE_LOCALE = 'vi';
const STRICT = process.argv.includes('--strict');

/** Khoá luôn coi là đã dùng: đọc nguyên khối / `t.raw`, từ vựng chung, hoặc tra bằng dữ liệu (`labelKey`). */
const ALWAYS_USED = [
  /^metadata\./,
  /^errors\.http\./,
  /^validation\./,
  /^ui\.common\./,
  /^ui\.primitives\.vciIcons\./,
];

const flatten = (value, prefix = '') =>
  Object.entries(value).flatMap(([key, child]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === 'object' && !Array.isArray(child)) {
      return flatten(child, full);
    }
    return [[full, child]];
  });

function loadLocale(locale) {
  const dir = path.join(MESSAGES_DIR, locale);
  const entries = new Map();
  for (const file of fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.json'))
    .sort()) {
    const namespace = file.slice(0, -'.json'.length);
    const json = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    for (const [key, text] of flatten(json, namespace)) entries.set(key, text);
  }
  return entries;
}

/** Tên biến ICU cấp cao nhất của một thông điệp: `{count, plural, one {# a} other {# b}}` → `count`. */
function icuVariables(text) {
  if (typeof text !== 'string') return new Set();
  const names = new Set();
  let depth = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '{') {
      if (depth === 0) {
        const name = /^\{\s*([A-Za-z_]\w*)/.exec(text.slice(index))?.[1];
        if (name) names.add(name);
      }
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
    }
  }
  return names;
}

const locales = fs
  .readdirSync(MESSAGES_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const source = loadLocale(SOURCE_LOCALE);
const errors = [];
const warnings = [];

for (const locale of locales.filter((name) => name !== SOURCE_LOCALE)) {
  const target = loadLocale(locale);
  for (const key of source.keys()) {
    if (!target.has(key)) errors.push(`[${locale}] thiếu khoá: ${key}`);
  }
  for (const key of target.keys()) {
    if (!source.has(key))
      errors.push(`[${locale}] thừa khoá (không có ở ${SOURCE_LOCALE}): ${key}`);
  }
  for (const [key, text] of source) {
    if (!target.has(key)) continue;
    const a = [...icuVariables(text)].sort().join(',');
    const b = [...icuVariables(target.get(key))].sort().join(',');
    if (a !== b) {
      errors.push(
        `[${locale}] biến ICU lệch ở "${key}": ${SOURCE_LOCALE} {${a}} ≠ ${locale} {${b}}`,
      );
    }
  }
}

function* sourceFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(full);
    else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) yield full;
  }
}

/** `const t = useTranslations('ns')` / `const t = await getTranslations({ locale, namespace: 'ns' })` → (biến, namespace). */
const BINDING_RE =
  /(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*(?:\{[^}]*?namespace:\s*)?(?:'([^']+)'|`([^`$]+)`)/g;

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const literalKeys = [];
const dynamicPrefixes = new Set();

for (const file of sourceFiles(path.join(ROOT, 'src'))) {
  const text = fs.readFileSync(file, 'utf8');
  const relative = path.relative(ROOT, file).replace(/\\/g, '/');

  /** Một biến có thể gắn nhiều namespace trong cùng file (generateMetadata + trang): khoá hợp lệ nếu có ở BẤT KỲ namespace nào. */
  const bindings = new Map();
  for (const [, variable, single, template] of text.matchAll(BINDING_RE)) {
    const namespaces = bindings.get(variable) ?? new Set();
    namespaces.add(single ?? template);
    bindings.set(variable, namespaces);
  }

  for (const [variable, namespaces] of bindings) {
    const call = new RegExp(
      `(?<![\\w.])${escapeRegExp(variable)}(?:\\.rich|\\.raw|\\.has|\\.markup)?\\(\\s*(?:'([^']+)'|\`([^\`]*)\`)`,
      'g',
    );
    /** `t(biến)` — khoá lấy từ biến / bảng dữ liệu nên không chứng minh được khoá nào mồ côi: coi CẢ namespace là đã dùng. */
    const byVariable = new RegExp(
      `(?<![\\w.])${escapeRegExp(variable)}\\(\\s*[A-Za-z_][\\w.]*\\s*[,)]`,
    );
    if (byVariable.test(text)) {
      for (const namespace of namespaces) dynamicPrefixes.add(namespace + '.');
    }
    for (const [, literal, templated] of text.matchAll(call)) {
      const keyOrTemplate = literal ?? templated;
      const dynamicAt = keyOrTemplate.indexOf('${');
      if (dynamicAt === -1) {
        literalKeys.push({
          candidates: [...namespaces].map((namespace) => `${namespace}.${keyOrTemplate}`),
          file: relative,
        });
      } else {
        for (const namespace of namespaces) {
          dynamicPrefixes.add(`${namespace}.${keyOrTemplate.slice(0, dynamicAt)}`);
        }
      }
    }
  }
}

const referenced = new Set();
for (const item of literalKeys) {
  const existing = item.candidates.filter((key) => source.has(key));
  if (existing.length > 0) existing.forEach((key) => referenced.add(key));
  else errors.push(`thiếu khoá ở ${SOURCE_LOCALE}: ${item.candidates[0]}  ← ${item.file}`);
}

for (const key of source.keys()) {
  const used =
    referenced.has(key) ||
    ALWAYS_USED.some((pattern) => pattern.test(key)) ||
    [...dynamicPrefixes].some((prefix) => key.startsWith(prefix));
  if (!used) warnings.push(`khoá mồ côi (không thấy dùng): ${key}`);
}

if (warnings.length > 0) {
  const shown = warnings.slice(0, 40);
  console.warn(`⚠️  ${warnings.length} cảnh báo:\n${shown.map((line) => `   ${line}`).join('\n')}`);
  if (warnings.length > shown.length) {
    console.warn(`   … và ${warnings.length - shown.length} khoá nữa`);
  }
}

if (errors.length > 0 || (STRICT && warnings.length > 0)) {
  console.error(
    `\n⛔ ${errors.length} lỗi đa ngôn ngữ:\n${errors.map((line) => `   ${line}`).join('\n')}`,
  );
  console.error('\nSửa ở `src/messages/<locale>/*.json` — hướng dẫn: docs/guides/i18n.md');
  process.exit(1);
}

console.log(
  `✅ ${locales.length} ngôn ngữ · ${source.size} khoá — khoá, biến ICU và tham chiếu trong code đều khớp`,
);
