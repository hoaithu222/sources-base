'use client';

import { useLocale, useTranslations } from 'next-intl';

import { LOCALE_META, LOCALES, Link, usePathname } from '@/core/i18n';
import { cn } from '@/shared/utils/style/cn';

interface LocaleSwitcherProps {
  className?: string;
}

const SWITCHER_CLASSES = {
  root: 'inline-flex items-center gap-0.5 rounded-full bg-bg-subtle p-0.5',
  item: cn(
    'inline-flex h-7 min-w-9 items-center justify-center rounded-full px-2.5 text-caption-12-semibold outline-none',
    'text-fg-muted transition-colors duration-150 hover:text-fg-heading',
    'focus-visible:ring-2 focus-visible:ring-ring-focus',
  ),
  active: 'bg-bg-surface text-fg-heading shadow-(--elev-1)',
};

/**
 * LocaleSwitcher — chuyển ngôn ngữ giữ nguyên trang đang xem. Mỗi ngôn ngữ là `<Link locale>` THẬT (`<a href="/en/about"
 * hreflang="en">`): công cụ tìm kiếm lần theo được các bản dịch, chuột phải mở tab mới được, không cần JS.
 *
 * Dùng:   header trang công khai · khung đăng nhập · Cài đặt. Nhãn là tên ngôn ngữ viết bằng CHÍNH ngôn ngữ đó (`LOCALE_META`),
 *         nên người đọc tìm được ngôn ngữ của mình dù đang ở giao diện lạ.
 * Lưu ý:  chỉ giữ `pathname`, bỏ query string (tránh `useSearchParams` buộc trang vào `<Suspense>`); next-intl ghi cookie
 *         `NEXT_LOCALE` ở lần vào đường dẫn có tiền tố để nhớ lựa chọn.
 *
 * @param props.className - Class thêm cho khung ngoài.
 *
 * @example
 * <LocaleSwitcher className="ml-auto" />
 */
export default function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const t = useTranslations('common.language');
  const current = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t('label')} className={cn(SWITCHER_CLASSES.root, className)}>
      {LOCALES.map((locale) => {
        const meta = LOCALE_META[locale];
        const isActive = locale === current;
        return (
          <Link
            key={locale}
            aria-current={isActive ? 'true' : undefined}
            className={cn(SWITCHER_CLASSES.item, isActive && SWITCHER_CLASSES.active)}
            href={pathname}
            hrefLang={meta.hrefLang}
            lang={meta.htmlLang}
            locale={locale}
            title={meta.label}
          >
            {meta.shortLabel}
          </Link>
        );
      })}
    </nav>
  );
}
