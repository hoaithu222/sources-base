import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import perfectionist from 'eslint-plugin-perfectionist';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { importBoundaries, moduleBoundary } from './scripts/eslint/architecture.mjs';
import { GENERATED_SOURCES, SRC } from './scripts/eslint/files.mjs';
import commentPolicy from './scripts/eslint/rules/comment-policy.mjs';
import relativeInModule from './scripts/eslint/rules/relative-in-module.mjs';
import restrictedDynamicImports from './scripts/eslint/rules/restricted-dynamic-imports.mjs';
import { guardPlugin, syntaxGuards } from './scripts/eslint/syntax-guards.mjs';

/**
 * ESLint — file này CHỈ ghép block, mỗi block một dòng nói nó giữ luật nào. Bảng luật dài ở `scripts/eslint/`:
 *
 *   architecture.mjs    tầng + public API (`no-restricted-imports`), import tương đối chỉ trong module
 *   syntax-guards.mjs   gác cú pháp `guard/*` (ô tìm kiếm, khoảng cách, React 19, store, storage, chữ hiển thị cứng…)
 *   rules/              rule tự viết (`local/comment-policy`, `local/relative-in-module`, `local/restricted-dynamic-imports`)
 *   files.mjs           nhóm file dùng chung (`SRC`, file sinh tự động)
 *
 * Bản đồ luật → cổng: docs/rules/foundations/quality-gates.md. `npm run check:eslint-config` khẳng định
 * mỗi vùng của `src/` nhận đủ luật (flat config GHI ĐÈ options khi nhiều block cùng khớp một rule).
 */

const TS_FILES = ['**/*.{ts,tsx}'];

const TEST_GLOBALS = [
  'describe',
  'it',
  'test',
  'expect',
  'vi',
  'beforeEach',
  'afterEach',
  'beforeAll',
  'afterAll',
].map((name) => ({ name, message: 'API test chỉ dùng trong tests/.' }));

