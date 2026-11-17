# API & Data Fetching Patterns

## API nằm ở đâu

Hàm gọi API thuộc về **nơi sở hữu dữ liệu**, không gom về `core`:

```
src/core/http/                 # CHỈ hạ tầng: apiClient, AppError, readData — không có API nghiệp vụ
src/domains/{domain}/api/      # Dữ liệu NHIỀU feature dùng chung (vd phiên đăng nhập)
src/features/{feature}/api/    # Dữ liệu của riêng một feature
```

Cây folder của feature: xem `structure/feature-structure.md`. File của chủ đề này nằm ở:
`api/{feature}.api.ts` — endpoint + hàm async thuần (KHÔNG React); `api/{feature}.types.ts` —
kiểu request / response; `service/{feature}.queries.ts` — React Query hooks.

> Chưa chắc dữ liệu có dùng chung không → cứ đặt trong feature. Khi feature thứ
> hai cần tới thì mới dời xuống `domains/`. Đừng tạo domain "để sẵn".

## 0. Gọi API ở đâu: server hay client (quyết định đầu tiên của bản Next)

| Dữ liệu                                                                             | Gọi ở                                                         | Cách                                                                                                                   | Vì sao                                                                                                                             |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Công khai, không cần phiên** (nội dung trang marketing / SEO, danh mục, bài viết) | **Server Component** (`page.tsx` / view không `'use client'`) | `fetch` của Next trong hàm có `import 'server-only'`, khai `next: { revalidate: N }` (ISR) hoặc `cache: 'force-cache'` | HTML trả về đã có dữ liệu → công cụ tìm kiếm đọc được, LCP tốt, không thêm JS; route vẫn tĩnh                                      |
| **Gắn phiên người dùng** (mọi thứ trong `(workspace)`)                              | **Client Component**                                          | TanStack Query + `apiClient` (§1–§2)                                                                                   | Access token chỉ ở BỘ NHỚ trình duyệt (`architecture.md` §11) — server không có token; interceptor 401 → refresh chỉ chạy ở client |

- ⛔ **KHÔNG dùng `apiClient` ở server.** Token adapter (`configureHttp`) chỉ được cấu hình ở trình duyệt (`SessionBootstrap`),
  nên axios chạy ở server là request KHÔNG token và không có interceptor refresh. Server gọi BE thẳng bằng `fetch`, đích là
  `serverConfig.apiProxyTarget` (biến server-only, `@/core/config/server-config`).
- ⛔ **KHÔNG đọc `cookies()` / `headers()` trong layout / page công khai để gọi BE thay người dùng** — đó là thứ biến route SSG thành
  render động (mất tĩnh, mất cache CDN — `architecture.md` §3). Dữ liệu theo người dùng cứ để client lấy sau khi hydrate.
- Dữ liệu chung nhưng NHIỀU người dùng cùng đọc, đổi chậm → `revalidate` ở server. Dữ liệu đổi liên tục / theo người dùng → client.
- Từ trình duyệt, `apiClient` gọi `/api/*` **cùng origin**; `next.config.ts` `rewrites()` proxy đường đó về `API_PROXY_TARGET`
  nên cookie HttpOnly refresh-token là first-party (không bị chặn như third-party). Đổi tiền tố / đích: `NEXT_PUBLIC_API_BASE_URL` +
  `API_PROXY_TARGET` trong `.env`, không tự gọi `fetch('http://…')` cứng từ client.

```typescript
// src/features/{feature}/api/{feature}.server.ts — CHỈ chạy ở server (mẫu; chưa có trang công khai nào lấy dữ liệu BE)
import 'server-only';

import { serverConfig } from '@/core/config/server-config';

import { featureItemsSchema } from './{feature}.schema';

export async function getPublicItems() {
  const response = await fetch(`${serverConfig.apiProxyTarget}/api/public/items`, {
    next: { revalidate: 300 }, // ISR: dựng lại tối đa 5 phút / lần — không khai thì Next KHÔNG cache fetch
  });
  if (!response.ok) throw new Error(`public items: ${response.status}`); // `error.tsx` của nhóm route bắt
  return featureItemsSchema.parse(await response.json()); // kiểm hình dạng như `readData(…, schema)` — async-safety.md §6
}
```

## 1. Hàm API — async thuần, trả THẲNG payload

