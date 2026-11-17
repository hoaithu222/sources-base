import { configureZodLocale } from '@/core/config';
import { configureHttp } from '@/core/http';
import {
  getAccessToken,
  onSessionEnd,
  refreshAccessToken,
  startSessionSync,
} from '@/domains/session';
import { showToast } from '@/shared/ui';
import { resetProgressCenter } from '@/shared/widgets/progress-center';

import { initializeAppearance, queryClient } from './providers';

/**
 * bootstrapApp — khởi tạo trước render và trả disposer.
 *
 * Dùng:   const dispose = bootstrapApp();  — gọi trùng trả cùng disposer.
 * Lưu ý:  dispose dừng listener và gỡ cấu hình HTTP; HMR tự gọi, TEST phải gọi sau mỗi lượt.
 *         Phiên kết thúc / đổi tài khoản (`onSessionEnd`, kể cả `switched`) xoá cache + hàng đợi tải
 *         lên + thẻ tác vụ — docs/notes/code/app.md (## bootstrap).
 */

function resetAccountScopedState(): void {
  queryClient.clear();
  resetProgressCenter();
}

function resetWhenSessionEnds(): () => void {
  return onSessionEnd((reason) => {
    resetAccountScopedState();
    if (reason === 'expired') {
      showToast('warning', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  });
}

let disposeApp: (() => void) | undefined;

export function bootstrapApp(): () => void {
  if (disposeApp) return disposeApp;
  const cleanups: (() => void)[] = [];
  try {
    configureZodLocale();
    configureHttp({ auth: { getAccessToken, refreshAccessToken } });
    initializeAppearance();
    cleanups.push(resetWhenSessionEnds());
    cleanups.push(startSessionSync());
  } catch (error) {
    cleanups.reverse().forEach((cleanup) => cleanup());
    configureHttp({});
    throw error;
  }

  const dispose = () => {
    if (disposeApp !== dispose) return;
    disposeApp = undefined;
    cleanups.reverse().forEach((cleanup) => cleanup());
    configureHttp({});
  };
  disposeApp = dispose;
  return dispose;
}

if (import.meta.hot) import.meta.hot.dispose(() => disposeApp?.());
