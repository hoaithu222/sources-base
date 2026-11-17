# Component Structure — thứ tự file, bảng class, luồng code (`src/shared/ui`)

> Mở file nào trong UI kit cũng thấy **cùng một thứ tự**. Muốn đổi màu hay cỡ của
> một component: đi thẳng tới bảng, tìm đúng khoá, sửa — không phải lần qua
> `compoundVariants`, không phải đọc hết file.
>
> **Ví dụ chuẩn để đối chiếu: `src/shared/ui/actions/Button.tsx`.**
> Bổ sung `ui-kit-architecture.md`; phần comment xem `comment-policy.md`.

---

## 1. Thứ tự cố định trong một file

| # | Mục | Nội dung |
|---|-----|----------|
| 1 | **Imports** | Thứ tự theo `code-style.md` |
| 2 | **Types / Props** | `export type XxxSize = …` · `export interface XxxProps` (không JSDoc trên từng prop — §4) |
| 3 | **Class nền** | `XXX_BASE_CLASSES` |
| 4 | **Bảng kích thước** | `XXX_SIZE_CLASSES` |
| 5 | **Bảng skin × variant** | `XXX_SKIN_CLASSES` |
| 6 | **Hàm phụ / sub-component nội bộ** | Hàm thuần nhỏ, sub-component `memo` nội bộ (nếu có) |
| 7 | **Khối tài liệu + Component** | Khối tài liệu (§4) SÁT ngay trên khai báo component DUY NHẤT của file |
| 8 | **Export** | `export default Xxx` |

Mục nào component không có thì **bỏ**, KHÔNG đảo thứ tự các mục còn lại. Bảng phụ
(icon, state, slot) đứng ngay sau bảng cùng trục.

**React 19 — viết component là hàm thường.** `ref` là prop thường: KHÔNG dùng `forwardRef`
(khai `ref?: React.Ref<HTMLXxxElement>` hoặc kế thừa `React.ComponentProps<'xxx'>`), dùng
`React.ComponentRef` thay `React.ElementRef` (đã lỗi thời). Hàm có tên nên KHÔNG cần
`Xxx.displayName`. Cần `memo` thì viết `const Xxx = memo(function Xxx(props: XxxProps) {…})` —
không `export default memo(Xxx)` (biểu thức không tên làm mất chú thích khi rê chuột).

---

## 2. Bảng class

Bảng nằm **ngoài** component, **trong cùng file**, đặt tên `SCREAMING_SNAKE_CASE`.

```tsx
const BUTTON_BASE_CLASSES = cn('inline-flex items-center …', 'focus-visible:…');

const BUTTON_SIZE_CLASSES = {
  xl: 'h-11 px-5 py-3 text-body-14-medium …',
  xs: 'h-7 px-2 py-1 text-caption-12-medium gap-1',
  // …
} satisfies Record<ButtonSize, string>;

const BUTTON_SKIN_CLASSES = {
  base: {
    primary: cn('border border-primary-6 bg-primary-6 text-neutral-0', 'hover:…', 'active:…'),
    ghost: cn('border border-transparent bg-transparent text-action-base', 'hover:…', 'active:…'),
    // secondary, stroke …
  },
  danger: { /* đủ 4 variant */ },
  // accent, neutral …
} satisfies Record<ButtonSkin, Record<ButtonVariant, string>>;

// Trong component — chỉ CHỌN class rồi render:
const buttonClassName = cn(
  BUTTON_BASE_CLASSES,
  BUTTON_SIZE_CLASSES[size],
  BUTTON_SKIN_CLASSES[skin][variant],
  fullWidth && 'w-full',
  className,
);
```

### Quy tắc

1. **Tên** = `{COMPONENT}_{TRỤC}_CLASSES`. `TRỤC` là tên prop: `SIZE`, `SKIN`, `COLOR`,
   `INTENT`, `TONE`, `STATE`… Bảng của một phần con chen tên phần đó:
   `BUTTON_ICON_SIZE_CLASSES`. Ma trận hai trục đặt tên theo trục NGOÀI
   (`SKIN`), khoá trong là trục kia (`[skin][variant]`).
