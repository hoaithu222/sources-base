# Hướng dẫn thêm một màn CRUD — nhân bản từ feature mẫu `customers`

> Đọc xong là tự làm được nghiệp vụ đầu tiên mà KHÔNG phải tự quyết lại: query key đặt ở đâu, form dựng thế nào, lỗi hiện ở đâu, quyền kiểm ra sao, test cái gì.
> `src/features/customers/` là ví dụ SỐNG của một màn CRUD tiêu chuẩn (danh sách lọc trên URL · tạo · sửa · xoá), chạy được ở chế độ demo, không cần backend.
> File này là HƯỚNG DẪN, không đặt luật: luật nằm ở [`feature-structure.md`](../rules/structure/feature-structure.md) · [`api-patterns.md`](../rules/data/api-patterns.md) ·
> [`async-safety.md`](../rules/data/async-safety.md) · [`form-validation.md`](../rules/data/form-validation.md) · [`routing-conventions.md`](../rules/structure/routing-conventions.md) ·
> [`testing.md`](../rules/foundations/testing.md); lý do thiết kế từng file: [`notes/code/customers.md`](../notes/code/customers.md). Tên file / hàm dưới đây là code THẬT; thấy lệch thì code là nguồn
> thật — sửa file này trong cùng PR (`documentation-management.md §3`).

**Mục lục**

1. Mẫu `customers` có gì
2. Chạy được không cần backend — chọn cách nào, vì sao
3. Nhân bản thành màn của bạn — từng bước
4. Trang sửa: route tĩnh + `?id=`, không phải `[id]`
5. Quyền — giao diện chỉ ẩn nút, backend PHẢI kiểm lại
6. Test
7. Lỗi thường gặp
8. Checklist

---

## 1. Mẫu `customers` có gì

| Cần                                   | Ở đâu                                                                                                                       | Làm gì                                                                                                     |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Hợp đồng dữ liệu                      | `api/customers.types.ts` · `api/customer-dto.schema.ts` · `utils/customer-mapping.utils.ts`                                 | Model giao diện (camelCase, `number`) ↔ DTO của BE (snake_case, tiền dạng chuỗi); schema Zod kiểm phản hồi |
| Gọi API                               | `api/customers.api.ts`                                                                                                      | `apiClient` + `readData(response, schema)` + mapping; đọc nhận `signal`                                    |
| Dữ liệu giả (chỉ demo)                | `api/customers-demo-adapter.ts` · `api/customers-demo-seed.ts`                                                              | "Máy chủ" trong bộ nhớ nói đúng hợp đồng REST (404 · 409 · 422)                                            |
| Query key + `queryOptions` + mutation | `service/customers.queries.ts`                                                                                              | MỘT chỗ cho đọc / prefetch / invalidate                                                                    |
| Bộ lọc trên URL                       | `hooks/useCustomerList.ts`                                                                                                  | `useQueryParams` + `useDebounce` + query; giá trị từ URL được kiểm                                         |
| Form                                  | `schemas/customer.schema.ts` · `schemas/useCustomerSchemas.ts` · `hooks/useCustomerForm.ts` · `components/CustomerForm.tsx` | Schema factory có câu dịch · gửi · lỗi máy chủ · `dirtyGuard`                                              |
| Trạng thái tải / rỗng / lỗi           | `components/CustomerTable.tsx` · `CustomerLoadError.tsx` · `CustomerEditContent.tsx`                                        | Bảng có phân trang phía server; lỗi có "Thử lại"                                                           |
| Xoá                                   | `components/CustomerDeleteDialog.tsx`                                                                                       | `ConfirmDialog` giữ mở trong lúc xoá                                                                       |
| Màn hình                              | `views/CustomerListView.tsx` · `CustomerCreateView.tsx` · `CustomerEditView.tsx`                                            | Chỉ GHÉP (`page-structure.md`)                                                                             |
| Route + menu + quyền                  | `src/app/[locale]/(workspace)/(app)/demo/customers/` · `src/app/_navigation/navigation.config.ts`                           | `page.tsx` mỏng · `PermissionGate` · `screens` của phân hệ demo                                            |
| Test                                  | `tests/features/customers/`                                                                                                 | Luồng · lỗi thật · mapping + key · quyền                                                                   |

Cây folder đúng `feature-structure.md` (`api/ service/ schemas/ views/ components/` + `hooks/ constants/ utils/` vì có ≥ 1 file thật). Bên ngoài chỉ import qua `src/features/customers/index.ts` (ba view).

