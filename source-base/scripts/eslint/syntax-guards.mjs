import { builtinRules } from 'eslint/use-at-your-own-risk';

import { GENERATED_SOURCES, SRC } from './files.mjs';

/**
 * Gác cú pháp (`no-restricted-syntax`) — MỖI quy ước một rule có tên riêng `guard/<tên>`.
 *
 * Vì sao không dồn vào một `no-restricted-syntax`: flat config GHI ĐÈ options khi nhiều block cùng khớp một
 * file, nên mọi block phải chép lại đủ selector của nhau — các gác có vùng áp và ngoại lệ khác nhau (file chủ
 * `storage.utils.ts`, `*.store.ts`…) sẽ thành một ma trận dễ sót. Đăng ký lại CÙNG rule lõi dưới nhiều tên
 * thì mỗi gác có `files` / `ignores` của riêng nó, không đè nhau, và `eslint-disable-next-line guard/<tên>`
 * chỉ tắt đúng một gác.
 *
 * Thêm gác: thêm một dòng vào `SYNTAX_GUARDS` (tên · vùng · ngoại lệ · selector + thông báo trỏ docs), rồi
 * thêm phép kiểm vào `scripts/check-eslint-config.mjs`.
 */

/** Ô tìm kiếm — docs/rules/interaction/ime-safe-input.md · search-matching.md. */
const SEARCH_INPUT = [
  {
    selector: "JSXOpeningElement[name.name='Input'] > JSXAttribute[name.name='debounce']",
    message:
      'Prop `debounce` biến <Input> thành controlled nội bộ → cắt ngang composition IME, mất dấu tiếng Việt. Bỏ prop này, dùng `useImeSafeSearchInput` cho ô nhập + `useDebounce` ở tầng lọc/query. Xem docs/rules/interaction/ime-safe-input.md',
  },
  {
    selector:
      "JSXOpeningElement[name.name=/^(Input|input)$/]:has(JSXAttribute[name.name='placeholder'] > Literal[value=/[Tt]ìm|[Ss]earch/]):has(JSXAttribute[name.name='value'])",
    message:
      'Ô tìm kiếm controlled (`value` + `onChange`) làm mất dấu khi gõ tiếng Việt. Dùng `{...inputProps}` từ `useImeSafeSearchInput(value, onChange)`. Xem docs/rules/interaction/ime-safe-input.md',
  },
  {
    selector:
      "JSXOpeningElement[name.name=/^(Input|input)$/] > JSXAttribute[name.name='value'] > JSXExpressionContainer > Identifier[name=/^(search|searchTerm|searchText|searchValue|searchQuery|query|keyword|filterText)$/i]",
    message:
      'Ô tìm kiếm controlled (`value={search}`) làm mất dấu khi gõ tiếng Việt. Dùng `{...inputProps}` từ `useImeSafeSearchInput(value, onChange)`. Xem docs/rules/interaction/ime-safe-input.md',
  },
  {
    selector:
      "CallExpression[callee.property.name='includes'][callee.object.callee.property.name='toLowerCase']",
    message:
      '`x.toLowerCase().includes(y)` KHÔNG bỏ dấu — gõ "met khoi" không ra "Mét khối". Dùng `includesSearch` / `includesNormalized` / `matchesSearch` từ `@/shared/utils/format/string.utils`. Xem docs/rules/interaction/search-matching.md',
  },
];

const spacingClass = (pattern) =>
  `:matches(Literal[value=/${pattern}/], TemplateElement[value.raw=/${pattern}/])`;