2. **Kiểu khoá khai TRƯỚC** ở mục 3 (`export type ButtonSize = 'xl' | …`), bảng
   chỉ `satisfies` kiểu đó. Thêm một cỡ vào union mà quên thêm vào bảng → `tsc` đỏ.
   KHÔNG suy kiểu ngược từ bảng, KHÔNG ép kiểu (`as`, `Record<string, …>`) để
   truy cập bảng.
3. **Mỗi ô đứng một mình.** Ô `accent.stroke` tự mang `border`, `bg-transparent`,
   chữ, hover, active — không dựa vào ô khác "đã có sẵn". Cùng một chuỗi lặp ở hai
   ô là CHẤP NHẬN ĐƯỢC (đây là dữ liệu, không phải logic): sửa một ô không được
   làm đổi ô khác. Đừng gộp biến chung khiến hai ô lệ thuộc nhau.
4. **Ô dài → `cn()` mỗi đối số một trạng thái** (tĩnh · hover · active · focus ·
   disabled). Đó chỉ là cách ngắt dòng; kết quả vẫn là `string` nên `satisfies`
   vẫn đúng. Ô ngắn (≤ 100 ký tự) viết thẳng chuỗi.
5. **Class phải là chuỗi LITERAL đầy đủ.** Cấm nối chuỗi / template
   (`` `bg-${color}-5` ``): Tailwind quét văn bản chứ không chạy code, class dựng
   động sẽ không được sinh ra.
6. **Mặc định khai ở destructuring props** (`size = 'xl'`), không ở bảng.
7. **Bảng KHÔNG `export`** từ file `.tsx` (export không phải component phá Fast
   Refresh — `clean-code-standards.md §5`). Cần dùng chung ≥ 2 file → chuyển sang
   `{name}.theme.ts` cùng folder, vẫn theo thứ tự §1 và quy tắc ở đây.
8. **`className` luôn đứng CUỐI** trong `cn()` để nơi gọi ghi đè được.
9. Component chỉ có MỘT trục hoặc không có trục → bỏ mục không dùng:
   không trục → một hằng `XXX_CLASSES`; không cần hằng nếu chuỗi ≤ 1 dòng và dùng
   một lần.

### Điều kiện bật/tắt (disabled, invalid, selected…)

- Một class kèm một điều kiện → `cond && 'class'` thẳng trong `cn()`.
- Từ hai điều kiện trở lên đi chung (vd `invalid × focusMode`) → một bảng
  `XXX_STATE_CLASSES` `satisfies Record<…>`, KHÔNG viết chuỗi `if` rải trong JSX.

### `tv()` — KHÔNG dùng ở bất cứ đâu trong repo

| Vấn đề của `tv()` | Bảng `*_CLASSES` + `cn()` |
|---|---|
| Có instance twMerge RIÊNG, không biết token font → coi `text-body-14-medium` là **màu chữ** và nuốt `text-neutral-0`. Đo trên Button cũ: 88/89 tổ hợp mất class. | `cn()` đã đăng ký token font từ `font.json` (`tailwind-conventions.md`). |
| `compoundVariants` là mảng: tìm ô (skin, variant) phải quét, thiếu tổ hợp không báo lỗi. | Tra thẳng `[skin][variant]`; thiếu ô là `tsc` đỏ. |
| Thêm cờ `twMergeConfig` lên từng recipe là việc dễ quên. | Không có gì để quên. |

`tailwind-variants` đã gỡ khỏi `package.json`; ESLint (`no-restricted-imports`) và
`check:imports` chặn import lại. Widget theo cùng quy tắc (`widget-composition.md`).

### File theme dùng chung (`*.theme.ts`)

