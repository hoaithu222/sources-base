'use client';

import { memo, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { LOCALE_META, LOCALES, usePathname, useRouter } from '@/core/i18n';
import type { Locale } from '@/core/i18n';
import { ChoiceTiles, InsetGroup, InsetGroupRow } from '@/shared/ui';
import type { ChoiceTileOption } from '@/shared/ui';

/**
 * LanguageGroup — nhóm "Ngôn ngữ" của trang Cài đặt: chọn ngôn ngữ giao diện. Đổi ngôn ngữ là chuyển sang URL tương ứng
 * (`/en/settings` ⇄ `/settings`) và GIỮ query string; next-intl nhớ lựa chọn bằng cookie `NEXT_LOCALE`.
 * Lưu ý: ở trang công khai dùng `LocaleSwitcher` (liên kết thật) — nhóm này là cách chọn trong vùng làm việc, đọc query lúc bấm
 * (không `useSearchParams`) nên trang không buộc phải bọc `<Suspense>`.
 */
const LanguageGroup = memo(function LanguageGroup() {
  const t = useTranslations('account.settings.language');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const options = useMemo<readonly ChoiceTileOption<Locale>[]>(
    () => LOCALES.map((value) => ({ value, label: LOCALE_META[value].label })),
    [],
  );

  const handleChange = (next: Locale) => {
    router.replace(`${pathname}${window.location.search}`, { locale: next });
  };

  return (
    <InsetGroup footer={t('footer')} title={t('title')}>
      <InsetGroupRow
        control={
          <ChoiceTiles
            aria-label={t('title')}
            options={options}
            value={locale}
            onValueChange={handleChange}
          />
        }
        description={t('description')}
        icon="globe-bold"
        title={t('label')}
        tone="blue"
        wideControl
      />
    </InsetGroup>
  );
});

export default LanguageGroup;
