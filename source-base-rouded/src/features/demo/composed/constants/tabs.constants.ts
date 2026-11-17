/** Tab của phân hệ — bơm lên thanh header toàn cục qua `<PageHeader nav>`. */
export const DEMO_COMPOSED_TABS = [
  { key: 'packages', label: 'Gói thầu' },
  { key: 'progress', label: 'Tiến độ' },
  { key: 'acceptance', label: 'Nghiệm thu' },
] as const;

export type DemoComposedTab = (typeof DEMO_COMPOSED_TABS)[number]['key'];