Chỉ tồn tại cho bảng class mà **≥ 2 component** dùng (`field.theme`,
`popup-surface.theme`, `modal.theme` — `ui-kit-architecture.md §5b`). Bảng chỉ dùng
cho một component thì ở lại file component; nếu làm file vượt ngưỡng §6 thì tách
sang `{name}.theme.ts` NẰM TRONG folder của component đó.

File theme chỉ chứa hằng / bảng class: KHÔNG hàm kiểu `xxxStyles({ … })` trả hàm theo slot (di sản `tv()`)
— nhiều phần thì một bảng `XXX_SLOT_CLASSES` (`MODAL_SLOT_CLASSES.corner.tl`, `SPLITTER_SLOT_CLASSES.handle`);
KHÔNG khai kiểu trục công khai (`DrawerSize`, `PanelCardVariant`…) — kiểu đó ở file component, hoặc
`{name}.types.ts` khi theme cũng cần nó (tránh vòng import component ↔ theme). Ngoại lệ duy nhất: `FieldSize`
nằm cạnh `FIELD_HEIGHT` trong `inputs/field.theme.ts` vì nó là THANG CỠ dùng chung của mọi ô nhập.

Hàm/hằng xuất ra từ file theme là API nội bộ: đổi tên hay chữ ký phải sửa mọi nơi
gọi cùng lượt (`tsc` chỉ đường).

---

## 3. Types / Props

```tsx
export type ButtonVariant = 'primary' | 'secondary' | 'stroke' | 'ghost';
export type ButtonSkin = 'base' | 'accent' | 'danger' | 'neutral';
export type ButtonSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  skin?: ButtonSkin;
  variant?: ButtonVariant;
  size?: ButtonSize;
  // …
}
```

- Mỗi trục một `export type` union literal — `XxxProps` dùng lại đúng các type này.
- `XxxProps` luôn `export` (`tests/policy/structure/ui-kit-props-types.test.ts` kiểm).
- Types dùng ≥ 2 file, hoặc dài > 40 dòng → `{name}.types.ts`.
- Thứ tự prop trong interface: nội dung → trục biến thể → slot (`ReactNode`) →
  hành vi (`onXxx`) → `className`.

---

## 4. Khối tài liệu component

Đúng **một** JSDoc, đặt **SÁT ngay trên dòng khai báo** component (`function Xxx(` /
`const Xxx = memo(…)`), không dòng trống ở giữa. Đây là chỗ DUY NHẤT trong file được viết
"nó là gì · props nghĩa là gì · cách dùng · chỗ sửa · bẫy". Rê chuột lên `<Xxx` ở bất kỳ đâu
trong VS Code là thấy nguyên khối. Ngoài khối này chỉ còn JSDoc ≤ 3 dòng trên hằng / hàm / kiểu
dữ liệu công khai (`comment-policy.md §1`) — không còn comment nào khác trong file.

```tsx
/**
 * Button — nút bấm chuẩn của UI kit; mọi chỗ cần "bấm để làm một việc" đều dùng nút này.
 *
 * Nhận thêm mọi thuộc tính của `<button>` (`onClick`, `disabled`, `aria-*`, `form`…).
 * Điều hướng sang trang khác thì bọc `<Link>` bằng `asChild` (docs/rules/interaction/navigable-controls.md).
 * Sửa giao diện: màu → `BUTTON_SKIN_CLASSES[skin][variant]` · cỡ → `BUTTON_SIZE_CLASSES`.
 * Lưu ý: stroke / ghost dùng token semantic (`action-*`, `error`), KHÔNG dùng bậc số `-7`.
 *
 * @param props.skin - Bảng màu: `base` | `accent` | `danger` | `neutral`. Mặc định `base`.
 * @param props.size - Cỡ nút: `xl` 44px | `lg` 40px | `md` 36px | `sm` 32px | `xs` 28px. Mặc định `xl`.
 * @param props.loading - `true` → hiện spinner, chặn bấm, gắn `aria-busy`. Mặc định `false`.
 * @param props.ref - Trỏ tới phần tử `<button>` (React 19: `ref` là prop thường).
 *
 * @example
 * <Button skin="danger" variant="stroke" size="md">Xoá</Button>
 */
function Button({ skin = 'base', size = 'xl', loading = false, ref, ...props }: ButtonProps) {
```

