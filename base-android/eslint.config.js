/**
 * ESLint flat config.
 *
 * Nền là `eslint-config-expo/flat` (đã gồm react, react-hooks, import,
 * @typescript-eslint và bộ globals của React Native). Bên trên chồng thêm:
 *
 *   · quy ước sắp xếp prop JSX — giống hệt base web `base-projects`;
 *   · chặn import vòng;
 *   · 5 selector `no-restricted-syntax` bắt những lỗi ĐÃ GÂY BUG THẬT trên
 *     máy người dùng, không phải quy ước thẩm mỹ. Mỗi selector có ghi chú vì sao.
 *
 * ⛔ Đừng tắt bằng `eslint-disable`. Cần ngoại lệ thì sửa rule kèm lý do trong PR.
 */
const js = require('@eslint/js');
const { defineConfig, globalIgnores } = require('eslint/config');
const expoFlat = require('eslint-config-expo/flat');
const perfectionist = require('eslint-plugin-perfectionist');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = defineConfig([
  globalIgnores([
    'node_modules/**',
    'android/**',
    'ios/**',
    '.expo/**',
    'dist/**',
    'coverage/**',
    'expo-env.d.ts',
    // File sinh tự động — sửa ở đây là vô nghĩa, lần sinh sau ghi đè.
    '**/*.generated.js',
    '**/*.generated.ts',
  ]),

  js.configs.recommended,
  ...expoFlat,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    plugins: { perfectionist },
    settings: {
      /**
       * Không có mục này thì `eslint-plugin-import` chỉ biết phân giải theo kiểu
       * Node — mọi import `@/…` thành "unresolved", và `import/no-cycle` bên dưới
       * lặng lẽ không kiểm được đường nào đi qua alias, tức là gần như KHÔNG kiểm
       * gì cả trong dự án này.
       */
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },
    rules: {
      /**
       * Import vòng làm module khởi tạo nửa chừng: một bên nhìn thấy `undefined`
       * thay vì hàm/hằng nó cần. Trên RN lỗi hiện ra ở tận runtime dưới dạng
       * "undefined is not a function", ở một file KHÔNG liên quan tới chỗ sai.
       *
       * `maxDepth: Infinity` để bắt cả vòng dài qua nhiều barrel — kiểu vòng
       * hay gặp nhất khi mỗi thư mục có một `index.ts`.
       *
       * (Base web dùng `madge` cho việc này. Ở đây gộp vào ESLint vì madge@8
       * chưa chạy được với TypeScript 6 — bớt một devDependency và lỗi hiện ngay
       * trong editor thay vì đợi tới lúc chạy script.)
       */
      'import/no-cycle': ['error', { maxDepth: Infinity, ignoreExternal: true }],

      /**
       * ⛔ TẮT có chủ đích, KHÔNG phải vì lười.
       *
       * Rule này cảnh báo khi đọc thuộc tính của một default import trùng tên
       * với một named export — `axios.create` là ví dụ chính xác. Nhưng với
       * axios thì `axios.create`/`axios.isAxiosError` LÀ cách dùng chính thức
       * và có trong tài liệu; đây là cảnh báo sai hoàn toàn. Để bật thì mọi thực
       * thể axios đều đỏ, và người ta sẽ quen mắt bỏ qua cảnh báo — mất luôn giá
       * trị của những cảnh báo thật.
       */
      'import/no-named-as-default-member': 'off',

      /** Khớp với `verbatimModuleSyntax` trong tsconfig. */
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      /** Dependency của hook là ERROR, không phải warn — thiếu deps là bug dữ liệu cũ. */
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // Sắp xếp prop JSX a → z (tự sửa khi save).
      // `key`/`ref` luôn đứng đầu, handler `onXxx` dồn xuống cuối.
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

  {
    files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
    rules: {
      /**
       * ⛔ Global CHỈ CÓ Ở NODE — không tồn tại lúc chạy trên máy thật.
       *
       * `tsconfig.json` nạp `@types/node` cho toàn dự án (test và script cần),
       * mà TypeScript không phân vùng kiểu theo thư mục được. Nên nếu ai viết
       * `Buffer.from(...)` trong một màn hình thì `tsc` VẪN XANH, và app chỉ nổ
       * khi người dùng mở đúng màn hình đó — `ReferenceError: Buffer is not
       * defined`, trên máy thật, sau khi đã phát hành.
       *
       * Hàng rào đặt ở đây vì ESLint phân vùng theo thư mục được: `tests/`,
       * `scripts/` và `app.config.ts` KHÔNG bị rule này áp.
       *
       * `process` KHÔNG nằm trong danh sách: `process.env.EXPO_PUBLIC_*` là cách
       * đọc biến môi trường chính thức của Expo (Metro thay chuỗi lúc build) và
       * được dùng thật ở `src/core/config/env.config.ts`.
       */
      'no-restricted-globals': [
        'error',
        {
          name: 'Buffer',
          message:
            'Buffer chỉ có ở Node, KHÔNG có trên React Native. Cần xử lý base64 thì dùng @/shared/utils/jwt.utils, hoặc gói expo-crypto / js-base64.',
        },
        {
          name: '__dirname',
          message: '__dirname chỉ có ở Node. Đường dẫn tệp trên máy dùng expo-file-system.',
        },
        {
          name: '__filename',
          message: '__filename chỉ có ở Node.',
        },
        {
          name: 'global',
          message: 'Dùng globalThis thay cho global — global là biến riêng của Node.',
        },
        {
          name: 'setImmediate',
          message:
            'setImmediate không có trên Hermes. Dùng setTimeout(fn, 0), hoặc queueMicrotask khi cần chạy trước lượt vẽ kế.',
        },
      ],

      'no-restricted-syntax': [
        'error',

        // ── 1. <Modal> thiếu `supportedOrientations` ────────────────────────
        // <Modal> của React Native dựng một view controller RIÊNG trên iOS. Không
        // khai `supportedOrientations` thì view controller đó rơi về PORTRAIT, và
        // vì nó nằm trên cùng nên CẢ APP hết xoay được chừng nào modal còn mở.
        // Triệu chứng khó lần: người dùng mở bộ lọc, xoay ngang, không có gì xảy
        // ra, đóng bộ lọc thì xoay lại được.
        {
          selector:
            'JSXOpeningElement[name.name="Modal"]:not(:has(JSXAttribute[name.name="supportedOrientations"]))',
          message:
            '<Modal> thiếu `supportedOrientations` ⇒ iPhone khoá màn ở portrait suốt lúc modal mở. Thêm supportedOrientations={["portrait","landscape"]}.',
        },

        // ── 2. So khớp chuỗi KHÔNG bỏ dấu ──────────────────────────────────
        // `x.toLowerCase().includes(y)` không bỏ dấu tiếng Việt: gõ "met khoi"
        // KHÔNG ra "Mét khối", gõ "da nang" không ra "Đà Nẵng". Người dùng kết
        // luận là "tìm kiếm hỏng" chứ không đoán được là phải gõ đủ dấu.
        {
          selector:
            "CallExpression[callee.property.name='includes'][callee.object.callee.property.name='toLowerCase']",
          message:
            '`x.toLowerCase().includes(y)` KHÔNG bỏ dấu — gõ "met khoi" không ra "Mét khối". Dùng `includesSearch` / `matchesSearch` từ `@/shared/utils/format/string.utils`.',
        },

        // ── 3. Ô tìm kiếm controlled ────────────────────────────────────────
        // `<TextInput value={search} onChangeText={setSearch}>` mà state đi qua
        // một nhịp bất đồng bộ (debounce, cập nhật từ query, setState trong
        // effect) sẽ ghi ĐÈ lại ô nhập ngay giữa lúc bộ gõ đang ghép dấu. Trên
        // Android + Telex, đúng lúc đó là mất dấu hoặc nhảy con trỏ về đầu.
        // Cách đúng: ô nhập uncontrolled (`defaultValue`), debounce ở tầng lọc.
        {
          selector:
            "JSXOpeningElement[name.name=/^(TextInput|Input|SearchInput)$/] > JSXAttribute[name.name='value'] > JSXExpressionContainer > Identifier[name=/^(search|searchTerm|searchText|searchValue|searchQuery|query|keyword|filterText)$/i]",
          message:
            'Ô tìm kiếm controlled (`value={search}`) làm mất dấu khi gõ tiếng Việt trên Android. Dùng `{...inputProps}` từ `useSearchInput` (@/shared/ui/search) — ô nhập uncontrolled, debounce ở tầng lọc.',
        },

        // ── 4. Cỡ chữ số cứng, đi vòng qua hệ token ────────────────────────
        // Thang chữ sinh từ `src/styles/typography/typography.json` và được KIỂM
        // lineHeight theo số đo thật của font (xem scripts/generate-typography.mjs).
        // `text-[17px]` bỏ qua toàn bộ khâu đó: không ai kiểm lineHeight, và
        // Android cắt dấu `Ẳ`/`Ộ` mà không có lỗi nào báo.
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/(^|\\s)(text|leading)-\\[/]",
          message:
            'Cỡ chữ/line-height số cứng (`text-[17px]`, `leading-[20px]`) bỏ qua hệ token và khâu kiểm lineHeight cho dấu tiếng Việt. Dùng vai trò có sẵn: text-display|text-header-lg|text-header-md|text-header-sm|text-body-lg|text-body-md|text-label-lg|text-label-md|text-label-sm|text-label-xs|text-caption-lg|text-caption-sm|text-link-lg|text-link-md|text-overline. Cần cỡ mới thì thêm vào src/styles/typography/typography.json rồi `npm run generate:typography`.',
        },

        // ── 5. `className` trên `Animated.*` ────────────────────────────────
        // NativeWind chỉ gắn được `className` vào những thẻ nó ĐÃ đăng ký
        // (`View`, `Text`, `Pressable`…). Thẻ của Reanimated không nằm trong
        // danh sách: prop bị NUỐT — không lỗi, không cảnh báo, chỉ là thẻ không
        // có style nào. Bẫy này đã hỏng thật ở đây và đang được cảnh báo bằng
        // văn xuôi ở BỐN chỗ (`Skeleton.tsx`, `Toggle.tsx`, `BottomSheet.tsx`,
        // `TooltipSheet.tsx`) — bốn lời cảnh báo cho cùng một bẫy nghĩa là văn
        // xuôi không đủ, phải có hàng rào.
        //
        // ✅ Cách đúng đã dùng trong repo: đăng ký một lần rồi gán vào BIẾN —
        //    `const AnimatedView = cssInterop(Animated.View, { className: 'style' });`
        //    Lúc đó tên thẻ JSX là `AnimatedView` (một JSXIdentifier), không
        //    còn là `Animated.View` (JSXMemberExpression), nên selector bám
        //    theo tên là đủ để cho ca đúng đi qua.
        // ✅ Cách đúng thứ hai, cũng đang dùng: để `className` ở `<View>` bọc
        //    ngoài và chỉ đưa `style={animatedStyle}` cho `Animated.View`.
        //
        // ⚠️ Đi kèm một bẫy nữa mà ESLint không thấy được: `height`/`width` phải
        // nằm TRONG animated style. Reanimated ghi đè cả object `style`, khoá
        // nào worklet không trả thì mất.
        {
          selector:
            "JSXOpeningElement[name.type='JSXMemberExpression'][name.object.name='Animated']:has(JSXAttribute[name.name='className'])",
          message:
            '`className` trên `Animated.*` bị NUỐT âm thầm — NativeWind chưa đăng ký thẻ của Reanimated, prop biến mất mà không có lỗi nào báo. Đăng ký một lần rồi dùng biến: `const AnimatedView = cssInterop(Animated.View, { className: "style" })` (xem src/shared/ui/skeleton/Skeleton.tsx), hoặc để `className` ở `<View>` bọc ngoài và chỉ truyền `style={animatedStyle}` cho `Animated.View` (xem src/shared/ui/bottom-sheet/BottomSheet.tsx).',
        },
      ],
    },
  },

  {
    /**
     * Script và file config chạy bằng Node (không phải runtime React Native),
     * nên cần globals của Node — thiếu thì `__dirname`, `process`, `require`
     * đều bị báo `no-undef`.
     */
    files: ['scripts/**/*.{js,mjs}', '*.config.{js,ts}', 'jest.setup.js'],
    languageOptions: { globals: globals.node },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-restricted-syntax': 'off',
    },
  },

  {
    /**
     * File test + file dựng môi trường test được phép dùng globals của Jest.
     * `jest.setup.js` phải có mặt ở đây: nó chạy TRONG Jest nên `jest.mock()`
     * là hợp lệ, nhưng nó không khớp mẫu `*.test.*` nào.
     */
    files: ['tests/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', 'jest.setup.js'],
    languageOptions: { globals: { ...globals.jest, ...globals.node } },
  },
]);
