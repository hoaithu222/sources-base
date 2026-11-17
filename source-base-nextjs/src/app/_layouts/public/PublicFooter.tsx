import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n';
import { APP_NAME } from '@/shared/constants/app.constants';
import { PATHS } from '@/shared/constants/paths.constants';

const FOOTER_CLASSES = {
  root: 'border-t border-border-default bg-bg-surface',
  inner: 'mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between',
  brand: 'flex flex-col gap-1',
  name: 'text-body-14-semibold text-fg-heading',
  tagline: 'text-caption-12 text-fg-muted',
  nav: 'flex flex-wrap gap-x-5 gap-y-2',
  link: 'text-body-14 text-fg-body underline-offset-2 hover:text-link hover:underline',
  rights: 'text-caption-12 text-fg-muted',
};

/**
 * PublicFooter — chân trang công khai: tên + khẩu hiệu, liên kết chân trang, dòng bản quyền. Server Component.
 * Lưu ý: `new Date().getFullYear()` chạy lúc build (trang tĩnh) — năm cập nhật ở lần triển khai kế tiếp; đủ cho dòng bản quyền.
 */
export default function PublicFooter() {
  const t = useTranslations('site');
  const tHeader = useTranslations('site.header');

  return (
    <footer className={FOOTER_CLASSES.root}>
      <div className={FOOTER_CLASSES.inner}>
        <div className={FOOTER_CLASSES.brand}>
          <span className={FOOTER_CLASSES.name}>{APP_NAME}</span>
          <span className={FOOTER_CLASSES.tagline}>{t('footer.tagline')}</span>
        </div>
        <nav aria-label={t('footer.navLabel')} className={FOOTER_CLASSES.nav}>
          <Link className={FOOTER_CLASSES.link} href={PATHS.ABOUT}>
            {tHeader('about')}
          </Link>
          <Link className={FOOTER_CLASSES.link} href={PATHS.LOGIN}>
            {tHeader('signIn')}
          </Link>
        </nav>
        <p className={FOOTER_CLASSES.rights}>
          {t('footer.rights', { year: new Date().getFullYear(), name: APP_NAME })}
        </p>
      </div>
    </footer>
  );
}