| Phần | Khi nào có | Viết gì |
|---|---|---|
| Dòng đầu `Tên — một câu` | luôn | Nó là gì, dùng khi nào (khác component gần giống thế nào) |
| Đoạn hướng dẫn | khi cần | Thuộc tính kế thừa (`Nhận thêm mọi thuộc tính của <div>`), cách ghép với component khác |
| `Sửa giao diện:` | có bảng class | Muốn đổi gì thì tới bảng / file theme nào |
| `Lưu ý:` | có bẫy | Bẫy khiến dùng / sửa sai mà hỏng ÂM THẦM; lý do dài → `notes/components/<nhóm>[-<nhóm-con>].md` (quy tắc tra: `docs/README.md`) |
| `@param props.<tên> - …` | mỗi prop UI kit tự khai | Nghĩa · giá trị hợp lệ · đơn vị · `Mặc định …`. Dòng dài thì xuống dòng thụt 2 dấu cách |
| `@example` | luôn | Một – hai đoạn JSX ngắn nhất dùng được thật (sao chép là chạy) |

- Mô tả và `Sửa:` / `Lưu ý:` đứng TRƯỚC các thẻ `@param` — chữ đứng sau một thẻ bị hiểu là
  phần của thẻ đó.
- Prop kế thừa từ React / Radix (`onClick`, `aria-*`…) không cần `@param`, trừ khi UI kit đổi
  nghĩa / mặc định của nó (vd `type` mặc định `'button'`, `ref`).
- `tests/policy/foundations/ui-kit-docs.test.ts` kiểm: khối sát khai báo, dòng đầu `Tên — `, có `@example`,
  `@param` khớp ĐÚNG danh sách prop thật (thiếu hay thừa đều đỏ).

Không kể lịch sử, không dán số đo Figma dài (một dòng `Figma: 41:5353` là đủ).

---

## 5. Luồng code trong component

Từ trên xuống dưới, **không đảo**:

1. Destructure props, kèm giá trị mặc định
2. Hook: context · state · ref · query (gom một cụm, đúng thứ tự Rules of Hooks)
3. Giá trị dẫn xuất (`useMemo` chỉ khi đo được cần — `code-optimization.md`)
4. Handler (`useCallback` khi truyền xuống con đã `memo`)
5. Effect
6. Early return
7. Ghép class: `const xxxClassName = cn(…)` — một biến cho mỗi phần tử có class động
8. JSX

- Biến class đặt tên `{phần}ClassName` (`buttonClassName`, `iconClassName`).
- JSX chỉ **mô tả**: không logic nhiều dòng, không IIFE, `.map` dài > 10 dòng →
  tách sub-component; ternary lồng quá một cấp → tách biến hoặc early return.
- Một component = một trách nhiệm (`clean-code-standards.md §1`). Sub-component
  `memo` nội bộ (ngoại lệ §1 của file đó) đứng NGAY TRÊN component chính.
- Hàm phụ thuần của riêng component, ≤ 15 dòng → đứng trên component, dưới bảng
  class. Dài hơn → `{name}.utils.ts`.

---

## 6. Folder & độ dài file

### Một file một việc

