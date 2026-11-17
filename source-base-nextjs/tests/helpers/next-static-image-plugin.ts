import path from 'node:path';

import type { Plugin } from 'vite';

const IMAGE_FILE = /\.(svg|png|jpe?g|gif|webp|avif)$/i;

/**
 * Plugin Vite cho Vitest: `import logo from './logo.svg'` trả `{ src, width, height }` như `StaticImageData` của Next.
 *
 * Vite thuần trả CHUỖI URL nên `registry.src` ở `src/assets/image/index.ts` thành `undefined` — mọi `<Image name="…">` render `null`.
 * Chỉ bắt import KHÔNG có query (`?url` / `?raw` giữ nguyên hành vi của Vite).
 */
export function nextStaticImagePlugin(): Plugin {
  return {
    name: 'tests:next-static-image',
    enforce: 'pre',
    load(id) {
      if (id.includes('?') || !IMAGE_FILE.test(id)) return null;
      const src = `/_next/static/media/${path.basename(id)}`;
      return `export default ${JSON.stringify({ src, width: 24, height: 24 })};`;
    },
  };
}
