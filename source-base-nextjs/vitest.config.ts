import path from 'node:path';

import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';

import { nextStaticImagePlugin } from './tests/helpers/next-static-image-plugin.ts';

/** Test dựng cả cây app — xem `test.projects` bên dưới. */
const SMOKE_TESTS = 'tests/**/*.smoke.test.{ts,tsx}';

export default defineConfig({
  plugins: [react(), nextStaticImagePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@tests': path.resolve(import.meta.dirname, './tests'),
      // `server-only` ném lỗi ngoài điều kiện react-server (đúng chủ đích ở build) — test chạy ngoài điều kiện đó nên thay bằng module rỗng.
      'server-only': path.resolve(import.meta.dirname, './tests/helpers/server-only.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    // Test cố định chế độ demo: kết quả không phụ thuộc `.env` / `.env.local` của từng máy (checkout sạch của CI không có `.env`).
    env: { NEXT_PUBLIC_APP_MODE: 'demo' },
    // `next-intl` import `next/navigation` không đuôi file — Node ESM thuần không giải được, nên để Vite xử lý (cách chính thức cho Vitest).
    server: { deps: { inline: ['next-intl'] } },
    // Tắt xử lý CSS để test chạy nhanh — NGOẠI TRỪ `*.css?raw`: vitest coi MỌI id kết thúc bằng `.css` (kể cả có `?raw`) là CSS và thay
    // bằng chuỗi rỗng, nên `tests/policy/styling/css-structure.test.ts` đọc về "" và mọi phép kiểm đều pass giả.
    css: { include: [/\.css\?raw$/] },
    /**
     * Hai nhóm test, hai ngân sách thời gian.
     *
     *  - `unit`  — nhanh, cô lập. Giữ timeout mặc định 5 giây: bài kiểm đơn vị chạm ngưỡng đó là có vấn đề thật.
     *  - `smoke` — dựng cây provider / layout lớn trong jsdom (`*.smoke.test.tsx`). Phần lớn thời gian là transform + import
     *              hàng trăm module, phụ thuộc số worker chứ không phụ thuộc code — dùng chung ngưỡng 5 giây thì đỏ ngẫu nhiên.
     *
     * `npm test` chạy cả hai; `npm run test:unit` cho vòng lặp nhanh lúc code.
     */
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/**/*.{test,spec}.{ts,tsx}'],
          exclude: [...configDefaults.exclude, SMOKE_TESTS],
        },
      },
      {
        extends: true,
        test: {
          name: 'smoke',
          include: [SMOKE_TESTS],
          testTimeout: 30_000,
          hookTimeout: 30_000,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html'],
      // Mọi tầng có LOGIC. Trang route (`src/app/[locale]`) mỏng và do build + smoke kiểm — tính vào chỉ làm loãng con số.
      include: [
        'src/{core,domains,shared}/**/*.{ts,tsx}',
        'src/features/auth/**/*.{ts,tsx}',
        'src/app/_*/**/*.{ts,tsx}',
      ],
      exclude: ['**/index.ts', '**/*.types.ts', '**/*.generated.ts', 'src/shared/ui/icons/**'],
      reportsDirectory: './coverage',
      /**
       * Ngưỡng CHỈ đặt cho hai tầng mà hỏng là hỏng mọi màn hình: HTTP / cấu hình và phiên đăng nhập. Tầng giao diện đo để biết,
       * không đặt ngưỡng — ép phần trăm lên UI kit chỉ sinh ra test render-cho-có.
       */
      thresholds: {
        'src/core/**': { lines: 85, functions: 85, branches: 75 },
        'src/domains/session/**': { lines: 85, functions: 85, branches: 75 },
      },
    },
  },
});
