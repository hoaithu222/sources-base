---
name: react-best-practices
description: Checklist tối ưu hiệu năng React/Next cho base-project — server-first, waterfall, bundle, re-render, hydration, JS thuần — trích từ bộ 45 rule của Vercel Engineering, đã chọn phần hợp với Next.js 16 App Router + React Compiler. Dùng khi nghi 1 màn hình chậm hoặc trước khi ship 1 tính năng nặng dữ liệu.
---

# React / Next Performance Checklist

base-project là **Next.js 16 App Router** (SSG mặc định, React Compiler bật) — các rule Server Component / RSC **ÁP DỤNG**. Ngân sách
tải đầu do KỶ LUẬT ranh giới server / client giữ (`docs/architecture.md` §2, §16), không phải do một script đo bundle. Đo: `npm run build`
(bảng Route) · `npm run analyze` (`next experimental-analyze`, Turbopack) · Lighthouse / React DevTools Profiler.

## 0. Server-first — CRITICAL

- Mặc định Server Component; chỉ file thật sự cần hook / handler / API trình duyệt mới `'use client'`, và đẩy `'use client'` xuống
  Component LÁ (nút, ô nhập), không đánh dấu cả view / layout (`docs/rules/structure/server-client-boundary.md`).
- Không đẩy cả object lớn qua prop Server → Client (server-serialization): chỉ truyền field client dùng; props được serialize vào HTML.
- Trang marketing `(public)` không kéo React Query, Zustand phiên, toast, Recharts — provider nặng chỉ ở `(workspace)` (`AppProviders`).
- Dữ liệu công khai fetch ở Server Component; dữ liệu theo phiên đi TanStack Query ở client (token nằm trong bộ nhớ).
- Giữ route TĨNH: `cookies()` / `headers()` / `searchParams` / `useSearchParams` thiếu `<Suspense>` biến route thành `ƒ`
  (`npm run build` → bảng Route). Việc cần sau-response (log, analytics) → `after()` từ `next/server`, không chặn response.
- Dedup trong một request ở server: `React.cache()` bọc hàm đọc dữ liệu dùng ở nhiều component; `fetch` trùng URL Next tự dedup.

## 1. Tránh waterfall — CRITICAL

- `await` song song bằng `Promise.all()` khi 2+ request độc lập, KHÔNG `await` tuần tự từng cái một — kể cả ở Server Component và
  `generateMetadata` (cùng dữ liệu với page → bọc `React.cache`).
- Tách component để từng phần fetch riêng và bọc `<Suspense>` riêng (streaming) thay vì một page `await` hết rồi mới render.
- Query độc lập trong cùng component client → tách `useQuery` riêng, đừng gộp `queryFn` ôm nhiều fetch nối tiếp.
- Bọc phần chờ lâu trong `<Suspense>` boundary riêng (hoặc `loading.tsx` của nhóm route), đừng để 1 fetch chậm chặn cả cây.

## 2. Bundle size — CRITICAL

- KHÔNG import cả barrel khi chỉ cần 1 export (`import { formatDate } from '@/shared/utils/format/format.utils'`, không
  `import * as utils`). Thư viện nhiều export (recharts, dayjs, dnd-kit) đã khai `experimental.optimizePackageImports` ở
  `next.config.ts` — thêm thư viện mới nhiều export thì thêm vào đó. Barrel `@/shared/ui` của repo được phép (một cổng import công
  khai) — nhưng đừng thêm re-export thư viện nặng vào barrel dùng chung.
- KHÔNG import `recharts` / dnd-kit / `react-arborist` vào layout hay barrel dùng chung — chỉ vào bundle của trang import chúng.
- Widget nặng CHỈ-CLIENT dùng hiếm (editor, biểu đồ lớn, modal hiếm mở, export PDF, xử lý ảnh) → `next/dynamic` (`ssr: false` chỉ
  trong Client Component) hoặc `import()` động tại điểm dùng, không import tĩnh đầu file.
- Third-party script không thiết yếu (analytics...) → `next/script` với `strategy="afterInteractive"` / `"lazyOnload"`, không chặn render.
- Preload khi hover vào link điều hướng: `Link` của Next đã prefetch route trong viewport — đừng tự thêm.
- `next/image` cho ảnh nội dung (đã bật AVIF / WebP); font qua `next/font` (không `<link>` Google Fonts).

## 3. Client data fetching — MED-HIGH

