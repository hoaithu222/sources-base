#!/usr/bin/env node
/**
 * Kiểm CẤU HÌNH ESLint: mỗi vùng của `src/` nhận ĐỦ luật, và mỗi luật bắt đúng thứ nó định bắt.
 *
 * Flat config GHI ĐÈ options khi nhiều block cùng khớp một rule: thêm một block mà quên mang lại danh sách
 * là luật tầng / public API âm thầm mất hiệu lực — `npm run lint` vẫn xanh. Script hỏi ESLint cấu hình THẬT
 * của file đại diện từng vùng (`calculateConfigForFile`) và lint thử từng dòng import / mẫu vi phạm.
 *
 * Chạy: npm run check:eslint-config (nằm trong `npm run check`). Thêm vùng / luật mới → thêm dòng vào bảng.
 */
import { ESLint } from 'eslint';

const GUARDS = [
  'guard/search-input',
  'guard/react-19',
  'guard/store-write',
  'guard/login-redirect',
  'guard/error-claim',
  'guard/storage',
  'guard/number-format',
  'guard/context-files',
  'guard/store-files',
];

const CLEAN_CODE = ['complexity', 'max-depth', 'max-params', 'max-lines-per-function'];

const EVERY_SRC_FILE = [
  'no-restricted-imports',
  'local/relative-in-module',
  'no-console',
  'no-restricted-globals',
  'local/comment-policy',
  'perfectionist/sort-imports',
  '@typescript-eslint/consistent-type-imports',
  '@typescript-eslint/naming-convention',
  '@typescript-eslint/no-floating-promises',
  ...GUARDS,
];

/** File đại diện → rule phải BẬT / phải TẮT. */
const RULE_MATRIX = [
  {
    file: 'src/features/auth/pages/LoginPage.tsx',
    on: [
      ...EVERY_SRC_FILE,
      'guard/spacing',
      'guard/ui-kit-elements',
      'no-nested-ternary',
      ...CLEAN_CODE,
    ],
  },
  {
    file: 'src/features/demo/library/pages/DemoPage.tsx',
    on: [...EVERY_SRC_FILE, 'guard/spacing', 'guard/ui-kit-elements', 'no-nested-ternary'],
    off: CLEAN_CODE,
  },
  {
    file: 'src/app/pages/HomePage.tsx',
    on: [...EVERY_SRC_FILE, 'guard/spacing', 'guard/ui-kit-elements', ...CLEAN_CODE],
  },
  { file: 'src/app/shell/AppDock.tsx', on: ['guard/ui-kit-elements'], off: ['guard/spacing'] },
  { file: 'src/app/router/guards/AuthGuard.tsx', off: ['guard/login-redirect'] },
  {
    file: 'src/core/http/index.ts',
    on: [...EVERY_SRC_FILE, 'guard/named-exports', 'guard/error-messages', ...CLEAN_CODE],
  },
  { file: 'src/core/http/errors/error-messages.constants.ts', off: ['guard/error-messages'] },
  {
    file: 'src/core/http/errors/claim-error-message.ts',
    on: ['guard/error-messages'],
    off: ['guard/error-claim'],
  },
  {
    file: 'src/domains/session/index.ts',
    on: ['guard/named-exports', 'guard/ui-kit-elements', ...CLEAN_CODE],
    off: ['guard/store-write'],
  },
  {
    file: 'src/shared/ui/inputs/Input.tsx',
    on: [...EVERY_SRC_FILE, 'guard/ui-kit-barrel'],
    off: ['guard/ui-kit-elements', 'guard/spacing', ...CLEAN_CODE],
  },
  { file: 'src/shared/ui/inputs/index.ts', off: ['guard/ui-kit-barrel'] },
  { file: 'src/shared/ui/inputs/field.theme.ts', on: ['guard/theme-tables'] },
  {
    file: 'src/shared/widgets/dock/Dock.tsx',
    on: EVERY_SRC_FILE,
    off: ['guard/ui-kit-elements', 'guard/spacing'],
  },
  {
    file: 'src/shared/widgets/dock/dock-settings.store.ts',
    off: ['guard/store-write', 'guard/store-files'],
  },
  {
    file: 'src/shared/utils/browser/storage.utils.ts',
    off: ['guard/storage', 'guard/store-files'],
  },
  { file: 'src/shared/ui/form/form.context.ts', off: ['guard/context-files'] },
  { file: 'src/shared/utils/format/format.utils.ts', off: ['guard/number-format'] },
  {
    file: 'src/shared/hooks/browser/useMediaQuery.ts',
    on: ['no-restricted-exports'],
    off: ['react-hooks/set-state-in-effect'],
  },
  {
    file: 'src/shared/hooks/dom/useClickOutside.ts',
    on: ['no-restricted-exports', 'react-hooks/set-state-in-effect'],
  },
  { file: 'src/shared/ui/icons/index.ts', off: ['local/comment-policy', 'guard/barrel-only'] },
  { file: 'src/shared/ui/index.ts', on: ['guard/barrel-only'], off: ['guard/ui-kit-barrel'] },
  { file: 'scripts/check-bundle.mjs', on: ['no-undef', 'no-unused-vars'] },
  {
    file: 'tests/setup.ts',
    on: ['@typescript-eslint/no-floating-promises'],
    off: ['local/comment-policy', 'react-refresh/only-export-components'],
  },
];