```typescript
// src/features/{feature}/api/{feature}.api.ts
import { apiClient, readData } from '@/core/http';
import type { ApiResponse } from '@/core/http';

import type { FeatureItem, FeatureListPage, GetFeatureListRequest } from './{feature}.types';

const ENDPOINTS = {
  list: '/feature',
  byId: (id: string) => `/feature/${id}`,
} as const;

export const featureApi = {
  // Hàm ĐỌC nhận `signal` để huỷ request thật khi query bị huỷ.
  getList: async (params: GetFeatureListRequest, signal?: AbortSignal): Promise<FeatureListPage> =>
    readData(await apiClient.get<ApiResponse<FeatureListPage>>(ENDPOINTS.list, { params, signal })),

  getById: async (id: string, signal?: AbortSignal): Promise<FeatureItem> =>
    readData(await apiClient.get<ApiResponse<FeatureItem>>(ENDPOINTS.byId(id), { signal })),

  create: async (data: Partial<FeatureItem>): Promise<FeatureItem> =>
    readData(await apiClient.post<ApiResponse<FeatureItem>>(ENDPOINTS.list, data)),

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.byId(id));
  },
};
```

- **Đường dẫn tính từ `NEXT_PUBLIC_API_BASE_URL`** (mặc định `/api`, same-origin qua `rewrites()`). BE có version thì ghi vào
  biến đó (`NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1` hoặc `/api/v1`) — `ENDPOINTS` KHÔNG thêm
  tiền tố `/v1`, không khai hằng `API_PREFIX` / `API_V1` trong từng file API. Biến `NEXT_PUBLIC_*` nằm trong bundle: không đặt secret.
- **Danh sách phân trang** trả `{ items: T[]; total: number }` — khai trong
  `{feature}.types.ts` (`interface FeatureListPage { items: FeatureItem[]; total: number }`).
  Trang hiện tại / cỡ trang là `page` / `pageSize` của `useQueryParams`; BE đặt tên
  tham số khác (`PageNumber`, `PageSize`…) thì đổi tên ở chỗ dựng `params`.

### `readData` — vì sao không trả thẳng `response.data`

`ApiResponse<T>.data` là bắt buộc về mặt KIỂU, nhưng kiểu chỉ là lời hứa của FE
với chính nó. BE trả thiếu trường thì `res.data.items.map(...)` nổ ở một chỗ rất
xa nơi gọi API. `readData(response)` xác nhận `data` thật sự có, nếu không thì
ném `AppError('contract')`.

Payload **quan trọng** (phiên đăng nhập, quyền, tiền…) thì kiểm cả hình dạng:

```typescript
import { sessionPayloadSchema } from '../model/session.schema';

login: async (data: LoginRequest): Promise<SessionPayload> =>
  readData(await apiClient.post(ENDPOINTS.login, data), sessionPayloadSchema),
```

Kiểu trả về suy ra từ schema (`z.output<typeof schema>`) — không khai tay lần hai.
Bản mẫu chạy thật: `src/domains/session/api/`.

### Cờ điều khiển interceptor

Truyền thẳng trong config của lời gọi — đã khai vào kiểu của axios, không cần ép kiểu:

| Cờ                                | Dùng khi                                                                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| `skipAuthRefresh: true`           | Endpoint công khai (login, register…): 401 ở đó là "sai thông tin", không phải token hết hạn |
| `skipBusinessErrorHandling: true` | Chỗ gọi muốn tự đọc `{ status: false }` trả kèm HTTP 2xx                                     |

## 2. React Query hooks