- TanStack Query đã tự dedup request trùng key trong cùng thời điểm — KHÔNG tự viết cache/dedup layer riêng đè lên nó.
- Global event listener (resize, scroll, keydown...) → đăng ký 1 lần dùng chung (hook `useMediaQuery` / `useElementSize` có sẵn ở
  `@/shared/hooks`), KHÔNG mỗi component tự `addEventListener` riêng cho cùng 1 sự kiện.

## 4. Re-render — MEDIUM

- **React Compiler đang bật** (`reactCompiler: true`): tự memo hoá component / hook, nên KHÔNG thêm `memo` / `useMemo` / `useCallback`
  phản xạ (`docs/rules/foundations/code-optimization.md` nói khi nào VẪN cần). Đổi lại code phải theo Rules of React — đọc `ref.current` /
  mutate props, state lúc render, hook trong điều kiện làm Compiler BỎ QUA component đó (mất memo hoá, không báo lỗi lúc chạy);
  ESLint (`react-hooks` có luật React Compiler) báo phần lớn ca này.
- Đọc state ở component con nhất cần nó, không đọc ở cha rồi truyền prop xuống nhiều tầng nếu con cháu không cần re-render theo.
- Dependency array chỉ chứa **giá trị primitive ổn định** — object/array tạo mới mỗi render trong deps làm effect chạy lại vô ích.
- Derived state tính trực tiếp trong render, KHÔNG đồng bộ qua `useEffect` + `useState` riêng (2 nguồn sự thật, dễ lệch nhau).
- `setState` dạng hàm (`setCount(c => c + 1)`) khi update dựa trên giá trị cũ — tránh stale closure trong handler/effect.
- Khởi tạo state nặng qua lazy initializer: `useState(() => expensiveInit())`, KHÔNG `useState(expensiveInit())`.
- `startTransition` cho update không khẩn cấp (filter danh sách lớn) để không chặn input đang gõ.

## 5. Rendering & hydration — MEDIUM

- Giá trị chỉ có ở trình duyệt (`localStorage`, `window.matchMedia`, `Date.now()`, `Math.random()`) KHÔNG đọc lúc render lần đầu — HTML
  server sẽ khác client → hydration mismatch. Store `persist` dùng `skipHydration` (`architecture.md` §4); hook như `useIsPhone` /
  `useMediaQuery` trả mặc định ở lần render đầu — thứ cần đúng từ HTML đầu thì dùng CSS (`phone:`, `max-lg:`).
- Tránh nháy giao diện (theme sáng → tối): script inline đặt class TRƯỚC khi hydrate (`appearanceInitScript` trong `<head>`),
  kèm `suppressHydrationWarning` trên `<html>` — đừng đợi `useEffect` rồi mới áp theme.
- SVG động (icon xoay, progress ring...) → animate transform ở wrapper, hạn chế animate trực tiếp path phức tạp.
- Danh sách dài ẩn ngoài viewport → cân nhắc `content-visibility: auto`.
- JSX tĩnh không phụ thuộc props/state → hoist ra module scope (hoặc để Compiler lo).
- Điều kiện render: `cond ? <A/> : null`, tránh `cond && <A/>` khi `cond` có thể là `0`/`''`.

## 6. JS thuần — LOW-MED (không liên quan React, áp dụng mọi nơi tính toán nặng)

- Tra cứu lặp lại nhiều lần → build `Map`/object index 1 lần, đừng `array.find()` trong vòng lặp lồng nhau (O(n²) ẩn).
- Truy cập `array.length`/property lồng sâu trong vòng lặp nóng → cache ra biến local trước vòng lặp.
- Kiểm tra rẻ trước (`if (!arr.length) return`) trước khi làm việc tốn kém.
- Trùng lặp phần tử → `Set`, tra cứu theo key → `Map`, không `array.includes()` trong vòng lặp.
- `array.toSorted()` (immutable) thay `array.sort()` (mutate tại chỗ) khi không chắc ai khác còn giữ tham chiếu mảng gốc.

## 7. Advanced — LOW

- Handler cần đọc giá trị props/state MỚI NHẤT nhưng không muốn nằm trong dependency array → ref pattern (`useEventCallback` có sẵn
  ở `@/shared/hooks`), không tự chế `useRef` + đồng bộ tay.

---

## Không áp dụng cho base này

`async-api-routes` / Route Handler tối ưu (chỉ có `/api/health`; `/api/*` proxy về backend qua `rewrites()`) · Server Actions
(`server-auth-actions`: base không dùng Server Actions — mọi ghi dữ liệu đi `apiClient` tới backend) · Cache Components /
`'use cache'` (chưa bật `cacheComponents`; muốn bật → skill `brainstorm` trước, vì đổi mô hình render toàn app).
