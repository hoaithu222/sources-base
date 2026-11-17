import type { ComponentType } from 'react';

import ActionsSection from './sections/actions-inputs/ActionsSection';
import ButtonMatrixSection from './sections/actions-inputs/ButtonMatrixSection';
import ChoiceControlsSection from './sections/actions-inputs/ChoiceControlsSection';
import InputsSection from './sections/actions-inputs/InputsSection';
import PickersAdvancedSection from './sections/actions-inputs/PickersAdvancedSection';
import PickersSection from './sections/actions-inputs/PickersSection';
import SelectsSection from './sections/actions-inputs/SelectsSection';
import DataDisplaySection from './sections/data-display/DataDisplaySection';
import DataTreeSection from './sections/data-display/DataTreeSection';
import HudKpiSection from './sections/data-display/HudKpiSection';
import OpsKitSection from './sections/data-display/OpsKitSection';
import SmartLiveSection from './sections/data-display/SmartLiveSection';
import TableSection from './sections/data-display/TableSection';
import FeedbackIndicatorsSection from './sections/feedback-overlays/FeedbackIndicatorsSection';
import FeedbackSection from './sections/feedback-overlays/FeedbackSection';
import OverlaysDialogsSection from './sections/feedback-overlays/OverlaysDialogsSection';
import OverlaysFormsSection from './sections/feedback-overlays/OverlaysFormsSection';
import OverlaysPhoneSection from './sections/feedback-overlays/OverlaysPhoneSection';
import OverlaysSection from './sections/feedback-overlays/OverlaysSection';
import FormAdvancedSection from './sections/forms/FormAdvancedSection';
import FormArraysSection from './sections/forms/FormArraysSection';
import FormHooksSection from './sections/forms/FormHooksSection';
import FormLayoutSection from './sections/forms/FormLayoutSection';
import FormShowcaseSection from './sections/forms/FormShowcaseSection';
import ColorTokensSection from './sections/foundations/ColorTokensSection';
import HudRecipesSection from './sections/foundations/HudRecipesSection';
import IconsSection from './sections/foundations/IconsSection';
import PrimitivesSection from './sections/foundations/PrimitivesSection';
import ResponsiveLabSection from './sections/foundations/ResponsiveLabSection';
import TypographySection from './sections/foundations/TypographySection';
import MediaSection from './sections/media/MediaSection';
import UploadHookSection from './sections/media/UploadHookSection';
import HudSection from './sections/surfaces-layout/HudSection';
import LayoutBoxesSection from './sections/surfaces-layout/LayoutBoxesSection';
import LayoutHeadersSection from './sections/surfaces-layout/LayoutHeadersSection';
import NavigationSection from './sections/surfaces-layout/NavigationSection';
import PanelCardSection from './sections/surfaces-layout/PanelCardSection';
import SurfacesCardsSection from './sections/surfaces-layout/SurfacesCardsSection';
import SplitterSection from './sections/surfaces-layout/SplitterSection';
import SurfacesSection from './sections/surfaces-layout/SurfacesSection';
import ChartGallerySection from './sections/widgets/ChartGallerySection';
import ChartPaletteSection from './sections/widgets/ChartPaletteSection';
import ChartPhoneSection from './sections/widgets/ChartPhoneSection';
import ChartsSection from './sections/widgets/ChartsSection';
import WidgetsSection from './sections/widgets/WidgetsSection';

/**
 * Mục lục trang `/demo` — nguồn DUY NHẤT cho thanh điều hướng trái lẫn thứ tự khu vực bên phải.
 * Thêm khu vực: tạo `sections/<nhóm>/<Tên>Section.tsx` rồi thêm MỘT dòng vào `DEMO_SECTIONS` (đúng
 * chỗ trong nhóm). `id` = kebab(tên file bỏ `Section`), `group` = folder chứa file — cũng là tên folder
 * `constants/<nhóm>/` nếu section cần dữ liệu riêng. `tests/features/demo/demo-sections-wired` giữ cả ba luật.
 */

/** Nhóm của mục lục, theo thứ tự hiển thị; khoá = tên folder trong `sections/` và `constants/`. */
export const DEMO_GROUP_LABELS = {
  foundations: 'Nền tảng',
  'actions-inputs': 'Hành động & nhập liệu',
  'feedback-overlays': 'Phản hồi & lớp nổi',
  'data-display': 'Trình bày dữ liệu',
  forms: 'Hệ form',
  'surfaces-layout': 'Mặt nền & bố cục',
  media: 'Ảnh & tệp',
  widgets: 'Biểu đồ & widget',
} as const;

export type DemoSectionGroup = keyof typeof DEMO_GROUP_LABELS;

interface DemoSectionEntry {
  /** Anchor của khu vực — cũng là `#hash` trên URL. */
  id: string;
  label: string;
  group: DemoSectionGroup;
  Section: ComponentType;
}

