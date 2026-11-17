# Kiến trúc — các quyết định đáng biết trước khi sửa

> Mỗi mục: **quyết định** · **vì sao** · **luật chi tiết ở đâu**. Luật đầy đủ nằm ở `docs/rules/`; file này
> chỉ giữ phần "vì sao" để người sau không lật ngược một quyết định đã trả giá. Mục lục: [`README.md`](README.md).

---

## 1. Tầng và chiều phụ thuộc — ESLint chặn cứng

```
app → features → domains → shared → core
```

Mũi tên là chiều ĐƯỢC PHÉP import. `core` không import tầng nào; `shared` chỉ import `core`; feature không
import feature khác và không import `app`. Từ bên ngoài, một domain / feature chỉ được import qua `index.ts` của
nó (`@/domains/session`, `@/features/auth`); trang được router nạp lười bằng `import()` động.

**Tầng dưới cần hành vi của tầng trên thì nhận qua tham số** ở `src/app/bootstrap.ts`, không import ngược.
Ví dụ thật: `core/http` cần access token và cách làm mới nó nhưng không được biết store nằm đâu:

```ts
configureHttp({ auth: { getAccessToken, refreshAccessToken } }); // hai hàm của @/domains/session
```

Vì sao: tầng nào cũng thay / test được độc lập; vòng import không thể xuất hiện giữa các tầng. Luật ở đầu
`eslint.config.js` (`npm run lint` đỏ khi vi phạm) · `quality-gates.md`.

## 2. UI kit chia theo chức năng, import qua một barrel

`src/shared/ui` chia theo **việc component làm** (`primitives/ feedback/ actions/ inputs/ selects/ pickers/
overlays/ navigation/ data-display/ surfaces/ media/ layout/ form/ icons/`), không theo bậc "atomic". Khi cần
một component, người ta nhớ _nó làm gì_ ("chọn ngày"), không nhớ nó thuộc bậc trừu tượng nào.

Code ngoài UI kit import qua `@/shared/ui`; chỉ ba đường import sâu có lý do (`icons/Icons`, `media/image-annotator`,
`overlays/modal.theme`). Mọi file component đọc theo cùng thứ tự (imports → types → bảng `*_CLASSES` → khối tài
liệu + component → export), biến thể là bảng `satisfies Record<…>` — thiếu ô là `tsc` đỏ.
Luật: `ui-kit-architecture.md` · `component-structure.md` · catalog `reuse-first.md`.

## 3. Bố cục trang: một công thức, một nguồn lề

Mọi trang nội dung ghép bằng bốn hộp của `layout/`, không gõ tay class:

```tsx
<PageShell>                       {/* vỏ — KHÔNG đệm, layout ngoài đã cấp lề */}
  <TitleScreen title="…" />
  <Toolbar left={…} right={…} />  {/* cụm trái nở, cụm phải ghim */}
  <PageBody overflow="hidden">    {/* chiếm phần còn lại; đây mới là chỗ cuộn */}
    <BoxPanel>…</BoxPanel>
  </PageBody>
</PageShell>
```

- ⛔ **Một trang một tầng tên.** Trang đã có `<PageHeader>` (tên trang nằm trên thanh header, tab của trang lên header từ `xl`,
  dưới `xl` là dải gạch chân trong trang) thì BỎ `TitleScreen` ở
  trên — hành động của trang đi cùng hàng dải KPI, căn giữa dọc (`page-structure.md §3b`).
- ⛔ **Trang KHÔNG tự thêm đệm.** Lề do `SHELL_GUTTER_X` / `SHELL_GUTTER_Y` (`shared/constants/layout.constants.ts`)
  cấp MỘT lần ở `AppShellLayout`, và thanh header đọc cùng hằng đó — header, nội dung, mép logo nằm trên một lưới.
  Trước khi có `PageShell`, bốn trang tự thêm `p-2` lên nền `p-4`: đi giữa hai trang là cả nội dung nhảy 8px.
- ⛔ `min-h-0` trong `PageShell` / `PageBody` không phải để đẹp: flex item mặc định `min-height: auto` nên không
  co nhỏ hơn nội dung — thiếu nó thì bảng **đẩy cả trang dài ra** thay vì cuộn trong khung.
- Ba lưới, đừng lẫn: `BoxGrid` (thẻ / panel — khai bề ngang một ô) · `FormGrid` (field — khai số cột) ·
  `DemoGrid` (chỉ trang trưng bày).

Luật: `page-structure.md` · `spacing-system.md` (ESLint chặn trang tự đệm).

## 4. Design token sinh từ JSON, không viết tay

