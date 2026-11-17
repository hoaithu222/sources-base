'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Dropdown, MultiSelect } from '@/shared/ui';

import { CATALOG_SLOT_CLASSES } from '../catalog.theme';
import CatalogSection from '../CatalogSection';
import CatalogState from '../CatalogState';
import { DEPARTMENT_CODES, DEPARTMENT_IDS } from '../data/catalog-sample.constants';

const CONTROL_CLASSES = 'w-full max-w-xs';

/**
 * SelectCatalog — mục "Chọn từ danh sách" của catalog `/demo`: `Dropdown` (đơn · có tìm kiếm + nút xoá · dấu radio) và
 * `MultiSelect` (nhiều · tìm kiếm + chọn tất cả · gộp chip), kèm trạng thái lỗi / vô hiệu hoá. Giá trị đang chọn hiện dưới ô.
 */
export default function SelectCatalog() {
  const t = useTranslations('demo.select');
  const [single, setSingle] = useState('');
  const [searchable, setSearchable] = useState('finance');
  const [radio, setRadio] = useState('hr');
  const [multi, setMulti] = useState<string[]>([]);
  const [multiSearch, setMultiSearch] = useState<string[]>(['hr', 'it']);
  const [multiLimit, setMultiLimit] = useState<string[]>(['hr', 'finance', 'sales', 'it']);
  const [multiInvalid, setMultiInvalid] = useState<string[]>([]);

  const options = DEPARTMENT_IDS.map((id) => ({
    value: id,
    label: t(`options.${id}`),
    meta: DEPARTMENT_CODES[id],
  }));
  const multiOptions = DEPARTMENT_IDS.map((id) => ({ value: id, label: t(`options.${id}`) }));
  const valueText = (value: string | string[]) => {
    const text = Array.isArray(value) ? value.join(', ') : value;
    return t('value', { value: text || t('none') });
  };

  return (
    <CatalogSection id="select">
      <div className={CATALOG_SLOT_CLASSES.grid}>
        <CatalogState label={t('single')} note={valueText(single)}>
          <Dropdown
            className={CONTROL_CLASSES}
            options={options}
            placeholder={t('placeholder')}
            value={single}
            onValueChange={setSingle}
          />
        </CatalogState>
        <CatalogState label={t('searchable')} note={valueText(searchable)}>
          <Dropdown
            className={CONTROL_CLASSES}
            clearable
            options={options}
            placeholder={t('placeholder')}
            searchable
            value={searchable}
            onValueChange={setSearchable}
          />
        </CatalogState>
        <CatalogState label={t('radio')} note={valueText(radio)}>
          <Dropdown
            className={CONTROL_CLASSES}
            options={options}
            value={radio}
            variant="radio"
            onValueChange={setRadio}
          />
        </CatalogState>
        <CatalogState label={t('invalidDisabled')}>
          <Dropdown
            className={CONTROL_CLASSES}
            defaultValue=""
            invalid
            options={options}
            placeholder={t('placeholder')}
          />
          <Dropdown className={CONTROL_CLASSES} defaultValue="hr" disabled options={options} />
        </CatalogState>
        <CatalogState label={t('multi')} note={valueText(multi)}>
          <MultiSelect
            className={CONTROL_CLASSES}
            options={multiOptions}
            placeholder={t('placeholder')}
            value={multi}
            onValueChange={setMulti}
          />
        </CatalogState>
        <CatalogState label={t('multiSearchable')} note={valueText(multiSearch)}>
          <MultiSelect
            className={CONTROL_CLASSES}
            clearable
            options={multiOptions}
            searchable
            selectAll
            value={multiSearch}
            onValueChange={setMultiSearch}
          />
        </CatalogState>
        <CatalogState label={t('multiLimit')} note={valueText(multiLimit)}>
          <MultiSelect
            className={CONTROL_CLASSES}
            maxDisplay={2}
            options={multiOptions}
            value={multiLimit}
            onValueChange={setMultiLimit}
          />
        </CatalogState>
        <CatalogState label={t('invalidDisabled')}>
          <MultiSelect
            className={CONTROL_CLASSES}
            invalid
            options={multiOptions}
            placeholder={t('placeholder')}
            value={multiInvalid}
            onValueChange={setMultiInvalid}
          />
          <MultiSelect className={CONTROL_CLASSES} disabled options={multiOptions} value={['hr']} />
        </CatalogState>
      </div>
    </CatalogSection>
  );
}
