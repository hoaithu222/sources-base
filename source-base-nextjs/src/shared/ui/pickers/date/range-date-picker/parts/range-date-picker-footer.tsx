'use client';

import { useTranslations } from 'next-intl';
import Button from '@/shared/ui/actions/Button';
import { DATE_PICKER_FOOTER_CLASSES } from '../../shared/date-picker.theme';
import { RANGE_DATE_PICKER_CLASSES } from '../range-date-picker.theme';

interface RangeDatePickerFooterProps {
  fromText: string;
  toText: string;
  onReset: () => void;
  onApply: () => void;
}

/**
 * RangeDatePickerFooter — chân panel của `RangeDatePicker`: dòng tóm tắt khoảng + nút Cài lại / Áp dụng.
 *
 * Phần con NỘI BỘ của RangeDatePicker (ẩn khi `hideFooter`).
 * Sửa giao diện: chân panel → `DATE_PICKER_FOOTER_CLASSES` · tóm tắt → `RANGE_DATE_PICKER_CLASSES.summary`;
 * nút là `<Button size="sm">` của UI kit. Panel hẹp (288px) thì cụm nút tự xuống dòng, căn phải
 * (`DATE_PICKER_FOOTER_CLASSES` có `flex-wrap`).
 *
 * @param props.fromText - Mốc đầu đã format sẵn; chưa chọn thì truyền `"dd/mm/yy"`.
 * @param props.toText - Mốc cuối đã format sẵn; chưa chọn thì truyền `"dd/mm/yy"`.
 * @param props.onReset - Bấm "Cài lại" (xoá khoảng, đóng panel).
 * @param props.onApply - Bấm "Áp dụng" (chốt mốc đang chờ nếu có, đóng panel).
 *
 * @example
 * <RangeDatePickerFooter fromText="10/01/2024" toText="dd/mm/yy" onApply={apply} onReset={reset} />
 */
export function RangeDatePickerFooter({
  fromText,
  toText,
  onReset,
  onApply,
}: RangeDatePickerFooterProps) {
  const t = useTranslations('ui.pickers');
  return (
    <div className={DATE_PICKER_FOOTER_CLASSES}>
      <span className={RANGE_DATE_PICKER_CLASSES.summary}>
        {fromText} – {toText}
      </span>
      <div className={RANGE_DATE_PICKER_CLASSES.actions}>
        <Button size="sm" skin="neutral" variant="stroke" onClick={onReset}>
          {t('range.reset')}
        </Button>
        <Button size="sm" onClick={onApply}>
          {t('range.apply')}
        </Button>
      </div>
    </div>
  );
}
