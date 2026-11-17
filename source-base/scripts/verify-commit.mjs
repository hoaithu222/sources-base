/**
 * verify-commit — chạy cuối `.husky/pre-commit` (sau lint-staged): BẢN SẼ COMMIT phải build được lên production.
 *
 * Vì sao không chỉ `tsc` như trước: lỗi build thật nằm ở chỗ khác — Tailwind / CSS, rolldown, kiểm env của bản
 * production (`findProductionIssues`, chỉ chạy ở chế độ `app`), file sinh lệch nguồn, `package-lock.json` quên
 * stage — và kiểm trên THƯ MỤC LÀM VIỆC thì pass dù commit thiếu file (quên `git add`, stage một phần).
 *
 * Các bước, dừng ở bước đỏ đầu tiên:
 *   0. Commit không chạm đường nào ảnh hưởng build (chỉ docs, .claude…) → bỏ qua phần nặng.
 *   1. `package.json` ↔ `package-lock.json` trong bản stage khớp nhau (`npm ci` của CI đỏ nếu lệch).
 *   2. Có stage nguồn style (`font.json`, `colors-theme.json`, script sinh) → `generate:styles`, file sinh phải
 *      khớp bản stage.
 *   3. `typecheck` (`tsc -b`; ⛔ không `tsc --noEmit` — tsconfig kiểu solution nên lệnh đó kiểm 0 file) →
 *      `check:imports` → `check:cycles`.
 *   4. Build demo (như job `check` của CI) + ngân sách tải đầu; build chế độ app (như job `build-app`) + ngân sách.
 *
 * Thư mục làm việc khác bản stage ở đường liên quan (sửa chưa stage, file mới chưa `git add`, có `.env*.local`)
 * → kiểm trên BẢN SAO của index ở thư mục tạm (`node_modules` nối bằng junction), xong thì dọn.
 *
 * Khẩn cấp: `git commit --no-verify` — CI vẫn chạy đủ các bước này.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Đường ảnh hưởng tới build hoặc tới `tsc -b` (tsconfig.app gồm cả `tests/`). */
const BUILD_INPUT =
  /^(src|tests|scripts|public)\/|^(index\.html|package(-lock)?\.json|vite\.config\.ts|tsconfig[\w.-]*\.json|knip\.json|\.env|\.env\.example|\.npmrc|\.nvmrc)$/;

/** Nguồn → file sinh của `npm run generate:styles`. */
const STYLE_SOURCES = [
  'src/styles/theme/colors-theme.json',
  'src/styles/font/font.json',
  'scripts/generate-colors.mjs',
  'scripts/generate-font.mjs',
];
const STYLE_OUTPUTS = [
  'src/styles/theme/generated-colors.css',
  'src/shared/theme/colors.generated.ts',
  'src/styles/font/generated-font.css',
];

/** `.env.local`, `.env.production.local`… — bị ignore nên không vào commit, nhưng build tại chỗ sẽ đọc chúng. */
const LOCAL_ENV = /^\.env(\.[\w-]+)?\.local$/;

/** Env của hai job CI — giữ khớp `.github/workflows/ci.yml`. */
const DEMO_ENV = { VITE_APP_MODE: 'demo' };
const APP_ENV = { VITE_APP_MODE: 'app', VITE_API_BASE_URL: '/api' };

/** Thư mục cache ghi trong `node_modules` — bản sao dùng thư mục riêng, không ghi đè cache của repo thật. */
const LOCAL_CACHES = new Set(['.tmp', '.vite', '.vite-temp', '.cache']);

const startedAt = Date.now();
const seconds = (ms) => `${(ms / 1000).toFixed(1)} s`;
let workDir;

function cleanup() {
  if (workDir) fs.rmSync(workDir, { recursive: true, force: true });
  workDir = undefined;
}

function fail(title, hint, output = '') {
  if (output.trim()) console.error(`\n${output.trimEnd()}`);
  console.error(`\n✖ ${title}\n  ${hint}`);
  console.error('  Khẩn cấp: git commit --no-verify (CI vẫn chặn).');
  cleanup();
  process.exit(1);
}

