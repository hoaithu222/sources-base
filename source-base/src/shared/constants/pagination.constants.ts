/** Số dòng mỗi trang mặc định của danh sách phân trang (`useQueryParams`, `<Pagination>`). */
export const DEFAULT_PAGE_SIZE = 12;

/** Các mức "số dòng / trang" người dùng được chọn ở `<Pagination>`. */
export const PAGE_SIZE_OPTIONS = [12, 24, 48, 96] as const;

/** Trần `pageSize` đọc từ URL (`useQueryParams`) — lớn hơn coi là param rác; ≥ mọi mức trong `PAGE_SIZE_OPTIONS`. */
export const MAX_PAGE_SIZE = 100;