| Loại | File | Ghi chú |
|---|---|---|
| Component | `Xxx.tsx` | theo §1 |
| Types dùng chung / dài | `xxx.types.ts` | không có giá trị chạy |
| Bảng class dài / dùng chung | `xxx.theme.ts` | theo §2 |
| Hook riêng của component | `useXxx.ts` | không JSX (cần JSX → tách phần con) |
| Hàm thuần | `xxx.utils.ts` | không React; mọi file trong `utils/` đều `*.utils.ts` |
| Context | `xxx.context.ts` | chỉ `createContext` + Provider; hook đọc context ở `hooks/useXxx.ts` |
| Phần con NỘI BỘ | `parts/xxx-yyy.tsx` (kebab-case) | 1 file = 1 component; tên export khớp tên file (`table-full-row-cell.tsx` → `TableFullRowCell`) |
| Component con CÔNG KHAI (đi qua barrel) | `XxxYyy.tsx` (PascalCase) ở gốc folder component | KHÔNG nằm trong `parts/` (`table/TableDragHandle.tsx`) |

### Ba loại folder

| Loại | Chứa gì | `index.ts` |
|---|---|---|
| **Nhóm** (`data-display/`, `surfaces/`) | Component phẳng + folder component + nhóm con | Barrel liệt kê API công khai của cả nhóm |
| **Folder component** (`table/`) | Mọi file của MỘT component | Cổng ra duy nhất: default + type |
| **Folder vai trò** (`hooks/`, `parts/`) | Chỉ hook, hoặc chỉ phần con NỘI BỘ, của component cha | Không có — component chính import tương đối |

### Component một file → phẳng; từ hai file trở lên → folder riêng

```
src/shared/ui/data-display/
├── index.ts                 # barrel nhóm
├── AnimatedNumber.tsx       # 1 file → đứng phẳng trong nhóm
├── table/                   # ≥ 2 file → folder kebab-case của riêng nó
└── tree/
```

- `index.ts` của folder là API công khai của component (barrel nhóm `export *` từ đó); code
  NGOÀI UI kit chỉ import qua barrel gốc `@/shared/ui`. Trong UI kit, component này import
  component kia theo đường dẫn file của nó (`…/table/Table`) hoặc qua `index.ts` của folder nó
  (`@/shared/ui/media/upload`), KHÔNG chui vào `hooks/`, `parts/`, `*.utils.ts` nội bộ của component
  khác. Kiểu thì lấy thẳng từ file khai báo (`…/dropdown/dropdown.types`) — file component không re-export.
- `index.ts` lấy THẲNG từ file nguồn (`export type { TableProps } from './table.types'`); file
  component không làm barrel hộ (`export … from` trong `Xxx.tsx` là sai).
- Giữa hai nhóm UI kit dùng alias `@/shared/ui/<nhóm>/…`; trong cùng nhóm dùng đường tương đối.
- Barrel nhóm dùng `export * from './table'` cho folder, và vẫn liệt kê từng dòng
  `export { default as X } from './X'` cho component phẳng (ui-kit-architecture §8).
- Hai component dùng chung một helper → helper lên cấp nhóm (`picker-trigger.tsx`,
  `popup-surface.theme.ts`), không chui vào folder của một bên.

### Folder component lớn → chia tiếp theo vai trò

```
data-display/table/
├── index.ts                  # API công khai: default + type
├── Table.tsx                 # component chính
├── table.types.ts            # gốc chỉ giữ component chính + MỖI LOẠI tối đa một file:
├── table.theme.ts            #   types · theme · context
├── table-row-drag.context.ts
├── TableDragHandle.tsx       # component con CÔNG KHAI → gốc folder, không vào parts/
├── hooks/                    # ≥ 2 hook (useColumnResize · useTableDnd · useTableSort…)
├── utils/                    # ≥ 2 file *.utils.ts
└── parts/                    # ≥ 2 phần con nội bộ, kebab-case
    ├── header/               # > 8 phần con → chia tiếp theo vùng
    ├── body/
    └── table-footer.tsx
```

- Năm folder vai trò: `hooks/` (`use*.ts`) · `utils/` (`*.utils.ts` và hàm thuần) ·
  `types/` (khi có ≥ 2 `*.types.ts`) · `parts/` (phần con) · `shared/` (helper dùng chung giữa
  các component anh em của một nhóm con, vd `pickers/date/shared/`). Chỉ tạo khi có ≥ 2 mục
  cùng vai trò; đúng 1 file thì đứng ở gốc, không tạo folder cho một file.
