/**
 * Danh mục dữ liệu mẫu của màn Sổ cái: tài khoản (hệ thống TK kế toán doanh nghiệp VN), kỳ kế toán năm 2026 và mẫu
 * nghiệp vụ để `buildLedgerBook` (ledger.utils.ts) sinh 25–40 bút toán mỗi tài khoản mỗi kỳ — hằng tĩnh, không random.
 * Mẫu diễn giải nhận chỗ trống: {kh} khách hàng · {ncc} nhà cung cấp · {hd} số hóa đơn · {vt} vật tư · {dv} dịch vụ
 * · {nv} nhân viên · {thang} kỳ này · {thangTruoc} kỳ trước · {lsx} lệnh sản xuất.
 */

/** `debit` — tài khoản dư Nợ (tài sản, chi phí) · `credit` — dư Có (nợ phải trả, doanh thu). */
export type AccountNature = 'debit' | 'credit';

/** `balance` — TK bảng cân đối, số dư chuyển kỳ · `pnl` — TK kết quả, cuối kỳ kết chuyển sang 911 về 0. */
export type AccountKind = 'balance' | 'pnl';

/** Chữ đầu số chứng từ: thu / chi tiền mặt, báo có / báo nợ ngân hàng, bán hàng, mua hàng, nhập / xuất kho, khác. */
export type VoucherPrefix = 'PT' | 'PC' | 'BC' | 'BN' | 'BH' | 'MH' | 'NK' | 'XK' | 'KT';

/** Mẫu nghiệp vụ: [chứng từ, `+` làm TĂNG số dư / `-` làm GIẢM, TK đối ứng, diễn giải, tiền min–max (triệu), trọng số, một lần/kỳ]. */
export type LedgerTemplateRow = readonly [
  prefix: VoucherPrefix,
  effect: '+' | '-',
  contra: string,
  text: string,
  minMillion: number,
  maxMillion: number,
  weight?: number,
  once?: boolean,
];

export interface LedgerAccount {
  code: string;
  name: string;
  nature: AccountNature;
  kind: AccountKind;
  /** Số dư đầu năm 01/01/2026 (đồng) — chỉ TK `balance`. */
  openingYear: number;
  /** Dải số dư mong muốn (đồng) — bộ sinh nghiêng về nghiệp vụ tăng / giảm để số dư nằm trong dải. */
  band: readonly [number, number];
  templates: readonly LedgerTemplateRow[];
}

const TY = 1_000_000_000;

