# Base Android — React Native

Khung dự án **React Native 0.86 + Expo SDK 57 + Expo Router + NativeWind 4 +
TypeScript strict**, dựng theo đúng kiến trúc của base web
[`base-projects`](../base-projects) để hai nền tảng đọc được code của nhau.

**Trong hộp:** hệ token màu 264 × 2 theme · thang chữ 15 vai
trò có **ngưỡng chống Android cắt dấu tiếng Việt đo từ chính file font** · **bộ
component giao diện dựng theo design system BIDV SmartBanking** (25 nhóm) · **bộ
icon 303 cái xuất thẳng từ Figma**, nhuộm được theo token · tầng HTTP có làm mới
token 401 xếp hàng · phiên đăng nhập cất token đúng chỗ (Keychain/Keystore) ·
4 màn hình xác thực · module registry lo thanh tab và phân quyền · 6 lớp gác
chất lượng.

**Không có:** màn hình nghiệp vụ nào — phần đó dựng theo từng dự án. Bộ
component ở `src/shared/ui/`, đọc `src/shared/ui/AGENTS.md` trước khi thêm hay
sửa gì ở đó.

> ⚠️ **Kiểm đăng nhập MẶC ĐỊNH TẮT** (`EXPO_PUBLIC_AUTH_ENABLED=false`) để chạy
> lần đầu vào thẳng được mọi màn hình khi chưa có backend.
> **Dự án thật PHẢI đặt `true`.**

---

## Bắt đầu

```bash
npm install
cp .env.example .env         # sửa EXPO_PUBLIC_API_BASE_URL trỏ về backend của bạn

npx expo prebuild            # sinh thư mục android/ và ios/ (chạy MỘT lần)
npm run android              # dựng và cài bản dev-client lên máy/máy ảo
```

Lần sau chỉ cần `npm start` (Metro) — trừ khi thêm gói có phần native, lúc đó
phải `npm run android` lại.

> ⛔ **Base này KHÔNG chạy trên Expo Go.** Nó dùng `expo-dev-client` và font nhúng
> lúc build. Expo Go không nạp được font nhúng và không có module native của dự
> án — chữ sẽ rơi về font hệ thống và một số màn hình lỗi. `npm run start:go` có
> sẵn để thử nhanh, nhưng đừng đánh giá giao diện qua đó.

| Lệnh                        | Việc                                                                 |
| --------------------------- | -------------------------------------------------------------------- |
| `npm start`                 | Metro (dev-client)                                                   |
| `npm run start:clear`       | Metro + xoá cache — **bắt buộc sau khi sửa `.env`**                  |
| `npm run android` / `ios`   | Dựng bản native rồi cài lên máy                                      |
| `npm run prebuild`          | Sinh lại `android/` + `ios/` từ `app.config.ts`                      |
| `npm run typecheck`         | `tsc --noEmit`                                                       |
| `npm run lint` / `lint:fix` | ESLint                                                               |
| `npm test`                  | Jest                                                                 |
| `npm run check`             | Chạy hết: typecheck → lint → kiểm import → **kiểm class** → test     |
| `npm run check:imports`     | Gói được import nhưng chưa khai trong `package.json`                 |
| `npm run check:classes`     | Class Tailwind CHẾT (`text-body`, `rounded-2xl`) — xem bên dưới      |
| `npm run check:orphans`     | File không ai với tới + gói khai mà không ai import (knip)           |
| `npm run check:deps`        | Đối chiếu version gói với SDK đang dùng (`expo install --check`)     |
| `npm run doctor`            | `expo-doctor` — soát cấu hình native                                 |
| `npm run generate:styles`   | Sinh lại token màu + thang chữ + hình học (gọi cả `generate:layout`) |

---

## Cấu trúc

