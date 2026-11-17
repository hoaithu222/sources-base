/** Độ sâu khối (px) của `StackBar` theo bề dày mặt trước — thanh mảnh thì nông hơn để mặt trên không đè hàng kế. */
export function stackBarDepth(height: number): number {
  if (height >= 20) return 5;
  if (height >= 8) return 4;
  return Math.max(2, Math.ceil(height / 2));
}