```typescript
// src/features/{feature}/service/{feature}.queries.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { showToast } from '@/shared/ui';

import { featureApi } from '../api/{feature}.api';
import type { FeatureItem, GetFeatureListRequest } from '../api/{feature}.types';

// Khoá PHÂN CẤP — một chỗ, dùng lại cho `useQuery`, prefetch và `invalidateQueries` (mẫu đủ: `features/customers/service/customers.queries.ts`).
const QUERY_KEYS = {
  all: ['feature'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (params: GetFeatureListRequest) => [...QUERY_KEYS.lists(), params] as const,
  detail: (id: string) => [...QUERY_KEYS.all, 'detail', id] as const,
};

export const useFeatureList = (params: GetFeatureListRequest) =>
  useQuery({
    queryKey: QUERY_KEYS.list(params),
    // `signal` của React Query đi xuống tận axios → đổi filter nhanh thì
    // request cũ bị HUỶ THẬT, không chỉ bị bỏ kết quả.
    queryFn: ({ signal }) => featureApi.getList(params, signal),
  });

export const useFeatureById = (id: string | undefined) =>
  useQuery({
    queryKey: QUERY_KEYS.detail(id ?? ''),
    queryFn: ({ signal }) => featureApi.getById(id!, signal),
    enabled: !!id,
  });

export const useCreateFeature = () => {
  const queryClient = useQueryClient();
  const t = useTranslations('feature'); // `next-intl`; chữ ở `messages/<locale>/feature.json`
  return useMutation({
    mutationFn: (data: Partial<FeatureItem>) => featureApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      showToast('success', t('createSuccess'));
    },
  });
};
```

> File `*.queries.ts` có hook React Query nên PHẢI `'use client'` ở dòng đầu (kể cả file `.ts` — `server-client-boundary.md`).

## 3. Xử lý lỗi

Mọi lỗi ra khỏi `apiClient` là **`AppError`** (`@/core/http`):