```
app/                        CÂY ROUTE (Expo Router) — file MỎNG, chỉ trỏ tới màn hình
├── _layout.tsx             gốc: providers + chặn vẽ tới khi biết trạng thái phiên
├── (auth)/                 nhóm KHÁCH — đăng nhập, đăng ký, quên/đặt lại mật khẩu
├── (app)/                  nhóm ĐÃ ĐĂNG NHẬP — thanh tab đọc MODULE_REGISTRY
├── demo/                   THƯ VIỆN COMPONENT — ⛔ đồ bỏ đi khi giao dự án thật
└── +not-found.tsx

src/
├── shell/                  VỎ ỨNG DỤNG — biết về ứng dụng CỤ THỂ này
│   ├── config/             PATHS, hằng số của app
│   ├── providers/          Gesture → Keyboard → SafeArea → Query → Theme → Toast
│   ├── navigation/         MODULE_REGISTRY + lọc quyền
│   ├── session/            khôi phục phiên lúc khởi động
│   └── store/              zustand: auth · theme
│
├── core/                   HẠ TẦNG — KHÔNG biết gì về giao diện
│   ├── api/                axios + interceptor, làm mới token, module auth
│   ├── config/             env, query-client, zod tiếng Việt, hằng số auth
│   └── storage/            kho khoá OS (token) + AsyncStorage (dữ liệu thường)
│
├── features/               NGHIỆP VỤ — auth · home · profile · settings · demo
├── shared/                 DÙNG CHUNG, không phụ thuộc feature
│   ├── ui/                 BỘ COMPONENT — 27 thư mục, 25 nhóm nối vào barrel ui/index.ts
│   │   ├── feedback/       toast (hạ tầng, KHÔNG nằm trong barrel — xem chú thích ở đó)
│   │   └── icon/           <Icon /> + tên sinh tự động (ngoài barrel, nhập từ @/shared/ui/icon)
│   ├── theme/              token màu + chữ + hình học (SINH TỰ ĐỘNG) và hook đọc màu thô
│   ├── form/               useZodForm
│   ├── utils/              format · style · jwt · toast
│   └── constants/
└── styles/                 global.css + token, MỖI NHÓM MỘT THƯ MỤC
    ├── colors/             colors.json → colors.generated.js
    ├── typography/         typography.json → typography.generated.js
    └── layout/             layout.json → layout.generated.js
```

### ⛔ Vì sao vỏ ứng dụng tên là `src/shell` chứ không phải `src/app`

Bên web, `src/app/` là vỏ ứng dụng. Ở đây **không đặt tên đó được**, và đây là
một cái bẫy đã sập một lần trong lúc dựng base:

**Expo Router tự dò thư mục route, và nó ưu tiên `src/app` HƠN `app/` ở gốc.**
Nếu `src/app/` tồn tại, Expo Router lặng lẽ coi nó là cây route:

- toàn bộ `app/` ở gốc bị **bỏ qua**, không màn hình nào còn tồn tại;
- mỗi file trong đó thành một "route", kể cả `store/types.ts`;
- **build vẫn XANH**, không cảnh báo nào, app chỉ hiện một màn trống.

Dấu hiệu duy nhất là một dòng log rất dễ trôi qua:
`Using src/app as the root directory for Expo Router`.

`tests/project-structure.test.ts` chốt cứng: `src/app/` không được phép tồn tại.

| Web (`base-projects`)                | Mobile (ở đây)                  | Ghi chú                          |
| ------------------------------------ | ------------------------------- | -------------------------------- |
| `src/app/` (vỏ + router)             | `src/shell/` + `app/`           | tách đôi vì lý do trên           |
| `src/core/`                          | `src/core/`                     | giống hệt                        |
| `src/features/`                      | `src/features/`                 | giống hệt                        |
| `src/shared/`                        | `src/shared/`                   | giống hệt                        |
| `src/styles/theme/colors-theme.json` | `src/styles/colors/colors.json` | cùng nguồn, tách theo nhóm token |

---

## Những quyết định đáng biết trước khi sửa

### Token đăng nhập cất ở đâu — và vì sao KHÔNG phải AsyncStorage

Bên web, refresh token nằm trong cookie `HttpOnly`: JavaScript không bao giờ
nhìn thấy nó. Trên di động **không có cơ chế tương đương**. Nên:

| Thứ               | Chỗ để                              | Vì sao                                            |
| ----------------- | ----------------------------------- | ------------------------------------------------- |
| Access token      | Bộ nhớ (zustand, **không** persist) | Sống ngắn; tắt app là mất                         |
| **Refresh token** | **`expo-secure-store`**             | Keychain/Keystore — mã hoá bởi OS, ràng vào máy   |
| Hồ sơ người dùng  | `AsyncStorage`                      | Không nhạy cảm; cần đọc nhanh để vẽ khung màn đầu |

