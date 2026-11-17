/**
 * Cảnh báo khi git hook của husky CHƯA được cài — commit / push sẽ không qua kiểm nào (pre-commit build bản
 * stage, pre-push `npm run check`).
 *
 * Hay gặp: cài bằng `npm install --ignore-scripts`, clone mà chưa `npm install`, sao chép thư mục không kèm
 * `.husky/_` (thư mục sinh, bị ignore). Chỉ cảnh báo (exit 0) — chạy ở `predev` và trong `npm run check`; CI bỏ qua.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOOKS_PATH = '.husky/_';

const git = (args) => spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });

const inRepo = !process.env.CI && git(['rev-parse', '--is-inside-work-tree']).status === 0;

if (inRepo) {
  const configured = (git(['config', '--get', 'core.hooksPath']).stdout ?? '').trim();
  const installed =
    configured === HOOKS_PATH && fs.existsSync(path.join(ROOT, HOOKS_PATH, 'pre-commit'));
  if (!installed) {
    console.warn(
      `⚠️  Git hook CHƯA được cài (core.hooksPath = "${configured || 'trống'}", cần "${HOOKS_PATH}") — commit / push sẽ không qua kiểm nào.\n` +
        '   Sửa: chạy `npm install` (hoặc `npx husky`) ở thư mục dự án.',
    );
  }
}