```
src/styles/theme/colors-theme.json  ──generate:colors──▶  generated-colors.css · shared/theme/colors.generated.ts
src/styles/font/font.json           ──generate:font────▶  generated-font.css
src/assets/icons/*.svg              ──generate:icons───▶  assets/icons/index.tsx · shared/ui/icons/index.ts   ⛔ hiện KHÔNG chạy (known-issues.md)
src/assets/vci-icons/*.svg          ──generate:vci-icons─▶  shared/ui/icons/vci-icon/vci-icons.generated.ts
```

189 token màu × 2 theme (sáng / tối), 14 thang chữ × 4 độ đậm. Đổi màu / cỡ chữ → sửa **file JSON** rồi chạy
lại script (`generate:styles` tự chạy trong `npm run build`). ⛔ Không sửa file `*.generated.*` / `generated-*`
— lần chạy sau ghi đè. ⛔ **KHÔNG chạy `generate:icons` / `generate:images`** — generator đang lệch registry đã
commit (xem `known-issues.md`). `generate:vci-icons` thì chạy được: bộ icon nhận diện VCI (SVG vẽ tay, 3 lớp
`duo` · `line` · `dot`) sinh dữ liệu cho `VciIcon`; test `vci-icons` gác lưới, nét, lớp và dữ liệu sinh khớp nguồn.

Vì sao: một nguồn cho cả CSS lẫn TS (chart canvas cần giá trị màu), và test (`color-tokens`, `font-tokens`) chặn
class màu / chữ không tồn tại — Tailwind im lặng bỏ qua class sai. Luật: `color-system.md` · `font-system.md` ·
`icon-conventions.md` · `vci-icon-system.md`.

## 5. Nhóm "sống & tự chạy" — và luật giảm chuyển động

`AnimatedNumber`, `ScrollBoard`, `RankingBoard`, `CapsuleChart`, `LiquidGauge` tự làm một việc theo thời gian
(học từ giao diện bảng điều khiển lớn kiểu DataV); `SummaryCard`, `CompactKpiCard`, `SummaryPill` đếm số theo
mặc định. Vì sao: trên màn 20 con số, số nhảy phịch thì mắt không bắt được cái nào vừa đổi — chuyển động là thứ
thị giác ngoại vi nhạy nhất.

⛔ Mọi hiệu ứng TỰ CHẠY phải hỏi `usePrefersReducedMotion()` và **nhảy thẳng tới trạng thái cuối** (không phải
chạy nhanh hơn) — chuyển động không mong muốn gây chóng mặt thật với người rối loạn tiền đình. Test
`smart-live.test.tsx` chốt luật này. Tắt từng chỗ bằng `animate={false}` (thẻ KPI) hoặc `disabled` /
`disableAnimation`; nên tắt khi số nằm trong bảng dài.

## 6. Phiên đăng nhập

**Access token KHÔNG nằm trong localStorage.** `session.store.ts` chỉ persist `user`; `accessToken` sống trong bộ
nhớ, refresh token ở cookie HttpOnly do BE đặt. Sau F5 phiên dựng lại bằng một lượt refresh. Đổi lại cho "tiện"
là mở cửa cho XSS lấy trọn phiên.

**Một đường refresh cho mọi tình huống.** Khởi động tab, request ăn 401, tab khác vừa đăng nhập — tất cả đi qua
`refreshSession()` (nội bộ `domains/session/lifecycle`) và nhận cùng một kiểu kết quả. Ba nhánh, đừng gộp:

| Kết quả                                    | Lúc khởi động                     | Khi request ăn 401                              |
| ------------------------------------------ | --------------------------------- | ----------------------------------------------- |
| `ok`                                       | Vào ứng dụng                      | Phát lại request gốc bằng token mới             |
| `unauthenticated` (BE trả 400 / 401 / 403) | Về `/login`, nhớ URL định vào     | Xoá phiên → `AuthGuard` đưa về `/login`         |
| `unavailable` (mất mạng, 5xx, payload sai) | Màn "Thử lại", **giữ nguyên URL** | **Giữ nguyên phiên**, request fail như lỗi mạng |

Ba bất biến (test `session-lifecycle`, `http-client`): **single-flight** — N request cùng hết hạn → một lời gọi
refresh (trong tab bằng promise chung, giữa các tab bằng Web Locks; refresh token xoay vòng ở BE, bắn song song là
phiên chết oan) · **kết quả cũ không ghi đè phiên mới** · **đa tab** — đăng xuất / đăng nhập ở tab này thì tab
khác tự cập nhật (`BroadcastChannel`), cache React Query được dọn khi phiên kết thúc hoặc đổi người
(`app/bootstrap.ts`). Luật: `async-safety.md` · `security-checklist.md` · `notes/code/domains.md`.