⛔ **AsyncStorage KHÔNG mã hoá.** Trên Android nó là một file SQLite thường
trong thư mục app — đọc được trên máy đã root (rất phổ biến ở công trường / máy
dùng chung) hoặc qua một bản sao lưu ADB. Refresh token lộ = chiếm phiên vô thời
hạn.

Sau khi mở lại app, access token được dựng lại bằng một lượt refresh
(`useSessionBootstrap`). Kẻ đọc được `AsyncStorage` không có gì để dùng.

### Làm mới token: BA kết quả, không phải boolean

`refreshSession()` trả về một trong ba, và **không được gộp lại**:

| Kết quả                                | Xử lý                                            |
| -------------------------------------- | ------------------------------------------------ |
| `ok`                                   | Chạy lại request gốc, xả hàng đợi                |
| `unauthenticated` (400/401/403)        | Máy chủ nói thẳng phiên đã chết → dọn sạch phiên |
| `unavailable` (mất sóng, 5xx, quá hạn) | **GIỮ NGUYÊN phiên** — kể cả refresh token       |

Gộp hai nhánh cuối là bug kinh điển, và trên di động nó nặng hơn web nhiều: một
cú chập sóng khi đi qua hầm gửi xe sẽ đăng xuất người dùng và xoá mất biểu mẫu
họ đang điền dở giữa công trường — trong khi phiên thật ra vẫn còn hiệu lực.

`tests/core/session.test.ts` chốt cả ba nhánh (16 test).

### Thang chữ: ngưỡng lineHeight ĐO TỪ FILE FONT

Tiếng Việt xếp dấu **chồng hai tầng** (`Ẳ` = A + dấu á + dấu hỏi). Khi
`lineHeight` quá sát `fontSize`, **Android cắt cụt phần dấu** — người dùng thấy
"A" thay vì "Ẳ". iOS thì cho tràn ra ngoài chứ không cắt, nên lỗi **chỉ hiện
trên Android** và rất dễ lọt qua khâu review làm trên máy Mac.

`scripts/lib/font-metrics.mjs` mở file `.ttf`, tra bảng `cmap` lấy mã glyph của
từng ký tự tiếng Việt rồi đọc hộp bao của chúng trong bảng `glyf`. Số đo thật
của Plus Jakarta Sans — font của design system BIDV (đo 2026-09-08):

| Nét      | Chỉ Latin | Latin + tiếng Việt |
| -------- | --------- | ------------------ |
| Regular  | 0.98em    | 1.409em            |
| Medium   | 0.98em    | 1.436em            |
| SemiBold | 0.98em    | 1.463em            |
| **Bold** | 0.98em    | **1.495em**        |

Cao nhất là `Ẳ`, thấp nhất là `Ạ`. **Tiếng Việt cần hơn 45% chiều cao so với
cùng font chạy Latin** — đó là lý do một thang chữ chép từ dự án tiếng Anh về
gần như luôn cắt dấu.

Hai bậc ngưỡng, `generate-typography.mjs` chặn cứng khi vi phạm:

- **1.50×** cho vai trò IN HOA (`overline`) — nhãn kiểu "ĐỊA CHỈ" có cả `Ẳ` lẫn
  `Ạ` trên cùng một dòng. (Con số này = nét Bold ở bảng trên, làm tròn lên.)
- **1.30×** cho chữ thường/hỗn hợp — trên chiều cao dòng tự nhiên của font
  (1.265×), và chữ thường có dấu thấp hơn hẳn bản in hoa.

Đổi font là ngưỡng tự đo lại, không có con số cũ nào kẹt lại.

### Design token sinh từ JSON, không viết tay

**Một thư mục cho một nhóm token.** Mỗi thư mục chứa đúng hai file cùng tên: bản
NGUỒN (`.json`, sửa tay) và bản SINH RA (`.generated.js`, cho `tailwind.config.js`).
Bản sinh cho TypeScript nằm ở `src/shared/theme/` vì code app đọc qua `@/shared/theme`.

