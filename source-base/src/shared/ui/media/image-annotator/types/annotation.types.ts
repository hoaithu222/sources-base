/** `ellipse` (khoanh) | `text` (chữ); chọn / kéo / đổi cỡ làm qua thẻ kéo + handle nên không có tool "Chọn". */
export type Tool = 'ellipse' | 'text';

/** ⛔ MỌI toạ độ / kích thước của editor chú thích là px của ẢNH GỐC (natural), không phải px hiển thị. */
export interface Point {
  x: number;
  y: number;
}

interface BaseShape {
  id: string;
  color: string;
}

export interface EllipseShape extends BaseShape {
  kind: 'ellipse';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  lineWidth: number;
}

export interface TextShape extends BaseShape {
  kind: 'text';
  /** Góc trên-trái của dòng đầu. */
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

export type Shape = EllipseShape | TextShape;

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