function git(args) {
  const result = spawnSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')}\n${result.stderr}`);
  return result.stdout;
}

const nulList = (output) => output.split('\0').filter(Boolean);
const stagedBlob = (file) => git(['show', `:${file}`]);
const normalize = (text) => text.replace(/\r\n/g, '\n');

/** Chạy một bước, nuốt output — chỉ in khi đỏ. */
function step(title, command, { cwd, env = {}, hint }) {
  const begin = Date.now();
  const result = spawnSync(command, {
    cwd,
    shell: true,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, ...env },
  });
  const took = seconds(Date.now() - begin);
  if (result.status !== 0) {
    fail(`${title} — đỏ (${took})`, hint, `${result.stdout ?? ''}${result.stderr ?? ''}`);
  }
  console.log(`  ✓ ${title} (${took})`);
}

const sortedJson = (value) =>
  JSON.stringify(
    value && Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))),
  );

function checkLockfile(staged) {
  if (!staged.some((file) => /^package(-lock)?\.json$/.test(file))) return;
  const manifest = JSON.parse(stagedBlob('package.json'));
  const lockRoot = JSON.parse(stagedBlob('package-lock.json')).packages?.[''] ?? {};
  const drift = [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies',
  ].filter((field) => sortedJson(manifest[field]) !== sortedJson(lockRoot[field]));
  if (drift.length > 0) {
    fail(
      `package.json và package-lock.json trong bản stage lệch nhau (${drift.join(', ')})`,
      'Chạy `npm install` rồi `git add package.json package-lock.json` — CI dùng `npm ci`, lệch là đỏ ngay bước cài.',
    );
  }
  console.log('  ✓ package.json ↔ package-lock.json khớp');
}

function checkGeneratedStyles(staged, cwd) {
  if (!staged.some((file) => STYLE_SOURCES.includes(file) || STYLE_OUTPUTS.includes(file))) return;
  step('Sinh style (generate:styles)', 'npm run generate:styles', {
    cwd,
    hint: 'Script sinh style lỗi — chạy `npm run generate:styles` để xem chi tiết.',
  });
  const stagedText = (file) => {
    try {
      return normalize(stagedBlob(file));
    } catch {
      return undefined;
    }
  };
  const stale = STYLE_OUTPUTS.filter(
    (file) => normalize(fs.readFileSync(path.join(cwd, file), 'utf8')) !== stagedText(file),
  );
  if (stale.length > 0) {
    fail(
      'File sinh lệch nguồn style trong bản stage',
      `Chạy \`npm run generate:styles\` rồi \`git add ${stale.join(' ')}\`.`,
    );
  }
  console.log('  ✓ File sinh khớp nguồn style');
}

/** Lý do phải kiểm trên bản sao của index (rỗng = thư mục làm việc khớp bản stage, kiểm tại chỗ). */
function snapshotReasons() {
  const unstaged = nulList(git(['diff', '--name-only', '-z'])).filter((f) => BUILD_INPUT.test(f));
  const untracked = nulList(git(['ls-files', '--others', '--exclude-standard', '-z'])).filter((f) =>
    BUILD_INPUT.test(f),
  );
  const localEnv = fs.readdirSync(ROOT).filter((name) => LOCAL_ENV.test(name));
  const sample = (files) => files.slice(0, 3).join(', ') + (files.length > 3 ? ', …' : '');
  return [
    unstaged.length && `${unstaged.length} file sửa chưa stage (${sample(unstaged)})`,
    untracked.length && `${untracked.length} file chưa \`git add\` (${sample(untracked)})`,
    localEnv.length && `có ${localEnv.join(', ')} (bản commit / CI không có)`,
  ].filter(Boolean);
}

function makeSnapshot() {
  const tree = path.join(workDir, 'tree');
  git(['checkout-index', '--all', `--prefix=${tree.replaceAll('\\', '/')}/`]);
  const modules = path.join(tree, 'node_modules');
  fs.mkdirSync(modules);
  for (const entry of fs.readdirSync(path.join(ROOT, 'node_modules'), { withFileTypes: true })) {
    if (!(entry.isDirectory() || entry.isSymbolicLink()) || LOCAL_CACHES.has(entry.name)) continue;
    fs.symlinkSync(
      path.join(ROOT, 'node_modules', entry.name),
      path.join(modules, entry.name),
      'junction',
    );
  }
  return tree;
}

