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
  'guard/i18n-text',
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
    file: 'src/features/auth/views/LoginView.tsx',
    on: [
      ...EVERY_SRC_FILE,
      'guard/spacing',
      'guard/ui-kit-elements',
      'no-nested-ternary',
      ...CLEAN_CODE,
    ],
  },
  {
    file: 'src/app/_views/DashboardView.tsx',
    on: [...EVERY_SRC_FILE, 'guard/spacing', 'guard/ui-kit-elements', ...CLEAN_CODE],
  },
  {
    // Trang marketing cần khoảng cách lớn hơn thang của trang làm việc.
    file: 'src/app/_views/marketing/LandingView.tsx',
    on: [...EVERY_SRC_FILE, 'guard/ui-kit-elements'],
    off: ['guard/spacing'],
  },
  { file: 'src/app/_shell/AppDock.tsx', on: ['guard/ui-kit-elements'], off: ['guard/spacing'] },
  { file: 'src/app/_guards/AuthGate.tsx', off: ['guard/login-redirect'] },
  {
    file: 'src/app/[locale]/(public)/page.tsx',
    on: [...EVERY_SRC_FILE, 'react-refresh/only-export-components'],
  },
  {
    file: 'src/app/[locale]/opengraph-image.tsx',
    on: ['react-refresh/only-export-components'],
  },
  { file: 'src/proxy.ts', on: ['no-restricted-imports', 'local/comment-policy'] },
  {
    file: 'src/core/http/index.ts',
    on: [...EVERY_SRC_FILE, 'guard/named-exports', 'guard/error-messages', ...CLEAN_CODE],
  },
  { file: 'src/core/http/errors/error-messages.ts', off: ['guard/error-messages'] },
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
  { file: 'src/messages/vi/index.ts', off: ['guard/barrel-only'] },
  { file: 'scripts/check-i18n.mjs', on: ['no-undef', 'no-unused-vars'] },
  {
    file: 'tests/setup.ts',
    on: ['@typescript-eslint/no-floating-promises'],
    off: ['local/comment-policy', 'react-refresh/only-export-components'],
  },
  {
    // Bộ e2e (Playwright) là code test riêng: thiếu `await` là lỗi phổ biến nhất (test xanh giả) nên luật Promise BẮT BUỘC;
    // luật riêng của `src/` (comment, chữ Việt cứng, `console`) không áp.
    file: 'e2e/auth-session.e2e.ts',
    on: ['@typescript-eslint/no-floating-promises', '@typescript-eslint/no-misused-promises'],
    off: ['local/comment-policy', 'guard/i18n-text', 'no-console', 'no-restricted-imports'],
  },
  {
    file: 'playwright.config.ts',
    on: ['@typescript-eslint/no-floating-promises'],
    off: ['local/comment-policy', 'no-restricted-imports'],
  },
];

/**
 * File đại diện → import phải BỊ CHẶN / phải ĐƯỢC PHÉP. Chuỗi trần = `import '<đường>'`;
 * chuỗi bắt đầu bằng `import ` được lint nguyên văn (để thử `import type` / tên import).
 */
