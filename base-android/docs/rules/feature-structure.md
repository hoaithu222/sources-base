# Cấu trúc feature

```
src/features/{ten-feature}/
├── api/
│   ├── {ten}.api.ts          # đường dẫn endpoint (hằng số)
│   ├── {ten}.service.ts      # hàm async — bọc apiClient, bóc response
│   ├── {ten}.types.ts        # kiểu DTO của backend
│   └── index.ts
├── queries/
│   └── {ten}.queries.ts      # hook React Query (use…)
├── hooks/                    # hook gộp nghiệp vụ
├── components/               # UI trong feature
│   └── {NhomCon}/            # feature nhiều mảng → chia theo mảng
├── screens/                  # màn hình, được route trỏ tới
├── schemas/ · constants/ · types/ · utils/
└── index.ts                  # barrel — mặt tiền công khai của feature
```

**`screens/` = "pages" của web.** Màn hình được `app/**` trỏ tới.

## Luật

- ⛔ **Không gọi API trực tiếp trong component** → qua hook trong `queries/`.
- ⛔ **Không đặt logic nghiệp vụ trong component** → tách ra `hooks/`.
- ⛔ **Không import chéo feature.** Cần dùng chung → đưa lên `@/shared`,
  `@/core` hoặc `@/shell`. Import chéo là con đường ngắn nhất tới import vòng,
  mà import vòng trên RN hiện ra lúc chạy dưới dạng
  `undefined is not a function` ở một file KHÔNG liên quan. ESLint chặn cứng
  (`import/no-cycle`).
- File route trong `app/` phải **mỏng** — chỉ `import` và `return`. Nội dung
  nằm trong `features/*/screens/`. Nhờ vậy `app/` đọc lướt là ra bản đồ màn hình,
  và màn hình test được mà không phải dựng cả bộ điều hướng.

## Ba tầng gọi API

```
api.ts       → hằng số đường dẫn. `grep` một lần là thấy hết mặt tiếp xúc backend.
service.ts   → async, bọc apiClient, CHUẨN HOÁ tên trường của backend.
queries.ts   → hook React Query: cache, trạng thái tải, thử lại, làm mới.
```

Tách ba tầng để khi backend đổi tên trường (`access_token` → `accessToken` — đã
xảy ra) thì **chỉ `service.ts` phải sửa**. Xem `src/core/api/auth/` làm mẫu.