/**
 * File đại diện → import phải BỊ CHẶN / phải ĐƯỢC PHÉP. Chuỗi trần = `import '<đường>'`;
 * chuỗi bắt đầu bằng `import ` được lint nguyên văn (để thử `import type`).
 */
const IMPORT_MATRIX = [
  {
    file: 'src/core/http/api-client.ts',
    blocked: [
      '@/shared/ui',
      '@/domains/session',
      '@/features/auth',
      '../../shared/utils/x',
      'tailwind-variants',
    ],
    allowed: ['@/core/config', '@/core/http/errors/app-error', 'axios'],
  },
  {
    file: 'src/shared/hooks/browser/useMediaQuery.ts',
    blocked: [
      '@/shared/ui',
      '@/shared/widgets/header',
      '@/core/http/api-client',
      '@/domains/session',
    ],
    allowed: [
      "import type { ProgressVariant } from '@/shared/ui';",
      '@/core/http',
      '@/shared/utils/style/cn',
    ],
  },
  {
    file: 'src/shared/ui/inputs/Input.tsx',
    blocked: [
      '../actions/Button',
      '@/shared/widgets/header',
      '@/core/http/api-client',
      'tailwind-variants',
    ],
    allowed: ['./field.theme', '@/shared/ui/actions/Button', '@/core/http'],
  },
  {
    file: 'src/shared/ui/form/fields/text/TextField.tsx',
    blocked: ['../../../inputs/field.theme', '../../../layout/Stack'],
    allowed: ['../../FormItem', '../../layout/FormRow', '@/shared/ui/inputs/field.theme'],
  },
  {
    file: 'src/shared/widgets/command-palette/CommandPalette.tsx',
    blocked: [
      '@/shared/widgets/dock',
      '@/shared/widgets',
      '../dock/Dock',
      '@/shared/ui/actions/Button',
      '@/domains/session',
    ],
    allowed: [
      '@/shared/ui',
      '@/shared/ui/icons/Icons',
      '@/shared/ui/overlays/modal.theme',
      '@/shared/ui/overlays/popup-surface.theme',
      './parts/palette-row',
    ],
  },
  {
    file: 'src/shared/widgets/header/Header.tsx',
    blocked: ['@/shared/ui/overlays/dialog/Modal', '@/shared/widgets/command-palette'],
    allowed: ['./page-header/PageHeader', '@/shared/widgets/header/Logo'],
  },
  {
    file: 'src/domains/session/model/session.store.ts',
    blocked: [
      '@/features/auth',
      '@/app/components',
      '@/domains/preferences/theme/theme.store',
      '@/shared/ui/actions/Button',
      '@/shared/widgets',
      '@/core/http/api-client',
    ],
    allowed: ['@/domains/preferences', '@/shared/ui', '@/shared/widgets/header', '@/core/http'],
  },
  {
    file: 'src/features/auth/pages/LoginPage.tsx',
    blocked: [
      '@/features/demo',
      '@/app/components',
      '@/domains/session/model/session.store',
      '@/shared/ui/actions/Button',
      '@/shared/widgets/header/Header',
      '@/core/config/env.schema',
      '../../../core/http/api-client',
      '../../demo',
      'tailwind-variants',
    ],
    allowed: [
      '@/domains/session',
      '@/shared/ui',
      '@/shared/ui/media/image-annotator',
      '@/shared/widgets/header',
      '../components/AuthPageFrame',
    ],
  },
  {
    file: 'src/features/demo/library/pages/DemoPage.tsx',
    blocked: [
      '../../dashboard/dashboard.theme',
      '@/features/demo/composed/pages/ComposedDemoPage',
      '@/features/auth',
      '@/shared/ui/actions/Button',
    ],
    allowed: [
      '../../shared/constants/screens.constants',
      '../sections.constants',
      '@/shared/ui/icons',
    ],
  },
  {
    file: 'src/features/demo/shared/charts/SCurveChart.tsx',
    blocked: ['../../library/sections.constants', '@/features/demo/dashboard/dashboard.theme'],
    allowed: ['./chart-data.utils'],
  },
  {
    file: 'src/app/shell/AppDock.tsx',
    blocked: [
      '@/app/router',
      '../router',
      '@/app/router/menu/build-menu.utils',
      '@/app/components/ErrorScreen',
      '@/features/auth/pages/LoginPage',
      '@/domains/session/model/session.store',
      '@/shared/ui/actions/Button',
      '@/core/http/api-client',
      'tailwind-variants',
    ],
    allowed: [
      '@/app/router/menu',
      '@/app/components',
      '@/features/auth',
      '@/domains/session',
      '@/shared/ui',
    ],
  },
  {
    file: 'src/app/router/setup/build-routes.tsx',
    blocked: ['@/app/router', '@/app/components/LoadingScreen', '@/shared/ui/actions/Button'],
    allowed: ['@/app/router/definition/route-tree.utils', '../definition'],
  },
  { file: 'src/app/App.tsx', blocked: ['@/app/router/setup/AppRouter'], allowed: ['./router'] },
  {
    file: 'src/main.tsx',
    blocked: ['@/features/auth/pages/LoginPage', 'tailwind-variants'],
    allowed: ['@/app/App'],
  },
];

