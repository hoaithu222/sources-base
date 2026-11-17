import fs from 'node:fs';
import path from 'node:path';

/**
 * Chữ hiển thị lấy từ `src/messages/<locale>/*.json` THẬT — test hỏi "nút đăng xuất tên gì" bằng khoá dịch, không chép chữ
 * Việt vào test: sửa câu chữ không làm đỏ e2e, còn khoá bị đổi tên / xoá thì đỏ ngay ở đây.
 *
 *   vi('auth.login.submit')   → 'Đăng nhập'
 *   en('about.title')         → 'About'
 *
 * Lưu ý: ghép khoá y như `src/messages/<locale>/index.ts` — `ui.widgets.json` thành nhánh `ui.widgets`, file còn lại là
 * nhánh cùng tên (`auth.json` → `auth`). Chỉ nhận chuỗi trần (không ICU `{biến}`).
 */

type Locale = 'vi' | 'en';
type Tree = { [key: string]: Tree | string | string[] };

const MESSAGES_DIR = path.resolve(import.meta.dirname, '../../src/messages');
const trees = new Map<Locale, Tree>();

function readTree(locale: Locale): Tree {
  const dir = path.join(MESSAGES_DIR, locale);
  const tree: Tree = {};
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.json'))) {
    const branch = file.replace(/\.json$/, '').split('.');
    const leaf = branch.pop() as string;
    let node = tree;
    for (const part of branch) node = (node[part] ??= {}) as Tree;
    node[leaf] = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) as Tree;
  }
  return tree;
}

function lookup(locale: Locale, key: string): string {
  if (!trees.has(locale)) trees.set(locale, readTree(locale));

  let node: Tree | string | string[] | undefined = trees.get(locale);
  for (const part of key.split('.')) {
    node = typeof node === 'object' && !Array.isArray(node) ? node[part] : undefined;
  }
  if (typeof node !== 'string')
    throw new Error(`Khoá dịch không có hoặc không phải chuỗi: ${locale}:${key}`);
  return node;
}

export const vi = (key: string): string => lookup('vi', key);
export const en = (key: string): string => lookup('en', key);