const IMPORT_MATRIX = [
  {
    file: 'src/core/http/api-client.ts',
    blocked: [
      '@/shared/ui',
      '@/shared/ui/form',
      '@/shared/ui/actions',
      '@/domains/session',
      '@/features/auth',
      '@/app/_navigation',
      '../../shared/utils/x',
      'tailwind-variants',
    ],
    allowed: ['@/core/config', '@/core/http/errors/app-error', 'axios'],
  },
  {
    // Điều hướng đi qua `@/core/i18n`: `next/link` và hook điều hướng của `next/navigation` bị chặn ở MỌI nơi.
    file: 'src/app/_shell/AppDock.tsx',
    blocked: [
      'next/link',
      "import { useRouter } from 'next/navigation';",
      "import { usePathname } from 'next/navigation';",
      "import { redirect } from 'next/navigation';",
      '@/app/_navigation/useAppMenu',
      '@/app/_components/ErrorScreen',
      '@/features/auth/views/LoginView',
      '@/domains/session/model/session.store',
      '@/shared/ui/actions/Button',
      '@/core/http/api-client',
      '@/core/seo/metadata',
      'tailwind-variants',
    ],
    allowed: [
      "import { useSearchParams } from 'next/navigation';",
      "import { notFound } from 'next/navigation';",
      '@/app/_navigation',
      '@/app/_components',
      '@/features/auth',
      '@/domains/session',
      '@/shared/ui',
      '@/core/i18n',
      '@/core/i18n/locales',
    ],
  },
  {
    file: 'src/shared/hooks/browser/useMediaQuery.ts',
    blocked: [
      '@/shared/ui',
      '@/shared/widgets/header',
      '@/core/http/api-client',
      '@/core/i18n/navigation',
      '@/domains/session',
    ],
    allowed: [
      "import type { ProgressVariant } from '@/shared/ui';",
      '@/core/http',
      '@/core/i18n',
      '@/core/i18n/locales',
      '@/shared/utils/style/cn',
    ],
  },
  {
    file: 'src/shared/ui/inputs/Input.tsx',
    blocked: [
      '../actions/Button',
      '@/shared/widgets/header',
      '@/core/http/api-client',
      '@/core/i18n/request',
      'tailwind-variants',
    ],
    allowed: ['./field.theme', '@/shared/ui/actions/Button', '@/core/http', '@/core/i18n'],
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
      '@/app/_components',
      '@/domains/preferences/theme/theme.store',
      '@/shared/ui/actions/Button',
      '@/shared/widgets',
      '@/core/http/api-client',
    ],
    allowed: ['@/domains/preferences', '@/shared/ui', '@/shared/widgets/header', '@/core/http'],
  },
  {
    file: 'src/features/auth/views/LoginView.tsx',
    blocked: [
      '@/app/_components',
      '@/domains/session/model/session.store',
      '@/shared/ui/actions/Button',
      '@/shared/widgets/header/Header',
      '@/core/config/app-config',
      '../../../core/http/api-client',
      'tailwind-variants',
    ],
    allowed: [
      '@/domains/session',
      '@/shared/ui',
      '@/shared/ui/media/image-annotator',
      '@/shared/widgets/header',
      '@/core/i18n',
      '../components/AuthPageFrame',
    ],
  },
  {
    // `src/app` gồm route + thư mục lắp ráp `_xxx`: barrel cho thư mục có index, deep cho `_views` / `_layouts` / `_seo`.
    file: 'src/app/[locale]/(public)/page.tsx',
    blocked: [
      '@/app/_navigation/useAppMenu',
      '@/app/_providers/bootstrap',
      '@/core/seo/metadata',
      '@/core/i18n/navigation',
      '@/domains/session/model/session.store',
      '@/shared/ui/actions/Button',
    ],
    allowed: [
      '@/app/_views/marketing/LandingView',
      '@/app/_seo/page-metadata',
      '@/app/_layouts',
      '@/core/seo',
      '@/core/i18n',
      '@/core/i18n/server',
      '@/domains/preferences/appearance-script',
    ],
  },
  {
    file: 'src/app/robots.ts',
    blocked: ['@/app/_navigation/useAppMenu', '@/app/_navigation/build-menu.utils'],
    allowed: ['@/app/_navigation/public-routes', '@/app/_navigation', '@/core/seo'],
  },
  {
    file: 'src/proxy.ts',
    blocked: [
      '@/core/config/app-config',
      '@/core/i18n/navigation',
      '@/domains/session',
      'next/link',
    ],
    allowed: [
      '@/core/config/env.schema',
      '@/core/i18n/locales',
      '@/core/i18n/routing',
      '@/shared/constants/paths.constants',
    ],
  },
  {
    // `app` / `core` không import ngược tầng trên.
    file: 'src/core/i18n/server.ts',
    blocked: ['@/app/_components', '@/shared/ui', '@/features/auth', '@/domains/session'],
    allowed: ['./locales', './messages', 'next-intl/server'],
  },
];

