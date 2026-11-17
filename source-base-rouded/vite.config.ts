import { configDefaults, defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

import {
  EnvValidationError,
  findProductionIssues,
  parseAppEnv,
} from './src/core/config/env.schema.ts';

const DEFAULT_PROXY_TARGET = 'http://localhost:5000';

/** Test dựng cả cây app — xem `test.projects` bên dưới. */
const SMOKE_TESTS = 'tests/**/*.smoke.test.{ts,tsx}';

/** Đích proxy của dev server — biến CHỈ DÀNH CHO NODE, không có tiền tố `VITE_`. */
function resolveProxyTarget(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return DEFAULT_PROXY_TARGET;
  if (!/^https?:\/\/[^\s/]+/.test(value)) {
    throw new EnvValidationError([
      `API_PROXY_TARGET: phải là URL http(s) đầy đủ, vd ${DEFAULT_PROXY_TARGET} (đang là ${JSON.stringify(raw)})`,
    ]);
  }
  return value;
}

export default defineConfig(({ command, mode }) => {
  /**
   * Nạp .env thủ công.
   *
   * Vite chỉ tự đưa biến `VITE_*` vào `import.meta.env` của CLIENT. File config
   * này chạy ở Node, `process.env` chỉ thấy biến của shell — nên biến khai
   * trong `.env` mà đọc bằng `process.env` thì luôn ra undefined và proxy âm
   * thầm trỏ vào cổng mặc định.
   */
  const env = loadEnv(mode, process.cwd(), '');

  /**
   * Kiểm env NGAY TẠI ĐÂY — cùng schema với phía trình duyệt — để `.env` viết
   * sai là đỏ ở terminal lúc `npm run dev` / `npm run build`, không đợi tới
   * màn trắng trong trình duyệt.
   */
  const appEnv = parseAppEnv(env);
  const proxyTarget = resolveProxyTarget(env.API_PROXY_TARGET);

  if (command === 'build' && mode === 'production') {
    const issues = findProductionIssues(appEnv);
    if (issues.length > 0) {
      throw new EnvValidationError([
        ...issues,
        'Nếu đây là bản TRƯNG BÀY giao diện (không backend), đặt VITE_APP_MODE=demo.',
      ]);
    }
    if (appEnv.isDemo) {
      console.warn(
        `\n⚠️  Đang build ở chế độ DEMO (VITE_APP_MODE=demo): kiểm đăng nhập ${
          appEnv.authEnabled ? 'BẬT' : 'TẮT'
        }, có phân hệ "Thư viện UI". Sản phẩm thật phải build với VITE_APP_MODE=app.\n`,
      );
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
        '@tests': path.resolve(import.meta.dirname, './tests'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      // Test cố định chế độ demo: kết quả không phụ thuộc `.env` / `.env.local` của từng máy (checkout sạch của CI không có `.env`).
      env: { VITE_APP_MODE: 'demo' },
      // Tắt xử lý CSS để test chạy nhanh — NGOẠI TRỪ `*.css?raw`: vitest coi MỌI id
      // kết thúc bằng `.css` (kể cả có `?raw`) là CSS và thay bằng chuỗi rỗng, nên
      // `tests/policy/styling/css-structure.test.ts` đọc về "" và mọi phép kiểm đều pass giả.
      css: { include: [/\.css\?raw$/] },
      /**
       * Hai nhóm test, hai ngân sách thời gian.
       *
       *  - `unit`  — nhanh, cô lập. Giữ timeout mặc định 5 giây: bài kiểm đơn
       *              vị chạm ngưỡng đó là có vấn đề thật.
       *  - `smoke` — dựng CẢ cây app trong jsdom (`*.smoke.test.tsx`). Phần lớn
       *              thời gian là transform + import hàng trăm module, phụ
       *              thuộc số worker đang chạy song song chứ không phụ thuộc
       *              code. Dùng chung ngưỡng 5 giây thì chúng đỏ ngẫu nhiên khi
       *              máy bận — đỏ mà không có lỗi nào để sửa.
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
        // Mọi tầng có LOGIC. `features/demo` là trang trưng bày, đã có smoke
        // test riêng — tính vào chỉ làm loãng con số.
        include: ['src/{app,core,domains,shared}/**/*.{ts,tsx}', 'src/features/auth/**/*.{ts,tsx}'],
        exclude: [
          '**/index.ts',
          '**/*.types.ts',
          '**/*.generated.ts',
          'src/shared/ui/icons/**',
          'src/vite-env.d.ts',
        ],
        reportsDirectory: './coverage',
        /**
         * Ngưỡng CHỈ đặt cho hai tầng mà hỏng là hỏng mọi màn hình: HTTP và
         * phiên đăng nhập. Tầng giao diện đo để biết, không đặt ngưỡng — ép
         * phần trăm lên UI kit chỉ sinh ra test render-cho-có.
         */
        thresholds: {
          'src/core/**': { lines: 85, functions: 85, branches: 75 },
          'src/domains/session/**': { lines: 85, functions: 85, branches: 75 },
        },
      },
    },
    server: {
      host: true,
      open: true,
      proxy: {
        // Đường API duy nhất. Dev trỏ same-origin `/api/*` để cookie HttpOnly
        // refresh-token không bị coi là third-party (Safari chặn hẳn loại này).
        // Khoá này phải khớp `DEFAULT_API_BASE_URL` ở `env.schema.ts`.
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: { host: true },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rolldownOptions: {
        output: {
          /**
           * Chỉ gom THƯ VIỆN NGOÀI, theo vòng đời thay đổi và theo THỜI ĐIỂM cần tải.
           *
           * Code trong `src/` cố ý KHÔNG gom tay: `sideEffects` trong
           * package.json đã bật rung cây, nên Rolldown tự tách UI kit thành các
           * chunk nhỏ theo component và mỗi trang chỉ tải phần nó dùng.
           *
           * ⛔ ĐỪNG quay lại `manualChunks(id)`. Ở Rolldown, module rơi vào
           * một nhóm sẽ kéo theo CẢ phụ thuộc của nó, và nhóm nào gặp trước thì
           * giành trước. Bản cũ vì thế đặt chính module `react` vào chunk
           * `charts` (recharts import react) — mọi chunk đều phải import
           * `charts`, nên 400 kB thư viện biểu đồ bị preload ở MỌI lần mở app
           * dù trang đầu không vẽ biểu đồ nào.
           *
           * `priority` giải quyết đúng chuyện đó: nhóm ưu tiên cao lấy module
           * trước, nhóm thấp chỉ nhận phần còn lại.
           *
           *   40  vendor       React + router — gần như không đổi, cache lâu nhất
           *   30  radix/query/zod/form — thư viện nền, đổi theo đợt nâng cấp
           *   20  deps         MỌI gói còn lại mà trang đầu cần (`$initial`)
           *   10  charts/tree/dnd — nặng, CHỈ tải khi trang dùng tới
           *
           * Nhóm `deps` đứng TRÊN nhóm nặng là mấu chốt: `clsx`, `zustand`…
           * vừa được trang đầu dùng vừa là phụ thuộc của recharts; để nhóm
           * `charts` lấy trước thì trang đầu lại phải tải `charts`.
           *
           * `scripts/check-bundle.mjs` chặn hồi quy: build mà preload lại
           * chunk nặng, hoặc vượt ngân sách tải ban đầu, là đỏ.
           */
          codeSplitting: {
            groups: [
              {
                name: 'vendor',
                test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
                priority: 40,
              },
              {
                name: 'radix',
                test: /node_modules[\\/](@radix-ui|@floating-ui)[\\/]/,
                priority: 30,
              },
              { name: 'query', test: /node_modules[\\/]@tanstack[\\/]/, priority: 30 },
              { name: 'zod', test: /node_modules[\\/]zod[\\/]/, priority: 30 },
              {
                name: 'form',
                test: /node_modules[\\/](react-hook-form|@hookform)[\\/]/,
                priority: 30,
              },
              { name: 'deps', test: /node_modules[\\/]/, tags: ['$initial'], priority: 20 },
              {
                name: 'charts',
                test: /node_modules[\\/](recharts|victory-vendor|d3-[^\\/]+)[\\/]/,
                priority: 10,
              },
              { name: 'tree', test: /node_modules[\\/]react-arborist[\\/]/, priority: 10 },
              { name: 'dnd', test: /node_modules[\\/]@dnd-kit[\\/]/, priority: 10 },
            ],
          },
        },
      },
      chunkSizeWarningLimit: 500,
    },
  };
});
