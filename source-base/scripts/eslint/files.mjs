/** Nhóm file dùng chung của cấu hình ESLint. */

export const SRC = ['src/**/*.{ts,tsx}'];

/** File TS do script sinh ra (mang header `//` của máy, barrel kèm registry) — không viết tay nên không kiểm comment / barrel. */
export const GENERATED_SOURCES = ['src/assets/image/index.ts', 'src/shared/ui/icons/index.ts'];