---

## 2. Chạy được không cần backend — chọn cách nào, vì sao

Chế độ demo (`NEXT_PUBLIC_APP_MODE=demo`, mặc định ở `.env`) không có backend, nhưng một màn CRUD thật phải đi qua `apiClient`, interceptor, `readData`, `AppError` và React Query. Ba cách:

| Cách                                 | Vì sao KHÔNG chọn                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------------------------- |
| Hook trả dữ liệu cứng, không gọi API | Không kiểm được trạng thái tải / lỗi / mapping — màn hình chạy khác hẳn khi nối backend thật |
| Sửa `core/http` để có "chế độ giả"   | Hạ tầng dùng chung nhiễm code của một feature                                                |
| Service worker giả API (MSW…)        | Thêm dependency + file `public/` sinh ra                                                     |

**Cách đã chọn:** `customers.api.ts` gọi `apiClient` đúng như khi có backend, và gắn THÊM `adapter` của axios cho từng request khi `appConfig.isDemo`:

```ts
const transport = () => (appConfig.isDemo ? { adapter: customersDemoAdapter } : {});

getById: async (id: number, signal?: AbortSignal): Promise<Customer> =>
  toCustomer(readData(await apiClient.get(ENDPOINTS.byId(id), { signal, ...transport() }), customerDtoSchema)),
```

`customersDemoAdapter` chỉ thay lớp THẤP NHẤT (nơi request rời trình duyệt): token, interceptor, chuẩn hoá lỗi, `readData` + schema, mapping, React Query đều là bản thật. Không sửa `core/http`, không thêm dependency.

- Dữ liệu sống trong bộ nhớ của tab — tải lại trang là về `CUSTOMERS_DEMO_SEED`. Test gọi `resetCustomersDemo({ latencyMs: 0 })` trước mỗi ca.
- "Máy chủ" thi hành đúng luật nghiệp vụ mà màn cần thấy: mã trùng → **409** `CUSTOMER_001`, dữ liệu sai → **422** kèm `errors` theo ô, id lạ → **404**; câu lỗi lấy từ registry đã dịch.
- **Dựng dự án thật:** xoá `api/customers-demo-adapter.ts`, `api/customers-demo-seed.ts`, hàm `transport()` cùng các `...transport()` trong `customers.api.ts` (hết là hết, không còn dấu vết demo); dời route khỏi `demo/` và bỏ dòng `notFound()` ở `layout.tsx` (§3 bước 7).

---

## 3. Nhân bản thành màn của bạn — từng bước

Ví dụ minh hoạ: nhân bản `customers` thành `suppliers` (nhà cung cấp). Chép cả folder rồi đổi tên theo thứ tự dưới đây; mỗi bước nói file nào đổi và cái gì GIỮ nguyên.

**Bước 0 — Chốt bốn tên.** Folder feature `kebab-case` (`suppliers`) · `resource` quyền (`supplier` → `supplier:view|create|update|delete`) · path (`/suppliers`) · namespace dịch cùng tên feature (`suppliers.json`).

**Bước 1 — Hợp đồng dữ liệu.** Khai model giao diện ở `api/<f>.types.ts` và hợp đồng BE bằng Zod ở `api/<f>-dto.schema.ts`; mapping là hàm THUẦN ở `utils/`:

```ts
export function toCustomer(dto: CustomerDto): Customer {
  return {
    id: dto.id,
    code: dto.code,
    /* … */ phone: dto.phone ?? '',
    creditLimit: Number(dto.credit_limit),
    createdAt: dto.created_at /* … */,
  };
}

export function toWriteDto(input: CustomerInput): CustomerWriteDto {
  return { code: input.code.trim(), /* … */ credit_limit: input.creditLimit.toFixed(2) };
}
```

Backend khớp UI (cùng tên, cùng kiểu) thì vẫn giữ schema DTO nhưng mapping có thể rút còn "đổi tên field". Tiền, quyền, số lượng… luôn kiểm cả hình dạng (`api-patterns.md` §1 "readData").

**Bước 2 — Hàm API.** `api/<f>.api.ts`: object `xxxApi` gồm `getList` · `getById` · `create` · `update` · `remove`, đọc nhận `signal`, trả MODEL (không lộ DTO). Đường dẫn tính từ `NEXT_PUBLIC_API_BASE_URL`, KHÔNG thêm `/v1`. Muốn chạy demo kèm dữ liệu giả → giữ `transport()` + adapter (§2); không thì bỏ.

