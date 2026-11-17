import { getExtension } from '@/shared/utils/validation/file.utils';
import type { FileTypeStyle } from '../upload.types';

/**
 * Upload utilities — hàm thuần, không React: kiểu badge theo đuôi tệp, nhận diện ảnh, sinh id.
 * Lưu ý:  kiểm tệp / cỡ tệp KHÔNG ở đây — nguồn duy nhất là `@/shared/utils/validation/file.utils`
 *         và `@/shared/utils/format/file-size.utils`.
 */

const FILE_TYPE_MAP: Record<string, FileTypeStyle> = {
  pdf: { iconName: 'file-bold', label: 'PDF', skin: 'red' },
  doc: { iconName: 'file-lines-bold', label: 'DOC', skin: 'blue' },
  docx: { iconName: 'file-lines-bold', label: 'DOCX', skin: 'blue' },
  xls: { iconName: 'file-lines-bold', label: 'XLS', skin: 'green' },
  xlsx: { iconName: 'file-lines-bold', label: 'XLSX', skin: 'green' },
  csv: { iconName: 'file-lines-bold', label: 'CSV', skin: 'green' },
  ppt: { iconName: 'file-bold', label: 'PPT', skin: 'orange' },
  pptx: { iconName: 'file-bold', label: 'PPTX', skin: 'orange' },
  txt: { iconName: 'file-lines-bold', label: 'TXT', skin: 'neutral' },
  zip: { iconName: 'folder-bold', label: 'ZIP', skin: 'purple' },
  rar: { iconName: 'folder-bold', label: 'RAR', skin: 'purple' },
  '7z': { iconName: 'folder-bold', label: '7Z', skin: 'purple' },
  png: { iconName: 'image-bold', label: 'PNG', skin: 'sky' },
  jpg: { iconName: 'image-bold', label: 'JPG', skin: 'sky' },
  jpeg: { iconName: 'image-bold', label: 'JPG', skin: 'sky' },
  webp: { iconName: 'image-bold', label: 'WEBP', skin: 'sky' },
  gif: { iconName: 'image-bold', label: 'GIF', skin: 'sky' },
  svg: { iconName: 'image-bold', label: 'SVG', skin: 'sky' },
  dwg: { iconName: 'file-bold', label: 'DWG', skin: 'orange' },
  ifc: { iconName: 'file-bold', label: 'IFC', skin: 'purple' },
  rvt: { iconName: 'file-bold', label: 'RVT', skin: 'blue' },
  mp4: { iconName: 'file-bold', label: 'MP4', skin: 'purple' },
  mov: { iconName: 'file-bold', label: 'MOV', skin: 'purple' },
};

const DEFAULT_TYPE_STYLE: FileTypeStyle = {
  iconName: 'file-bold',
  label: 'FILE',
  skin: 'neutral',
};

/** Icon + nhãn + skin của badge theo đuôi tệp; đuôi lạ → "FILE" màu neutral. */
export function getFileTypeStyle(name: string): FileTypeStyle {
  return FILE_TYPE_MAP[getExtension(name)] ?? DEFAULT_TYPE_STYLE;
}

export function isImageFile(file: { type?: string; name: string }): boolean {
  if (file.type?.startsWith('image/')) return true;
  const ext = getExtension(file.name);
  return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
}

let _idSeq = 0;
export function generateFileId(): string {
  _idSeq = (_idSeq + 1) % 1_000_000;
  return `upl_${Date.now().toString(36)}_${_idSeq.toString(36)}`;
}
