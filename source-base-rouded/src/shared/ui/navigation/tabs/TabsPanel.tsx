import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/shared/utils/style/cn';

export interface TabsPanelProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

const TABS_PANEL_CLASSES =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus';

/**
 * TabsPanel — nội dung của một tab; phải là con của `<Tabs>` (Radix tự ẩn / hiện theo tab đang chọn,
 * panel ẩn bị unmount).
 *
 * Radix cho panel `tabIndex=0` (Tab từ tab list nhảy vào panel) nên panel có vòng focus của kit
 * (`TABS_PANEL_CLASSES`).
 *
 * @param props.value - `key` của tab mà panel này thuộc về (khớp `TabOption.key`).
 * @param props.children - Nội dung panel.
 * @param props.className - Class của panel.
 *
 * @example
 * <Tabs options={[{ key: 'info', label: 'Thông tin' }]}>
 *   <TabsPanel value="info" className="pt-3">Nội dung…</TabsPanel>
 * </Tabs>
 */
function TabsPanel({ value, children, className }: TabsPanelProps) {
  return (
    <TabsPrimitive.Content className={cn(TABS_PANEL_CLASSES, className)} value={value}>
      {children}
    </TabsPrimitive.Content>
  );
}

export default TabsPanel;
