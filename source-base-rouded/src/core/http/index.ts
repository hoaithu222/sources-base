/**
 * Tầng HTTP — không phụ thuộc store, router hay giao diện.
 *
 *   apiClient · configureHttp   thực thể axios + interceptor (cờ request: `axios.d.ts`)
 *   AppError · toAppError       dạng lỗi duy nhất đi ra khỏi tầng này
 *   claimErrorMessage           lỗi nào được báo người dùng, câu nào — một chỗ quyết
 *   readData                    bóc `data` khỏi `ApiResponse`, có kiểm lúc chạy
 *
 * Hàm gọi API nghiệp vụ không nằm ở đây: mỗi feature / domain giữ `api/` của mình.
 * Cách dùng: `docs/rules/data/api-patterns.md`.
 */

export { apiClient, configureHttp } from './api-client';
export type { HttpAuthAdapter } from './api-client';
export { AppError, errorMessageOf, isAppError, isRetryableError } from './errors/app-error';
export type { AppErrorKind } from './errors/app-error';
export { claimErrorMessage } from './errors/claim-error-message';
export type { ClaimErrorMessageOptions } from './errors/claim-error-message';
export { toAppError } from './errors/to-app-error';
export { readData } from './read-data';
export type { ApiResponse } from './http.types';
