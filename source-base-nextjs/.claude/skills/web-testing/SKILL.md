---
name: web-testing
description: Viết/chạy test cho base-project bằng Vitest 5 + Testing Library (+ provider next-intl) cho logic / component, và Playwright (`e2e/`) cho vài luồng thật trên bản build production — KHÔNG có k6. Dùng khi viết test mới, sửa test fail, hoặc quyết định coverage cần bao nhiêu.
---

# Web Testing — Vitest 5 + Testing Library

base-project test logic / component bằng Vitest 5 (jsdom) + React Testing Library; **vài luồng thật** (proxy + cookie, hydrate, đổi ngôn ngữ,
phiên, không tràn ngang) có Playwright trong `e2e/` (`npm run test:e2e`, mục §8 của `testing.md`) — ÍT test, giá trị cao, không thay test đơn vị.
Không có k6 / Cypress. Cây `tests/`, đặt tên file, helper, test luật:
**`docs/rules/foundations/testing.md`** (nguồn duy nhất — skill này không chép lại). Import helper bằng alias `@tests/helpers/<file>`.

## Lệnh

```bash
npm run test:unit -- <tên>   # vòng lặp nhanh lúc code (nhóm unit, timeout 5s)
npm run test:smoke           # *.smoke.test.tsx — dựng cả cây app (timeout 30s)
npm test                     # cả hai nhóm (nằm trong npm run check)
npm run test:watch           # watch mode (test:ui = giao diện Vitest)
npm run test:coverage        # ngưỡng chỉ cho src/core và src/domains/session
```

Xong việc: `npm run check` xanh (`docs/rules/foundations/quality-gates.md`). Test KHÔNG thay `npm run build` — Vitest không thấy được
route nào bị `ƒ` hay lỗi ranh giới server / client (Next báo lúc biên dịch).

## Một test — AAA (Arrange-Act-Assert)

```tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithIntl } from '@tests/helpers/render';
import { Button } from '@/shared/ui';

describe('Button', () => {
  it('gọi onClick khi bấm', async () => {
    const handleClick = vi.fn();
    renderWithIntl(<Button onClick={handleClick}>Lưu</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

- `describe` / `it` tiếng Việt, nói hành vi mong đợi — không `test1` / `it works`.
- Query theo `getByRole` / `getByLabelText` (như người dùng thật); `getByTestId` là phương án cuối. UI kit đứng trên Radix nên
  phần lớn có role / aria đúng — khó `getByRole` thường là component thiếu ARIA: sửa component trước.

## next-intl + điều hướng — helper ở `tests/helpers/render.tsx`

`render` trần của Testing Library KHÔNG có `NextIntlClientProvider` nên component dùng `useTranslations` / `Link` / `useRouter` của
`@/core/i18n` ném "No intl context found". Dùng:

| Helper                                             | Khi nào                                                                                                                          |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `renderWithIntl(ui, { locale })`                   | Component có chữ dịch (mặc định `vi`, thông điệp THẬT từ `src/messages/<locale>`; `locale: 'en'` khi hành vi phụ thuộc ngôn ngữ) |
| `renderInRouter(ui, { pathname, search, locale })` | Component đọc / đổi vị trí (`usePathname`, `useSearchParams`, `useRouter`, `<Link>`); trả thêm `router` (= `navigationMock`)     |
| `renderInForm(ui, defaultValues)`                  | Field UI kit cần nằm trong `<Form>` thật                                                                                         |

- `next/navigation` đã được mock ở `tests/setup.ts`; đọc / ghi qua `navigationMock` (`tests/helpers/navigation-mock.ts`):
  `navigationMock.setLocation('/en/settings', '?tab=2')`, `expect(navigationMock.push).toHaveBeenCalledWith('/dashboard')`.
  Pathname viết KHÔNG tiền tố cho `vi`, có `/en` cho tiếng Anh. `notFound()` / `redirect()` ném lỗi như bản thật.
- Assert theo chữ THẬT của thông điệp (`import viMessages from '@/messages/vi'` → `name: viMessages.auth.login.submit`) thay vì chép chuỗi —
  đổi chữ không làm đỏ test, còn khoá bị xoá thì `tsc` đỏ.
- Khoá thiếu / lệch giữa vi và en: do `tsc` + `npm run check:i18n` giữ, không viết test riêng. Chữ tiếng Việt cứng trong JSX: ESLint chặn.

## Phần Next-specific

- **Server Component `async`** (`page.tsx`, `layout.tsx`) KHÔNG render được bằng Testing Library. Tách phần logic thành hàm thuần rồi test
  hàm đó (`core/seo`: `buildPageMetadata`, `buildSitemap`, `buildRobots`, hàm JSON-LD — gọi trực tiếp, assert đối tượng trả về); phần
  render của view chính test qua view `'use client'` hoặc view tĩnh không `async`.
- **`server-only`** được alias thành module rỗng ở `vitest.config.ts` (`tests/helpers/server-only.ts`) — test import được file server-only;
  `build` mới là nơi kiểm lọt vào client.
- **Test luật** (đọc mã nguồn để giữ quy ước, `tests/policy/` và `tests/app/`): file chạm API chỉ-client phải có `'use client'` ·
  path ở `navigation.config.ts` ↔ có `page.tsx` · `PUBLIC_ROUTES` ∩ `PRIVATE_PATHS` = rỗng · `proxy.ts`. Thêm route / phân hệ mà các
  test này đỏ → sửa code, không nới test (danh sách thật: `docs/rules/foundations/testing.md`).
- **Env:** đổi `appConfig` bằng `vi.mock('@/core/config', …)`; test cố định chế độ demo qua `test.env` trong `vitest.config.ts`.
- **Zustand `persist`:** store dùng `skipHydration` nên không tự đọc `localStorage` — test cần giá trị đã lưu thì gọi
  `rehydratePersistedStores()` (`@/shared/utils/browser/storage.utils`) hoặc `useXxxStore.persist.rehydrate()`.

## Mock

- Gọi API: KHÔNG mock module `@/core/http`. Dùng `mockHttp(handler)` (`tests/helpers/http-mock.ts`) — chỉ thay tầng mạng nên interceptor,
  hàm API và TanStack Query THẬT vẫn chạy (ví dụ: `tests/domains/session-lifecycle.test.ts`).
- Thứ tự bất đồng bộ (lượt về ngược, huỷ): `createDeferred` / `createGate` (`tests/helpers/deferred.ts`) — không ngủ thật.
- `vi.fn()` cho callback; `vi.spyOn` khi chỉ theo dõi một method. `localStorage` của jsdom là `Storage` thật — spy trên
  `Storage.prototype`, không trên instance.

## Thêm component vào UI kit

Các test dựa trên barrel (`tests/helpers/ui-kit-exports.ts`) tự đưa component mới vào phạm vi: render được, xuất kèm `XxxProps`, có khối
tài liệu khớp props, có mặt trên `/demo`. Quên một trong số đó là đỏ — không cần viết test riêng cho việc export; chỉ cần thêm ca render
tối thiểu khi test báo thiếu.

## Coverage — theo rủi ro, không ép 100%

| Vùng                                                           | Mục tiêu                                                                         |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Logic nghiệp vụ quan trọng (phiên, refresh token, validation)  | Gần 100% nhánh                                                                   |
| `core/seo`, `core/i18n`, `core/config` (hàm thuần, env schema) | Phủ rộng — lỗi ở đây là lỗi cho MỌI trang                                        |
| UI kit                                                         | Đã có render rộng + test luật; test thêm khi component có state / logic phức tạp |
| Feature UI                                                     | Happy path + 1–2 edge case rõ ràng                                               |
| Component hiển thị thuần                                       | Không bắt buộc test riêng nếu đã phủ qua trang                                   |

## IME / tìm kiếm — đừng bỏ qua

Ô tìm / lọc tự do dùng `useImeSafeSearchInput` (`docs/rules/interaction/ime-safe-input.md`): test PHẢI mô phỏng
`fireEvent.compositionStart` / `compositionEnd` — `userEvent.type()` không mô phỏng IME, dễ pass giả.
