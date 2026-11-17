/**
 * Ranh giới Server / Client — `docs/rules/structure/server-client-boundary.md`.
 *
 * Next render mọi thứ ở server theo mặc định; file nào chạm API CHỈ CÓ Ở CLIENT mà thiếu `'use client'` là lỗi biên dịch
 * ("You're importing a component that needs useState…") — và vì `@/shared/ui` là MỘT barrel nên chỉ cần một module trong đó
 * thiếu directive là mọi Server Component import barrel đều đỏ. Bốn nhóm đo được bằng máy:
 *   1. File chạm API chỉ-client PHẢI có directive (kể cả `.ts`: hook, context):
 *        - hook trạng thái / vòng đời của React · `createContext`
 *        - hook điều hướng `usePathname · useRouter · useSearchParams · useParams` (next/navigation hoặc bản bọc `@/core/i18n`)
 *        - GỌI hook `useXxx(…)` của repo / thư viện (trừ `useMemo · useCallback · useId · useDebugValue` mà bản server của
 *          React có, và `useTranslations · useLocale · useMessages · useFormatter` của next-intl chạy được ở Server Component)
 *        - riêng `.tsx`: prop sự kiện JSX `onXxx={…}` · import Radix / zustand / react-hook-form / TanStack Query / Recharts /
 *          dnd-kit / react-arborist / react-number-format
 *   2. Chiều ngược: file có directive KHÔNG được import thứ chỉ-server (`server-only`, `serverConfig`, `@/core/seo`,
 *      `@/core/i18n/server`, `next/headers`, `next-intl/server`) — lọt vào bundle trình duyệt là build đỏ.
 *   3. Theo vị trí: `page` · `layout` · `not-found` · `loading` · route handler… là Server (không directive); `error.tsx` /
 *      `global-error.tsx` là Client (Next bắt buộc).
 *   4. Hằng / bảng class / hàm thuần / kiểu / schema (`*.theme · constants · utils · types · schema`) KHÔNG directive — Server
 *      Component gọi được (mọi export khác của file `'use client'` bị Next đổi thành tham chiếu client).
 * Thừa directive ở component trình bày thuần là việc review (`server-client-boundary.md §9`): đoán "thuần" bằng regex sẽ báo nhầm.
 *
 * Quét sau khi bỏ chú thích và `import type` (không sinh code); nội dung đọc qua `tests/helpers/source-files.ts`.
 */

import { describe, expect, it } from 'vitest';

import { HANDWRITTEN_CODE, baseName, stripComments } from '@tests/helpers/source-files';

// ── Nhận diện ────────────────────────────────────────────────────────────────────────────────────

/** Directive `'use client'` đứng đầu file (cho phép chú thích / dòng trống phía trước). */
const DIRECTIVE = /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*(['"])use client\1/;

const REACT_HOOKS = [
  'useState',
  'useEffect',
  'useLayoutEffect',
  'useReducer',
  'useRef',
  'useContext',
  'useImperativeHandle',
  'useSyncExternalStore',
  'useInsertionEffect',
  'useTransition',
  'useDeferredValue',
  'useOptimistic',
  'useActionState',
  'useEffectEvent',
];
const NAVIGATION_HOOKS = ['usePathname', 'useRouter', 'useSearchParams', 'useParams'];
/** Hook có bản chạy được ở Server Component — gọi chúng KHÔNG buộc file thành client. */
const SERVER_CAPABLE_HOOKS = new Set([
  'useMemo',
  'useCallback',
  'useId',
  'useDebugValue',
  'useTranslations',
  'useLocale',
  'useMessages',
  'useFormatter',
]);

const REACT_HOOK_CALL = new RegExp(String.raw`\b(?:${REACT_HOOKS.join('|')})\b\s*[(<]`);
const NAVIGATION_HOOK_CALL = new RegExp(String.raw`\b(?:${NAVIGATION_HOOKS.join('|')})\b\s*[(<]`);
const CREATE_CONTEXT = /\bcreateContext\b\s*[(<]/;
/** `useXxx(` / `useXxx<T>(` — bỏ chỗ KHAI BÁO (`function useXxx(`). */
const HOOK_CALL = /(?<!function\s+)\b(use[A-Z]\w*)\b\s*[(<]/g;
const JSX_HANDLER = /\s(on[A-Z]\w*)=\{/;
const CLIENT_LIBRARIES =
  /from\s+'(?:@radix-ui\/[^']+|zustand(?:\/[^']*)?|react-hook-form|@tanstack\/react-query|recharts|@dnd-kit\/[^']+|react-arborist|react-number-format)'/;
const SERVER_ONLY_IMPORT =
  /^\s*import\s+(?:[\s\S]*?\s+from\s+)?'(server-only|@\/core\/config\/server-config|@\/core\/seo(?:\/[^']*)?|@\/core\/i18n\/server|next\/headers|next-intl\/server)'/gm;

/** Bỏ chú thích + câu `import type … ;` / `export type … from` (không sinh code nên không phải dấu hiệu). */
const codeOf = (text: string) =>
  stripComments(text)
    .replace(/^\s*import\s+type\b[\s\S]*?;/gm, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/^\s*export\s+type\s*\{[\s\S]*?\}\s*from\s+'[^']*';/gm, (m) =>
      m.replace(/[^\n]/g, ' '),
    );

