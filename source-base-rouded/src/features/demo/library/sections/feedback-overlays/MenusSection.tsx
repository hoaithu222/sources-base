import { memo } from 'react';

import { Button, ContextMenu, Menu, Text, type MenuOption } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import {
  MENU_RICH_ITEMS,
  type MenuDemoItem,
} from '../../constants/feedback-overlays/overlays.constants';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';

/** Đổi `iconName` → `<SystemIcon>` (cả submenu) — file hằng không chứa JSX. */
function toMenuOption({ iconName, children, ...item }: MenuDemoItem): MenuOption {
  return {
    ...item,
    icon: iconName ? <SystemIcon name={iconName} size={14} /> : undefined,
    children: children?.map(toMenuOption),
  };
}

const MENU_RICH_OPTIONS: MenuOption[] = MENU_RICH_ITEMS.map(toMenuOption);

/** Menu chuột phải dùng chung mục với menu bấm, bỏ mục có submenu (`ContextMenu` không dựng `children`). */
const CONTEXT_MENU_OPTIONS: MenuOption[] = MENU_RICH_OPTIONS.filter((option) => !option.children);

/**
 * MenusSection — mục "Menu & chuột phải" của trang `/demo`: `Menu` đầy đủ (phím tắt · vạch ngăn nhóm · submenu lựa
 * chọn đơn · mục khoá · mục phá huỷ) và `ContextMenu` cùng bộ mục.
 */
const MenusSection = memo(function MenusSection() {
  return (
    <DemoSection
      description="Menu · ContextMenu — menu kiểu macOS, dòng đang trỏ (chuột hay phím ↑↓) nền đặc chữ trắng nên nhìn là biết Enter sẽ chạy dòng nào."
      importPath="@/shared/ui"
      title="Menu & chuột phải"
    >
      <DemoRow
        label="Menu · shortcut / separatorBefore / children + checked / disabled + hint / danger"
        note="phím tắt chỉ là chữ gợi ý — nơi gọi tự bắt phím"
      >
        <Menu
          options={MENU_RICH_OPTIONS}
          trigger={
            <Button
              endIcon={<SystemIcon name="angle-down-outline" size={12} />}
              size="sm"
              variant="stroke"
            >
              Menu đầy đủ
            </Button>
          }
        />
        <Menu
          align="end"
          options={MENU_RICH_OPTIONS}
          side="top"
          trigger={
            <Button aria-label="Thao tác khác" size="sm" variant="stroke">
              <SystemIcon name="ellipsis-outline" size={14} />
            </Button>
          }
        />
      </DemoRow>

      <DemoRow label="ContextMenu · cùng bộ mục (bỏ submenu)" note="chuột phải vào khung nét đứt">
        <ContextMenu modal={false} options={CONTEXT_MENU_OPTIONS}>
          <div className="flex h-16 w-72 items-center justify-center rounded-lg border border-dashed border-border-strong">
            <Text size="tiny" skin="muted">
              Chuột phải vào đây
            </Text>
          </div>
        </ContextMenu>
      </DemoRow>
    </DemoSection>
  );
});

export default MenusSection;
