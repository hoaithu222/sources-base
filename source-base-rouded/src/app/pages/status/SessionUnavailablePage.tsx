import { memo, useCallback } from 'react';

import { restoreSession } from '@/domains/session';
import { Button } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import StatusPage from './StatusPage';

/**
 * SessionUnavailablePage — màn của `AuthGuard` khi chưa hỏi được máy chủ về phiên (`unavailable`);
 * nút "Thử lại" khôi phục phiên lần nữa và giữ nguyên URL (không đá về trang đăng nhập).
 */
const SessionUnavailablePage = memo(function SessionUnavailablePage() {
  const handleRetry = useCallback(() => void restoreSession(), []);

  return (
    <StatusPage
      description="Chưa kiểm tra được phiên đăng nhập của bạn. Hãy kiểm tra kết nối mạng rồi thử lại — bạn không cần đăng nhập lại nếu phiên vẫn còn hiệu lực."
      title="Không kết nối được máy chủ"
    >
      <Button
        size="md"
        startIcon={<SystemIcon name="arrows-rotate-bold" />}
        variant="primary"
        onClick={handleRetry}
      >
        Thử lại
      </Button>
    </StatusPage>
  );
});

export default SessionUnavailablePage;
