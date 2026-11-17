/** Nhóm màn hình theo thang chuẩn của `docs/rules/display/responsive-screens.md §1`. */
export type DemoViewportGroupId =
  | 'phone-portrait'
  | 'phone-landscape'
  | 'tablet-portrait'
  | 'tablet-landscape'
  | 'laptop-14'
  | 'laptop-16'
  | 'external';

export interface DemoViewportGroup {
  id: DemoViewportGroupId;
  label: string;
}

interface ClassifyInput {
  width: number;
  height: number;
  /** `useIsPhone()` — biến thể `phone:` đang khớp. */
  isPhone: boolean;
  /** `useIsCoarsePointer()` — biến thể `touch:` đang khớp. */
  isTouch: boolean;
}

const GROUP_LABELS = {
  'phone-portrait': 'Điện thoại dọc',
  'phone-landscape': 'Điện thoại ngang',
  'tablet-portrait': 'Tablet dọc',
  'tablet-landscape': 'Tablet ngang',
  'laptop-14': 'Laptop 14"',
  'laptop-16': 'Laptop 16"',
  external: 'Màn ngoài / TV',
} satisfies Record<DemoViewportGroupId, string>;

/**
 * Xếp viewport vào MỘT nhóm của thang chuẩn theo đúng cổng của code: `phone:` → điện thoại, `touch:` →
 * tablet, còn lại theo bậc bề rộng. Lý do dùng `touch:` chứ không riêng bề rộng: `notes/code/demo.md`.
 */
export function classifyViewport({
  width,
  height,
  isPhone,
  isTouch,
}: ClassifyInput): DemoViewportGroup {
  const portrait = height >= width;
  let id: DemoViewportGroupId;

  if (isPhone) id = portrait ? 'phone-portrait' : 'phone-landscape';
  else if (width >= 1800) id = 'external';
  else if (isTouch) id = portrait ? 'tablet-portrait' : 'tablet-landscape';
  else if (width >= 1536) id = 'laptop-16';
  else if (width >= 1280) id = 'laptop-14';
  else id = portrait ? 'tablet-portrait' : 'tablet-landscape';

  return { id, label: GROUP_LABELS[id] };
}
