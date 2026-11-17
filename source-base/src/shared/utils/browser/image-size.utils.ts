const isImage = (file: File): boolean => file.type.startsWith('image/');

/**
 * `{ width, height }` (px) của ảnh, hoặc `null` khi không phải ảnh / không giải mã được (vd SVG ở
 * vài trình duyệt). KHÔNG bao giờ ném — thiếu kích thước chỉ làm bong bóng giật nhẹ, không đáng chặn gửi tệp.
 */
export const readImageSize = async (
  file: File,
): Promise<{ width: number; height: number } | null> => {
  if (!isImage(file)) return null;
  try {
    const bitmap = await createImageBitmap(file);
    try {
      return { width: bitmap.width, height: bitmap.height };
    } finally {
      bitmap.close();
    }
  } catch {
    return null;
  }
};