- `*.theme.ts` và `*.context.ts` mỗi loại một file ở gốc. Ngoại lệ: tách theme vì trần 300 dòng (vd `media/upload`:
  `upload.theme.ts` ở gốc + `file-list/file-card.theme.ts`).
- `parts/` quá 8 phần thì chia theo vùng chức năng (`header/`, `body/`) — vẫn là folder
  vai trò, không có `index.ts`.
- Phần con tự có file đi kèm (types, hook riêng) thì nó là component nhiều file:
  `parts/table-header/` theo đúng luật folder component ở trên.

### Nhóm đông → chia nhóm con

Một nhóm có > 8 mục thì chia theo họ chức năng; nhóm con có `index.ts` riêng và barrel
nhóm viết `export * from './hud'`:

```
surfaces/
├── index.ts
├── hud/         # HudFrame · HudCorners · HudInfoBox
├── cards/       # SummaryCard · SummaryPill · CompactKpiCard · CardScreenshot · hud-kpi-card/
├── panels/      # PanelCard · BoxPanel · BoxInfo · Surface
└── splitter/
```

Tên nhóm con là danh từ chức năng — KHÔNG dùng `misc/`, `common/`, `other/`.

### Giới hạn mỗi folder

**≤ 8 mục** (file + folder con, không tính `index.ts`). Vượt thì chia theo vai trò
(`hooks/`, `parts/`) hoặc nhóm con. `tests/policy/foundations/folder-structure.test.ts` giữ giới hạn này
cho `src/shared/ui/**`.

### Độ dài

Trần dòng của UI kit: nguồn duy nhất `folder-structure.md §1` (đếm dòng CODE — khối tài liệu §4 không tính, để chú
thích props đầy đủ không ép xé file). Vượt thì tách theo bảng "Một file một việc" ở trên: types → `*.types.ts`,
bảng class → `*.theme.ts`, logic → `use*.ts`, hàm thuần → `*.utils.ts`, khối JSX → phần con.

---

## 7. Checklist khi viết / sửa component UI kit

- [ ] Đúng thứ tự §1; không có mục nào lạc chỗ
- [ ] Không còn `tv()`, `compoundVariants`, `twMergeConfig`
- [ ] Mọi trục biến thể có `export type` + bảng `satisfies Record<…>`; ma trận hai
      trục `satisfies Record<A, Record<B, string>>`
- [ ] Mỗi ô đủ class để đứng một mình; chuỗi class là literal
- [ ] Mặc định ở destructuring; `className` cuối `cn()`
- [ ] Khối tài liệu SÁT ngay trên component: dòng đầu `Tên — `, `@param props.<tên>` đủ từng prop, `@example` (+ `Sửa giao diện:` nếu có bảng)
- [ ] Không `forwardRef` / `React.ElementRef` / `export default memo(X)`; `ref` là prop thường
- [ ] Không còn comment nào ngoài khối tài liệu, JSDoc ≤ 3 dòng trên API công khai và chỉ thị công cụ (`comment-policy.md`)
- [ ] Trong giới hạn dòng (`folder-structure.md §1`); component có file đi kèm đã nằm trong folder riêng
- [ ] Mỗi folder ≤ 8 mục; folder component lớn đã tách `hooks/` / `parts/`; nhóm đông đã chia nhóm con
- [ ] `npm run check` xanh (`quality-gates.md`) — lúc sửa chạy nhanh `npm run test:unit -- ui-kit-docs`

---

## 8. Cross-references

`ui-kit-architecture.md` (3R, barrel, token) · `comment-policy.md` · `clean-code-standards.md`
(một file một component) · `code-style.md` (naming, import order) ·
`tailwind-conventions.md` (`cn()`, thứ tự class) · `feature-structure.md` (cấu
trúc folder ở `src/features`).