```
src/styles/
├── colors/
│   ├── colors.json                ──generate:colors──────▶ colors.generated.js
│   └── colors.generated.js                                 + shared/theme/colors.generated.ts
├── typography/
│   ├── typography.json            ──generate:typography──▶ typography.generated.js
│   └── typography.generated.js                             + shared/theme/typography.generated.ts
└── layout/
    ├── layout.json                ──generate:layout─────▶ layout.generated.js
    └── layout.generated.js                                 + shared/theme/layout.generated.ts

assets/icons/**.svg                ──generate:icons──────▶ shared/ui/icon/icons.*.generated.ts
```

`npm run generate:styles` chạy cả ba nhóm token một lượt.

⛔ **Ba nhóm này KHÔNG được gộp lại một thư mục.** Chúng đổi vì những lý do khác
nhau và theo nhịp khác nhau:

| Nhóm         | Đổi khi nào                                | Ràng buộc riêng                         |
| ------------ | ------------------------------------------ | --------------------------------------- |
| `colors`     | đổi nhận diện thương hiệu, thêm trạng thái | phải có ĐỦ cặp light/dark               |
| `typography` | chỉnh thang chữ, đổi font                  | lineHeight bị kiểm theo số đo font thật |
| `layout`     | bản thiết kế chỉnh bo góc, giãn cách       | số đo hình học, giống nhau ở mọi theme  |

Gộp chung thì mỗi lần chỉnh một con số bo góc lại phải mở file có 264 mã màu, và
`git blame` trên file đó không còn nói lên điều gì.

Đổi màu hay cỡ chữ → sửa **file JSON** rồi chạy lại script.
⛔ Đừng sửa file `*.generated.*` — lần chạy sau ghi đè sạch.

Trong code:

```tsx
<View className="bg-bg-1 border-border-1">     {/* ✅ token */}
<Text className="text-body-lg text-fg-2">     {/* ✅ vai trò chữ */}

<View className="bg-white border-gray-200">   {/* ❌ */}
<Text className="text-[17px]">                {/* ❌ ESLint chặn */}
```

Prop nhận **màu thô** (`tabBarActiveTintColor`, `<ActivityIndicator color>`,
`fill`/`stroke` của SVG) thì dùng `useThemeColors()` — xem
`src/shared/theme/use-theme-colors.ts`.

⚠️ NativeWind 4 chạy trên **Tailwind 3.4**, không phải Tailwind 4 như web. Cú
pháp `@theme`, `oklch()` và các tiện ích chỉ có ở v4 KHÔNG dùng được.

### `cn()` cần `tailwind-merge`, dù nhiều người nói NativeWind không cần

NativeWind áp style theo **độ ưu tiên CSS**, KHÔNG theo thứ tự bạn viết trong
chuỗi className. Nên chỉ nối chuỗi thì:

```tsx
<Button className={cn(base, 'bg-error-5')} /> // base có 'bg-primary-6'
```

class nào thắng phụ thuộc thứ tự Tailwind sinh ra chúng — tức là gần như ngẫu
nhiên với người viết. Prop `className` truyền từ ngoài vào lúc đè được lúc không.

Thêm nữa, thang chữ ở đây theo **vai trò** (`text-body-lg`) và thay thế thang mặc
định. `tailwind-merge` gặp một `text-*` lạ sẽ đoán đó là **màu chữ**, nên
`cn('text-header-md', 'text-fg-2')` làm **biến mất cỡ chữ**. `twMergeConfig` trong
`cn.ts` khai các vai trò vào nhóm `font-size` để chặn ca đó — và **phải truyền
cùng config đó vào mọi recipe `tv()`**, vì `tailwind-variants` tạo thực thể
`twMerge` riêng của nó. Xem bản mẫu ở `src/shared/ui/button/button.styles.ts`.

### Biến môi trường: phải viết ĐỦ TÊN ngay tại chỗ đọc

Metro không đọc biến môi trường lúc chạy — nó **thay chuỗi vào bundle lúc build**:

