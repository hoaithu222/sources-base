'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { DateTimePicker, SingleDatePicker, Text, TimePicker } from '@/shared/ui';
import { formatDate } from '@/shared/utils/format/format.utils';

import { CATALOG_SLOT_CLASSES } from '../catalog.theme';
import CatalogSection from '../CatalogSection';
import CatalogState from '../CatalogState';
import {
  PICKER_DATE_FORMAT,
  PICKER_MAX_DATE,
  PICKER_MIN_DATE,
  PICKER_SAMPLE_DATE,
  PICKER_SAMPLE_DATE_TIME,
  PICKER_SAMPLE_TIME,
} from '../data/catalog-sample.constants';

/**
 * PickerCatalog — mục "Chọn ngày giờ" của catalog `/demo`: `SingleDatePicker`, `DateTimePicker`, `TimePicker` cùng giá trị
 * đang chọn, khoảng `minDate` / `maxDate` và trạng thái lỗi / vô hiệu hoá. Tên tháng, tên thứ và định dạng ngày theo ngôn ngữ.
 */
export default function PickerCatalog() {
  const t = useTranslations('demo.pickers');
  const locale = useLocale();
  const dateFormat = PICKER_DATE_FORMAT[locale];
  const dateTimeFormat = `${dateFormat} HH:mm`;
  const [date, setDate] = useState<Date | null>(PICKER_SAMPLE_DATE);
  const [dateTime, setDateTime] = useState<Date | null>(PICKER_SAMPLE_DATE_TIME);
  const [time, setTime] = useState<string | null>(PICKER_SAMPLE_TIME);
  const [limited, setLimited] = useState<Date | null>(null);
  const [invalidDate, setInvalidDate] = useState<Date | null>(null);

  const valueText = (value: string | null) => t('value', { value: value ?? t('none') });
  const dateText = (value: Date | null) => valueText(value && formatDate(value, undefined, locale));
  const dateTimeText = (value: Date | null) =>
    valueText(value && formatDate(value, dateTimeFormat, locale));

  return (
    <CatalogSection id="pickers">
      <Text size="small" skin="muted">
        {t('languageHint')}
      </Text>
      <div className={CATALOG_SLOT_CLASSES.grid}>
        <CatalogState label={t('date')} note={dateText(date)}>
          <SingleDatePicker
            format={dateFormat}
            placeholder={dateFormat}
            value={date}
            onChange={setDate}
          />
        </CatalogState>
        <CatalogState label={t('dateTime')} note={dateTimeText(dateTime)}>
          <DateTimePicker
            format={dateTimeFormat}
            minuteStep={15}
            placeholder={dateTimeFormat}
            value={dateTime}
            onChange={setDateTime}
          />
        </CatalogState>
        <CatalogState label={t('time')} note={valueText(time)}>
          <TimePicker minuteStep={5} value={time} onChange={setTime} />
        </CatalogState>
        <CatalogState label={t('range')} note={dateText(limited)}>
          <SingleDatePicker
            format={dateFormat}
            maxDate={PICKER_MAX_DATE}
            minDate={PICKER_MIN_DATE}
            placeholder={dateFormat}
            value={limited}
            onChange={setLimited}
          />
        </CatalogState>
        <CatalogState label={t('invalidDisabled')}>
          <div className={CATALOG_SLOT_CLASSES.row}>
            <SingleDatePicker
              format={dateFormat}
              invalid
              placeholder={dateFormat}
              value={invalidDate}
              onChange={setInvalidDate}
            />
            <SingleDatePicker
              disabled
              format={dateFormat}
              placeholder={dateFormat}
              value={PICKER_SAMPLE_DATE}
            />
          </div>
        </CatalogState>
      </div>
    </CatalogSection>
  );
}
