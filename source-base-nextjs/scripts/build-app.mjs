#!/usr/bin/env node
/**
 * Build production ở chế độ app (như job `build-app` của CI) — `npm run build:app`.
 *
 * Vào thư mục `.next-verify-app` riêng (`NEXT_DIST_DIR`) nên không đè `.next` của dev server / lần build demo. Build vẫn phải đỏ
 * khi env production sai (`findProductionIssues`, `src/core/config/env.schema.ts`). Env lấy từ `scripts/ci-env.mjs`.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { APP_ENV } from './ci-env.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = '.next-verify-app';

const result = spawnSync('npm run build', {
  cwd: ROOT,
  shell: true,
  stdio: 'inherit',
  env: { ...process.env, ...APP_ENV, NEXT_DIST_DIR: DIST },
});

fs.rmSync(path.join(ROOT, DIST), { recursive: true, force: true });
process.exit(result.status ?? 1);