const hasDirective = (text: string) => DIRECTIVE.test(text);

/** Lý do file này cần `'use client'` (rỗng = không cần). */
function clientReasons(path: string, code: string): string[] {
  const reasons: string[] = [];
  const react = REACT_HOOK_CALL.exec(code)?.[0];
  if (react) reasons.push(`hook React \`${react.replace(/\s*[(<]$/, '')}\``);
  const navigation = NAVIGATION_HOOK_CALL.exec(code)?.[0];
  if (navigation) reasons.push(`hook điều hướng \`${navigation.replace(/\s*[(<]$/, '')}\``);
  if (CREATE_CONTEXT.test(code)) reasons.push('`createContext`');

  // Gọi hook `useXxx(…)` khác. File `*.queries.ts` / `*.store.ts` chỉ BỌC hook (cấp module không gọi hook nào) nên không tính.
  if (!/\.(?:queries|store)\.tsx?$/.test(path)) {
    const custom = [...code.matchAll(HOOK_CALL)]
      .map((m) => m[1])
      .filter(
        (name) =>
          !SERVER_CAPABLE_HOOKS.has(name) &&
          !REACT_HOOKS.includes(name) &&
          !NAVIGATION_HOOKS.includes(name),
      );
    if (custom.length > 0) reasons.push(`gọi hook \`${custom[0]}\``);
  }

  if (path.endsWith('.tsx')) {
    const handler = JSX_HANDLER.exec(code)?.[1];
    if (handler) reasons.push(`prop sự kiện JSX \`${handler}\``);
    const lib = CLIENT_LIBRARIES.exec(code)?.[0];
    if (lib) reasons.push(`import thư viện chỉ-client (${lib.replace(/^from\s+/, '')})`);
  }
  return reasons;
}

const serverOnlyImports = (code: string) => [...code.matchAll(SERVER_ONLY_IMPORT)].map((m) => m[1]);

// ── Phạm vi ─────────────────────────────────────────────────────────────────────────────────────

/** Hằng / hàm thuần / kiểu / bảng class / schema — KHÔNG hook, KHÔNG directive. */
const PURE_FILE = /\.(?:types|constants|theme|schema|utils)\.ts$/;
/** Khai báo kiểu, file sinh (`isGenerated` đã loại), barrel — không bàn tới. */
const isOutOfScope = (path: string) =>
  path.endsWith('.d.ts') || PURE_FILE.test(path) || baseName(path) === 'index.ts';