**Bước 3 — Query key + `queryOptions` + mutation** (`service/<f>.queries.ts`, có `'use client'`):

```ts
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params: CustomerListParams) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: number) => [...customerKeys.details(), id] as const,
};
```

- Mọi danh sách nằm dưới `lists()` nên MỘT lệnh `invalidateQueries({ queryKey: customerKeys.lists() })` làm cũ mọi bộ lọc / trang; chi tiết ở nhánh `details()` không bị đụng.
- `customerQueries.list(params)` / `.detail(id)` là `queryOptions` — dùng chung cho `useQuery`, `queryClient.prefetchQuery` (vd khi rê chuột lên dòng), `ensureQueryData`. KHÔNG gọi `apiClient` ở server để prefetch (token chỉ ở trình duyệt — `api-patterns.md` §0).
- Mutation tạo / sửa: `setQueryData(detail(id), kết quả)` + `void invalidateQueries({ queryKey: lists() })`; xoá: `removeQueries(detail(id))` + invalidate `lists()`.
- **Ai báo lỗi:** query đọc và mutation tạo / sửa khai `meta: { silentError: true }` vì view tự vẽ lỗi (nút "Thử lại", lỗi trên form). Xoá KHÔNG khai → bộ báo lỗi tập trung toast một lần. Hook không toast thành công — view quyết (`notes/code/auth.md`).

**Bước 4 — Danh sách trên URL** (`hooks/use<F>List.ts` + view). Bộ lọc, từ khoá, trang sống trên URL qua `useQueryParams`; hook là nơi gom, view chỉ ghép:

```ts
const { page, pageSize, search, setPage, setPageSize, setSearch, getParam, setParam, clearParams } =
  useQueryParams({ paramKeys: ['status'] });
const status = parseCustomerStatus(getParam('status'));
const keyword = useDebounce(search.trim(), CUSTOMER_SEARCH_DEBOUNCE_MS);
const query = useCustomerListQuery({ keyword, status, page, pageSize });
```

- Giá trị từ URL là dữ liệu NGOÀI: `parseCustomerStatus` trả `undefined` cho giá trị rác (không lọc), `parseCustomerId` chỉ nhận số nguyên dương (`async-safety.md` §6).
- Ô tìm kiếm: `useImeSafeSearchInput` (KHÔNG `value={search}`) + `useDebounce` ở tầng query; so khớp bỏ dấu làm ở BE (demo: `matchesSearch`) — `ime-safe-input.md`, `search-matching.md`.
- `page.tsx` PHẢI bọc `<Suspense>` vì view đọc `useSearchParams`; thiếu thì route mất SSG (§7).
- Trạng thái: **tải** → `Table loading`; **lỗi** → `CustomerLoadError` (có "Thử lại" = `query.refetch`); **rỗng** → `EmptyState` truyền vào `Table emptyMessage` (hai nhánh: chưa có dữ liệu + nút thêm · bộ lọc không khớp + "Xoá bộ lọc" = `clearParams`). Phân trang phía server: `total` lấy từ BE.
- Đi tới trang sửa là `<Link href>` thật (`customerEditPath(id)`), không `onClick={router.push}` (`navigable-controls.md`).

**Bước 5 — Form tạo / sửa.** Schema là factory nhận câu ĐÃ DỊCH, hook ghép `useTranslations`; email / điện thoại dùng validator chung (câu tự theo ngôn ngữ):

```ts
export function createCustomerSchemas(messages: CustomerValidationMessages) {
  const customerFormSchema = z.object({
    code: z.string().trim().min(1, messages.codeRequired).max(CUSTOMER_CODE_MAX, messages.codeMax),
    name: requiredText(messages.nameRequired).max(CUSTOMER_NAME_MAX, messages.nameMax),
    email: emailField(),
    phone: optionalPhoneField(),
    status: z.enum(CUSTOMER_STATUSES),
    creditLimit: z
      .number({ error: messages.creditLimitInvalid })
      .min(0, messages.creditLimitInvalid),
  });
  return { customerFormSchema };
}
```

`useCustomerForm(customer?)` là NƠI DUY NHẤT xử lý gửi — có `customer` thì sửa, không thì tạo:

```ts
const onSubmit = async (values: CustomerFormValues) => {
  const isCurrent = begin();
  try {
    if (customer) await update.mutateAsync({ id: customer.id, input: values });
    else await create.mutateAsync(values);
  } catch (error) {
    if (!isCurrent()) return;
    if (isAppError(error) && error.code === CUSTOMER_CODE_TAKEN) {
      form.setError('code', { type: 'server', message: t('codeTaken') });
    } else {
      applyServerErrors(error);
    }
    return;
  }
  if (!isCurrent()) return;
  form.reset(values);
  showToast('success', customer ? t('updated') : t('created'));
  router.push(PATHS.DEMO_CUSTOMERS);
};
```

