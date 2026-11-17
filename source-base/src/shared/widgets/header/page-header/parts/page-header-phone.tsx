import { memo, useCallback } from 'react';
import type { ReactNode } from 'react';

import type { TitleIconColor } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import { HEADER_PHONE_BUTTON_CLASS } from '../../header.theme';
import { HeaderSlotPortal } from '../../slots';
import {
  PAGE_HEADER_PHONE_ACTIVE_CLASSES,
  PAGE_HEADER_PHONE_SLOT_CLASSES,
} from '../page-header-phone.theme';
import type {
  PageHeaderNavAction,
  PageHeaderNavConfig,
  PageHeaderNavItem,
} from '../page-header.types';
import ChipElement from './chip/chip-element';

interface PageHeaderPhoneProps {
  title: string;
  subtitle?: ReactNode;
  tone: TitleIconColor;
  nav?: PageHeaderNavConfig;
  start?: ReactNode;
  end?: ReactNode;
  onBack?: () => void;
  backLabel: string;
  backHref?: string;
}

interface PhoneNavChipProps {
  item: PageHeaderNavItem;
  active: boolean;
  disabled?: boolean;
  onSelect: (key: string) => void;
}

interface PhoneNavActionProps {
  action: PageHeaderNavAction;
  disabled?: boolean;
}

const PhoneNavChip = memo(function PhoneNavChip({
  item,
  active,
  disabled,
  onSelect,
}: PhoneNavChipProps) {
  const handleActivate = useCallback(() => onSelect(item.key), [item.key, onSelect]);
  const chipClassName = cn(
    PAGE_HEADER_PHONE_SLOT_CLASSES.chip,
    active && PAGE_HEADER_PHONE_ACTIVE_CLASSES.chip,
    disabled && 'pointer-events-none opacity-50',
  );

  return (
    <ChipElement
      ariaCurrent={active}
      className={chipClassName}
      disabled={disabled}
      href={item.href}
      onActivate={handleActivate}
    >
      <span className={PAGE_HEADER_PHONE_SLOT_CLASSES.chipLabel}>{item.label}</span>
    </ChipElement>
  );
});

const PhoneNavAction = memo(function PhoneNavAction({ action, disabled }: PhoneNavActionProps) {
  const chipClassName = cn(
    PAGE_HEADER_PHONE_SLOT_CLASSES.chip,
    'px-2',
    disabled && 'pointer-events-none opacity-50',
  );

  return (
    <ChipElement
      aria-label={action.label}
      className={chipClassName}
      disabled={disabled}
      href={action.href}
      newTab={action.newTab}
      onActivate={action.onSelect}
    >
      <SystemIcon name={action.icon} />
    </ChipElement>
  );
});

/**
 * PageHeaderPhone — dạng ĐIỆN THOẠI của `PageHeader`: đẩy nút quay lại vào ô `start`, tên + dòng phụ phẳng vào ô
 * `title`, dải tab cuộn ngang vào ô `nav` (dưới top bar) và node `end` vào ô `end`. Phần nội bộ của `PageHeader`.
 *
 * Bảng tên vát góc + chip bình hành cần ≥ 1024px nên KHÔNG dựng ở đây; chức năng (tab, action, quay lại) giữ nguyên.
 *
 * @param props.title - Tiêu đề của trang.
 * @param props.subtitle - Dòng phụ dưới tiêu đề (xoay ngang: cùng hàng).
 * @param props.tone - Tông thanh nhấn trước tên (`TitleIconColor`).
 * @param props.nav - Tab + action của trang (`PageHeaderNavConfig`) — vào dải cuộn ngang.
 * @param props.start - Node đẩy ra mép TRÁI top bar (sau nút quay lại).
 * @param props.end - Node đẩy ra mép PHẢI top bar (trước nút tìm).
 * @param props.onBack - Có → bật nút quay lại.
 * @param props.backLabel - `aria-label` của nút quay lại.
 * @param props.backHref - Path cố định của nút quay lại; bỏ trống → chỉ chạy `onBack`.
 *
 * @example
 * <PageHeaderPhone backLabel="Quay lại" title="Gói thầu" tone="sky" />
 */
const PageHeaderPhone = memo(function PageHeaderPhone({
  title,
  subtitle,
  tone,
  nav,
  start,
  end,
  onBack,
  backLabel,
  backHref,
}: PageHeaderPhoneProps) {
  const hasSubtitle = subtitle != null && subtitle !== false;
  const hasNav = nav != null && (nav.items.length > 0 || (nav.actions?.length ?? 0) > 0);
  const hasStart = onBack != null || (start != null && start !== false);
  const hasEnd = end != null && end !== false;

  return (
    <>
      {hasStart && (
        <HeaderSlotPortal slot="start">
          <>
            {onBack && (
              <ChipElement
                aria-label={backLabel}
                className={HEADER_PHONE_BUTTON_CLASS}
                href={backHref}
                onActivate={onBack}
              >
                <SystemIcon name="angle-left-outline" />
              </ChipElement>
            )}
            {start}
          </>
        </HeaderSlotPortal>
      )}

      <HeaderSlotPortal slot="title">
        <span className={PAGE_HEADER_PHONE_SLOT_CLASSES.title}>
          <span
            aria-hidden
            className={PAGE_HEADER_PHONE_SLOT_CLASSES.accent}
            style={{ background: `var(--color-${tone}-5)` }}
          />
          <span className={PAGE_HEADER_PHONE_SLOT_CLASSES.text}>
            <h1 className={PAGE_HEADER_PHONE_SLOT_CLASSES.name} title={title}>
              {title}
            </h1>
            {hasSubtitle && (
              <span className={PAGE_HEADER_PHONE_SLOT_CLASSES.subtitle}>{subtitle}</span>
            )}
          </span>
        </span>
      </HeaderSlotPortal>

      {nav && hasNav && (
        <HeaderSlotPortal slot="nav">
          <span className={PAGE_HEADER_PHONE_SLOT_CLASSES.nav}>
            {nav.items.map((item) => (
              <PhoneNavChip
                key={item.key}
                active={item.key === nav.active}
                disabled={nav.disabled}
                item={item}
                onSelect={nav.onSelect}
              />
            ))}
            {nav.actions?.map((action) => (
              <PhoneNavAction key={action.key} action={action} disabled={nav.disabled} />
            ))}
          </span>
        </HeaderSlotPortal>
      )}

      {hasEnd && <HeaderSlotPortal slot="end">{end}</HeaderSlotPortal>}
    </>
  );
});

export default PageHeaderPhone;