/** File đặc biệt của Next ở cây route (ngoài folder private `_xxx`) — `src/app/**`. */
const routeFile = (path: string) => {
  if (!path.startsWith('src/app/')) return undefined;
  if (
    path
      .split('/')
      .slice(2, -1)
      .some((segment) => segment.startsWith('_'))
  )
    return undefined;
  return /^(.+)\.tsx?$/.exec(baseName(path))?.[1];
};
const SERVER_ROUTE_FILES = new Set([
  'page',
  'layout',
  'template',
  'not-found',
  'loading',
  'default',
  'route',
  'opengraph-image',
  'twitter-image',
  'icon',
  'apple-icon',
  'robots',
  'sitemap',
  'manifest',
  'global-not-found',
]);
const CLIENT_ROUTE_FILES = new Set(['error', 'global-error']);

const FILES = Object.entries(HANDWRITTEN_CODE).map(([path, text]) => ({
  path,
  text,
  code: codeOf(text),
  client: hasDirective(text),
}));

describe('detector — bài kiểm không mù', () => {
  const reasons = (code: string, path = 'src/x/Foo.tsx') => clientReasons(path, codeOf(code));

  it('nhận ra hook React, kể cả generic, và bỏ chú thích / chuỗi chú thích', () => {
    expect(reasons('const [a] = useState<number>(0);\n')).toHaveLength(1);
    expect(reasons('const ref = useRef<HTMLDivElement>(null);\n')).toHaveLength(1);
    expect(reasons('// useState(0)\n/* useEffect(() => {}) */\nexport const x = 1;\n')).toEqual([]);
  });

  it('hook có bản server (`useMemo`, `useCallback`, `useId`, `useTranslations`…) không buộc directive', () => {
    expect(
      reasons(
        'const t = useTranslations("a");\nconst m = useMemo(() => 1, []);\nconst c = useCallback(() => 1, []);\n',
      ),
    ).toEqual([]);
    expect(reasons('const id = useId();\nconst l = useLocale();\n')).toEqual([]);
  });

  it('hook của repo / thư viện (`useDisclosure()`, `useSessionStore(…)`) và hook điều hướng buộc directive', () => {
    expect(reasons('const d = useDisclosure();\n')).toHaveLength(1);
    expect(reasons('const u = useSessionStore(selectUser);\n')).toHaveLength(1);
    expect(reasons('const p = usePathname();\n')).toEqual(['hook điều hướng `usePathname`']);
  });

  it('chỗ KHAI BÁO hook (`function useFoo(`) không phải lời gọi', () => {
    expect(reasons('export function useFoo() {\n  return 1;\n}\n', 'src/x/useFoo.ts')).toEqual([]);
  });

  it('`*.queries.ts` / `*.store.ts` chỉ bọc hook nên không tính lời gọi `useMutation(` ở cấp bọc', () => {
    const code = 'export const useLogin = () => useMutation({});\n';
    expect(reasons(code, 'src/features/auth/service/auth.queries.ts')).toEqual([]);
    expect(reasons(code, 'src/x/useLogin.ts')).toHaveLength(1);
  });

  it('`.tsx`: prop sự kiện JSX và import thư viện chỉ-client; `.ts` thì không xét hai dấu hiệu này', () => {
    expect(reasons('const a = <button onClick={go} />;\n')).toHaveLength(1);
    expect(reasons("import * as Dialog from '@radix-ui/react-dialog';\n")).toHaveLength(1);
    expect(reasons('const a = <button onClick={go} />;\n', 'src/x/foo.ts')).toEqual([]);
    expect(reasons("import type { X } from '@radix-ui/react-dialog';\n")).toEqual([]);
  });

  it('nhận ra directive đứng đầu file, kể cả sau khối chú thích', () => {
    expect(hasDirective("'use client';\n\nimport x from 'x';\n")).toBe(true);
    expect(hasDirective("/** Mô tả */\n'use client';\n")).toBe(true);
    expect(hasDirective("import x from 'x';\n'use client';\n")).toBe(false);
    expect(hasDirective('export const note = "use client";\n')).toBe(false);
  });

  it('nhận ra import chỉ-server, bỏ `import type`', () => {
    expect(serverOnlyImports(codeOf("import 'server-only';\n"))).toEqual(['server-only']);
    expect(
      serverOnlyImports(codeOf("import { serverConfig } from '@/core/config/server-config';\n")),
    ).toEqual(['@/core/config/server-config']);
    expect(serverOnlyImports(codeOf("import { buildRobots } from '@/core/seo';\n"))).toEqual([
      '@/core/seo',
    ]);
    expect(serverOnlyImports(codeOf("import type { PublicRoute } from '@/core/seo';\n"))).toEqual(
      [],
    );
    expect(serverOnlyImports(codeOf("import { Link } from '@/core/i18n';\n"))).toEqual([]);
  });
});