/** Khoảng cách trong code trang — docs/rules/styling/spacing-system.md (cổng đầy đủ: tests/policy/styling/spacing-policy.test.ts). */
const SPACING = [
  {
    selector: spacingClass(
      '(^|\\s)([a-z0-9-]+:)*-?(p[xytrblse]?|gap(-[xy])?|space-[xy]|m[xytrbl]?)-\\[',
    ),
    message:
      'Khoảng cách tuỳ ý (`p-[…]`, `gap-[…]`, `m-[…]`) nằm ngoài thang và KHÔNG co ở chế độ TV. Dùng bậc gần nhất: 0.5 · 1 · 1.5 · 2 · 3 · 4. Xem docs/rules/styling/spacing-system.md §2',
  },
  {
    selector: spacingClass('(^|\\s)([a-z0-9-]+:)*p[xytrblse]?-([5-9]|[1-9][0-9])(\\s|$)'),
    message:
      'Đệm từ bậc 5 (20px) trở lên không dùng ở code trang — thân hộp `p-2`, form dài `p-3`, tối đa `p-4`. Cần to hơn nghĩa là đang thiếu một hộp. Xem docs/rules/styling/spacing-system.md §4',
  },
  {
    selector:
      "JSXOpeningElement[name.name='PageShell'] > JSXAttribute[name.name='className'] Literal[value=/(^|\\s)p[xytrbl]?-[0-9]/]",
    message:
      '`<PageShell>` không tự đệm: `<main>` đã cấp lề (SHELL_GUTTER_X/Y), thêm vào là cộng dồn và lệch mép header. Xem docs/rules/styling/spacing-system.md §3',
  },
];

/** Cách viết component React 19 — docs/rules/foundations/code-style.md (React Components). */
const REACT_19 = [
  {
    selector: "ExportDefaultDeclaration > CallExpression[callee.name='memo']",
    message:
      'Không `export default memo(X)` — khai `const X = memo(function X(…) {…})` rồi export tên đó. Xem docs/rules/foundations/code-style.md',
  },
  {
    selector:
      "CallExpression[callee.name='memo']:matches([arguments.0.type='ArrowFunctionExpression'], [arguments.0.type='FunctionExpression']:not([arguments.0.id]))",
    message:
      'Hàm trong `memo` phải có tên (`memo(function TenComponent(…) {…})`) — DevTools và stack lỗi lấy tên từ đó. Xem docs/rules/foundations/code-style.md',
  },
  {
    selector:
      ":matches(CallExpression[callee.name='forwardRef'], ImportDeclaration[source.value='react'] > ImportSpecifier[imported.name=/^(forwardRef|FC|ElementRef)$/])",
    message:
      'React 19: `ref` là prop thường — không `forwardRef`; props khai kiểu inline, không `FC`; kiểu phần tử dùng `ComponentRef`. Xem docs/rules/foundations/code-style.md',
  },
  {
    selector:
      "MemberExpression[object.name='React'][property.name=/^(memo|forwardRef)$/], TSQualifiedName[left.name='React'][right.name=/^(FC|ElementRef)$/]",
    message:
      'Không `React.memo` / `React.forwardRef` / `React.FC` / `React.ElementRef` — import tên từ `react` (`memo`), `ref` là prop thường, props khai kiểu inline. Xem docs/rules/foundations/code-style.md',
  },
];

/** Phần tử HTML thô thay cho UI kit — docs/rules/structure/reuse-first.md · ui-kit-architecture.md §0. */
const UI_KIT_ELEMENTS = [
  {
    selector: 'JSXOpeningElement[name.name=/^(button|input|select|textarea|table|svg)$/]',
    message:
      'Code trang không dựng `<button>` / `<input>` / `<select>` / `<textarea>` / `<table>` / `<svg>` thô — dùng `Button`, `Input`, `Dropdown`, `Textarea`, `Table`, `SystemIcon` của `@/shared/ui`. Thiếu biến thể thì mở rộng UI kit. Xem docs/rules/structure/reuse-first.md',
  },
];

/** Ghi store từ bên ngoài — docs/rules/data/state-management.md. */
const STORE_WRITE = [
  {
    selector:
      "CallExpression[callee.object.name=/^use[A-Z]\\w*Store$/][callee.property.name='setState']",
    message:
      '`useXxxStore.setState(…)` thô chỉ được ở chính file `*.store.ts` hoặc trong `src/domains/**` (hàm vòng đời). Nơi khác gọi action / hàm vòng đời của store. Xem docs/rules/data/state-management.md',
  },
];

