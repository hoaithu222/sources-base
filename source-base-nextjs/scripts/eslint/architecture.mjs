import fs from 'node:fs';

import { SRC } from './files.mjs';

/**
 * Ranh giới import: TẦNG + PUBLIC API (`no-restricted-imports`) và MODULE (`local/relative-in-module`).
 *
 *   app → features → domains → shared → core
 *
 * Mũi tên là chiều ĐƯỢC PHÉP import. Tầng dưới cần hành vi của tầng trên thì nhận qua tham số ở
 * `src/app/_providers/bootstrap.ts`, không import ngược.
 *
 *   core      nền tảng (config, http, query, i18n, seo) — không import tầng nào khác
 *   shared    UI kit, widget, hook, util dùng chung — chỉ được import core
 *   domains   dữ liệu dùng chung nhiều feature (phiên, tuỳ chọn hiển thị)
 *   features  một nghiệp vụ / một nhóm màn hình — KHÔNG import feature khác
 *   app       `src/app/` của Next: route (`[locale]/…`) + lắp ráp (`_providers`, `_layouts`, `_shell`, `_views`…) và `src/proxy.ts`
 *
 * Luật: docs/rules/foundations/folder-structure.md · docs/rules/structure/ui-kit-architecture.md §1 ·
 * feature-structure.md · widget-composition.md · routing-conventions.md.
 *
 * Hai lớp:
 *   1. `moduleBoundary` — import TƯƠNG ĐỐI chỉ đi trong module (nhóm UI kit, widget, feature, mỗi thư mục `_xxx` của app…); ra ngoài
 *      thì dùng alias `@/…`. Nhờ vậy lớp 2 chỉ cần đọc alias.
 *   2. `importBoundaries` — alias nào được import từ vùng nào. ⚠️ Flat config GHI ĐÈ (không gộp) options của
 *      cùng một rule khi nhiều block cùng khớp một file, nên `src/` chia thành các VÙNG: mỗi vùng là MỘT
 *      block liệt kê ĐỦ danh sách của nó qua `restrictImports` (tự thêm `BANNED_IMPORTS`), vùng hẹp đứng SAU
 *      vùng rộng. `npm run check:eslint-config` kiểm lại từng vùng nhận đủ luật.
 *
 * `no-restricted-imports` chỉ thấy import TĨNH và `export … from`; `import('…')` động có chuỗi hằng được `local/restricted-dynamic-imports` kiểm
 * theo CÙNG bảng (nguồn là biến thì không kiểm được — dùng chuỗi hằng).
 */

/** Gốc module — mẫu đầu tiên khớp đầu đường file thắng; `(?=/)` để file ở gốc tầng rơi xuống mẫu sau. */
const MODULES = [
  '^src/shared/(ui|widgets)/[^/]+(?=/)',
  '^src/app/_[^/]+(?=/)',
  '^src/app/\\[locale\\](?=/)',
  '^src/messages/[^/]+(?=/)',
  '^src/(core|domains|features|shared)/[^/]+(?=/)',
  '^src/(core|domains|features|shared|app)(?=/)',
];

export const moduleBoundary = {
  files: SRC,
  rules: { 'local/relative-in-module': ['error', { modules: MODULES }] },
};

const LAYER_FORBIDS = {
  core: ['app', 'features', 'domains', 'shared'],
  shared: ['app', 'features', 'domains'],
  domains: ['app', 'features'],
  features: ['app'],
};

const layer = (name) =>
  LAYER_FORBIDS[name].map((target) => ({
    regex: `^@/${target}(/|$)`,
    message: `Tầng \`${name}\` không được import \`${target}\` — chiều phụ thuộc là app → features → domains → shared → core. Cần hành vi của tầng trên thì nhận qua tham số (xem src/app/_providers/bootstrap.ts).`,
  }));

/**
 * Điều hướng đi qua `@/core/i18n` (tự thêm tiền tố ngôn ngữ) — `next/link` và các hook điều hướng của `next/navigation` bị chặn.
 * `useSearchParams`, `notFound`, `ReadonlyURLSearchParams` không phụ thuộc ngôn ngữ nên vẫn dùng thẳng từ `next/navigation`.
 */
const NAVIGATION_IMPORTS = [
  {
    name: 'next/link',
    message:
      'Dùng `Link` của `@/core/i18n` — nó tự thêm tiền tố ngôn ngữ (`/en/…`). `next/link` trần bỏ mất ngôn ngữ đang chọn. Xem docs/rules/i18n/i18n.md',
  },
  {
    name: 'next/navigation',
    importNames: ['useRouter', 'usePathname', 'redirect', 'permanentRedirect'],
    message:
      'Dùng `useRouter` / `usePathname` / `redirect` của `@/core/i18n` (nhận biết ngôn ngữ, đường dẫn KHÔNG tiền tố). `useSearchParams` / `notFound` thì import thẳng từ `next/navigation`. Xem docs/rules/i18n/i18n.md',
  },
];