| Trường        | Ý nghĩa                                                                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`        | `canceled` · `network` · `timeout` · `unauthorized` · `forbidden` · `not_found` · `validation` · `business` · `server` · `contract` · `unknown` |
| `message`     | Câu ĐÃ DỊCH theo ngôn ngữ đang chọn (lấy từ `errors.http` qua registry `errorMessages()`) — hiển thị được ngay                                  |
| `code`        | Mã lỗi của BE (vd `AUTH_001`) để rẽ nhánh nghiệp vụ                                                                                             |
| `status`      | HTTP status, nếu máy chủ có trả lời                                                                                                             |
| `fieldErrors` | Lỗi theo từng ô nhập → `useServerErrors(form).applyServerErrors(error)`                                                                         |

**Ai báo lỗi cho người dùng?** Mặc định KHÔNG phải bạn. Bộ báo lỗi tập trung
(`createQueryClient` của `@/core/query`, app dựng ở `src/app/_providers/query-client.ts` — `getQueryClient()`: server tạo client
MỚI mỗi lần gọi, trình duyệt dùng MỘT client duy nhất) toast mỗi lỗi đúng một lần, sau khi đã thử lại xong. Query tự thử lại một
lần, và chỉ với lỗi hạ tầng (mạng / timeout / 5xx). Tắt cả bộ: `NEXT_PUBLIC_ENABLE_ERROR_TOAST=false`.

**Lỗi nào được báo, câu nào** — một chỗ quyết: `claimErrorMessage` (`@/core/http`), dùng
chung bởi bộ báo tập trung và `showErrorToast`. Không báo: request bị huỷ, 401 (phiên hết
hạn đã có MỘT thông báo riêng), lỗi đã báo rồi. **Chỉ câu của `AppError` lên giao diện** —
lỗi khác (`TypeError`, `new Error('…')`) hiện câu dự phòng, không lộ câu thô.

| Tình huống                                                       | Làm gì                                                                                                       |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Lỗi thông thường của query / mutation                            | Không làm gì — đã có toast tập trung                                                                         |
| Màn hình TỰ vẽ lỗi (Callout trong form, trạng thái lỗi của bảng) | `meta: { silentError: true }` trên query/mutation đó, rồi `errorMessageOf(error, t('loadFailed'))` trong JSX |
| Muốn câu thông báo riêng                                         | `meta: { silentError: true }` + `onError: (e) => showErrorToast(e, { message: t('deleteFailed') })`          |
| Gọi `apiClient` ngoài React Query                                | `try/catch` rồi `showErrorToast(e)` (câu dự phòng riêng: `{ fallback: t('…') }`)                             |
| Màn hình tự ném lỗi và muốn người dùng thấy câu đó               | `throw new AppError('business', t('codeTaken'))` — `Error` thường chỉ hiện câu dự phòng                      |
| Rẽ nhánh theo loại lỗi                                           | `isAppError(e) && e.code === 'RES_002'` / `e.kind === 'forbidden'`                                           |

> ⛔ Thiếu `silentError` thì câu riêng KHÔNG BAO GIỜ hiện: `MutationCache.onError` chạy
> TRƯỚC `onError` của mutation, đã báo câu của lỗi và đánh dấu lỗi là đã báo — `showErrorToast`
> trong `onError` thấy dấu đó và bỏ qua.

```typescript
export const useDeletePlan = () => {
  const t = useTranslations('plan'); // hook gọi hook: chữ lấy từ `messages/<locale>/plan.json`, không viết cứng
  return useMutation({
    mutationFn: (id: string) => planApi.remove(id),
    meta: { silentError: true },
    onError: (error) => showErrorToast(error, { message: t('deleteFailed') }),
  });
};
```

### Câu lỗi của tầng HTTP là DỮ LIỆU DỊCH, không phải hằng trong code

Mọi câu lỗi (mã lỗi BE, HTTP status, mất mạng, timeout, câu dự phòng) nằm ở `src/messages/<locale>/errors.json` khoá `http`
(`codes` · `status` · `fallback` · `timeout` · `network` · …). `core/http` không biết React nên đọc qua registry
`errorMessages()` / `messageOfCode()` / `messageOfStatus()` (`core/http/errors/error-messages.ts`); `LocaleSync`
(`app/_providers`, chạy ở trình duyệt) gọi `configureErrorMessages(messages.errors.http)` mỗi khi đổi ngôn ngữ.

- **Thêm mã lỗi nghiệp vụ mới** → thêm khoá vào `errors.http.codes` ở **MỌI** ngôn ngữ (`tsc` đỏ nếu `en` thiếu — `satisfies Messages`).
- ⛔ Không viết câu lỗi cứng trong `catch` / hàm API. Cần câu riêng cho một màn → khoá trong namespace của feature + `t()` (bảng trên).
- Mặc định (chưa gọi `configureErrorMessages`, vd test) là tiếng Việt để lỗi vẫn đọc được. Quy tắc chung: `rules/i18n/i18n.md` §7.

## Quy tắc BẮT BUỘC

1. **React Query cho mọi API call** — KHÔNG dùng `useEffect` + `useState` để fetch
2. **Query keys chứa params** — `[KEY, params]` để auto-refetch
3. **Hàm API thuần async** — KHÔNG import React; trả payload qua `readData`, không trả vỏ `ApiResponse`
4. **Truyền `signal`** từ `queryFn` xuống hàm API đọc dữ liệu
5. **Invalidate sau mutation** — luôn invalidate query liên quan (`void queryClient.invalidateQueries(...)`)
6. **enabled flag** — dùng `enabled: !!id` cho conditional queries
7. **apiClient có sẵn interceptors** — KHÔNG tự gắn header, KHÔNG tự xử lý 401
8. **Không toast lỗi hai lần** — xem bảng ở mục 3
9. **API của feature nằm trong feature** — KHÔNG đặt API nghiệp vụ vào `src/core/`
10. **Đúng nơi gọi** (§0) — dữ liệu công khai: `fetch` ở server (`server-only`); dữ liệu theo phiên: React Query + `apiClient` ở client. KHÔNG `apiClient` ở server
11. **Câu lỗi là dữ liệu dịch** — thêm mã lỗi / câu riêng vào `messages/<locale>/errors.json` (hoặc namespace feature) ở MỌI ngôn ngữ, không viết cứng

---

## ⛔ URL-synced Filters — BẮT BUỘC cho mọi màn hình có filter/phân trang

> Bất kỳ màn hình / tab / panel nào có **filter** (search, dropdown, date range, …),
> **pagination** (page, pageSize), hoặc **tab navigation** → **BẮT BUỘC** đẩy
> toàn bộ state đó lên URL query string qua hook `useQueryParams` từ
> `@/shared/hooks`. **KHÔNG dùng `useState` thuần** để lưu filter.

### Lý do bắt buộc

1. **Shareable** — copy URL gửi cho người khác là họ thấy đúng cùng filter/trang
2. **Refresh-safe** — F5 không mất bộ lọc đang xem
3. **Browser back/forward** — user navigate qua lại theo lịch sử filter tự nhiên
4. **Deep link** — email/notification có thể link thẳng vào filter cụ thể
5. **Debug-friendly** — bug report có URL = reproduce được ngay

### Pattern chuẩn

```tsx
// src/features/{feature}/components/{Feature}List.tsx
'use client';