```ts
process.env.EXPO_PUBLIC_API_BASE_URL; // ✅ được thay bằng giá trị thật

const key = 'EXPO_PUBLIC_API_BASE_URL';
process.env[key]; // ⛔ luôn undefined, không lỗi, không cảnh báo
```

Đó là lý do `src/core/config/env.config.ts` có một khối `RAW` liệt kê từng biến
một thay vì một hàm `getStr(key)` gọn gàng như bên web (Vite đọc
`import.meta.env` lúc chạy nên bên đó viết hàm được).

⛔ Thêm biến mới = thêm **hai** dòng: một vào `RAW`, một vào `types/env.d.ts`.
⛔ Sửa `.env` xong phải `npm run start:clear` — Metro đã cache bundle có giá trị cũ.
⛔ Mọi biến `EXPO_PUBLIC_*` nằm trong APK. `unzip` là đọc được. Không đặt secret.

### Thêm phân hệ = 1 file route + 1 dòng registry

```tsx
// 1. app/(app)/reports.tsx
export default function ReportsRoute() {
  return <ReportsScreen />;
}
```

```ts
// 2. src/shell/navigation/module-registry.ts
{
  id: 'report',                    // cũng là `resource` khi kiểm quyền
  name: 'reports',                 // PHẢI trùng TÊN FILE ở bước 1
  href: '/reports',
  title: 'Báo cáo',
  icon: 'chart-1',                 // tên THẬT trong `assets/icons/system`
  permission: { resource: 'report', action: 'view' },
}
```

Thanh tab, thứ tự tab và việc lọc quyền tự đi theo.

⛔ `name` sai một ký tự thì tab hiện ra nhưng bấm vào không có gì — không lỗi nào báo.
⛔ Lọc quyền chỉ có **một** nơi: `useAccessibleModules()`. Chỗ nào tự lọc riêng
thì sớm muộn hai bộ luật lệch nhau. Và nó là lọc để **hiển thị**, không phải hàng
rào bảo mật — hàng rào thật nằm ở backend.

### Khai `PATHS` thì PHẢI có file route

Bẫy này đã sập một lần ở base web: `PATHS.PROFILE` được khai và menu điều hướng
tới, nhưng không route nào mount nó — bấm vào ra màn 404. `tsc` không thấy (chuỗi
vẫn hợp lệ), lint cũng không. `tests/project-structure.test.ts` đối chiếu hai
danh sách.

---

## Sáu lớp gác chất lượng

| Lớp             | Bắt gì                                                                 |
| --------------- | ---------------------------------------------------------------------- |
| `tsc --noEmit`  | Kiểu, kèm `noUncheckedIndexedAccess` (`arr[0]` là `T \| undefined`)    |
| ESLint          | Import vòng · dependency của hook · **5 luật riêng bên dưới**          |
| `check:imports` | Gói được import nhưng chưa khai trong `package.json`                   |
| `knip`          | File không ai với tới · gói khai mà không ai dùng                      |
| Jest            | 419 test / 38 suite — phiên, token, so khớp tiếng Việt, cấu trúc route |
| Husky           | Chạy 3 lớp đầu trước mỗi commit + commitlint                           |

### Năm luật ESLint riêng — mỗi luật chặn một bug đã xảy ra thật

1. **`<Modal>` thiếu `supportedOrientations`** — trên iOS, `<Modal>` dựng một
   view controller riêng; không khai thì nó rơi về portrait và **cả app hết
   xoay** chừng nào modal còn mở. Triệu chứng: mở bộ lọc, xoay ngang, không có
   gì xảy ra; đóng bộ lọc thì xoay lại được.

2. **`x.toLowerCase().includes(y)`** — không bỏ dấu. Gõ "met khoi" không ra
   "Mét khối", gõ "da nang" không ra "Đà Nẵng". Dùng `includesSearch` /
   `matchesSearch`.

3. **Ô tìm kiếm controlled** (`<TextInput value={search}>`) — state đi qua một
   nhịp bất đồng bộ sẽ ghi đè ô nhập giữa lúc bộ gõ đang ghép dấu. Trên Android
   - Telex là mất dấu hoặc nhảy con trỏ.

4. **Cỡ chữ số cứng** (`text-[17px]`, `leading-[20px]`) — đi vòng qua khâu kiểm
   lineHeight cho dấu tiếng Việt.

