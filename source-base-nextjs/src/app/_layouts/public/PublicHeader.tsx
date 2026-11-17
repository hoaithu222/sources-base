import { useTranslations } from 'next-intl';

import { LocaleSwitcher } from '@/app/_components';
import { Link } from '@/core/i18n';
import { APP_NAME } from '@/shared/constants/app.constants';
import { BRAND_MARK_ICON } from '@/shared/constants/auth-motifs.constants';
import { PATHS } from '@/shared/constants/paths.constants';
import { Button } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import PublicThemeButton from './PublicThemeButton';

const PUBLIC_HEADER_CLASSES = {
  root: cn(
    'sticky top-0 z-30 border-b border-border-default bg-bg-surface/85 backdrop-blur',
    'pt-[var(--safe-t,0px)]',
  ),
  inner: 'mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6',
  brand: 'flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
  brandMark: cn(
    'inline-flex size-8 shrink-0 items-center justify-center bg-primary-6 text-neutral-0',
    'squircle rounded-md [&>svg]:size-4.5!',
  ),
  brandName: 'text-body-16-semibold text-fg-heading',
  nav: 'ml-4 hidden items-center gap-1 sm:flex',
  navLink: cn(
    'rounded-md px-3 py-1.5 text-body-14-medium text-fg-body outline-none transition-colors',
    'hover:bg-bg-nav-hover hover:text-link focus-visible:ring-2 focus-visible:ring-ring-focus',
  ),
  actions: 'ml-auto flex items-center gap-2',
};

/**
 * PublicHeader — thanh đầu trang công khai: logo + tên app (về trang chủ), điều hướng chính, chuyển ngôn ngữ, đổi giao diện,
 * nút đăng nhập / bắt đầu. Server Component — HTML đầy đủ ngay từ phản hồi đầu (công cụ tìm kiếm đọc được các liên kết).
 *
 * Lưu ý: `<header>` + `<nav aria-label>` là landmark cho trình đọc màn hình; thêm mục điều hướng công khai thì thêm
 * vào `PUBLIC_ROUTES` (`app/_navigation/public-routes.ts`) để sitemap nhận luôn.
 */
export default function PublicHeader() {
  const t = useTranslations('site.header');

  return (
    <header className={PUBLIC_HEADER_CLASSES.root}>
      <div className={PUBLIC_HEADER_CLASSES.inner}>
        <Link className={PUBLIC_HEADER_CLASSES.brand} href={PATHS.HOME}>
          <span aria-hidden className={PUBLIC_HEADER_CLASSES.brandMark}>
            <SystemIcon name={BRAND_MARK_ICON} />
          </span>
          <span className={PUBLIC_HEADER_CLASSES.brandName}>{APP_NAME}</span>
        </Link>

        <nav aria-label={t('navLabel')} className={PUBLIC_HEADER_CLASSES.nav}>
          <Link className={PUBLIC_HEADER_CLASSES.navLink} href={PATHS.ABOUT}>
            {t('about')}
          </Link>
        </nav>

        <div className={PUBLIC_HEADER_CLASSES.actions}>
          <LocaleSwitcher />
          <PublicThemeButton />
          <Button asChild className="hidden sm:inline-flex" size="sm" variant="ghost">
            <Link href={PATHS.LOGIN}>{t('signIn')}</Link>
          </Button>
          <Button asChild size="sm" variant="primary">
            <Link href={PATHS.REGISTER}>{t('signUp')}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
