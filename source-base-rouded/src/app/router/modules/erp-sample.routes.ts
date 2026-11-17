import type { AppIconName, AppTileTone } from '@/shared/ui';

import { lazyPage, type ModuleDef, type RouteDef } from '../definition';

/**
 * erpSampleModules — bộ phân hệ ERP MẪU (chỉ đăng ký ở chế độ demo): cho header (bộ chọn phân hệ, dải màn hình, đổi cấp +
 * nút quay lại), launcher và Dock có dữ liệu thật để trình diễn. KHÔNG có trang chủ phân hệ: bấm phân hệ (Dock, ⊞, vệt
 * header, bàn làm việc) vào THẲNG màn hình đầu tiên (`meta.landingPath`); mỗi màn hình là một trang THẬT có dữ liệu mẫu ở
 * `src/features/erp/<vùng>/pages`. Cần lưới thẻ màn hình thì thêm lại `{ index: true, page: LazyModuleHomePage }`.
 *
 * Dùng:   dự án thật XOÁ file này + `src/features/erp` + dòng `...erpSampleModules` ở `module-registry.ts`, rồi khai phân
 *         hệ thật theo mẫu `demo.routes.ts` (tone + group + route con có `meta.title` / `navIcon` / `navDescription` là đủ
 *         để header và trang chủ phân hệ tự dựng). Màn chưa có trang thật → `LazyPlaceholderPage`.
 * Lưu ý:  `permission: 'authenticated'` vì đây là trang trình diễn — đừng chép sang phân hệ nghiệp vụ.
 */

/** Một màn hình: [path, tên, icon thẻ, mô tả thẻ, trang]. */
type Screen = readonly [
  path: string,
  title: string,
  icon: AppIconName,
  description: string,
  page: NonNullable<RouteDef['page']>,
];

interface SampleModule {
  id: string;
  title: string;
  tabTitle?: string;
  subtitle: string;
  icon: AppIconName;
  tone: AppTileTone;
  group: string;
  screens: readonly Screen[];
  /** Nhóm màn hình (layout có con) — hiện thành menu thả xuống trên header, hàng riêng ở trang chủ phân hệ. */
  folders?: readonly { path: string; title: string; screens: readonly Screen[] }[];
}

const SAMPLE_MODULES: readonly SampleModule[] = [
  {
    id: 'tai-chinh',
    title: 'Tài chính',
    tabTitle: 'Tài chính – Kế toán',
    subtitle: 'Sổ cái, công nợ, báo cáo tài chính',
    icon: 'finance',
    tone: 'primary',
    group: 'Tài chính',
    screens: [
      [
        'so-cai',
        'Sổ cái',
        'ledger',
        'Bút toán, số dư theo tài khoản',
        lazyPage(() => import('@/features/erp/finance/pages/LedgerPage')),
      ],
      [
        'cong-no',
        'Công nợ',
        'invoice',
        'Phải thu, phải trả theo đối tác và tuổi nợ',
        lazyPage(() => import('@/features/erp/finance/pages/ReceivablesPage')),
      ],
    ],
    folders: [
      {
        path: 'bao-cao',
        title: 'Báo cáo tài chính',
        screens: [
          [
            'ket-qua',
            'Kết quả kinh doanh',
            'analytics',
            'Doanh thu, chi phí, lợi nhuận theo tháng',
            lazyPage(() => import('@/features/erp/finance/pages/IncomeStatementPage')),
          ],
        ],
      },
    ],
  },
  {
    id: 'mua-hang',
    title: 'Mua hàng',
    subtitle: 'Đơn mua, giao nhận, nhà cung cấp',
    icon: 'purchase',
    tone: 'orange',
    group: 'Chuỗi cung ứng',
    screens: [
      [
        'don-mua',
        'Đơn mua',
        'add-doc',
        'Đơn đặt hàng, theo dõi giao nhận',
        lazyPage(() => import('@/features/erp/supply/pages/PurchaseOrdersPage')),
      ],
    ],
  },
  {
    id: 'kho-van',
    title: 'Kho vận',
    subtitle: 'Tồn kho theo kho, lô, hạn dùng',
    icon: 'warehouse',
    tone: 'yellow',
    group: 'Chuỗi cung ứng',
    screens: [
      [
        'ton-kho',
        'Tồn kho',
        'lot',
        'Tồn theo kho, lô, hạn dùng; cảnh báo tồn tối thiểu',
        lazyPage(() => import('@/features/erp/supply/pages/StockPage')),
      ],
    ],
  },
  {
    id: 'san-xuat',
    title: 'Sản xuất',
    subtitle: 'Lệnh sản xuất, tiến độ xưởng',
    icon: 'production',
    tone: 'indigo',
    group: 'Vận hành',
    screens: [
      [
        'tien-do',
        'Tiến độ',
        'project',
        'Kế hoạch – thực tế theo lệnh và xưởng',
        lazyPage(() => import('@/features/erp/operations/pages/ProductionProgressPage')),
      ],
    ],
  },
  {
    id: 'nhan-su',
    title: 'Nhân sự',
    subtitle: 'Chấm công, nghỉ phép, tăng ca',
    icon: 'hr',
    tone: 'pink',
    group: 'Nhân sự',
    screens: [
      [
        'cham-cong',
        'Chấm công',
        'timesheet',
        'Bảng công tháng, nghỉ phép, tăng ca',
        lazyPage(() => import('@/features/erp/operations/pages/TimesheetPage')),
      ],
    ],
  },
  {
    id: 'bao-cao',
    title: 'Báo cáo',
    tabTitle: 'Báo cáo quản trị',
    subtitle: 'Dashboard điều hành toàn công ty',
    icon: 'report',
    tone: 'blue',
    group: 'Phân tích',
    screens: [
      [
        'dieu-hanh',
        'Dashboard điều hành',
        'overview',
        'KPI toàn công ty, doanh thu, cảnh báo',
        lazyPage(() => import('@/features/erp/reports/pages/ExecutiveDashboardPage')),
      ],
    ],
  },
];

const toScreenRoute =
  (prefix: string) =>
  ([path, title, navIcon, navDescription, page]: Screen): RouteDef => ({
    id: `${prefix}.${path}`,
    path,
    page,
    meta: { title, navIcon, navDescription },
  });

/** Màn hình đầu tiên của phân hệ (màn lẻ trước, rồi màn đầu của nhóm đầu) — đích khi bấm phân hệ. */
function landingOf(id: string, screens: readonly Screen[], folders: SampleModule['folders'] = []) {
  if (screens[0]) return `/${id}/${screens[0][0]}`;
  const folder = folders[0];
  return `/${id}/${folder.path}/${folder.screens[0][0]}`;
}

function toModuleDef({ screens, folders = [], ...meta }: SampleModule, order: number): ModuleDef {
  return {
    id: meta.id,
    path: `/${meta.id}`,
    permission: 'authenticated',
    meta: {
      title: meta.title,
      tabTitle: meta.tabTitle,
      subtitle: meta.subtitle,
      icon: meta.icon,
      tone: meta.tone,
      group: meta.group,
      order: (order + 1) * 10,
      landingPath: landingOf(meta.id, screens, folders),
    },
    children: [
      ...screens.map(toScreenRoute(meta.id)),
      ...folders.map((folder) => ({
        id: `${meta.id}.${folder.path}`,
        path: folder.path,
        meta: { title: folder.title },
        children: folder.screens.map(toScreenRoute(`${meta.id}.${folder.path}`)),
      })),
    ],
  };
}

export const erpSampleModules: readonly ModuleDef[] = SAMPLE_MODULES.map(toModuleDef);
