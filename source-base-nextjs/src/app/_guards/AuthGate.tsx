'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { LoadingScreen } from '@/app/_components';
import SessionUnavailableView from '@/app/_views/status/SessionUnavailableView';
import { usePathname, useRouter } from '@/core/i18n';
import { selectEndReason, useSessionStore } from '@/domains/session';
import { PATHS, RETURN_PATH_PARAM } from '@/shared/constants/paths.constants';
import { createReturnPath } from '@/shared/utils/url/return-path.utils';

import { useSessionGate } from './useSessionGate';

interface AuthGateProps {
  children: ReactNode;
}

/**
 * AuthGate — chặn vùng cần đăng nhập ở phía trình duyệt; bọc layout của nhóm route `(app)`.
 *
 * Nơi DUY NHẤT đưa người dùng về `/login`, kể cả ngay sau `logout()` (nơi gọi không tự điều hướng). Ghi đích quay lại
 * (`?next=`) khi phiên hết hạn / bị đăng xuất từ tab khác; đăng xuất CHỦ ĐỘNG thì không.
 * Lưu ý: `proxy.ts` đã chặn người KHÔNG có cookie phiên ở server; gate này lo phần proxy không biết — cookie hết hạn, phiên
 *        bị thu hồi. Phiên `unavailable` hiện `SessionUnavailableView` và GIỮ URL, không đá về `/login` —
 *        docs/rules/structure/routing-conventions.md §8 · docs/notes/code/app.md (## guards). Server luôn dựng màn chờ (chưa biết
 *        phiên) nên HTML của vùng này không mang dữ liệu riêng tư.
 *
 * @param props.children - Nội dung vùng làm việc (khung shell + trang).
 */
export default function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const gate = useSessionGate();
  const endReason = useSessionStore(selectEndReason);

  useEffect(() => {
    if (gate !== 'signed-out') return;
    const next = endReason === 'logout' ? null : createReturnPath(pathname, window.location.search);
    router.replace(
      next ? `${PATHS.LOGIN}?${RETURN_PATH_PARAM}=${encodeURIComponent(next)}` : PATHS.LOGIN,
    );
  }, [gate, endReason, pathname, router]);

  switch (gate) {
    case 'open':
    case 'signed-in':
      return <>{children}</>;
    case 'unavailable':
      return <SessionUnavailableView />;
    case 'pending':
    case 'signed-out':
      return <LoadingScreen level="app" />;
  }
}