- **Lỗi không ném ra khỏi `onSubmit`** (`<Form>` chỉ `console.error` khi ném): 409 mã trùng → ô `code` (rẽ nhánh theo `error.code`, KHÔNG so câu chữ) · 422 có `fieldErrors` → từng ô (`useServerErrors`) · lỗi khác → `<Form.Error message={rootError} />`. Form GIỮ dữ liệu, không điều hướng, không toast (đã `silentError`).
- `useLatestRequest` + `isCurrent()` sau MỖI `await`: rời trang khi đang gửi thì không `router.push` / `setError` vào cây đã gỡ (`async-safety.md`).
- **Chống mất dữ liệu:** `<Form dirtyGuard>` (UI kit đã có, KHÔNG tự viết lại) hỏi lại khi bấm liên kết rời trang lúc còn thay đổi; `form.reset(values)` trước khi điều hướng để guard tắt. Nút Back của trình duyệt KHÔNG bị chặn (`known-issues.md`). "Huỷ" là `<Link>` về danh sách.
- Bản ghi tới từ query (`CustomerEditContent`) → `<CustomerForm key={customer.id} customer={…} />`: `defaultValues` chỉ đọc lúc mount nên đổi bản ghi phải dựng lại form.
- Nháp (`autoSave`) CHƯA bật ở mẫu: form ngắn, mất dữ liệu ít. Form dài thì thêm prop `autoSave` với `key` RIÊNG người dùng + bản ghi (dạng `customer-edit:<userId>:<id>`) — `notes/components/form.md`.

**Bước 6 — Xoá.** `CustomerDeleteDialog` dùng `ConfirmDialog variant="delete" closeOnConfirm={false} loading={isPending}`: hộp ở lại và khoá nút trong lúc xoá; thành công → toast + đóng; lỗi → toast tập trung và hộp ở lại để thử lại. Nút xoá của dòng chỉ hiện khi `usePermission({ resource: 'customer', action: 'delete' })`.

**Bước 7 — Route, path, menu, chữ.** Theo `guides/app-layer.md` §5.4 – §5.7:

1. Thư mục route dưới `src/app/[locale]/(workspace)/(app)/<path>/`: `layout.tsx` (`PermissionGate` quyền phân hệ) · `page.tsx` (danh sách, bọc `<Suspense>`) · `new/page.tsx` (`PermissionGate` thêm `create`) · `edit/page.tsx` (bọc `<Suspense>`). Mỗi `page.tsx` chỉ `generateMetadata` + một view.
2. `src/shared/constants/paths.constants.ts`: thêm `PATHS.*` và vào `PROTECTED_PATH_PREFIXES` (`tests/app/seo-routes.test.ts` đòi MỌI giá trị `PATHS` của vùng riêng tư có mặt ở đó, kể cả route con).
3. `src/app/_navigation/navigation.config.ts`: một phân hệ (hoặc thêm `screens` vào phân hệ có sẵn) — màn danh sách hiện trên dải điều hướng, màn thêm / sửa `hideInNav: true`.
4. Chữ ở CẢ hai ngôn ngữ: `messages/{vi,en}/<f>.json` (gắn vào `index.ts` của mỗi ngôn ngữ + `CLIENT_NAMESPACES` ở `core/i18n/messages.ts`) · `metadata.json` (3 khoá) · `shell.json` (`nav.<id>` mỗi màn). Chạy `npm run check:i18n`.
5. Mẫu ở `demo/customers/` còn thêm `if (!appConfig.isDemo) notFound()` ở `layout.tsx` (bản `app` trả 404). Màn thật BỎ dòng này và dời route ra khỏi `demo/`.

---

## 4. Trang sửa: route tĩnh + `?id=`, không phải `[id]`

Đường sửa là `/demo/customers/edit?id=12`, không phải `/demo/customers/12`. Lý do: `npm run check:static-routes` đòi MỌI route `[locale]/…` được prerender tĩnh và chỉ cho phép `[...rest]` là động (`scripts/check-static-routes.mjs`); segment `[id]` không biết trước danh sách id lúc build (bản ghi do người dùng tạo lúc chạy) nên thành `ƒ` — vi phạm luật giữ SSG (`architecture.md` §3). Với route tĩnh:

