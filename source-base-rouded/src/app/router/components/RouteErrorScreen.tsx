import { useEffect } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import {
  describeError,
  ErrorScreen,
  logAppError,
  reloadOnceOnChunkError,
  type ErrorDescription,
} from '@/app/components';

function describeRouteError(error: unknown): ErrorDescription {
  if (!isRouteErrorResponse(error)) return describeError(error);
  return {
    kind: 'response',
    title: `Lỗi ${error.status}`,
    description: error.statusText || 'Không mở được trang này.',
  };
}

/**
 * RouteErrorScreen — màn lỗi cuối của cây route (`errorElement` ở route gốc): phủ lỗi render ở guard,
 * layout, header, dock — những chỗ nằm ngoài ranh giới lỗi của từng trang (`LazyLoad`).
 *
 * Không phải ranh giới lỗi: React Router tự bắt lỗi rồi render màn này. Lỗi HTTP do router trả hiện
 * `Lỗi <mã>`; lỗi khác mô tả bằng `describeError`. Lỗi tải chunk tự tải lại trang một lần (như
 * `ErrorBoundary` — `reloadOnceOnChunkError`).
 */
export default function RouteErrorScreen() {
  const error = useRouteError();

  useEffect(() => {
    logAppError('Lỗi ngoài phạm vi một trang:', error);
    reloadOnceOnChunkError(error);
  }, [error]);

  return <ErrorScreen error={describeRouteError(error)} level="app" />;
}
