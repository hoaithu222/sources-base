import type { Shape } from './annotation.types';

export interface AnnotationResult {
  file: File;
  shapes: Shape[];
}

export interface AnnotationLayerProps {
  source: Blob;
  fileName: string;
  initialShapes: Shape[];
  layout: { width: number; height: number } | null;
  rotation: number;
  saving: boolean;
  onNatural: (natural: { w: number; h: number }) => void;
  onCancel: () => void;
  onSave: (result: AnnotationResult) => void;
}