## 7. Lỗi HTTP: một hình dạng, báo một lần

Mọi lỗi ra khỏi `apiClient` là `AppError` (`@/core/http`): `kind` để quyết định xử lý, `message` là câu tiếng Việt
hiển thị được ngay, `fieldErrors` gắn thẳng vào form (`useServerErrors`). Tầng HTTP **không tự toast**: thông báo
nằm ở `QueryCache` / `MutationCache` (`core/query`), nên một lỗi báo đúng một lần và chỉ SAU khi đã thử lại xong;
lỗi nào được báo, câu nào — một chỗ quyết (`claimErrorMessage`). Màn tự vẽ lỗi thì khai `meta: { silentError: true }`;
request huỷ bằng `AbortSignal` không bao giờ bị báo. Hàm API trả payload qua `readData(response, schema?)` — nơi
xác nhận `data` có thật và, với payload quan trọng, đúng schema Zod. Luật: `api-patterns.md`.

## 8. Route khai MỘT chỗ

Thêm phân hệ = một file `src/app/router/modules/{id}.routes.ts` + một dòng trong `MODULE_REGISTRY`. Từ khai báo
đó dựng ra TẤT CẢ: route, guard quyền, mục Dock, bộ chọn phân hệ + dải điều hướng phân hệ trên header (route con có
`meta.title`, `toModuleNav`), mục bảng lệnh (Ctrl/⌘+K), tên tab trình duyệt. Trang tĩnh khai cùng kiểu ở
`static.routes.ts`. Không có danh sách path / tiêu đề thứ hai nào phải sửa cho khớp.

- Menu và guard dùng chung `canAccess` (`@/domains/session`) — menu không bao giờ hiện mục mà bấm vào ra 403.
  Dock, header (`useHeaderModules`) và bảng lệnh cùng đọc `useAppMenu()`; không nơi nào tự lọc quyền riêng.
- Một phân hệ = MỘT tông `AppTile` (`meta.tone`) ở Dock, launcher, nút bộ chọn; `meta.group` xếp nhóm trong launcher.
- Widget `CommandPalette` / `Header` / `Dock` là UI thuần, không đọc registry hay store; tầng nối là `src/app/shell/`.
- **Khai `PATHS` thì PHẢI mount route.** Từng sập: `PATHS.PROFILE` được menu điều hướng tới nhưng không route nào
  mount → 404; `tsc` và lint đều không thấy. Test `app-routes` đối chiếu `PATHS` ↔ route; `validateModules` chặn
  trùng id / path, path con tuyệt đối, `landingPath` sai.

Luật: `routing-conventions.md` · `navigable-controls.md`.

## 9. Hai lỗi tiếng Việt bị ESLint chặn cứng

Gác `guard/search-input` (`scripts/eslint/syntax-guards.mjs`) bắt hai lỗi đã gây bug thật: **ô tìm kiếm controlled** cắt ngang
composition của bộ gõ → gõ Telex mất dấu (dùng `useImeSafeSearchInput`); **`x.toLowerCase().includes(y)`** không bỏ
dấu → gõ "met khoi" không ra "Mét khối" (dùng `matchesSearch` / `includesSearch`). ⛔ Không tắt bằng
`eslint-disable`; cần ngoại lệ thì sửa rule kèm lý do. Luật: `ime-safe-input.md` · `search-matching.md`.

## 10. Chế độ demo và chế độ app

```bash
VITE_APP_MODE=demo   # base xuất xưởng — không cần backend, có phân hệ "Thư viện UI"
VITE_APP_MODE=app    # sản phẩm thật (mặc định khi không khai)
```

|                                                     | `demo`                                  | `app`                                                                 |
| --------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| Kiểm đăng nhập (`VITE_AUTH_ENABLED`) khi không khai | TẮT                                     | **BẬT**                                                               |
| Phân hệ `/demo` + phân hệ ERP mẫu                   | Có                                      | Không mount                                                           |
| `npm run build`                                     | Chạy, in cảnh báo "đang build bản demo" | **Dừng** nếu `VITE_AUTH_ENABLED=false` hoặc thiếu `VITE_API_BASE_URL` |

Phân hệ ERP mẫu (Tài chính · Mua hàng · Kho vận · Sản xuất · Nhân sự · Báo cáo — `erp-sample.routes.ts`, mọi trang
là placeholder) chỉ để header, launcher và Dock có dữ liệu trình diễn; dự án thật xoá file đó + một dòng ở
`module-registry.ts`.

