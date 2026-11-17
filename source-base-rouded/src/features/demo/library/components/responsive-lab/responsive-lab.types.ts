/** Một viewport tính theo CSS px (rộng × cao) — đơn vị mà media query / biến thể Tailwind đọc. */
export interface DemoViewport {
  width: number;
  height: number;
  /** Tên thiết bị / ghi chú ngắn (vd `mini`, `Pro 12.9"`), in mờ cạnh số đo. */
  note?: string;
}

/** Một nhóm thiết bị trong bảng "thiết bị → viewport", kèm cổng biến thể Tailwind chịu trách nhiệm cỡ đó. */
export interface DemoDeviceGroup {
  id: string;
  label: string;
  /** Biến thể / cổng Tailwind áp ở cỡ này (vd `phone: · touch:`), in mono. */
  gate: string;
  viewports: readonly DemoViewport[];
}

/** Trang nạp vào khung xem thử. */
export interface DemoFrameTarget {
  key: string;
  label: string;
  path: string;
}

/** Một biến thể theo media query để đối chiếu "đang khớp / không khớp". */
export interface DemoVariantProbe {
  /** Tên biến thể như viết trong class (vd `phone:`, `xl:`). */
  label: string;
  /** Media query tương đương — cùng điều kiện với biến thể CSS. */
  query: string;
}

export interface DemoVariantProbeGroup {
  id: string;
  label: string;
  note: string;
  probes: readonly DemoVariantProbe[];
}