- `edit/page.tsx` là Server Component tĩnh, bọc `<Suspense>`; `CustomerEditView` đọc `?id=` bằng `useQueryParams().getParam('id')` ở client, kiểm bằng `parseCustomerId`.
- `?id=` rác (`abc`, `0`, `12abc`) → màn "không tìm thấy" mà không gọi API; id đúng định dạng nhưng BE trả 404 (`AppError.kind === 'not_found'`) → cùng màn đó, KHÔNG phải màn lỗi tải.
- Đường dựng một chỗ: `customerEditPath(id)` ở `utils/customer-url.utils.ts` (mã hoá `id`).
- Cần `/…/<id>` thật (URL đẹp, trang CÔNG KHAI cho SEO)? Dùng `[id]` kèm `generateStaticParams` (`app-layer.md` §5.6, `routing-conventions.md` §11) — nhưng vùng làm việc có dữ liệu theo người dùng thì chọn route tĩnh + query như mẫu này.

---

## 5. Quyền — giao diện chỉ ẩn nút, backend PHẢI kiểm lại

| Ở đâu      | Khai                                                                        | Làm gì                                                             |
| ---------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Menu       | `permission` của `screens` ở `navigation.config.ts`                         | Ẩn mục menu                                                        |
| Route      | `PermissionGate` ở `layout.tsx` (cả nhóm) và `new/page.tsx` (thêm `create`) | Hiện `ForbiddenView` tại chỗ                                       |
| Nút / form | `usePermission({ resource, action })` ở component                           | Ẩn "Thêm", cột xoá; form `readOnly` + thông báo khi thiếu `update` |

> ⛔ Mọi kiểm quyền ở trình duyệt chỉ là TRẢI NGHIỆM, KHÔNG phải bảo mật: người dùng sửa được JavaScript, gõ thẳng URL, gọi thẳng API. Backend PHẢI kiểm quyền lại trên từng endpoint
> (`POST` · `PUT` · `DELETE` kiểm `customer:create|update|delete`, `GET` kiểm `customer:view`) và trả 403 — giao diện đã có sẵn đường hiện lỗi đó (`AppError.kind === 'forbidden'`). Chế độ demo mở MỌI quyền
> (`canAccess` luôn `true`) nên muốn thấy gate thật thì kiểm bằng test (§6) hoặc chạy chế độ app.

Menu ↔ `PermissionGate` phải KHỚP (lệch thì menu ẩn mà gõ URL vẫn vào, hoặc menu hiện mà bấm ra 403) — `tests/features/customers/customers-permissions.test.tsx` giữ cặp này cho mẫu.

---

## 6. Test

Đặt ở `tests/features/<f>/` (mỗi folder ≤ 8 mục); dựng bằng `tests/helpers/render-with-query.tsx` (`renderWithQuery`: provider next-intl + `LocaleSync` + `QueryClient` có bộ báo lỗi tập trung, tắt `retry`).

| File mẫu                         | Giữ gì                                                                                                                                                                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `customers-flow.test.tsx`        | Luồng trên máy chủ demo: bộ lọc / trang trên URL · **sửa → lưu → danh sách đang mở làm mới** · tạo · xoá · rỗng · id rác                                                                                                          |
| `customers-errors.test.tsx`      | **Lỗi thật** qua `mockHttp` (mock `@/core/config` đặt `isDemo = false`): 409 → ô mã · 422 → ô có lỗi · 500 → dòng lỗi chung · form GIỮ dữ liệu, không điều hướng, không toast chen · tải lỗi + "Thử lại" · hợp đồng sai · xoá lỗi |
| `customers-contract.test.ts`     | Mapping DTO ↔ model · schema DTO từ chối tiền sai · **khoá query** (nhánh `lists()` / `details()`, invalidate) · `parse*` của URL                                                                                                 |
| `customers-permissions.test.tsx` | Bật kiểm đăng nhập: thiếu quyền ghi → nút ẩn, form chỉ đọc · menu ↔ `PermissionGate` khớp                                                                                                                                         |

Quy tắc dựng ca: gọi API qua `mockHttp` (KHÔNG `vi.mock('@/core/http')`); ca chạy trên demo gọi `resetCustomersDemo({ latencyMs: 0 })` ở `beforeEach`; ca kiểm "danh sách làm mới" dựng view danh sách và view sửa CÙNG một `QueryClient` để thấy invalidate chạy thật. Hộp thoại Radix làm phần còn lại của trang `aria-hidden` — truy vấn phần tử đó khi hộp mở cần `{ hidden: true }`.