export const LEDGER_ACCOUNTS: readonly LedgerAccount[] = [
  {
    code: '111',
    name: 'Tiền mặt',
    nature: 'debit',
    kind: 'balance',
    openingYear: 412_350_000,
    band: [0.15 * TY, 0.9 * TY],
    templates: [
      ['PT', '+', '112', 'Rút tiền gửi ngân hàng nhập quỹ tiền mặt', 50, 300],
      ['PT', '+', '131', 'Thu tiền {kh} thanh toán {hd}', 10, 150, 2],
      ['PT', '+', '141', '{nv} hoàn ứng tiền tạm ứng công tác', 2, 15],
      ['PC', '-', '642', 'Chi tiếp khách, hội nghị khách hàng', 2, 18],
      ['PC', '-', '642', 'Chi mua văn phòng phẩm kỳ {thang}', 1, 8],
      ['PC', '-', '141', 'Tạm ứng công tác phí cho {nv}', 5, 30],
      ['PC', '-', '331', 'Thanh toán tiền mặt cho {ncc}', 10, 80, 2],
      ['PC', '-', '642', 'Chi xăng xe, cầu đường đi công tác', 1, 10],
      ['PC', '-', '112', 'Nộp tiền mặt vào tài khoản ngân hàng', 50, 200],
    ],
  },
  {
    code: '112',
    name: 'Tiền gửi ngân hàng',
    nature: 'debit',
    kind: 'balance',
    openingYear: 8_452_700_000,
    band: [4 * TY, 14 * TY],
    templates: [
      ['BC', '+', '131', '{kh} chuyển khoản thanh toán {hd}', 150, 2_500, 4],
      ['BC', '+', '515', 'Lãi tiền gửi không kỳ hạn kỳ {thang}', 2, 15, 1, true],
      ['BC', '+', '111', 'Nộp tiền mặt vào tài khoản', 50, 200],
      ['BN', '-', '331', 'Chuyển khoản thanh toán {ncc} theo {hd}', 100, 1_800, 4],
      ['BN', '-', '334', 'Trả lương nhân viên kỳ {thangTruoc}', 900, 1_400, 1, true],
      ['BN', '-', '3331', 'Nộp thuế GTGT kỳ {thangTruoc}', 200, 600, 1, true],
      ['BN', '-', '338', 'Nộp BHXH, BHYT, BHTN kỳ {thangTruoc}', 180, 260, 1, true],
      ['BN', '-', '635', 'Trả lãi vay ngắn hạn kỳ {thang}', 40, 90, 1, true],
      ['BN', '-', '642', 'Phí chuyển tiền, phí quản lý tài khoản', 0.1, 2],
      ['BN', '-', '111', 'Rút tiền gửi về nhập quỹ tiền mặt', 50, 300],
    ],
  },
  {
    code: '131',
    name: 'Phải thu của khách hàng',
    nature: 'debit',
    kind: 'balance',
    openingYear: 15_240_500_000,
    band: [10 * TY, 22 * TY],
    templates: [
      ['BH', '+', '511', 'Bán hàng cho {kh} theo {hd}', 120, 2_200, 4],
      ['BH', '+', '3331', 'Thuế GTGT đầu ra {hd} – {kh}', 12, 220, 2],
      ['BC', '-', '112', '{kh} thanh toán {hd} qua ngân hàng', 150, 2_400, 4],
      ['PT', '-', '111', '{kh} thanh toán tiền mặt', 10, 120],
      ['KT', '-', '521', 'Chiết khấu thương mại cho {kh}', 5, 40, 0.5],
      ['KT', '-', '331', 'Bù trừ công nợ phải thu – phải trả với {kh}', 50, 300, 0.3],
    ],
  },
  {
    code: '152',
    name: 'Nguyên liệu, vật liệu',
    nature: 'debit',
    kind: 'balance',
    openingYear: 6_180_000_000,
    band: [3 * TY, 9 * TY],
    templates: [
      ['NK', '+', '331', 'Nhập kho {vt} – {ncc}', 80, 900, 4],
      ['NK', '+', '111', 'Mua {vt} nhập kho, trả tiền mặt', 5, 40],
      ['NK', '+', '154', 'Nhập lại kho vật tư thừa từ sản xuất', 5, 60, 0.5],
      ['XK', '-', '621', 'Xuất {vt} cho sản xuất – {lsx}', 80, 850, 4],
      ['XK', '-', '642', 'Xuất vật tư dùng cho bộ phận văn phòng', 2, 15],
      ['XK', '-', '632', 'Xuất bán {vt} cho {kh}', 30, 200],
    ],
  },
  {
    code: '331',
    name: 'Phải trả cho người bán',
    nature: 'credit',
    kind: 'balance',
    openingYear: 9_875_400_000,
    band: [6 * TY, 14 * TY],
    templates: [
      ['MH', '+', '152', 'Mua {vt} của {ncc} chưa thanh toán', 80, 900, 4],
      ['MH', '+', '133', 'Thuế GTGT đầu vào {hd} – {ncc}', 8, 90, 2],
      ['MH', '+', '642', 'Dịch vụ {dv} – {ncc}', 5, 80],
      ['MH', '+', '211', 'Mua thiết bị sản xuất – {ncc}', 150, 900, 0.3],
      ['BN', '-', '112', 'Thanh toán {ncc} theo {hd}', 100, 1_800, 4],
      ['PC', '-', '111', 'Thanh toán tiền mặt cho {ncc}', 10, 80],
      ['KT', '-', '131', 'Bù trừ công nợ với khách hàng kiêm nhà cung cấp', 50, 300, 0.3],
    ],
  },
  {
    code: '511',
    name: 'Doanh thu bán hàng và cung cấp dịch vụ',
    nature: 'credit',
    kind: 'pnl',
    openingYear: 0,
    band: [0, 0],
    templates: [
      ['BH', '+', '131', 'Doanh thu bán hàng – {kh} – {hd}', 120, 1_600, 4],
      ['BH', '+', '111', 'Doanh thu bán lẻ thu tiền mặt', 3, 30],
      ['BH', '+', '131', 'Doanh thu dịch vụ lắp đặt – {kh}', 40, 300, 2],
      ['KT', '-', '131', 'Hàng bán bị trả lại – {kh}', 10, 80, 0.3],
    ],
  },
  {
    code: '632',
    name: 'Giá vốn hàng bán',
    nature: 'debit',
    kind: 'pnl',
    openingYear: 0,
    band: [0, 0],
    templates: [
      ['XK', '+', '155', 'Giá vốn thành phẩm xuất bán theo {hd}', 80, 1_100, 4],
      ['XK', '+', '156', 'Giá vốn hàng hóa xuất bán – {kh}', 20, 200, 2],
      ['KT', '+', '154', 'Kết chuyển giá thành sản phẩm hoàn thành xuất bán', 200, 900],
      ['KT', '-', '155', 'Nhập lại kho hàng bán bị trả lại', 10, 60, 0.3],
    ],
  },
  {
    code: '642',
    name: 'Chi phí quản lý doanh nghiệp',
    nature: 'debit',
    kind: 'pnl',
    openingYear: 0,
    band: [0, 0],
    templates: [
      ['KT', '+', '334', 'Tiền lương bộ phận quản lý kỳ {thang}', 320, 420, 1, true],
      ['KT', '+', '338', 'Trích BHXH, BHYT, BHTN, KPCĐ kỳ {thang}', 60, 80, 1, true],
      ['KT', '+', '214', 'Khấu hao TSCĐ bộ phận văn phòng kỳ {thang}', 45, 55, 1, true],
      ['KT', '+', '242', 'Phân bổ chi phí trả trước – phần mềm, công cụ', 8, 25, 1, true],
      ['KT', '+', '331', 'Thuê văn phòng kỳ {thang}', 85, 85, 1, true],
      ['PC', '+', '111', 'Chi tiếp khách, hội nghị khách hàng', 2, 18, 2],
      ['PC', '+', '111', 'Chi mua văn phòng phẩm', 1, 8],
      ['KT', '+', '331', 'Cước viễn thông, internet kỳ {thang}', 4, 12],
      ['KT', '+', '331', 'Tiền điện, nước văn phòng kỳ {thang}', 8, 20],
      ['PC', '+', '111', 'Chi xăng xe, cầu đường đi công tác', 1, 10, 2],
      ['BN', '+', '112', 'Phí dịch vụ ngân hàng', 0.1, 2],
      ['KT', '-', '141', 'Giảm chi phí do hoàn ứng thừa', 1, 5, 0.3],
    ],
  },
];

/** Kỳ đang mở sổ (chưa khoá, chưa kết chuyển cuối kỳ) và ngày dữ liệu cuối cùng của kỳ đó. */
export const LEDGER_OPEN_PERIOD = { year: 2026, month: 10, lastDay: 19 } as const;

/** Kỳ kế toán chọn được — tháng 01 → tháng đang mở của năm 2026, mới nhất lên đầu. */
export const LEDGER_PERIODS = Array.from({ length: LEDGER_OPEN_PERIOD.month }, (_, i) => {
  const month = LEDGER_OPEN_PERIOD.month - i;
  return { year: LEDGER_OPEN_PERIOD.year, month };
});

export const LEDGER_DEFAULT_ACCOUNT = '112';