/** Mẫu vi phạm → gác phải bắt (đặt vào file đại diện của vùng gác). */
const GUARD_SAMPLES = [
  [
    'guard/search-input',
    'src/features/auth/views/LoginView.tsx',
    'const a = x.toLowerCase().includes(q);',
  ],
  ['guard/spacing', 'src/features/auth/views/LoginView.tsx', "const a = 'p-[13px]';"],
  ['guard/spacing', 'src/app/_views/DashboardView.tsx', "const a = 'p-8';"],
  ['guard/react-19', 'src/features/auth/views/LoginView.tsx', 'export default memo(Foo);'],
  ['guard/react-19', 'src/features/auth/views/LoginView.tsx', 'const Foo = memo(() => null);'],
  [
    'guard/react-19',
    'src/features/auth/views/LoginView.tsx',
    'const Foo = memo(function () { return null; });',
  ],
  [
    'guard/react-19',
    'src/features/auth/views/LoginView.tsx',
    "import { forwardRef } from 'react';",
  ],
  ['guard/react-19', 'src/features/auth/views/LoginView.tsx', 'const Foo: React.FC = () => null;'],
  [
    'guard/react-19',
    'src/features/auth/views/LoginView.tsx',
    'type R = React.ElementRef<typeof X>;',
  ],
  [
    'guard/ui-kit-elements',
    'src/app/_views/DashboardView.tsx',
    'const a = <button type="button" />;',
  ],
  ['guard/store-write', 'src/app/_shell/AppDock.tsx', 'useSessionStore.setState({});'],
  ['guard/login-redirect', 'src/app/_shell/AppDock.tsx', 'router.replace(PATHS.LOGIN);'],
  ['guard/login-redirect', 'src/app/_shell/AppDock.tsx', 'router.push(PATHS.LOGIN);'],
  ['guard/i18n-text', 'src/app/_shell/AppDock.tsx', 'const a = <p>Xin chào</p>;'],
  ['guard/i18n-text', 'src/app/_shell/AppDock.tsx', 'const a = <i aria-label="Đóng" />;'],
  ['guard/i18n-text', 'src/features/auth/views/LoginView.tsx', "showToast('success', 'Đã lưu');"],
  ['guard/named-exports', 'src/core/http/index.ts', "export * from './api-client';"],
  ['guard/barrel-only', 'src/core/http/index.ts', 'export const x = 1;'],
  ['guard/context-files', 'src/shared/ui/inputs/Input.tsx', 'const C = createContext(null);'],
  ['guard/store-files', 'src/app/_shell/AppDock.tsx', "import { create } from 'zustand';"],
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
    ruleId === 'no-restricted-imports' ||
    ruleId === 'local/relative-in-module' ||
    ruleId === 'local/restricted-dynamic-imports',
});
const guardEngine = new ESLint({
  overrideConfig: NO_TYPES,
  ruleFilter: ({ ruleId }) => ruleId.startsWith('guard/'),
});

const problems = [];

const severityOf = (rules, rule) => {
  const value = Array.isArray(rules[rule]) ? rules[rule][0] : rules[rule];
  if (value === 'error') return 2;
  return value === 'warn' ? 1 : (value ?? 0);
};

for (const { file, on = [], off = [] } of RULE_MATRIX) {
  const { rules = {} } = await configEngine.calculateConfigForFile(file);
  for (const rule of on) if (!severityOf(rules, rule)) problems.push(`${file}: thiếu rule ${rule}`);
  for (const rule of off) {
    if (severityOf(rules, rule)) problems.push(`${file}: rule ${rule} lẽ ra phải tắt`);
  }
}

const toStatement = (entry) => (entry.startsWith('import ') ? entry : `import '${entry}';`);
/** Cùng bảng luật, dạng `import()` động — chỉ với đường dẫn (câu `import { x } from` cần tên nên không có bản động). */
const toDynamic = (entry) => `void import('${entry}');`;

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
    if (index < blocked.length && !hit) {
      problems.push(`${file}: import ${entry} lẽ ra phải bị chặn`);
    }
    if (index >= blocked.length && hit) problems.push(`${file}: import ${entry} lẽ ra được phép`);
  });
}

for (const { file, blocked = [], allowed = [] } of IMPORT_MATRIX) {
  const entries = [...blocked, ...allowed].filter((entry) => !entry.startsWith('import '));
  const blockedCount = blocked.filter((entry) => !entry.startsWith('import ')).length;
  const [result] = await importEngine.lintText(entries.map(toDynamic).join('\n'), {
    filePath: file,
  });
  const hitLines = new Set(result.messages.map((message) => message.line));
  entries.forEach((entry, index) => {
    const hit = hitLines.has(index + 1);
    if (index < blockedCount && !hit) {
      problems.push(`${file}: import() động tới ${entry} lẽ ra phải bị chặn`);
    }
    if (index >= blockedCount && hit) {
      problems.push(`${file}: import() động tới ${entry} lẽ ra được phép`);
    }
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