import { memo, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useDebounce, useImeSafeSearchInput, useQueryParams } from '@/shared/hooks';
import { Dropdown, Input, Table } from '@/shared/ui';

const FeatureList = memo(function FeatureList() {
  const t = useTranslations('feature');
  const { page, pageSize, search, setPage, setPageSize, setSearch, getParam, setParam } =
    useQueryParams();

  // Filter ngoài search/page → đọc/ghi qua getParam/setParam
  const statusFilter = getParam('status', 'all');
  const typeFilter = getParam('type', 'all');

  // Ô tìm kiếm PHẢI uncontrolled — `value={search}` bị ESLint chặn cứng
  // (mất dấu tiếng Việt). Xem `ime-safe-input.md`.
  const { inputProps } = useImeSafeSearchInput(search, setSearch);

  // Search debounce — VẪN debounce, nhưng nguồn = URL
  const debouncedSearch = useDebounce(search, 300);

  const queryParams = useMemo(
    () => ({
      Keyword: debouncedSearch || undefined,
      Status: statusFilter !== 'all' ? Number(statusFilter) : undefined,
      Type: typeFilter !== 'all' ? typeFilter : undefined,
      PageNumber: page,
      PageSize: pageSize,
    }),
    [debouncedSearch, statusFilter, typeFilter, page, pageSize],
  );

  const { data, isFetching } = useFeatureList(queryParams);

  return (
    <>
      <Input {...inputProps} placeholder={t('searchPlaceholder')} />
      <Dropdown
        value={statusFilter}
        options={STATUS_OPTIONS}
        onValueChange={(v) => setParam('status', v === 'all' ? null : v)}
      />
      <Dropdown
        value={typeFilter}
        options={TYPE_OPTIONS}
        onValueChange={(v) => setParam('type', v === 'all' ? null : v)}
      />
      <Table
        data={data?.items ?? []}
        loading={isFetching}
        pagination
        total={data?.total ?? 0}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </>
  );
});

export default FeatureList;
```

### API hook `useQueryParams`

| Trả về                             | Mô tả                                                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `page` (number)                    | URL `?page=2` → 2. Default 1                                                                                     |
| `pageSize` (number)                | URL `?pageSize=20` → 20. Default `DEFAULT_PAGE_SIZE`                                                             |
| `search` (string)                  | URL `?search=foo` → "foo"                                                                                        |
| `tab` (string)                     | URL `?tab=members` → "members"                                                                                   |
| `getParam(key, default?)`          | Đọc custom param                                                                                                 |
| `setPage(n)`                       | Set `?page=n`                                                                                                    |
| `setPageSize(n)`                   | Set `?pageSize=n`, auto reset `?page=1`                                                                          |
| `setSearch(v)`                     | Set `?search=v`, auto reset `?page=1`. `''` xoá key                                                              |
| `setTab(v)`                        | Set `?tab=v`. `''` xoá key                                                                                       |
| `setParam(key, v)`                 | Set custom param, auto reset `?page=1`. `null` xoá key                                                           |
| `updateParams({...})`              | Batch update nhiều param 1 lần (không reset page)                                                                |
| `clearParams()`                    | Xoá CHỈ param hook sở hữu (page / pageSize / search / tab + `paramKeys`); param khác (`?display=tv`…) giữ nguyên |
| `searchParams` (`URLSearchParams`) | Đối tượng thô, khi cần đọc param ngoài bảng trên                                                                 |

Config nhận: `pageKey` · `pageSizeKey` · `searchKey` · `tabKey` · `defaultPageSize` · `maxPageSize` (mặc định `MAX_PAGE_SIZE`) · `resetPageOnChange` · `paramKeys` (param bổ sung mà `clearParams()` được xoá).

**Tính chất:**

- ⛔ **Trang dùng `useQueryParams` PHẢI nằm trong `<Suspense>`.** Hook đọc `useSearchParams` của `next/navigation`; thiếu `<Suspense>` thì
  `next build` báo lỗi "should be wrapped in a suspense boundary" (hoặc cả route bị đẩy sang render phía client — mất SSG). Trong
  `(workspace)/(app)` đã có `loading.tsx` (Next tự bọc `page.tsx` bằng Suspense); nhóm khác (`(public)`, `(auth)`) tự bọc ở `page.tsx` — mẫu
  `(auth)/reset-password/page.tsx`. Cùng lý do: KHÔNG gọi `useSearchParams` trần trong layout.
- Ghi bằng `router.replace(url, { scroll: false })` của `@/core/i18n` (giữ tiền tố ngôn ngữ) → không phá `history` khi gõ search, không cuộn lên đầu
- Lần render server / SSG chưa có query string → hook trả mặc định (`page = 1`, `search = ''`); giá trị thật có sau hydrate. Dữ liệu theo filter
  vì vậy do client lấy (React Query) — đừng nhờ server prerender theo `searchParams` (biến route thành render động)
- Đổi filter / search / pageSize → tự reset `page = 1`
- Giá trị rỗng (`''`, `null`, `undefined`) → xoá key khỏi URL (URL sạch)
- `page` / `pageSize` đọc nghiêm ngặt: chỉ số nguyên dương (`12abc`, `1e3`, `10.5` → mặc định); `pageSize` ngoài `[1, maxPageSize]` → `defaultPageSize` (không cắt về trần)
- Default keys: `page`, `pageSize`, `search`, `tab` — đổi qua `config` nếu nhiều bảng share URL

### Tuỳ chỉnh key (khi 2+ bảng cùng trang)

```tsx
// Bảng A
const a = useQueryParams({
  pageKey: 'aPage',
  searchKey: 'aSearch',
});

