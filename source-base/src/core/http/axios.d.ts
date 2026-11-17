import 'axios';

/**
 * Cờ request riêng của `apiClient` — khai vào kiểu của axios nên truyền thẳng, không ép kiểu:
 *
 *   apiClient.post(url, data, { skipAuthRefresh: true })
 */

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Bỏ nhánh "401 → refresh → phát lại". Bật cho endpoint công khai (login, register…). */
    skipAuthRefresh?: boolean;
    /** Không coi `{ status: false }` / `{ success: false }` kèm HTTP 2xx là lỗi. */
    skipBusinessErrorHandling?: boolean;
  }
}