/** Mẫu vi phạm → gác phải bắt (đặt vào file đại diện của vùng gác). */
const GUARD_SAMPLES = [
  [
    'guard/search-input',
    'src/features/auth/pages/LoginPage.tsx',
    'const a = x.toLowerCase().includes(q);',
  ],
  ['guard/spacing', 'src/features/auth/pages/LoginPage.tsx', "const a = 'p-[13px]';"],
  ['guard/react-19', 'src/features/auth/pages/LoginPage.tsx', 'export default memo(Foo);'],
  ['guard/react-19', 'src/features/auth/pages/LoginPage.tsx', 'const Foo = memo(() => null);'],
  [
    'guard/react-19',
    'src/features/auth/pages/LoginPage.tsx',
    'const Foo = memo(function () { return null; });',
  ],
  [
    'guard/react-19',
    'src/features/auth/pages/LoginPage.tsx',
    "import { forwardRef } from 'react';",
  ],
  ['guard/react-19', 'src/features/auth/pages/LoginPage.tsx', 'const Foo: React.FC = () => null;'],
  [
    'guard/react-19',
    'src/features/auth/pages/LoginPage.tsx',
    'type R = React.ElementRef<typeof X>;',
  ],
  ['guard/ui-kit-elements', 'src/app/pages/HomePage.tsx', 'const a = <button type="button" />;'],
  ['guard/store-write', 'src/app/shell/AppDock.tsx', 'useSessionStore.setState({});'],
  ['guard/login-redirect', 'src/app/shell/AppDock.tsx', 'void navigate(PATHS.LOGIN);'],
  ['guard/named-exports', 'src/core/http/index.ts', "export * from './api-client';"],
  ['guard/barrel-only', 'src/core/http/index.ts', 'export const x = 1;'],
  ['guard/context-files', 'src/shared/ui/inputs/Input.tsx', 'const C = createContext(null);'],
  ['guard/store-files', 'src/app/shell/AppDock.tsx', "import { create } from 'zustand';"],
  ['guard/error-messages', 'src/core/http/read-data.ts', "throw new AppError('contract', 'Sai');"],
  ['guard/error-claim', 'src/shared/ui/inputs/Input.tsx', 'error.notified = true;'],
  ['guard/storage', 'src/shared/widgets/dock/Dock.tsx', "window.localStorage.getItem('k');"],
  ['guard/number-format', 'src/shared/charts/useChartMetrics.ts', 'const s = n.toLocaleString();'],
  [
    'guard/ui-kit-barrel',
    'src/shared/ui/inputs/Input.tsx',
    "export { cn } from '@/shared/utils/style/cn';",
  ],
  [
    'guard/theme-tables',
    'src/shared/ui/inputs/field.theme.ts',
    'export function inputStyles() { return 1; }',
  ],
];