5. **Global chỉ có ở Node** (`Buffer`, `__dirname`, `global`, `setImmediate`)
   trong `app/` và `src/` — `tsconfig` nạp `@types/node` cho toàn dự án (test và
   script cần), mà TypeScript không phân vùng theo thư mục được. Không có luật
   này thì `Buffer.from(...)` trong một màn hình vẫn qua được `tsc` và chỉ nổ
   trên máy thật, sau khi đã phát hành.

⛔ Đừng tắt bằng `eslint-disable`. Cần ngoại lệ thì sửa rule kèm lý do trong PR.

---

## Khác gì so với `vci-sun-mobile`

Dự án đó là bản tham chiếu tốt cho nhiều thứ và base này học lại khá nhiều từ nó
(bẫy Metro trên Windows, thang chữ theo vai trò, luật `<Modal>`). Những chỗ base
này làm khác — kèm lý do:

| Chỗ                | `vci-sun-mobile`                                                            | Ở đây                                                                        |
| ------------------ | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Refresh token**  | AsyncStorage — **văn bản trần**                                             | `expo-secure-store` (Keychain/Keystore)                                      |
| Điều hướng         | React Navigation khai bằng code, `ParamList` tự đồng bộ tay                 | Expo Router — typed routes, deep link tự động                                |
| Biến môi trường    | `app.json` → `extra`, tiền tố `VITE_` (di sản của web)                      | `.env` + `EXPO_PUBLIC_*`, có kiểu                                            |
| Thư viện UI        | gluestack-ui v5 — kéo ~30 gói `@react-aria`/`@react-stately` (thư viện web) | NativeWind + `tv()`, code nằm trong repo                                     |
| `cn()`             | Chỉ nối chuỗi — "NativeWind tự xử lý xung đột"                              | `clsx` + `tailwind-merge` (xem mục trên)                                     |
| Ngưỡng lineHeight  | Con số 1.3 viết cứng trong tài liệu                                         | **Đo từ file font**, chặn cứng lúc sinh                                      |
| Prettier           | Không có; CLAUDE.md dặn "⛔ đừng chạy prettier"                             | Có, cấu hình sẵn, chạy trong pre-commit                                      |
| Test               | Không có                                                                    | Jest + RNTL, 419 test                                                        |
| Husky / commitlint | Không có                                                                    | Có                                                                           |
| Thang chữ          | 3 thang chồng nhau (`text-xs`, `d-*`, vai trò)                              | 1 thang duy nhất theo vai trò                                                |
| `borderRadius`     | Ép về 0 toàn app (yêu cầu riêng của dự án đó)                               | **GHI ĐÈ** thang Tailwind — `rounded-sm` = 16dp, `rounded-2xl` là class chết |

---

## Nợ kỹ thuật đã biết

Ghi ra để người sau khỏi tưởng là cố ý:

- **Bộ component chưa có bản bọc `react-native-webview`.** `docs/rules/webview.md`
  mô tả đủ quy định hiển thị cho màn webview, nhưng repo chưa cài gói đó (nó là
  native module: thêm vào là phải `prebuild` và dựng lại dev client). Dự án nào
  cần webview thật thì cài rồi dựng bản bọc theo tài liệu đó.

- **Trang demo chưa có test.** `app/demo/` + `src/features/demo/` chỉ được
  `tsc` và `check:classes` soát. Cố ý: nó là đồ bỏ đi khi giao dự án, viết test
  cho nó là tạo thêm thứ phải xoá.

- **Style của NativeWind KHÔNG có trong test.** Biên dịch Tailwind là việc của
  Metro, mà Jest không chạy Metro — element render ra có `style` rỗng. ⛔ Đừng
  viết `expect(el).toHaveStyle({ padding: 16 })`, nó luôn đỏ và người viết sẽ
  tưởng component sai. Test **hành vi** thay vì hình thức; hệ token đã được kiểm
  riêng ở `tests/theme/tokens.test.ts`. (`nativewind/test` có `render` tự biên
  dịch Tailwind, nhưng bản phát hành chứa JSX chưa biên dịch nên Jest không nạp
  được — đã thử 2026-09-08.)