/** Điều hướng vào /login — docs/rules/structure/routing-conventions.md §10. */
const LOGIN_REDIRECT = [
  {
    selector:
      "CallExpression[callee.name='navigate'][arguments.0.object.name='PATHS'][arguments.0.property.name='LOGIN']",
    message:
      '`AuthGuard` là nơi DUY NHẤT đưa người dùng vào /login (hết phiên, đăng xuất, tab khác) — nơi gọi `logout()` không tự `navigate`. Xem docs/rules/structure/routing-conventions.md §10',
  },
];

/** Barrel của core / domains xuất ĐẶT TÊN — nhìn index là biết public API. */
const NAMED_EXPORTS = [
  {
    selector: 'ExportAllDeclaration',
    message:
      'Barrel của `core` / `domains` liệt kê từng tên (`export { a, b } from …`), không `export *` — public API phải đọc được ngay trong index.ts. Xem docs/rules/foundations/folder-structure.md',
  },
];

/** Câu lỗi của tầng HTTP — docs/rules/data/api-patterns.md §3. */
const ERROR_MESSAGES = [
  {
    selector:
      "NewExpression[callee.name='AppError']:matches([arguments.1.type='Literal'], [arguments.1.type='TemplateLiteral'])",
    message:
      'Câu lỗi tiếng Việt của tầng HTTP khai ở `core/http/errors/error-messages.constants.ts` (sửa câu nào cũng sửa một chỗ) — `new AppError(kind, HANG_SO)`. Xem docs/rules/data/api-patterns.md §3',
  },
];

const ERROR_CLAIM = [
  {
    selector: "AssignmentExpression[left.property.name='notified']",
    message:
      'Đánh dấu "đã báo lỗi" chỉ qua `claimErrorMessage` (`@/core/http`) — gán `.notified` tay là toast lặp hoặc nuốt lỗi. Xem docs/rules/data/api-patterns.md §3',
  },
];

/** Bộ nhớ trình duyệt — docs/rules/data/state-management.md (persist). */
const STORAGE = [
  {
    selector: 'Identifier[name=/^(localStorage|sessionStorage)$/]',
    message:
      '`localStorage` / `sessionStorage` trần ném lỗi khi hết quota / Safari riêng tư — đi qua `@/shared/utils/browser/storage.utils` (`safeStorage`, `createSafeJSONStorage`). Xem docs/rules/data/state-management.md',
  },
];

/** Định dạng số / ngày — một chỗ quyết locale vi-VN. */
const NUMBER_FORMAT = [
  {
    selector: 'CallExpression[callee.property.name=/^toLocale(String|DateString|TimeString)$/]',
    message:
      'Không tự gọi `toLocaleString` — dễ trộn `en-US`, cùng tập số hiện hai kiểu dấu. Dùng `formatNumber` / `formatPercent` / `formatCurrency` / `formatDate` ở `@/shared/utils/format/format.utils`. Xem docs/rules/display/chart-conventions.md',
  },
];

/** Chỉ `index.ts` của UI kit được re-export — docs/rules/structure/ui-kit-architecture.md §8. */
const UI_KIT_BARREL = [
  {
    selector: 'ExportAllDeclaration, ExportNamedDeclaration[source]',
    message:
      'Trong UI kit chỉ `index.ts` được re-export (`export … from`). File khác khai và export thứ của chính nó. Xem docs/rules/structure/ui-kit-architecture.md §8',
  },
];

/** `*.theme.ts` chỉ chứa bảng class — docs/rules/structure/component-structure.md §2. */
const THEME_TABLES = [
  {
    selector:
      ':matches(FunctionDeclaration[id.name=/Styles$/], VariableDeclarator[id.name=/Styles$/][init.type=/FunctionExpression$/])',
    message:
      'Hàm `xxxStyles()` trong `*.theme.ts` là di sản `tv()` — mỗi trục biến thể là một bảng `*_CLASSES`, ghép bằng `cn()` trong component. Xem docs/rules/structure/component-structure.md §2',
  },
];

/** File theo vai trò — docs/rules/foundations/folder-structure.md (bảng tên file). */
const BARREL_ONLY = [
  {
    selector: 'Program > :not(ExportNamedDeclaration[source], ExportAllDeclaration)',
    message:
      'Barrel `index.ts` chỉ chứa `export … from` — khai báo / logic đặt ở file riêng theo vai trò. Xem docs/rules/foundations/folder-structure.md',
  },
];