Kiểm đăng nhập tắt thì `AuthGuard` cho qua và không có lời gọi refresh nào (không backend, gọi chỉ tạo request đỏ
ở mọi lần tải). Mã xác thực vẫn nguyên ở cả hai chế độ; smoke test `app-boot` kiểm cả bật lẫn tắt.

Mọi biến `VITE_*` đi qua một schema Zod (`core/config/env.schema.ts`) dùng chung cho trình duyệt và
`vite.config.ts`: chuỗi rỗng = mặc định; `VITE_API_TIMEOUT=30000abc` hay `VITE_AUTH_ENABLED=ture` là dừng ngay chứ
không chạy bằng giá trị đoán. CI không dựa vào `.env` của máy: job `check` khai `VITE_APP_MODE=demo`, job
`build-app` khai `app` + `VITE_API_BASE_URL`; test cố định chế độ demo (`test.env` trong `vite.config.ts`).
Luật: `quality-gates.md` §2b.

## 11. Tải ban đầu có ngân sách

Thư viện ngoài chia chunk theo **thời điểm cần tải** (`codeSplitting.groups` ở `vite.config.ts`): React, Radix,
TanStack Query, Zod nằm trong tải ban đầu; `recharts`, `react-arborist`, `dnd-kit` chỉ tải khi trang dùng tới.
`npm run check:bundle` (sau build, có trong CI) đỏ khi chunk nặng lọt vào danh sách preload hoặc JS / CSS ban đầu
vượt ngân sách ở đầu `scripts/check-bundle.mjs`. Lazy route **không tự bảo đảm** điều này: từng có bản preload
~400 kB thư viện biểu đồ ở mọi lần mở app mà build vẫn xanh. Registry icon vẫn nằm trọn trong tải đầu — xem
`known-issues.md`.

## 12. Công cụ: `tsc -b`, TypeScript 5.9

- ⛔ **`npm run typecheck` (`tsc -b --noEmit`), không `npx tsc --noEmit`.** `tsconfig.json` kiểu solution
  (`files: []` + `references`) nên ⛔ `npx tsc --noEmit` kiểm **0 file và luôn pass giả** — ở dự án gốc lệnh đó từng
  giấu 13 lỗi type qua hàng chục commit. Husky và CI gọi `npm run typecheck`.
- **TypeScript ghim `~5.9.3` có chủ ý.** Bản 7 bị hoàn nguyên vì `typescript-eslint@8` khai peer `<6.1.0` — nâng
  lên là ESLint sập lúc nạp module, mất sạch rule chặn lỗi tiếng Việt; TS 7 còn bỏ `baseUrl` (`TS5102`). Chỉ nâng
  khi `typescript-eslint` hỗ trợ TS 7, nâng xong gỡ `baseUrl` khỏi `tsconfig.app.json`.
- `vite@8` (Rolldown, build nhanh ~10 lần) và `eslint@10` đã nâng và chạy tốt.

## 13. Trang demo — bản THẬT, không phải ảnh chụp

| Đường dẫn         | Là gì                                                                                                                                                                                                                         | Dùng để                                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `/demo`           | Thư viện giao diện: mọi token màu, thang chữ, 377 icon hệ thống (tìm không dấu) + bộ icon VCI, mọi nhóm UI kit + biến thể, hệ form 21 field, biểu đồ mẫu                                                                                             | Tra "component X có biến thể nào"; soát nhanh một thay đổi token có làm vỡ chỗ nào                                        |
| `/demo/ghep`      | Màn danh sách gói thầu ghép sẵn: tab của trang (trên header từ `xl`, dải gạch chân dưới `xl`), dải `SummaryCard` cùng hàng với nút hành động, `BoxPanel` bọc `Table` có dòng tổng + phân trang, `Drawer` chi tiết, lọc bằng `useImeSafeSearchInput` + `matchesSearch` | Soi lỗi chỉ lộ khi ghép (header ↔ nội dung cùng lưới, nhịp khe dọc, bảng tự cuộn); bản mẫu để chép màn danh sách đầu tiên |
| `/demo/tong-quan` | Dashboard MỘT viewport (6 KPI, 3 biểu đồ, 3 bảng)                                                                                                                                                                             | Soi lỗi chỉ lộ khi nhiều khối chia chung chiều cao                                                                        |
| `/demo/nhap-lieu` | Bảng nhập liệu kiểu bảng tính: ba mật độ, control phẳng, dòng nháp, ô đã sửa / lỗi, Enter theo cột, Ctrl+S, dòng tổng                                                                                                          | Bản mẫu để chép màn phiếu / danh mục nhập trực tiếp trên bảng (`data-entry-table.md`)                                     |

