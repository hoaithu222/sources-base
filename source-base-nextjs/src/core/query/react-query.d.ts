import '@tanstack/react-query';

/** `meta` của mọi query / mutation — đọc bởi bộ báo lỗi tập trung (`create-query-client.ts`). */

interface ErrorMeta extends Record<string, unknown> {
  /** `true` = màn hình tự hiển thị lỗi này, bộ báo lỗi tập trung bỏ qua. */
  silentError?: boolean;
}

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: ErrorMeta;
    mutationMeta: ErrorMeta;
  }
}
