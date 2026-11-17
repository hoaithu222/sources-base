import { cn } from '@/shared/utils/style/cn';

import {
  HEADER_CONTROL_HEIGHT,
  HEADER_FRAME_TRANSITION,
  HEADER_PHONE_BUTTON_CLASS,
} from '../header.theme';

/**
 * user-menu.theme.ts — bảng class của cụm người dùng ở mép phải thanh: nút trigger (avatar + tên +
 * vai trò + caret) và thân panel menu.
 *
 * Dùng:   USER_MENU_SLOT_CLASSES.trigger · .avatar · .info · .role · .panel … (mỗi slot một ô)
 * Sửa:    nút → trigger · avatarWrap · avatar · status · info · name · role · caret
 *         · panel menu → panel · panelHeader · panelIdentity · panelRole
 * Lưu ý:  ⛔ Khung nút đồng bộ với `HEADER_ICON_BUTTON_CLASS`: cao = `HEADER_CONTROL_HEIGHT`; sáng là nút
 *            trơn, tối mới có viền mảnh + ngoặc góc + inner glow (hằng của `header.theme.ts`).
 *         Trạng thái mở đọc từ `data-state` (Radix Trigger `asChild`), không nâng state lên React.
 *         Lý do thiết kế: docs/notes/code/widgets-header.md
 */

type UserMenuSlot =
  | 'trigger'
  | 'accentBar'
  | 'avatarWrap'
  | 'avatar'
  | 'status'
  | 'info'
  | 'name'
  | 'role'
  | 'caret'
  | 'panel'
  | 'panelHeader'
  | 'panelIdentity'
  | 'panelRole'
  | 'phoneTrigger'
  | 'phoneAvatar'
  | 'sheetIdentity'
  | 'sheetList'
  | 'sheetItem'
  | 'sheetButton'
  | 'sheetButtonDanger';

export const USER_MENU_SLOT_CLASSES = {
  trigger: cn(
    'group relative inline-flex shrink-0 cursor-pointer items-center text-left outline-none',
    HEADER_CONTROL_HEIGHT,
    'gap-1 pl-0.5 pr-1 md:pl-1 md:pr-1.5 wide:gap-1.5 wide:pl-1 wide:pr-2',
    'border border-transparent bg-transparent text-fg-on-chrome dark:border-hud-5/65',
    HEADER_FRAME_TRANSITION,
    'hover:bg-bg-nav-hover',
    'dark:hover:border-primary-5/60',
    'dark:hover:shadow-[inset_0_0_12px_var(--color-bg-primary-soft)]',
    'data-[state=open]:bg-bg-nav-active',
    'dark:data-[state=open]:border-primary-5/60',
    'dark:data-[state=open]:shadow-[inset_0_0_12px_var(--color-bg-primary-soft)]',
    "touch:after:absolute touch:after:inset-x-0 touch:after:-inset-y-2 touch:after:content-['']",
    'focus-visible:ring-2 focus-visible:ring-ring-focus',
  ),
  accentBar: 'hidden h-4 w-0.5 shrink-0 bg-primary-5/70 dark:bg-hud-4/80 dark:md:block wide:h-5',
  avatarWrap: 'relative shrink-0 pt-[2px]',
  avatar: 'size-5.5 xl:size-6 wide:size-7',
  status: cn(
    'pointer-events-none absolute -bottom-0.5 -right-0.5',
    'size-2 rounded-full border-2 border-bg-surface bg-success wide:size-2.5',
    'dark:border-bg-header-to',
  ),
  info: cn(
    'hidden min-w-0 flex-col gap-px leading-none lg:flex',
    'lg:max-w-[92px] xl:max-w-[100px] 2xl:max-w-[110px] wide:max-w-[200px]',
  ),
  name: 'truncate text-caption-12-medium text-fg-on-chrome wide:text-body-14-medium',
  role: cn(
    'truncate text-caption-10-medium uppercase text-fg-on-nav-subtle',
    'tracking-[0.06em] wide:tracking-[0.14em]',
  ),
  caret: cn(
    'hidden shrink-0 text-fg-on-nav-subtle transition-[color,rotate] duration-200 ease-out md:block',
    'size-3! wide:size-3.5!',
    'group-hover:text-link group-data-[state=open]:rotate-180 group-data-[state=open]:text-link',
  ),
  panel: cn(
    'min-w-[264px] max-w-[min(92vw,320px)]',
    'max-lg:[&_[role=menuitem]]:min-h-11 touch:[&_[role=menuitem]]:min-h-11',
  ),
  panelHeader: 'flex items-center gap-3',
  panelIdentity: 'flex min-w-0 flex-1 flex-col',
  panelRole: 'mt-0.5',
  phoneTrigger: HEADER_PHONE_BUTTON_CLASS,
  phoneAvatar: 'size-7 [@media(max-height:540px)]:size-6',
  sheetIdentity: 'border border-border-default bg-bg-surface px-3 py-2.5',
  sheetList: cn(
    'm-0 grid list-none grid-cols-1 gap-px border border-border-default bg-border-default p-0',
    '[@media(max-height:540px)]:grid-cols-2',
  ),
  sheetItem: 'bg-bg-surface [@media(max-height:540px)]:last:odd:col-span-2',
  sheetButton: 'min-h-12 w-full text-left active:bg-bg-nav-hover',
  sheetButtonDanger: 'text-error',
} satisfies Record<UserMenuSlot, string>;
