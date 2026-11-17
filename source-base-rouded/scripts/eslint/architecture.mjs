import fs from 'node:fs';

import { SRC } from './files.mjs';

/**
 * Ranh giới import: TẦNG + PUBLIC API (`no-restricted-imports`) và MODULE (`local/relative-in-module`).
 *
 *   app → features → domains → shared → core
 *
 * Mũi tên là chiều ĐƯỢC PHÉP import. Tầng dưới cần hành vi của tầng trên thì nhận qua tham số ở
 * `src/app/bootstrap.ts`, không import ngược.
 *
 *   core      nền tảng (config, http, query) — không import tầng nào khác
 *   shared    UI kit, widget, hook, util dùng chung — chỉ được import core
 *   domains   dữ liệu dùng chung nhiều feature (phiên, tuỳ chọn hiển thị)
 *   features  một nghiệp vụ / một nhóm màn hình — KHÔNG import feature khác
 *   app       lắp ráp: router, provider, shell
 *
 * Luật: docs/rules/foundations/folder-structure.md · docs/rules/structure/ui-kit-architecture.md §1 ·
 * feature-structure.md · widget-composition.md · routing-conventions.md.
 *
 * Hai lớp:
 *   1. `moduleBoundary` — import TƯƠNG ĐỐI chỉ đi trong module (nhóm UI kit, widget, feature…); ra ngoài
 *      thì dùng alias `@/…`. Nhờ vậy lớp 2 chỉ cần đọc alias.
 *   2. `importBoundaries` — alias nào được import từ vùng nào. ⚠️ Flat config GHI ĐÈ (không gộp) options của
 *      cùng một rule khi nhiều block cùng khớp một file, nên `src/` chia thành các VÙNG: mỗi vùng là MỘT
 *      block liệt kê ĐỦ danh sách của nó qua `restrictImports` (tự thêm `BANNED_PACKAGES`), vùng hẹp đứng SAU
 *      vùng rộng. `npm run check:eslint-config` kiểm lại từng vùng nhận đủ luật.
 *
 * Luật chỉ thấy import TĨNH và `export … from`; trang lazy-load bằng `import()` động không bị chặn.
 */

/** Gốc module — mẫu đầu tiên khớp đầu đường file thắng; `(?=/)` để file ở gốc tầng rơi xuống mẫu sau. */
const MODULES = [
  '^src/shared/(ui|widgets)/[^/]+(?=/)',
  '^src/features/demo/[^/]+(?=/)',
  '^src/(core|domains|features|shared)/[^/]+(?=/)',
  '^src/(core|domains|features|shared|app)(?=/)',
];

/** library / composed / dashboard của demo được dùng chung `demo/shared/` bằng đường tương đối. */
const SHARED_WITHIN = [{ from: '^src/features/demo/', to: '^src/features/demo/shared(/|$)' }];

export const moduleBoundary = {
  files: SRC,
  rules: { 'local/relative-in-module': ['error', { modules: MODULES, allow: SHARED_WITHIN }] },
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
    message: `Tầng \`${name}\` không được import \`${target}\` — chiều phụ thuộc là app → features → domains → shared → core. Cần hành vi của tầng trên thì nhận qua tham số (xem src/app/bootstrap.ts).`,
  }));

/** Gói bị cấm trên toàn `src/` — `restrictImports` tự thêm vào MỌI block. */
const BANNED_PACKAGES = [
  {
    name: 'tailwind-variants',
    message:
      'Không dùng tv() — mỗi trục biến thể là một bảng `*_CLASSES` ghép bằng cn(). Xem docs/rules/structure/component-structure.md §2.',
  },
];

const restrictImports = (files, ...patternLists) => ({
  files,
  rules: {
    'no-restricted-imports': ['error', { paths: BANNED_PACKAGES, patterns: patternLists.flat() }],
  },
});