---

## 7. Lỗi thường gặp

| Triệu chứng                                                                               | Nguyên nhân                                                                        | Sửa                                                                                                            |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `npm run build`: "should be wrapped in a suspense boundary" / route thành `ƒ`             | View đọc `useSearchParams` / `useQueryParams` mà `page.tsx` không bọc `<Suspense>` | Bọc `<Suspense fallback={null}>` ở `page.tsx`                                                                  |
| `MISSING_MESSAGE` lúc chạy dù `tsc` xanh                                                  | Namespace mới chưa vào `CLIENT_NAMESPACES` (view là Client Component)              | Thêm vào `src/core/i18n/messages.ts`                                                                           |
| Toast lỗi hiện HAI lần (toast + trên form)                                                | Quên `meta: { silentError: true }` ở query / mutation mà view tự vẽ lỗi            | Khai `silentError` (`api-patterns.md` §3)                                                                      |
| Câu riêng của `showErrorToast` không bao giờ hiện                                         | Thiếu `silentError` — bộ tập trung báo trước và đánh dấu lỗi đã báo                | Khai `silentError` rồi mới `showErrorToast` trong `onError`                                                    |
| Sửa xong danh sách vẫn cũ                                                                 | Invalidate sai nhánh key (key danh sách không nằm dưới `lists()`)                  | Mọi key danh sách bắt đầu bằng `customerKeys.lists()`                                                          |
| Gõ tìm kiếm mất dấu tiếng Việt                                                            | Ô `Input` controlled (`value={search}`)                                            | `useImeSafeSearchInput` (ESLint `guard/search-input` chặn)                                                     |
| Form sửa hiện dữ liệu cũ sau khi đổi `?id=`                                               | `defaultValues` chỉ đọc lúc mount                                                  | `key={customer.id}` ở cha                                                                                      |
| Form gửi `"   "` qua kiểm lỗi                                                             | Text bắt buộc thiếu `.trim()`                                                      | `requiredText()` hoặc `.trim().min(1)` (`form-validation.md`)                                                  |
| Xoá dòng cuối của trang cuối (hoặc gõ `?page=99`) ra trang trống báo "chưa có khách hàng" | `page` lớn hơn số trang còn lại                                                    | `useCustomerList` đã tự `setPage` về trang cuối khi `page > ceil(total / pageSize)` — giữ đoạn đó khi nhân bản |
| Test 500 chạy lâu hơn 1 giây                                                              | Query thử lại 1 lần với lỗi 5xx (hành vi app thật)                                 | Dùng `renderWithQuery` (tắt `retry`)                                                                           |
| `PermissionGate` không chặn ở chế độ demo                                                 | `canAccess` luôn `true` khi kiểm đăng nhập tắt                                     | Kiểm bằng test có `authEnabled: true` (§6)                                                                     |

---

## 8. Checklist

- [ ] Cây folder đúng `feature-structure.md`; `index.ts` chỉ export view; mỗi folder ≤ 8 mục, `.tsx` ≤ 200 dòng
- [ ] Model giao diện ≠ DTO; mapping thuần ở `utils/`; phản hồi qua `readData(response, schema)`
- [ ] Query key MỘT chỗ (`lists()` / `detail()`); mọi mutation invalidate `lists()`
- [ ] `silentError` đúng chỗ: view tự vẽ lỗi thì khai, còn lại để toast tập trung
- [ ] Bộ lọc / trang trên URL, giá trị từ URL được kiểm, `page.tsx` bọc `<Suspense>`
- [ ] Form: schema factory + `useXxxSchemas`, lỗi 409 / 422 / 5xx hiện đúng chỗ và GIỮ dữ liệu, `dirtyGuard`, `isCurrent()` sau mỗi `await`
- [ ] Quyền khai ở menu + `PermissionGate` + `usePermission`, khớp nhau; backend kiểm lại từng API
- [ ] Chữ ở cả `vi` và `en`, namespace vào `CLIENT_NAMESPACES`; `npm run check:i18n` xanh
- [ ] Route tĩnh: `npm run build` (hoặc build thử `NEXT_DIST_DIR=.next-check`) → `npm run check:static-routes` xanh, không `ƒ` mới
- [ ] Test: luồng · lỗi thật · mapping + khoá query · quyền; `npm run check` xanh
- [ ] Gỡ dấu vết demo khi dựng dự án thật (§2)