export const DEMO_SECTIONS: readonly DemoSectionEntry[] = [
  { id: 'color-tokens', label: 'Màu sắc', group: 'foundations', Section: ColorTokensSection },
  { id: 'typography', label: 'Chữ', group: 'foundations', Section: TypographySection },
  { id: 'icons', label: 'Biểu tượng', group: 'foundations', Section: IconsSection },
  { id: 'primitives', label: 'Nguyên tố', group: 'foundations', Section: PrimitivesSection },
  { id: 'hud-recipes', label: 'Công thức HUD', group: 'foundations', Section: HudRecipesSection },
  {
    id: 'responsive-lab',
    label: 'Responsive lab',
    group: 'foundations',
    Section: ResponsiveLabSection,
  },

  { id: 'actions', label: 'Hành động', group: 'actions-inputs', Section: ActionsSection },
  {
    id: 'button-matrix',
    label: 'Ma trận nút',
    group: 'actions-inputs',
    Section: ButtonMatrixSection,
  },
  { id: 'inputs', label: 'Ô nhập', group: 'actions-inputs', Section: InputsSection },
  {
    id: 'choice-controls',
    label: 'Ô chọn',
    group: 'actions-inputs',
    Section: ChoiceControlsSection,
  },
  { id: 'selects', label: 'Chọn danh sách', group: 'actions-inputs', Section: SelectsSection },
  { id: 'pickers', label: 'Ngày & giờ', group: 'actions-inputs', Section: PickersSection },
  {
    id: 'pickers-advanced',
    label: 'Ngày & giờ nâng cao',
    group: 'actions-inputs',
    Section: PickersAdvancedSection,
  },

  { id: 'feedback', label: 'Phản hồi', group: 'feedback-overlays', Section: FeedbackSection },
  {
    id: 'feedback-indicators',
    label: 'Chỉ báo trạng thái',
    group: 'feedback-overlays',
    Section: FeedbackIndicatorsSection,
  },
  { id: 'overlays', label: 'Lớp nổi', group: 'feedback-overlays', Section: OverlaysSection },
  {
    id: 'overlays-dialogs',
    label: 'Hộp thoại & ngăn kéo',
    group: 'feedback-overlays',
    Section: OverlaysDialogsSection,
  },
  {
    id: 'overlays-forms',
    label: 'Hộp thoại có form',
    group: 'feedback-overlays',
    Section: OverlaysFormsSection,
  },
  {
    id: 'overlays-phone',
    label: 'Lớp nổi trên điện thoại',
    group: 'feedback-overlays',
    Section: OverlaysPhoneSection,
  },

  { id: 'data-display', label: 'Bảng & cây', group: 'data-display', Section: DataDisplaySection },
  { id: 'table', label: 'Bảng nâng cao', group: 'data-display', Section: TableSection },
  { id: 'data-tree', label: 'Cây dữ liệu', group: 'data-display', Section: DataTreeSection },
  { id: 'hud-kpi', label: 'Thẻ KPI HUD', group: 'data-display', Section: HudKpiSection },
  { id: 'smart-live', label: 'Sống & tự chạy', group: 'data-display', Section: SmartLiveSection },
  { id: 'ops-kit', label: 'Bộ điều hành', group: 'data-display', Section: OpsKitSection },

  { id: 'form-showcase', label: 'Hệ form', group: 'forms', Section: FormShowcaseSection },
  { id: 'form-advanced', label: 'Hệ form nâng cao', group: 'forms', Section: FormAdvancedSection },
  { id: 'form-layout', label: 'Bố cục form', group: 'forms', Section: FormLayoutSection },
  { id: 'form-arrays', label: 'Mảng field động', group: 'forms', Section: FormArraysSection },
  { id: 'form-hooks', label: 'Hook của form', group: 'forms', Section: FormHooksSection },

  { id: 'surfaces', label: 'Mặt nền', group: 'surfaces-layout', Section: SurfacesSection },
  {
    id: 'surfaces-cards',
    label: 'Thẻ số liệu',
    group: 'surfaces-layout',
    Section: SurfacesCardsSection,
  },
  { id: 'hud', label: 'Khung HUD', group: 'surfaces-layout', Section: HudSection },
  {
    id: 'panel-card',
    label: 'Card dashboard',
    group: 'surfaces-layout',
    Section: PanelCardSection,
  },
  { id: 'navigation', label: 'Điều hướng', group: 'surfaces-layout', Section: NavigationSection },
  {
    id: 'layout-boxes',
    label: 'Hộp bố cục trang',
    group: 'surfaces-layout',
    Section: LayoutBoxesSection,
  },
  { id: 'splitter', label: 'Chia khung', group: 'surfaces-layout', Section: SplitterSection },
  {
    id: 'layout-headers',
    label: 'Tiêu đề & header',
    group: 'surfaces-layout',
    Section: LayoutHeadersSection,
  },

  { id: 'media', label: 'Ảnh & tệp', group: 'media', Section: MediaSection },
  { id: 'upload-hook', label: 'Tải tệp & xem ảnh', group: 'media', Section: UploadHookSection },

  { id: 'charts', label: 'Biểu đồ', group: 'widgets', Section: ChartsSection },
  { id: 'chart-palette', label: 'Bảng màu chart', group: 'widgets', Section: ChartPaletteSection },
  {
    id: 'chart-gallery',
    label: 'Thư viện biểu đồ',
    group: 'widgets',
    Section: ChartGallerySection,
  },
  { id: 'chart-phone', label: 'Chart ở 360px', group: 'widgets', Section: ChartPhoneSection },
  { id: 'widgets', label: 'Widget dựng sẵn', group: 'widgets', Section: WidgetsSection },
];