/** Gói bị cấm trên toàn `src/` — `restrictImports` tự thêm vào MỌI block. */
const BANNED_IMPORTS = [
  {
    name: 'tailwind-variants',
    message:
      'Không dùng tv() — mỗi trục biến thể là một bảng `*_CLASSES` ghép bằng cn(). Xem docs/rules/structure/component-structure.md §2.',
  },
  ...NAVIGATION_IMPORTS,
];

/** MỘT bảng luật, hai rule: import tĩnh (`no-restricted-imports`) và `import()` động (`local/restricted-dynamic-imports`). */
const restrictImports = (files, ...patternLists) => {
  const options = { paths: BANNED_IMPORTS, patterns: patternLists.flat() };
  return {
    files,
    rules: {
      'no-restricted-imports': ['error', options],
      'local/restricted-dynamic-imports': ['error', options],
    },
  };
};

const subfolders = (relativeDir) =>
  fs
    .readdirSync(new URL(`../../${relativeDir}`, import.meta.url), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

const FEATURES = subfolders('src/features');
const WIDGETS = subfolders('src/shared/widgets');

/**
 * Điểm vào SÂU của core có lý do: server-only / thuần (không kéo `next-intl/navigation`, React Query… vào đồ thị).
 *   config/server-config   cấu hình server (`import 'server-only'`)
 *   config/env.schema      schema thuần — `proxy.ts`
 *   i18n/server            API server của i18n (`requireLocale`, `getTranslations`…)
 *   i18n/{locales,routing,messages}   hằng + kiểu thuần — util thuần, `proxy.ts`, tệp thông điệp
 */
const CORE_DEEP_ALLOWED = [
  'config/(server-config|env\\.schema)',
  'i18n/(server|locales|routing|messages)',
];

const CORE_API = [
  {
    regex: `^@/core/(?!(${CORE_DEEP_ALLOWED.join('|')})$)[^/]+/.+`,
    message:
      'Import core qua public API của module (`@/core/http`, `@/core/config`, `@/core/query`, `@/core/i18n`, `@/core/seo`), không với sâu vào file bên trong. Ngoại lệ có lý do: `config/server-config`, `config/env.schema`, `i18n/{server,locales,routing,messages}`.',
  },
];

/** Nhóm chức năng của UI kit = thư mục con của `shared/ui` có `index.ts` — mỗi nhóm là một điểm vào công khai (`@/shared/ui/actions`…). */
const UI_KIT_GROUPS = subfolders('src/shared/ui').filter((name) =>
  fs.existsSync(new URL(`../../src/shared/ui/${name}/index.ts`, import.meta.url)),
);

const UI_KIT_DEEP_ALLOWED = [
  ...UI_KIT_GROUPS,
  'icons/Icons',
  'icons/StaticIcon',
  'media/image-annotator',
];

const uiKitApi = (extraAllowed = []) => [
  {
    regex: `^@/shared/ui/(?!(${[...UI_KIT_DEEP_ALLOWED, ...extraAllowed].join('|')})$)`,
    message:
      'Import UI kit qua barrel `@/shared/ui` hoặc barrel của MỘT NHÓM (`@/shared/ui/actions`, `/form`, `/data-display`…), không với sâu vào file. Ngoại lệ: `@/shared/ui/icons/{Icons,StaticIcon}`, `@/shared/ui/media/image-annotator`, và bảng class `overlays/{modal,popup-surface}.theme` cho widget — docs/rules/structure/ui-kit-architecture.md §1.',
  },
];

const UI_KIT_API = uiKitApi();

/** Widget tự dựng lớp nổi (CommandPalette) dùng lại BẢNG CLASS của Modal / Menu — ngoại lệ thứ 3 ở ui-kit-architecture.md §1. */
const UI_KIT_API_FOR_WIDGETS = uiKitApi([
  'overlays/modal\\.theme',
  'overlays/popup-surface\\.theme',
]);

const WIDGETS_API = [
  {
    regex: '^@/shared/widgets(/[^/]+/.+)?$',
    message:
      'Import widget qua `@/shared/widgets/<widget>` (không có barrel gốc, không với sâu vào file bên trong) — docs/rules/structure/widget-composition.md.',
  },
];

const otherWidgets = (own) => [
  {
    regex: `^@/shared/widgets(/(?!${own}(/|$))|$)`,
    message:
      'Widget không import widget khác — app ghép chúng lại; thứ dùng chung đưa xuống UI kit / hooks / utils. Xem docs/rules/structure/widget-composition.md.',
  },
];

/** `shared/{hooks,utils,constants,charts,theme}` nằm DƯỚI UI kit và widget: chỉ được dùng KIỂU của chúng. */
const BELOW_UI_KIT = [
  {
    regex: '^@/shared/(ui|widgets)(/|$)',
    allowTypeImports: true,
    message:
      'hooks / utils / constants / charts nằm dưới UI kit và widget — chỉ được `import type` từ đó. Cần giá trị thì chuyển nó xuống tầng này.',
  },
];

const UI_KIT_ABOVE_WIDGETS = [
  {
    regex: '^@/shared/widgets(/|$)',
    message: 'UI kit không import widget — widget ghép từ UI kit, không ngược lại.',
  },
];

/** Domain: public API là `index.ts`; ngoại lệ `preferences/appearance-script` — Server Component (root layout) nạp mà không kéo store vào đồ thị server. */
const DOMAIN_API = [
  {
    regex: '^@/domains/(?!preferences/appearance-script$)[^/]+/.+',
    message:
      'Import domain qua public API (`@/domains/<tên>`), không với sâu vào `model/` hay `api/`. Thiếu thứ cần dùng thì export thêm ở index của domain. Ngoại lệ: `@/domains/preferences/appearance-script` (script giao diện cho root layout).',
  },
];

const FEATURE_API = [
  {
    regex: '^@/features/[^/]+/.+',
    message:
      'Import feature qua public API (`@/features/<tên>`) — `page.tsx` import view từ index của feature.',
  },
];

const otherFeatures = (own) => [
  {
    regex: `^@/features/(?!${own}(/|$))`,
    message:
      'Feature không import feature khác. Thứ dùng chung thì đưa xuống `domains/` (dữ liệu) hoặc `shared/` (giao diện, tiện ích).',
  },
];

/**
 * Thư mục lắp ráp `src/app/_xxx`: các thư mục có barrel (`_navigation`, `_shell`, `_providers`, `_guards`, `_components`) import
 * qua `index.ts`; `_views`, `_layouts`, `_seo` là thư mục lá không barrel nên import thẳng được. Ngoại lệ có lý do: `public-routes`
 * (route công khai thuần dữ liệu, `robots.ts` / `sitemap.ts` nạp mà không kéo hook client).
 */
const APP_PRIVATE_API = [
  {
    regex: '^@/app/_(navigation|shell|providers|guards|components)/(?!public-routes$).+',
    message:
      'Import thư mục lắp ráp của app qua barrel (`@/app/_navigation`, `@/app/_shell`, `@/app/_providers`, `@/app/_guards`, `@/app/_components`). Ngoại lệ: `@/app/_navigation/public-routes`.',
  },
];

const PROXY_LIGHTWEIGHT = [
  {
    regex: '^@/(app|features|domains|shared/(hooks|charts|theme))(/|$)',
    message:
      '`proxy.ts` chạy trước MỌI request — chỉ import core thuần (`config/env.schema`, `i18n/{locales,routing}`), `shared/constants` và `shared/utils`; không store, hook, UI hay feature.',
  },
];

/** Public API của tầng dưới — mọi nơi dùng `core` / UI kit / widget đều phải đi qua. */
const CONSUMER_API = [...CORE_API, ...UI_KIT_API, ...WIDGETS_API];

const APP_API = [...CONSUMER_API, ...DOMAIN_API, ...FEATURE_API, ...APP_PRIVATE_API];

/** Bảng vùng — vùng hẹp đứng SAU vùng rộng (block sau thắng). */
export const importBoundaries = [
  // Mọi file `src/`: chỉ gói bị cấm.
  restrictImports(SRC),

  // core: không import tầng nào khác.
  restrictImports(['src/core/**/*.{ts,tsx}'], layer('core')),

  // shared/{hooks,utils,constants,charts,theme}: nằm dưới UI kit — chỉ dùng KIỂU của UI kit / widget.
  restrictImports(['src/shared/**/*.{ts,tsx}'], layer('shared'), CONSUMER_API, BELOW_UI_KIT),
  // shared/ui: không import widget; nhóm khác của UI kit đi qua `@/shared/ui/<nhóm>/…`.
  restrictImports(['src/shared/ui/**/*.{ts,tsx}'], layer('shared'), CORE_API, UI_KIT_ABOVE_WIDGETS),
  // shared/widgets/<widget>: không import widget khác; được dùng bảng class `overlays/*.theme`.
  ...WIDGETS.map((name) =>
    restrictImports(
      [`src/shared/widgets/${name}/**/*.{ts,tsx}`],
      layer('shared'),
      CORE_API,
      UI_KIT_API_FOR_WIDGETS,
      otherWidgets(name),
    ),
  ),

  // domains: không import feature / app; domain khác chỉ qua index.
  restrictImports(['src/domains/**/*.{ts,tsx}'], layer('domains'), CONSUMER_API, DOMAIN_API),

  // features/<feature>: không import feature khác, không import app.
  ...FEATURES.map((name) =>
    restrictImports(
      [`src/features/${name}/**/*.{ts,tsx}`],
      layer('features'),
      CONSUMER_API,
      DOMAIN_API,
      otherFeatures(name),
    ),
  ),

  // app (route + lắp ráp): mọi tầng qua public API; thư mục `_xxx` có barrel qua index.
  restrictImports(['src/app/**/*.{ts,tsx}'], APP_API),

  // proxy.ts chạy trước MỌI request nên phải NHẸ: chỉ core thuần + hằng / util thuần (không store, UI, feature, không React).
  restrictImports(['src/proxy.ts'], CONSUMER_API, DOMAIN_API, FEATURE_API, PROXY_LIGHTWEIGHT),
];