export default defineConfig([
  // Không lint: đầu ra build / coverage và mã sinh tự động.
  globalIgnores([
    '.next',
    '.next-e2e',
    'playwright-report',
    'test-results',
    'coverage',
    'public',
    'next-env.d.ts',
    'src/**/*.generated.ts',
    'src/assets/icons/index.tsx',
    'src/assets/icons/standalone.tsx',
  ]),

  // Plugin dùng chung: `local/*` rule tự viết, `guard/*` gác cú pháp, perfectionist (thứ tự).
  {
    plugins: {
      local: {
        rules: {
          'comment-policy': commentPolicy,
          'relative-in-module': relativeInModule,
          'restricted-dynamic-imports': restrictedDynamicImports,
        },
      },
      guard: guardPlugin,
      perfectionist,
    },
  },

  // Luật riêng của Next (`@next/next/*`: ảnh, font, script, link…), a11y (`jsx-a11y`), React, import — gói chính thức.
  ...nextVitals,

  // Nền cho mọi .ts / .tsx: js + typescript-eslint + react-hooks (gồm luật React Compiler).
  {
    files: TS_FILES,
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: { ecmaVersion: 'latest', globals: { ...globals.browser, ...globals.node } },
  },

  // Fast Refresh: file `.tsx` chỉ export component (trừ các export đặc biệt của route Next: metadata, generateStaticParams…).
  {
    files: SRC,
    extends: [reactRefresh.configs.next],
  },
  // Route ảnh Open Graph export thêm `size` / `contentType` / `alt` (cấu hình của file convention).
  {
    files: ['src/app/**/opengraph-image.tsx'],
    rules: {
      'react-refresh/only-export-components': [
        'error',
        { allowExportNames: ['size', 'contentType', 'alt', 'generateStaticParams'] },
      ],
    },
  },

  // Thứ tự props JSX: a → z, `key` / `ref` đầu, `onXxx` cuối (auto-fix) — docs/rules/foundations/code-style.md.
  {
    files: TS_FILES,
    rules: {
      'perfectionist/sort-jsx-props': [
        'warn',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          groups: ['top', 'unknown', 'callback'],
          customGroups: [
            { groupName: 'top', elementNamePattern: '^(key|ref)$' },
            { groupName: 'callback', elementNamePattern: '^on[A-Z]' },
          ],
        },
      ],
    },
  },

  // Rule tự viết của ESLint export default một object literal — `import/no-anonymous-default-export` (config-next) chỉ có nghĩa với code app.
  { files: ['scripts/**/*.mjs'], rules: { 'import/no-anonymous-default-export': 'off' } },

  // UI kit hiển thị ảnh do NGƯỜI DÙNG đưa (blob URL, data URL, ảnh nền khác miền, lightbox / annotator cần phần tử `<img>` thật) — `next/image`
  // cần loader + kích thước biết trước nên không dùng được. Trang SEO dùng `next/image` hoặc `Image` của UI kit có `width` / `height`.
  { files: ['src/shared/ui/**/*.tsx'], rules: { '@next/next/no-img-element': 'off' } },

  // Script Node + file cấu hình gốc (.js / .mjs): js.recommended với biến toàn cục của Node.
  {
    files: ['scripts/**/*.mjs', '*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: { ecmaVersion: 'latest', globals: globals.node },
  },

  // Promise (cần thông tin KIỂU nên chỉ `src/` + `tests/` + bộ e2e): không bỏ rơi promise — cố ý thì `void`;
  // không đặt hàm async vào chỗ chờ hàm đồng bộ (miễn thuộc tính JSX) — docs/rules/data/api-patterns.md.
  // Với Playwright, thiếu `await` là lỗi phổ biến nhất của e2e (test xanh giả) nên bộ e2e BẮT BUỘC có luật này — docs/rules/foundations/testing.md §8.
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}', 'e2e/**/*.ts', 'playwright.config.ts'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },

  // Tầng app → features → domains → shared → core + public API từng tầng — bảng: scripts/eslint/architecture.mjs.
  ...importBoundaries,

  // Import tương đối chỉ trong module (nhóm UI kit, widget, feature, thư mục `_xxx` của app…), ra ngoài dùng `@/…`.
  moduleBoundary,

  // Gác cú pháp `guard/*`, mỗi gác một quy ước có docs riêng — bảng: scripts/eslint/syntax-guards.mjs.
  ...syntaxGuards,

  // Không sót `console.log` / `debug` (lộ token, dữ liệu cá nhân) — docs/rules/data/security-checklist.md.
  { files: SRC, rules: { 'no-console': ['error', { allow: ['warn', 'error'] }] } },

  // API test (vitest globals) không lọt vào code app — tsconfig nạp type của vitest cho cả `tests/` nên tsc không chặn.
  { files: SRC, rules: { 'no-restricted-globals': ['error', ...TEST_GLOBALS] } },

  // `import type` cho thứ chỉ dùng làm kiểu (auto-fix) — docs/rules/foundations/code-style.md (TypeScript).
  {
    files: SRC,
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },

  // Thứ tự NHÓM import: thư viện ngoài → `@/…` → tương đối (auto-fix) — docs/rules/foundations/code-style.md.
  {
    files: SRC,
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'unsorted',
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index'], 'unknown'],
          internalPattern: ['^@/'],
          newlinesBetween: 'ignore',
          newlinesInside: 'ignore',
        },
      ],
    },
  },

  // Đặt tên: biến camelCase / UPPER_CASE / PascalCase, kiểu PascalCase — docs/rules/foundations/code-style.md.
  {
    files: SRC,
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'typeLike', format: ['PascalCase'] },
      ],
    },
  },

  // Không lồng ternary — tách biến / hàm có tên — docs/rules/foundations/clean-code-standards.md.
  {
    files: ['src/{app,core,domains,features}/**/*.{ts,tsx}'],
    rules: { 'no-nested-ternary': 'error' },
  },

  // Độ phức tạp của code LOGIC (app, core, domains, auth) — docs/rules/foundations/clean-code-standards.md.
  {
    files: ['src/{app,core,domains}/**/*.{ts,tsx}', 'src/features/auth/**/*.{ts,tsx}'],
    rules: {
      complexity: ['error', 15],
      'max-depth': ['error', 4],
      'max-params': ['error', 4],
      'max-lines-per-function': ['error', { max: 120, skipBlankLines: true, skipComments: true }],
    },
  },

  // Hook dùng chung export ĐẶT TÊN, không default — docs/rules/foundations/code-style.md.
  {
    files: ['src/shared/hooks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-exports': [
        'error',
        {
          restrictDefaultExports: {
            direct: true,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],
    },
  },

  // UI kit re-export component Radix bằng phép gán (`export const RadioGroup = RadioGroupPrimitive.Root`):
  // react-refresh phân tích tĩnh nên báo nhầm — khai đích danh hai tên, không tắt rule cả thư mục.
  {
    files: ['src/shared/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': [
        'error',
        { allowExportNames: ['RadioGroup', 'ToastProvider'] },
      ],
    },
  },

  // setState trong effect: chỉ hai hook đồng bộ giá trị từ bên ngoài React (media query, đếm số chạy).
  {
    files: ['src/shared/hooks/browser/useMediaQuery.ts', 'src/shared/hooks/timing/useCountUp.ts'],
    rules: { 'react-hooks/set-state-in-effect': 'off' },
  },

  // Chỉ comment hướng dẫn sử dụng (trừ file sinh tự động) — docs/rules/foundations/comment-policy.md.
  { files: SRC, ignores: GENERATED_SOURCES, rules: { 'local/comment-policy': 'error' } },
]);
