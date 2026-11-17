#!/usr/bin/env node
/**
 * Dựng rồi chạy bản production chế độ app cho bộ e2e — Playwright gọi qua `webServer.command` (`playwright.config.ts`);
 * không chạy tay (cổng và cookie phiên do config truyền qua biến môi trường).
 *
 * Build vào `.next-e2e` (`NEXT_DIST_DIR`) nên không đè `.next` của dev server; env chế độ app lấy từ `scripts/ci-env.mjs`
 * (đúng cấu hình job `build-app` của CI). `E2E_SKIP_BUILD=1` bỏ bước build để chạy lại nhanh khi mã nguồn chưa đổi — nhưng
 * `NEXT_PUBLIC_*` được nhúng lúc build, nên đổi mã hay env là phải build lại.
 *
 * Lưu ý: nghe `localhost` (chỉ loopback, không mở cổng ra mạng LAN). ⛔ KHÔNG đổi thành IP `127.0.0.1`: Next 16 + proxy.ts (next-intl) khi chạy với
 *        `--hostname 127.0.0.1` viết lại URL nội bộ thành host khác, mọi route qua proxy chuyển hướng vòng (xem `known-issues.md`).
 *        Playwright tự dọn cả cây tiến trình khi xong.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { APP_ENV } from './ci-env.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = '.next-e2e';
const PORT = process.env.E2E_PORT;

if (!PORT) {
  console.error(
    'Thiếu E2E_PORT — chạy bộ e2e bằng `npm run test:e2e` (cổng khai ở e2e/support/env.ts).',
  );
  process.exit(1);
}

const env = {
  ...process.env,
  ...APP_ENV,
  NODE_ENV: 'production',
  NEXT_DIST_DIR: DIST,
  NEXT_TELEMETRY_DISABLED: '1',
};

if (process.env.E2E_SKIP_BUILD === '1') {
  if (!fs.existsSync(path.join(ROOT, DIST, 'BUILD_ID'))) {
    console.error(
      `E2E_SKIP_BUILD=1 nhưng chưa có bản build ở ${DIST} — chạy một lần không đặt biến này.`,
    );
    process.exit(1);
  }
} else {
  const build = spawnSync('npm run build', { cwd: ROOT, env, shell: true, stdio: 'inherit' });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next');
const server = spawn(
  process.execPath,
  [nextBin, 'start', '--hostname', 'localhost', '--port', PORT],
  {
    cwd: ROOT,
    env,
    stdio: 'inherit',
  },
);

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill(signal));
server.on('exit', (code) => process.exit(code ?? 0));