const NO_TYPES = { languageOptions: { parserOptions: { projectService: false } } };

const configEngine = new ESLint();
const importEngine = new ESLint({
  overrideConfig: NO_TYPES,
  ruleFilter: ({ ruleId }) =>
    ruleId === 'no-restricted-imports' || ruleId === 'local/relative-in-module',
});
const guardEngine = new ESLint({
  overrideConfig: NO_TYPES,
  ruleFilter: ({ ruleId }) => ruleId.startsWith('guard/'),
});

const problems = [];

for (const { file, on = [], off = [] } of RULE_MATRIX) {
  const { rules = {} } = await configEngine.calculateConfigForFile(file);
  const severity = (rule) => {
    const value = Array.isArray(rules[rule]) ? rules[rule][0] : rules[rule];
    return value === 'error' ? 2 : value === 'warn' ? 1 : (value ?? 0);
  };
  for (const rule of on) if (!severity(rule)) problems.push(`${file}: thiếu rule ${rule}`);
  for (const rule of off) if (severity(rule)) problems.push(`${file}: rule ${rule} lẽ ra phải tắt`);
}

const toStatement = (entry) => (entry.startsWith('import ') ? entry : `import '${entry}';`);

for (const { file, blocked = [], allowed = [] } of IMPORT_MATRIX) {
  const entries = [...blocked, ...allowed];
  const [result] = await importEngine.lintText(entries.map(toStatement).join('\n'), {
    filePath: file,
  });
  const hitLines = new Set(result.messages.map((message) => message.line));
  for (const fatal of result.messages.filter((message) => !message.ruleId)) {
    problems.push(`${file}: ${fatal.message}`);
  }
  entries.forEach((entry, index) => {
    const hit = hitLines.has(index + 1);
    if (index < blocked.length && !hit)
      problems.push(`${file}: import ${entry} lẽ ra phải bị chặn`);
    if (index >= blocked.length && hit) problems.push(`${file}: import ${entry} lẽ ra được phép`);
  });
}

for (const [rule, file, code] of GUARD_SAMPLES) {
  const [result] = await guardEngine.lintText(code, { filePath: file });
  if (!result.messages.some((message) => message.ruleId === rule)) {
    const got = result.messages.map((message) => message.ruleId ?? message.message).join(', ');
    problems.push(`${file}: ${rule} không bắt mẫu \`${code}\`${got ? ` (nhận: ${got})` : ''}`);
  }
}

if (problems.length > 0) {
  console.error(`✖ Cấu hình ESLint lệch kỳ vọng (${problems.length}):\n  ${problems.join('\n  ')}`);
  console.error(
    '\nXem bảng vùng ở scripts/eslint/architecture.mjs và scripts/eslint/syntax-guards.mjs.',
  );
  process.exit(1);
}

const checks = RULE_MATRIX.length + IMPORT_MATRIX.length + GUARD_SAMPLES.length;
console.log(`✓ Cấu hình ESLint: ${checks} file / mẫu đại diện đều nhận đủ luật.`);
