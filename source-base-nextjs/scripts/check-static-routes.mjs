#!/usr/bin/env node
/**
 * Kiểm SAU BUILD: route `[locale]/…` render đúng CHÍNH SÁCH đã khai — `npm run check:static-routes`.
 *
 * Mặc định mọi route là TĨNH (SSG): phải có bản prerender cho từng ngôn ngữ. Một route lỡ thành render động (`ƒ`) KHÔNG làm build đỏ —
 * chỉ chậm đi, mất cache CDN và tốn CPU server mỗi request. Nguyên nhân hay gặp: `cookies()` / `headers()` / `searchParams` ở layout
 * hoặc page, `useSearchParams` thiếu `<Suspense>`, `export const dynamic = 'force-dynamic'`. Script đọc `prerender-manifest.json` của
 * bản build, so với `RENDER_POLICY` bên dưới.
 *
 * Trang CẦN render theo request (dữ liệu riêng của người dùng từ server, nội dung luôn mới…) thì khai MỘT dòng vào `RENDER_POLICY`
 * kèm lý do — không phải sửa luật toàn cục. Dòng khai động mà route vẫn tĩnh (hoặc không khớp route nào) bị cảnh báo là lỗi thời.
 * Quy ước dữ liệu server + kiểm quyền: `docs/architecture.md` §3 ("Chính sách render", "Dữ liệu từ server").
 * Thư mục build: `NEXT_DIST_DIR` (mặc định `.next`) — khớp `next.config.ts`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, process.env.NEXT_DIST_DIR ?? '.next');

/**
 * Route CỐ Ý không tĩnh (đã bỏ `/page`, `/route`; so khớp trên đường route kiểu `/[locale]/orders/[id]`) — kèm lý do.
 * Route không khớp dòng nào mặc định là `static`.
 */
const RENDER_POLICY = [
  {
    match: /\[\.\.\.rest\]/,
    mode: 'dynamic',
    reason: 'catch-all → notFound() cho URL lạ, luôn trả 404 theo request',
  },
];

const read = (file) => JSON.parse(fs.readFileSync(path.join(DIST, file), 'utf8'));

const localesSource = fs.readFileSync(path.join(ROOT, 'src/core/i18n/locales.ts'), 'utf8');
const locales = [
  ...(/LOCALES = \[([^\]]+)\]/.exec(localesSource)?.[1] ?? '').matchAll(/'([^']+)'/g),
].map((match) => match[1]);
if (locales.length === 0) {
  console.error('⛔ Không đọc được LOCALES từ src/core/i18n/locales.ts');
  process.exit(1);
}

if (!fs.existsSync(path.join(DIST, 'prerender-manifest.json'))) {
  console.error(
    `⛔ Chưa có bản build ở ${path.relative(ROOT, DIST)} — chạy \`npm run build\` trước.`,
  );
  process.exit(1);
}

const appRoutes = read('app-path-routes-manifest.json');
const prerendered = new Set(Object.keys(read('prerender-manifest.json').routes));
const isPrerendered = (route) =>
  locales.some((locale) => prerendered.has(route.replace('[locale]', locale)));

const missing = [];
const stale = [];
const declaredDynamic = [];
const matchedPolicies = new Set();
let checked = 0;

for (const route of new Set(Object.values(appRoutes))) {
  if (!route.startsWith('/[locale]')) continue;

  const policy = RENDER_POLICY.find(({ match }) => match.test(route));
  if (policy) {
    matchedPolicies.add(policy);
    declaredDynamic.push(`${route} — ${policy.reason}`);
    if (isPrerendered(route)) {
      stale.push(`${route}  (khai ${policy.mode} nhưng đang được prerender tĩnh)`);
    }
    continue;
  }

  for (const locale of locales) {
    checked += 1;
    const expected = route.replace('[locale]', locale);
    if (!prerendered.has(expected)) missing.push(`${expected}  (route ${route})`);
  }
}

for (const policy of RENDER_POLICY) {
  if (!matchedPolicies.has(policy)) {
    stale.push(`${policy.match}  (dòng RENDER_POLICY không khớp route nào của bản build)`);
  }
}

if (missing.length > 0) {
  console.error(
    `⛔ ${missing.length} route KHÔNG được prerender tĩnh — đang render động theo từng request:\n`,
  );
  missing.forEach((line) => console.error(`   ${line}`));
  console.error(
    '\nTìm `cookies()` / `headers()` / `searchParams` / `useSearchParams` thiếu <Suspense> / `dynamic = "force-dynamic"` trong layout + page của route đó.\n' +
      'Cố ý không tĩnh (dữ liệu riêng từ server…) thì khai một dòng vào RENDER_POLICY ở scripts/check-static-routes.mjs kèm lý do. Xem docs/architecture.md §3.',
  );
  process.exit(1);
}

if (stale.length > 0) {
  console.warn(`⚠️  ${stale.length} dòng RENDER_POLICY lỗi thời — xoá hoặc sửa cho khớp:`);
  stale.forEach((line) => console.warn(`   ${line}`));
}

const dynamicNote =
  declaredDynamic.length > 0
    ? `; ${declaredDynamic.length} route khai động có lý do (${declaredDynamic.join('; ')})`
    : '';
console.log(
  `✅ ${checked} route × ngôn ngữ đều prerender tĩnh (${locales.join(', ')})${dynamicNote}`,
);
