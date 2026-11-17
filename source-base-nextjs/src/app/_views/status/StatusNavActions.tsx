'use client';

import { useTranslations } from 'next-intl';

import { AngleLeftOutlineIcon, HouseOutlineIcon } from '@/assets/icons/standalone';
import { Link, useRouter } from '@/core/i18n';
import { PATHS } from '@/shared/constants/paths.constants';
import { Button } from '@/shared/ui';
import StaticIcon from '@/shared/ui/icons/StaticIcon';

/**
 * StatusNavActions — cặp nút "Quay lại" / "Về trang chủ" mặc định của `StatusView`; tách riêng vì dùng router hook —
 * `StatusView` truyền `children` thì không nạp phần này.
 */
export default function StatusNavActions() {
  const t = useTranslations('errors.screens');
  const router = useRouter();

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button
        size="md"
        startIcon={<StaticIcon icon={AngleLeftOutlineIcon} />}
        variant="stroke"
        onClick={() => router.back()}
      >
        {t('backAction')}
      </Button>
      <Button
        asChild
        size="md"
        startIcon={<StaticIcon icon={HouseOutlineIcon} />}
        variant="primary"
      >
        <Link href={PATHS.HOME}>{t('homeAction')}</Link>
      </Button>
    </div>
  );
}
