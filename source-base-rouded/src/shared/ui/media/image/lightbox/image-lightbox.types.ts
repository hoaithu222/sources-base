import type { AnnotationResult, Shape } from '../../image-annotator';

export interface ImageLightboxNavigation {
  /** Vị trí ảnh đang xem (0-based) — dùng hiện "3 / 12". */
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export interface ImageAnnotationConfig {
  /** Ảnh GỐC chưa nét vẽ (nguồn để vẽ lại); `null` = caller đang tải về. */
  source: Blob | null;
  fileName: string;
  initialShapes?: Shape[];
  saving?: boolean;
  onSave: (result: AnnotationResult) => void;
}

export interface ImageLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt?: string;
  kind?: 'image' | 'video';
  onDownload?: () => void;
  annotation?: ImageAnnotationConfig;
  actions?: React.ReactNode;
  navigation?: ImageLightboxNavigation;
}

export interface ImageNatural {
  w: number;
  h: number;
}

export interface ImageLayout {
  width: number;
  height: number;
  boxWidth: number;
  boxHeight: number;
}
