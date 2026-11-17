import { Component, type ErrorInfo, type ReactNode } from 'react';

import { reloadOnceOnChunkError } from './chunk-reload.utils';
import { describeError, logAppError } from './describe-error';
import ErrorScreen from './ErrorScreen';
import type { ScreenLevel } from './screen.types';

interface ErrorBoundaryProps {
  children: ReactNode;
  level: ScreenLevel;
  label: string;
  resetKey?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: unknown;
  resetKey: string | undefined;
}

/**
 * ErrorBoundary — ranh giới lỗi DUY NHẤT của app: nhánh con ném lỗi (render hoặc tải chunk) thì hiện
 * `ErrorScreen` thay cho cả nhánh, chi tiết ghi ra console qua `logAppError`.
 *
 * Hai chỗ dùng: bọc providers + router ở `App`, và bọc từng trang trong `LazyLoad`. Lỗi tải chunk (vừa
 * triển khai bản mới) thì tự tải lại trang MỘT lần (`reloadOnceOnChunkError`) — vẫn lỗi mới giữ màn lỗi.
 * Lưu ý: React Router render mọi trang ở cùng một vị trí nên ranh giới quanh trang được dùng lại cho
 * trang kế tiếp — phải truyền `resetKey` đổi theo trang, nếu không một trang hỏng khoá luôn các trang sau.
 *
 * @param props.children - Nhánh được bảo vệ.
 * @param props.level - Cỡ màn lỗi: `app` (chiếm trọn màn hình) | `content` (lấp vùng nội dung).
 * @param props.label - Tên nhánh trong log console, vd `Ứng dụng`, `Trang`.
 * @param props.resetKey - Đổi giá trị → ranh giới xoá lỗi và dựng lại nhánh con. Bỏ trống thì màn lỗi
 *   giữ tới khi tải lại trang.
 *
 * @example
 * <ErrorBoundary label="Trang" level="content" resetKey={pathname}>
 *   <Page />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  static getDerivedStateFromProps(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState,
  ): ErrorBoundaryState | null {
    if (props.resetKey === state.resetKey) return null;
    return { hasError: false, error: null, resetKey: props.resetKey };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    logAppError(
      `${this.props.label} không tải hoặc không hiển thị được:`,
      error,
      info.componentStack,
    );
    reloadOnceOnChunkError(error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return <ErrorScreen error={describeError(this.state.error)} level={this.props.level} />;
  }
}