process.on('SIGINT', () => {
  cleanup();
  process.exit(130);
});

const samePath = (a, b) => {
  const real = (p) => fs.realpathSync.native(p);
  return process.platform === 'win32'
    ? real(a).toLowerCase() === real(b).toLowerCase()
    : real(a) === real(b);
};

if (!samePath(git(['rev-parse', '--show-toplevel']).trim(), ROOT)) {
  console.warn('⚠️  verify-commit: thư mục dự án không phải gốc repo git — bỏ qua.');
  process.exit(0);
}

const staged = nulList(git(['diff', '--cached', '--name-only', '-z']));
const buildInputs = staged.filter((file) => BUILD_INPUT.test(file));

if (buildInputs.length === 0) {
  console.log(
    'verify-commit: commit không chạm đường nào ảnh hưởng build (src, tests, scripts, cấu hình…) — bỏ qua.',
  );
  process.exit(0);
}

console.log(
  `verify-commit: bản stage có ${buildInputs.length} file ảnh hưởng build — kiểm nó build được.`,
);
checkLockfile(staged);

workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-commit-'));
const reasons = snapshotReasons();
let cwd = ROOT;
if (reasons.length > 0) {
  console.log(`  Kiểm trên BẢN SAO của index vì: ${reasons.join('; ')}.`);
  const begin = Date.now();
  cwd = makeSnapshot();
  console.log(`  ✓ Dựng bản sao (${seconds(Date.now() - begin)})`);
} else {
  console.log('  Thư mục làm việc khớp bản stage — kiểm tại chỗ.');
}

const MISSING_FILE_HINT =
  reasons.length > 0
    ? ' Kiểm đang chạy trên BẢN STAGE: máy bạn chạy được mà ở đây báo thiếu module / file → bạn quên `git add` file đó.'
    : '';

checkGeneratedStyles(staged, cwd);

step('Kiểu (tsc -b)', 'npm run typecheck', {
  cwd,
  hint: `Sửa lỗi kiểu ở trên.${MISSING_FILE_HINT}`,
});
step('Gói import chưa khai', 'npm run check:imports', {
  cwd,
  hint: 'Cài gói (`npm install <gói>`) và stage cả `package.json` lẫn `package-lock.json`.',
});
step('Import vòng', 'npm run check:cycles', {
  cwd,
  hint: `Gỡ vòng import ở trên — docs/rules/foundations/folder-structure.md.${MISSING_FILE_HINT}`,
});

const demoDist = path.join(workDir, 'dist-demo');
const appDist = path.join(workDir, 'dist-app');

step(
  'Build demo (vite build, VITE_APP_MODE=demo)',
  `npx vite build --outDir "${demoDist}" --emptyOutDir`,
  {
    cwd,
    env: DEMO_ENV,
    hint: `Build lỗi (Tailwind / CSS, rolldown, env) — chạy \`npm run build\` để xem đầy đủ.${MISSING_FILE_HINT}`,
  },
);
step('Ngân sách tải đầu (demo)', `node scripts/check-bundle.mjs "${demoDist}"`, {
  cwd,
  hint: 'Xem hướng dẫn đầu file scripts/check-bundle.mjs.',
});
step(
  'Build chế độ app (như job build-app của CI)',
  `npx vite build --outDir "${appDist}" --emptyOutDir`,
  {
    cwd,
    env: APP_ENV,
    hint: 'Bản production thật (VITE_APP_MODE=app) không build được — thường là `findProductionIssues` (src/core/config/env.schema.ts) chặn env sai.',
  },
);
step('Ngân sách tải đầu (app)', `node scripts/check-bundle.mjs "${appDist}"`, {
  cwd,
  hint: 'Xem hướng dẫn đầu file scripts/check-bundle.mjs.',
});

cleanup();
console.log(`✓ verify-commit: bản stage build được (${seconds(Date.now() - startedAt)}).`);
