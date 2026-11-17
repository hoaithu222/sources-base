/**
 * Kiểu dữ liệu của tính năng con "Chuỗi cung ứng" (`erp/supply`): đơn mua (`/mua-hang/don-mua`) và tồn kho
 * (`/kho-van/ton-kho`). Ngày luôn là chuỗi ISO `YYYY-MM-DD`; tiền là số ĐỒNG (VND), không phải tỷ.
 */

export type PurchaseStatus = 'draft' | 'pending' | 'approved' | 'delivering' | 'done' | 'cancelled';

/** Bộ lọc trạng thái của danh sách đơn mua: một trạng thái hoặc `all`. */
export type PurchaseStatusFilter = PurchaseStatus | 'all';

export interface Supplier {
  name: string;
  /** Tên ngắn cho trục biểu đồ (≤ 18 ký tự). */
  short: string;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  supplierId: string;
  /** Tóm tắt hàng đặt + khối lượng, vd "Thép cây D16–D25 CB400-V · 118 tấn". */
  items: string;
  orderDate: string;
  dueDate: string;
  value: number;
  /** Phần trăm đã nhận theo giá trị, 0–100. */
  receivedPct: number;
  status: PurchaseStatus;
  owner: string;
  /** Ngày nhận đủ hàng — chỉ có ở đơn `done`. */
  deliveredDate?: string;
}

/** Dòng của bảng đơn mua: đơn + tên nhà cung cấp + số ngày trễ hạn giao (0 = chưa trễ). */
export interface PurchaseOrderRow extends PurchaseOrder {
  supplier: string;
  lateDays: number;
}

export interface PurchaseSummary {
  openCount: number;
  pendingCount: number;
  deliveringCount: number;
  openValue: number;
  remainingValue: number;
  lateCount: number;
  lateValue: number;
  doneCount: number;
  onTimeCount: number;
  /** Tỉ lệ giao đúng hạn trên đơn đã hoàn tất, thang 100. */
  onTimeRate: number;
}

export type WarehouseId = 'bd' | 'la' | 'td' | 'nt';

/** Bộ lọc kho: một kho hoặc `all` (mọi kho). */
export type WarehouseFilter = WarehouseId | 'all';

export type StockGroupId =
  'steel-bar' | 'steel-shape' | 'cement' | 'welding' | 'paint' | 'fastener';

export interface StockItem {
  name: string;
  unit: string;
  group: StockGroupId;
  /** Đơn giá bình quân (đồng / ĐVT). */
  unitPrice: number;
  /** Số chữ số lẻ khi in số lượng (tấn: 2, đơn vị đếm: 0). */
  decimals: number;
}

export interface StockLot {
  id: string;
  warehouse: WarehouseId;
  code: string;
  lot: string;
  importDate: string;
  /** Hạn sử dụng; `null` = vật tư không có hạn (thép, bulông). */
  expiry: string | null;
  qty: number;
  /** Tồn tối thiểu của MÃ tại kho (mọi lô cùng mã cùng kho mang cùng số). */
  min: number;
}

export type StockWarning = 'below-min' | 'expiring' | 'expired';

/** Dòng của bảng tồn kho: lô + thông tin vật tư + giá trị + cảnh báo (rỗng = bình thường). */
export interface StockLotRow extends StockLot, StockItem {
  value: number;
  /** Số ngày còn tới hạn sử dụng (âm = đã quá hạn); `null` khi không có hạn. */
  daysLeft: number | null;
  warnings: StockWarning[];
}

export interface StockSummary {
  value: number;
  lotCount: number;
  itemCount: number;
  groupCount: number;
  warehouseCount: number;
  belowMinItems: number;
  /** Giá trị cần đặt bổ sung để đủ mức tối thiểu (đồng). */
  shortageValue: number;
  expiringLots: number;
  expiredLots: number;
}

/** Một lát của donut cơ cấu tồn theo nhóm. */
export interface StockGroupSlice {
  key: StockGroupId;
  name: string;
  value: number;
  /** Token màu series (`seriesTokenAt`) gán theo NHÓM, không theo thứ hạng. */
  token: string;
  percent: number;
}
