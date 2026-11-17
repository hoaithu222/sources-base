/**
 * progress-center.types.ts — MỘT bộ từ vựng trạng thái cho mọi thứ của progress-center (mục con,
 * thẻ, tác vụ máy chủ). Trạng thái của UI kit (`UploadFile.status`) chỉ dịch sang đây ở MỘT chỗ:
 * `upload-queue/UploadQueueCard.tsx`.
 */

/** `pending` chờ tới lượt · `running` đang chạy · `success` xong · `error` lỗi. */
export type ProgressStatus = 'pending' | 'running' | 'success' | 'error';

/** Trạng thái của một THẺ / một tác vụ máy chủ — không có `pending`: chưa chạy thì chưa có thẻ. */
export type ProgressCardStatus = Exclude<ProgressStatus, 'pending'>;
