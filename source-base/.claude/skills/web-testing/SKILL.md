---
name: web-testing
description: Viết/chạy test cho base-project bằng Vitest + Testing Library — KHÔNG có Playwright/e2e/k6 trong stack này. Dùng khi viết test mới, sửa test fail, hoặc quyết định coverage cần bao nhiêu.
---

# Web Testing — Vitest + Testing Library

base-project **không có Playwright, e2e, k6** — chỉ unit / integration bằng Vitest (jsdom) + React Testing Library.
Đừng đề xuất Playwright / Cypress trừ khi user yêu cầu rõ. Cây `tests/`, đặt tên file, helper, test luật:
**`docs/rules/foundations/testing.md`** (nguồn duy nhất — skill này không chép lại).

## Lệnh

```bash
npm run test:unit -- <tên>   # vòng lặp nhanh lúc code (nhóm unit, timeout 5s)
npm run test:smoke           # *.smoke.test.tsx — dựng cả cây app (timeout 30s)
npm test                     # cả hai nhóm (nằm trong npm run check)
npm run test:watch           # watch mode
npm run test:coverage        # ngưỡng chỉ cho src/core và src/domains/session
```

Xong việc: `npm run check` xanh (`docs/rules/foundations/quality-gates.md`).

## Một test — AAA (Arrange-Act-Assert)

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/shared/ui';

describe('Button', () => {
  it('gọi onClick khi bấm', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Lưu</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

- `describe` / `it` tiếng Việt, nói hành vi mong đợi — không `test1` / `it works`.
- Query theo `getByRole` / `getByLabelText` (như người dùng thật); `getByTestId` là phương án cuối. UI kit đứng trên
  Radix nên phần lớn có role / aria đúng — khó `getByRole` thường là component thiếu ARIA: sửa component trước.
- Component cần router / form: `renderInRouter` / `renderInForm` (`tests/helpers/render.tsx`).

## Mock

- Gọi API: KHÔNG mock module `@/core/http`. Dùng `mockHttp(handler)` (`tests/helpers/http-mock.ts`) — chỉ thay tầng
  mạng nên interceptor, hàm API và TanStack Query THẬT vẫn chạy (ví dụ: `tests/domains/session-lifecycle.test.ts`).
- Thứ tự bất đồng bộ (lượt về ngược, huỷ): `createDeferred` / `createGate` (`tests/helpers/deferred.ts`) — không ngủ thật.
- Đổi `appConfig`: `vi.mock('@/core/config', …)` như `tests/app/router/guards/guards.test.tsx`.
- `vi.fn()` cho callback; `vi.spyOn` khi chỉ theo dõi một method. `localStorage` của jsdom là `Storage` thật — spy
  trên `Storage.prototype`, không trên instance.

## Thêm component vào UI kit

Các test dựa trên barrel (`tests/helpers/ui-kit-exports.ts`) tự đưa component mới vào phạm vi: render được, xuất kèm
`XxxProps`, có khối tài liệu khớp props, có mặt trên `/demo`. Quên một trong số đó là đỏ — không cần viết test riêng
cho việc export; chỉ cần thêm ca render tối thiểu khi test báo thiếu.

## Coverage — theo rủi ro, không ép 100%

| Vùng | Mục tiêu |
|---|---|
| Logic nghiệp vụ quan trọng (phiên, refresh token, validation) | Gần 100% nhánh |
| UI kit | Đã có render rộng + test luật; test thêm khi component có state / logic phức tạp |
| Feature UI | Happy path + 1–2 edge case rõ ràng |
| Component hiển thị thuần | Không bắt buộc test riêng nếu đã phủ qua trang |

## IME / tìm kiếm — đừng bỏ qua

Ô tìm / lọc tự do dùng `useImeSafeSearchInput` (`docs/rules/interaction/ime-safe-input.md`): test PHẢI mô phỏng
`fireEvent.compositionStart` / `compositionEnd` — `userEvent.type()` không mô phỏng IME, dễ pass giả.