const CONTEXT_FILES = [
  {
    selector: "CallExpression[callee.name='createContext']",
    message:
      '`createContext` đặt trong file `*.context.ts` (chỉ context + provider; hook đọc ở `useXxx.ts`). Xem docs/rules/foundations/folder-structure.md',
  },
];

const STORE_FILES = [
  {
    selector: 'ImportDeclaration[source.value=/^zustand(\\/|$)/]',
    message:
      'Store Zustand đặt trong file `*.store.ts`; persist dùng `createSafeJSONStorage()` của `@/shared/utils/browser/storage.utils`. Xem docs/rules/foundations/folder-structure.md · docs/rules/data/state-management.md',
  },
];

/** Tên · vùng áp · ngoại lệ (file CHỦ của quy ước) · selector. */
const SYNTAX_GUARDS = [
  { name: 'search-input', files: SRC, selectors: SEARCH_INPUT },
  {
    name: 'spacing',
    files: ['src/features/**/*.{ts,tsx}', 'src/app/pages/**/*.{ts,tsx}'],
    selectors: SPACING,
  },
  { name: 'react-19', files: SRC, selectors: REACT_19 },
  {
    name: 'ui-kit-elements',
    files: ['src/{app,features,domains}/**/*.{ts,tsx}'],
    selectors: UI_KIT_ELEMENTS,
  },
  {
    name: 'store-write',
    files: SRC,
    ignores: ['src/domains/**', 'src/**/*.store.ts'],
    selectors: STORE_WRITE,
  },
  {
    name: 'login-redirect',
    files: SRC,
    ignores: ['src/app/router/guards/**'],
    selectors: LOGIN_REDIRECT,
  },
  {
    name: 'named-exports',
    files: ['src/{core,domains}/**/index.ts'],
    selectors: NAMED_EXPORTS,
  },
  {
    name: 'error-messages',
    files: ['src/core/**/*.{ts,tsx}'],
    ignores: ['src/core/http/errors/error-messages.constants.ts'],
    selectors: ERROR_MESSAGES,
  },
  {
    name: 'error-claim',
    files: SRC,
    ignores: ['src/core/http/errors/claim-error-message.ts'],
    selectors: ERROR_CLAIM,
  },
  {
    name: 'storage',
    files: SRC,
    ignores: ['src/shared/utils/browser/storage.utils.ts'],
    selectors: STORAGE,
  },
  {
    name: 'number-format',
    files: SRC,
    ignores: ['src/shared/utils/format/**'],
    selectors: NUMBER_FORMAT,
  },
  {
    name: 'ui-kit-barrel',
    files: ['src/shared/ui/**/*.{ts,tsx}'],
    ignores: ['src/shared/ui/**/index.ts'],
    selectors: UI_KIT_BARREL,
  },
  { name: 'theme-tables', files: ['src/**/*.theme.ts'], selectors: THEME_TABLES },
  {
    name: 'barrel-only',
    files: ['src/**/index.ts'],
    ignores: GENERATED_SOURCES,
    selectors: BARREL_ONLY,
  },
  {
    name: 'context-files',
    files: SRC,
    ignores: ['src/**/*.context.ts'],
    selectors: CONTEXT_FILES,
  },
  {
    name: 'store-files',
    files: SRC,
    ignores: ['src/**/*.store.ts', 'src/shared/utils/browser/storage.utils.ts'],
    selectors: STORE_FILES,
  },
];

const noRestrictedSyntax = builtinRules.get('no-restricted-syntax');

/** Plugin `guard`: mỗi gác là rule lõi `no-restricted-syntax` mang một tên riêng. */
export const guardPlugin = {
  rules: Object.fromEntries(SYNTAX_GUARDS.map(({ name }) => [name, noRestrictedSyntax])),
};

const restrictSyntax = ({ name, files, ignores = [], selectors }) => ({
  files,
  ignores,
  rules: { [`guard/${name}`]: ['error', ...selectors] },
});

export const syntaxGuards = SYNTAX_GUARDS.map(restrictSyntax);