const subfolders = (relativeDir) =>
  fs
    .readdirSync(new URL(`../../${relativeDir}`, import.meta.url), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

const FEATURES = subfolders('src/features');
const WIDGETS = subfolders('src/shared/widgets');
const DEMO_PARTS = subfolders('src/features/demo');

const CORE_API = [
  {
    regex: '^@/core/[^/]+/.+',
    message:
      'Import core qua public API của module (`@/core/http`, `@/core/config`, `@/core/query`), không với sâu vào file bên trong.',
  },
];

const UI_KIT_DEEP_ALLOWED = ['icons', 'icons/Icons', 'media/image-annotator'];

const uiKitApi = (extraAllowed = []) => [
  {
    regex: `^@/shared/ui/(?!(${[...UI_KIT_DEEP_ALLOWED, ...extraAllowed].join('|')})$)`,
    message:
      'Import UI kit qua barrel `@/shared/ui`. Ngoại lệ duy nhất: `@/shared/ui/icons/Icons` (SystemIcon), `@/shared/ui/media/image-annotator`, và bảng class `overlays/{modal,popup-surface}.theme` cho widget — docs/rules/structure/ui-kit-architecture.md §1.',
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

const DOMAIN_API = [
  {
    regex: '^@/domains/[^/]+/.+',
    message:
      'Import domain qua public API (`@/domains/<tên>`), không với sâu vào `model/` hay `api/`. Thiếu thứ cần dùng thì export thêm ở index của domain.',
  },
];

const FEATURE_API = [
  {
    regex: '^@/features/[^/]+/.+',
    message:
      'Import feature qua public API (`@/features/<tên>`). Trang thì lazy-load bằng `import()` động trong router.',
  },
];

const otherFeatures = (own) => [
  {
    regex: `^@/features/(?!${own}(/|$))`,
    message:
      'Feature không import feature khác. Thứ dùng chung thì đưa xuống `domains/` (dữ liệu) hoặc `shared/` (giao diện, tiện ích).',
  },
];

const otherDemoParts = (own) => [
  {
    regex: `^@/features/demo/(?!(${own}|shared)(/|$))`,
    message:
      'library / composed / dashboard của demo không import lẫn nhau — thứ dùng chung đặt ở `features/demo/shared/`.',
  },
];

const APP_COMPONENTS_API = [
  {
    regex: '^@/app/components/.+',
    message: 'Import màn dùng chung qua barrel `@/app/components`.',
  },
];

const ROUTER_DEEP = [
  {
    regex: '^@/app/router/[^/]+/.+',
    message:
      'Ngoài `src/app/router`, import thư mục con của router (`@/app/router/menu`, `/modules`, `/definition`…), không với vào file bên trong.',
  },
];

const ROUTER_BARREL = [
  {
    regex: '^(@/app/router|\\./router|(\\.\\./)+router)$',
    message:
      '`@/app/router` export `appRoutes` (cây route nạp chính file này) — import nó từ trong app là import vòng. Chỉ `App.tsx` gắn `AppRouter`; thứ khác import thư mục con (`@/app/router/menu`…). Xem docs/rules/structure/routing-conventions.md.',
  },
];

/** Public API của tầng dưới — mọi nơi dùng `core` / UI kit / widget đều phải đi qua. */
const CONSUMER_API = [...CORE_API, ...UI_KIT_API, ...WIDGETS_API];

const APP_API = [...CONSUMER_API, ...DOMAIN_API, ...FEATURE_API, ...APP_COMPONENTS_API];

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
  // features/demo/<phần>: library / composed / dashboard không import lẫn nhau (chung thì ở demo/shared).
  ...DEMO_PARTS.map((part) =>
    restrictImports(
      [`src/features/demo/${part}/**/*.{ts,tsx}`],
      layer('features'),
      CONSUMER_API,
      DOMAIN_API,
      otherFeatures('demo'),
      otherDemoParts(part),
    ),
  ),

  // app + main.tsx: mọi tầng qua public API; router chỉ qua thư mục con, không qua barrel `@/app/router`.
  restrictImports(['src/app/**/*.{ts,tsx}', 'src/main.tsx'], APP_API, ROUTER_DEEP, ROUTER_BARREL),
  // Bên trong router: được với vào file của thư mục con.
  restrictImports(['src/app/router/**/*.{ts,tsx}'], APP_API, ROUTER_BARREL),
  // App.tsx: nơi DUY NHẤT gắn `AppRouter` từ barrel router.
  restrictImports(['src/app/App.tsx'], APP_API, ROUTER_DEEP),
];
