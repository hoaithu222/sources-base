'use client';

import { Fragment, memo } from 'react';

import { Tooltip } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import { PAGE_HEADER_ACTION_CLASSES as CLASSES } from './page-header.theme';
import type { PageHeaderAction } from './page-header.types';
import NavElement from './parts/nav-element';

interface PageHeaderActionsProps {
  actions: readonly PageHeaderAction[];
  phone?: boolean;
}

/**
 * PageHeaderActions — nút HÀNH ĐỘNG của trang trên thanh header, dựng theo biến `--hdr-*` nên hợp mọi kiểu thanh: nút phụ =
 * icon tròn trong suốt + tooltip; nút `primary` = VIÊN ĐẶC `--hdr-pill` có chữ (cùng ngôn ngữ tab đang mở). Điện thoại: mọi
 * nút là icon 36px của top bar. Có `href` → `<Link>` thật. Phần nội bộ của `PageHeader` (prop `actions`).
 *
 * @param props.actions - Hành động của trang (`PageHeaderAction[]`), giữ ≤ 3 — một `primary`.
 * @param props.phone - `true` → nút icon của top bar điện thoại.
 *
 * @example
 * <PageHeaderActions actions={[{ key: 'add', label: 'Tạo đơn', icon: 'plus-bold', primary: true, onSelect: create }]} />
 */
const PageHeaderActions = memo(function PageHeaderActions({
  actions,
  phone = false,
}: PageHeaderActionsProps) {
  return (
    <>
      {actions.map((action) => {
        const labelled = Boolean(action.primary) && !phone;
        const control = (
          <NavElement
            aria-label={labelled ? undefined : action.label}
            className={labelled ? CLASSES.primary : phone ? CLASSES.phone : CLASSES.icon}
            disabled={action.disabled}
            href={action.href}
            newTab={action.newTab}
            onActivate={action.onSelect}
          >
            <SystemIcon name={action.icon} size={labelled ? 14 : 16} />
            {labelled && action.label}
          </NavElement>
        );
        if (labelled && !action.hint) return <Fragment key={action.key}>{control}</Fragment>;
        return (
          <Tooltip
            key={action.key}
            arrow={false}
            content={action.hint ?? action.label}
            side="bottom"
          >
            {control}
          </Tooltip>
        );
      })}
    </>
  );
});

export default PageHeaderActions;
