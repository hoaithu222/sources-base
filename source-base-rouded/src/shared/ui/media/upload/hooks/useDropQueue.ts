import { useCallback, useEffect, useRef } from 'react';

/**
 * useDropQueue — giao kết quả đọc kéo-thả (bất đồng bộ) ĐÚNG thứ tự thả và chỉ khi component còn mount.
 *
 * Mỗi lần thả: bắt đầu đọc NGAY trong handler (DataTransfer hết hiệu lực sau event) rồi đưa promise vào
 * hàng. Kết quả của lần thả sau chờ lần trước giao xong; lần đọc lỗi bị bỏ qua, không chặn hàng; `deliver`
 * ném lỗi thì chỉ `console.error`, hàng vẫn chạy tiếp; unmount thì không giao gì nữa (async-safety.md).
 *
 * @returns `enqueue(pending, deliver)` — `deliver` là handler của CHÍNH lần thả đó.
 *
 * @example
 * const enqueue = useDropQueue();
 * const handleDrop = (e) => enqueue(readDirectoryDrop(e.dataTransfer), (result) => onDrop(result));
 */
export function useDropQueue() {
  const tailRef = useRef<Promise<void>>(Promise.resolve());
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  return useCallback(<T>(pending: Promise<T>, deliver: (result: T) => void): void => {
    const run = tailRef.current
      .then(() => pending)
      .then(
        (result) => {
          if (aliveRef.current) deliver(result);
        },
        () => undefined,
      );
    tailRef.current = run.catch((error: unknown) => console.error(error));
  }, []);
}
