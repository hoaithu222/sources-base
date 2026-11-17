import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { APP_NAME } from '@/shared/constants/app.constants';
import { BRAND_MARK_ICON } from '@/shared/constants/auth-motifs.constants';
import { PATHS } from '@/shared/constants/paths.constants';
import { Button, Text } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import '@/app/layouts/app-shell-layout.css';

interface StatusPageProps {
  code?: string;
  title: string;
  description: string;
  children?: ReactNode;
}

const STATUS_PAGE_SLOT_CLASSES = {
  root: cn(
    'app-background relative flex h-dvh items-center-safe justify-center p-4',
    'overflow-y-auto overscroll-y-contain',
  ),
  panel: 'relative flex w-full max-w-lg flex-col items-center gap-4 text-center',
  brand: 'flex items-center gap-2',
  brandMark: cn(
    'inline-flex size-8 shrink-0 items-center justify-center bg-primary-6 text-neutral-0',
    'squircle rounded-md [&>svg]:size-4.5!',
  ),
  brandName: 'text-caption-12-semibold uppercase tracking-[0.18em] text-fg-muted',
  code: 'flex items-center gap-2',
  digit: cn(
    'relative isolate flex h-16 w-12 items-center justify-center squircle rounded-lg',
    'border border-border-default bg-bg-surface shadow-[0_8px_24px_var(--color-shadow-popup)]',
    "after:absolute after:inset-x-0 after:top-1/2 after:-z-10 after:h-px after:bg-divider-default after:content-['']",
  ),
  digitText: cn(
    'text-h1-bold tabular-nums',
    'bg-gradient-to-b from-fg-heading to-primary-7 bg-clip-text text-transparent',
    'dark:to-primary-4',
  ),
  copy: 'flex flex-col items-center gap-1',
  actions: 'flex flex-wrap justify-center gap-2',
};

/** StatusCode — mã trạng thái tách từng ký tự vào một ô số; trình đọc màn hình đọc cả mã một lần. */
function StatusCode({ code }: { code: string }) {
  return (
    <p className={STATUS_PAGE_SLOT_CLASSES.code}>
      <span className="sr-only">{code}</span>
      {[...code].map((char, index) => (
        <span key={`${index}-${char}`} aria-hidden className={STATUS_PAGE_SLOT_CLASSES.digit}>
          <span className={STATUS_PAGE_SLOT_CLASSES.digitText}>{char}</span>
        </span>
      ))}
    </p>
  );
}

/**
 * StatusNavActions — cặp nút "Quay lại" / "Về trang chủ" mặc định của `StatusPage` (dùng router hook
 * nên tách riêng: trang truyền `children` thì không cần `<Router>`).
 */
function StatusNavActions() {
  const navigate = useNavigate();
  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <div className={STATUS_PAGE_SLOT_CLASSES.actions}>
      <Button
        size="md"
        startIcon={<SystemIcon name="angle-left-outline" />}
        variant="stroke"
        onClick={handleBack}
      >
        Quay lại
      </Button>
      <Button asChild size="md" startIcon={<SystemIcon name="house-outline" />} variant="primary">
        <Link to={PATHS.HOME}>Về trang chủ</Link>
      </Button>
    </div>
  );
}

/**
 * StatusPage — khung toàn màn của trang trạng thái (403, 404, mất kết nối) trên nền trang của app
 * (`.app-background`); mỗi trang chỉ truyền nội dung.
 *
 * Trang đứng riêng, ngoài mọi layout: khung là landmark `<main>`, tiêu đề là `<h1>` (cỡ chữ của h3).
 * Tự import `app-shell-layout.css` (nguồn của `.app-background`): 403 / 404 / mất phiên vẫn có nền
 * trang dù `AppShellLayout` chưa từng được nạp. Ô logo và ô số bo góc + `squircle` (cùng dáng icon app).
 * Lưu ý: không truyền `children` → hiện cặp nút "Quay lại" / "Về trang chủ" (cần Router); có
 * `children` thì thay hẳn cặp nút đó và không đụng tới router.
 *
 * @param props.code - Mã trạng thái cỡ lớn phía trên tiêu đề, vd `403` — mỗi ký tự một ô số. Bỏ trống
 *   thì không hiện.
 * @param props.title - Tiêu đề trang.
 * @param props.description - Câu giải thích dưới tiêu đề.
 * @param props.children - Nút hành động thay cho cặp nút điều hướng mặc định.
 *
 * @example
 * <StatusPage code="404" description="…" title="Không tìm thấy trang" />
 * <StatusPage description="…" title="…"><Button>Thử lại</Button></StatusPage>
 */
function StatusPage({ code, title, description, children }: StatusPageProps) {
  return (
    <main className={STATUS_PAGE_SLOT_CLASSES.root}>
      <div className={STATUS_PAGE_SLOT_CLASSES.panel}>
        <div className={STATUS_PAGE_SLOT_CLASSES.brand}>
          <span aria-hidden className={STATUS_PAGE_SLOT_CLASSES.brandMark}>
            <SystemIcon name={BRAND_MARK_ICON} />
          </span>
          <span className={STATUS_PAGE_SLOT_CLASSES.brandName}>{APP_NAME}</span>
        </div>

        {code && <StatusCode code={code} />}

        <div className={STATUS_PAGE_SLOT_CLASSES.copy}>
          <Text as="h1" size="extraLarge" weight="medium">
            {title}
          </Text>
          <Text className="max-w-md" size="small" skin="muted">
            {description}
          </Text>
        </div>

        {children ?? <StatusNavActions />}
      </div>
    </main>
  );
}

export default StatusPage;