// Bảng B
const b = useQueryParams({
  pageKey: 'bPage',
  searchKey: 'bSearch',
});
```

### Anti-patterns — BLOCK MERGE

| ❌ Sai                                                                      | ✅ Đúng                                                       |
| --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `const [search, setSearch] = useState('')` cho list page                    | `const { search, setSearch } = useQueryParams()`              |
| `const [page, setPage] = useState(1)` cho list page                         | `const { page, setPage } = useQueryParams()`                  |
| `const [filter, setFilter] = useState('all')`                               | `const filter = getParam('key', 'all'); setParam('key', val)` |
| Tự viết `useSearchParams` (từ `next/navigation`) + tự parse trong component | Dùng `useQueryParams` — KHÔNG re-implement                    |
| Trang dùng `useQueryParams` mà không có `<Suspense>` / `loading.tsx` bọc    | Bọc `<Suspense>` (xem "Tính chất" trên)                       |
| Lưu filter vào `localStorage` thay vì URL                                   | URL là source of truth duy nhất cho filter                    |
| Quên reset `page = 1` khi đổi filter                                        | `useQueryParams` tự reset — KHÔNG cần code tay                |
| Để URL có `?status=` (empty)                                                | Truyền `null` vào `setParam` → key bị xoá                     |

### Khi nào ngoại lệ KHÔNG cần đẩy URL?

| Tình huống                                       | Giải pháp                          |
| ------------------------------------------------ | ---------------------------------- |
| Filter trong modal/dialog tạm thời (đóng = mất)  | `useState` OK — KHÔNG cần URL      |
| Form input (chưa submit)                         | `react-hook-form` — KHÔNG dùng URL |
| Toggle expand/collapse UI (không ảnh hưởng data) | `useState` / `useDisclosure` OK    |
| Selected row trong table (chưa navigate)         | `useState` OK                      |
| Drag-drop reorder state tạm                      | `useState` OK                      |

> Quy tắc: nếu **state ảnh hưởng tới query gọi API** hoặc **danh sách dữ liệu user thấy** → BẮT BUỘC lên URL.

### Checklist trước khi commit list/table page

- [ ] Mọi `useState` cho search / filter / page / pageSize / tab đã được thay bằng `useQueryParams`?
- [ ] Filter dropdown gọi `setParam(key, val === 'all' ? null : val)` (xoá key khi default)?
- [ ] `useDebounce(search, 300)` vẫn được áp cho input text search?
- [ ] `Table` nhận `currentPage={page}`, `pageSize={pageSize}`, `onPageChange={setPage}`, `onPageSizeChange={setPageSize}`?
- [ ] Trang đã nằm trong `<Suspense>` (hoặc có `loading.tsx` cùng segment) và `npm run build` không báo `useSearchParams`?
- [ ] Refresh trình duyệt → filter & pagination giữ nguyên?
- [ ] Copy URL sang tab khác → thấy đúng filter?