describe('ranh giới Server / Client — src/', () => {
  it('có đủ file để kiểm', () => {
    expect(FILES.length).toBeGreaterThan(300);
    expect(FILES.filter((f) => f.client).length).toBeGreaterThan(100);
  });

  it("file chạm API chỉ-client PHẢI có 'use client' (kể cả .ts)", () => {
    const missing = FILES.filter(({ path, client }) => !client && !isOutOfScope(path))
      .map(({ path, code }) => [path, clientReasons(path, code)] as const)
      .filter(([, reasons]) => reasons.length > 0)
      .map(([path, reasons]) => `${path} — ${reasons.join('; ')}`);

    expect(
      missing,
      `Thêm 'use client' ở dòng đầu (server-client-boundary.md §2):\n  ${missing.join('\n  ')}`,
    ).toEqual([]);
  });

  it("file có 'use client' KHÔNG import thứ chỉ-server (server-only, serverConfig, @/core/seo, @/core/i18n/server…)", () => {
    const leaks = FILES.filter(({ client }) => client)
      .map(({ path, code }) => [path, serverOnlyImports(code)] as const)
      .filter(([, imports]) => imports.length > 0)
      .map(([path, imports]) => `${path} — ${[...new Set(imports)].join(', ')}`);

    expect(
      leaks,
      `Client Component import thứ chỉ-server → build đỏ, secret có thể lọt bundle (§8):\n  ${leaks.join('\n  ')}`,
    ).toEqual([]);
    // Quét ~900 file mã nguồn: ~3 giây một mình, quá 5 giây khi máy đang tải nhiều test song song — nới riêng ca này.
  }, 30_000);

  it('page · layout · not-found · loading · route handler… là Server (không directive); error · global-error là Client', () => {
    const wrong = FILES.flatMap(({ path, client }) => {
      const name = routeFile(path);
      if (name === undefined) return [];
      if (SERVER_ROUTE_FILES.has(name) && client) {
        return [
          `${path} — file route là Server Component, bỏ 'use client' (đưa phần tương tác vào view / component client)`,
        ];
      }
      if (CLIENT_ROUTE_FILES.has(name) && !client) {
        return [`${path} — Next bắt buộc 'use client' cho file này`];
      }
      return [];
    });
    expect(wrong, `Sai vị trí directive (§1):\n  ${wrong.join('\n  ')}`).toEqual([]);
  });

  it('hằng · bảng class · hàm thuần · kiểu · schema (`*.theme|constants|utils|types|schema.ts`) KHÔNG directive', () => {
    const marked = FILES.filter(({ path, client }) => client && PURE_FILE.test(path)).map(
      ({ path }) => path,
    );
    expect(
      marked,
      `Bỏ 'use client' — export không phải component của file client bị Next đổi thành tham chiếu, Server Component gọi là lỗi (§4):\n  ${marked.join('\n  ')}`,
    ).toEqual([]);
  });

  it('file đặc biệt của Next được nhận ra đúng (kiểm chính bộ lọc vị trí)', () => {
    expect(routeFile('src/app/[locale]/(public)/page.tsx')).toBe('page');
    expect(routeFile('src/app/global-error.tsx')).toBe('global-error');
    expect(routeFile('src/app/_views/page.tsx')).toBeUndefined();
    expect(routeFile('src/shared/ui/layout/PageShell.tsx')).toBeUndefined();
  });
});