Dùng đúng component sản phẩm dùng, nên sửa `colors-theme.json` / `font.json` là trang đổi theo. Smoke test
`demo-page` mount cả trang (barrel trỏ nhầm hay component ném lỗi lượt render là đỏ); test `demo-coverage` buộc mọi
export UI kit có mặt trên trang. Cấu trúc folder demo: `feature-structure.md` §"Feature mẫu" · `notes/code/demo.md`.
Cách gỡ demo khi dựng dự án thật: `README.md` gốc §"Dựng dự án thật".

## 14. Responsive: ba trục tách bạch, một component chạy mọi cỡ màn

Ba câu hỏi khác nhau, ba gate khác nhau: **hẹp chỗ** (bậc bề rộng `sm … wide`) · **ngón tay** (`touch:`) · **điện thoại**
(`phone:`, cả dọc lẫn ngang). Không gộp được: iPad Pro ngang (1366px) trùng laptop 14" nên bề rộng không tách được máy
chạm khỏi máy chuột, và điện thoại ngang (844–932px) rộng hơn iPad dọc nên bề rộng cũng không tách được điện thoại.
Mốc `wide` = 1800px là bản màn ngoài đã chốt — mọi đợt responsive chỉ THÊM bậc cho màn nhỏ để 1920×1080 so từng pixel
vẫn bằng 0. Một component, CSS chọn dạng; chỉ khi hai dạng là hai cây DOM khác nhau mới rẽ nhánh bằng `useIsPhone()`
(bản JS cùng điều kiện). Bố cục không có cổng máy trong `npm run check` (jsdom không có bố cục thật), nên kiểm bằng ảnh
chụp ma trận viewport. Luật: `responsive-screens.md` · `ipad-responsive.md` · cấu hình: `styles/theme/variants.css` ·
`styles/theme/breakpoints.css`.

## 15. Sáng là mặc định, tối giữ HUD — một class, hai hình

Base này là bản SÁNG của `source-base` (bản tối HUD): `THEME_INITIAL_STATE` = `light`, `index.html` không có
`class="dark"`; nút đổi theme vẫn còn, chế độ TV ép tối; theme lưu ở khoá `light-base-theme` (riêng của base sáng —
`source-base` tối chạy cùng `localhost` ghi khoá khác). Thương hiệu VCI: `primary` 1–9 là dải logo xanh lá → ngọc → lam,
vàng kim (`yellow` = `accent`), neutral ánh "sage", `icon-accent` = chấm đỏ logo cho icon VCI. Vì sao chung một bộ
component cho hai ngôn ngữ:

- **Trang trí HUD chỉ qua `dark:`** (quầng, ray, ngoặc góc, dấu `//`, lưới nền) — theme sáng là thẻ trắng bo mềm, bóng
  mảnh, MỘT dải gradient ở header. Thêm trang trí mà quên `dark:` là nó hiện cả ở màn quản trị sáng.
- **Bo góc là token**, không phải class rời: `rounded-md` = 8px ở sáng, 0 ở tối (`styles/theme/radius.css` + `.dark`
  đưa thang về 0). Component không viết `dark:rounded-none` → không có hai bộ class phải giữ khớp.
- **Header một dải, thanh nổi** (logo VCI · bộ chọn phân hệ · điều hướng phân hệ · tên trang + tab) thay sidebar. Header
  đổi theo CẤP của URL (0–3, tính một chỗ ở `useActiveModule`): từ cấp 2 dải phân hệ nhường chỗ cho vệt ‹ · phân hệ ›
  màn hình — vào sâu không mất đường về, Ctrl/⌘+↑ lên một cấp. Tab của TRANG lên thanh từ `xl` (nội dung lên sát header),
  dưới `xl` rơi về dải trong luồng trang — thanh không bao giờ tràn vì tab. Kiểu thanh (`brand` / `glass`) chỉ là bộ
  biến `--hdr-*`.
- **Icon nhận diện là bộ riêng** (`VciIcon`, vẽ theo logo: vòng hở 3 cung + chấm nhấn), icon chrome vẫn là `SystemIcon`;
  cấu hình (meta route, Dock, bảng lệnh) khai `AppIconName` để chọn bộ nào cũng được mà nơi vẽ không rẽ nhánh.

Luật: `light-theme.md` (ngôn ngữ sáng — đọc đầu tiên khi làm giao diện) · `visual-hierarchy.md` §0b · `color-system.md`
· `vci-icon-system.md` · `data-entry-table.md` (bảng nhập liệu) · note: `notes/code/widgets-header.md`.
