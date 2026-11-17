'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { LoadingScreen } from '@/app/_components';
import { useRouter } from '@/core/i18n';
import { RETURN_PATH_PARAM } from '@/shared/constants/paths.constants';
import { resolveReturnPath } from '@/shared/utils/url/return-path.utils';

import { useSessionGate } from './useSessionGate';

interface GuestGateProps {
  children: ReactNode;
}

/**
 * GuestGate — bọc các trang khách (đăng nhập, đăng ký, quên mật khẩu); người đã có phiên bị đưa đi.
 *
 * Nơi DUY NHẤT điều hướng sau khi đăng nhập — trang đăng nhập chỉ gọi API (routing-conventions.md §8). Đích = `?next=` (chỉ đường
 * nội bộ) hoặc bảng điều khiển.
 * Lưu ý: KHÔNG chặn form trong lúc khôi phục phiên — người chưa có cookie (đa số) thấy form ngay từ HTML server (LCP nhanh);
 * có phiên thật thì `signed-in` chuyển đi. Máy chủ không trả lời được (`unavailable`) hoặc chế độ demo vẫn hiện trang.
 *
 * @param props.children - Trang khách.
 */
export default function GuestGate({ children }: GuestGateProps) {
  const router = useRouter();
  const gate = useSessionGate();

  useEffect(() => {
    if (gate !== 'signed-in') return;
    const next = new URLSearchParams(window.location.search).get(RETURN_PATH_PARAM);
    router.replace(resolveReturnPath(next));
  }, [gate, router]);

  if (gate === 'signed-in') return <LoadingScreen level="app" />;
  return <>{children}</>;
}