- **Bộ icon đã xong** — 303 tên xuất từ Figma, dùng qua `<Icon name="…" />`
  (`npm run generate:icons`). `@expo/vector-icons` đã được gỡ khỏi dự án.

- **Ba gói native cài sẵn nhưng chưa dùng**: `expo-image`, `@shopify/flash-list`,
  `react-native-svg` (đã khai trong `knip.json` để không bị báo thừa). Cố ý: cả
  ba gần như chắc chắn dùng tới ở đợt giao diện, và thêm gói native SAU thì phải
  `prebuild` + dựng lại bản dev-client. Gộp vào một lượt build ngay từ đầu.

- **Icon và màn hình chờ vẫn là ảnh mẫu của Expo.** Thay `assets/images/` trước
  khi phát hành.

- **NativeWind 5 (hỗ trợ Tailwind 4) vẫn là bản `preview`.** Bản `5.0.0-preview.4`
  ra 2026-05-15 và chưa có bản preview mới, trong khi nhánh 4.x vẫn ra bản vá
  (4.2.6 — 2026-06-22). Giữ 4.x cho tới khi v5 lên `latest`; nâng xong thì
  `tailwind-merge`/`tailwind-variants` mới thật sự khớp phiên bản Tailwind.

- **Chưa có E2E.** Chỉ có Jest. Thêm Maestro hoặc Detox khi có luồng thật để chạy.

- **Chưa nối EAS Build.** `EAS_PROJECT_ID` đã có chỗ trong `.env`, nhưng chưa có
  `eas.json`.

---

## Ghi chú vận hành

- **Máy ảo Android không hiểu `localhost`** — đó là chính máy ảo. Dùng
  `http://10.0.2.2:5000`, hoặc IP LAN của máy dev khi chạy trên máy thật.
- **Sửa `.env` → `npm run start:clear`.** Reload thôi là chạy giá trị cũ.
- **Windows:** `metro.config.js` chặn `node_modules/*/android/build/` khỏi tầm
  Metro. Không phải để chạy nhanh hơn — để Metro **khỏi chết**. Không có
  watchman, `metro-file-map` dùng `FallbackWatcher` và nó `lstat` phải những tên
  thư mục Gradle sinh ra mà Windows không xử lý được (có cả ký tự `?` giữa đường
  dẫn). Trước khi chết hẳn, watcher đã hỏng nên sửa file không còn ăn — triệu
  chứng giống hệt "quên reload".

---

## Quy tắc code

`docs/rules/` — đọc trước khi sửa mảng tương ứng:

| Sắp sửa gì                 | Đọc                                      |
| -------------------------- | ---------------------------------------- |
| Bất kỳ JSX nào             | `styling-nativewind.md` · `mobile-ux.md` |
| Cấu trúc thư mục, đặt tên  | `feature-structure.md` · `code-style.md` |
| Gọi API                    | `api-patterns.md`                        |
| Route, guard, thanh tab    | `navigation.md`                          |
| Form, kiểm dữ liệu         | `form-validation.md`                     |
| Viết test                  | `testing.md`                             |
| Component dùng chung       | `ui-components.md`                       |
| Bố cục, tablet, xoay ngang | `responsive.md`                          |
| Màn hình webview           | `webview.md`                             |

`AGENTS.md` là bản rút gọn cho AI agent (`CLAUDE.md` trỏ tới đó).

---

## Đợt tiếp theo

Base này đã xong phần **nền, cấu hình chung, hệ token, bộ component và bộ icon**.
Việc còn lại, theo thứ tự đề nghị:

~~1. Bộ component giao diện~~ · ~~2. Bộ icon~~ · ~~3. Màn hình mẫu ghép sẵn~~ —
đã xong: 25 nhóm component trong `src/shared/ui/`, 303 icon sinh từ Figma, và
thư viện component chạy được trong app tại `/demo` (gồm cả trang mẫu bố cục).

Còn lại:

1. **EAS Build** + phân phối nội bộ.
2. **Bản bọc webview** khi dự án đầu tiên cần tới (xem mục nợ kỹ thuật).
3. **Thay icon và màn hình chờ** bằng bộ nhận diện của dự án.

# base-android

# base-android
