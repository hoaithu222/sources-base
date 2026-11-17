import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * `const [copied, copy] = useCopyToClipboard(resetDelay = 2000)` — `await copy(text)` chép vào clipboard,
 * `copied` bật `true` rồi tự tắt sau `resetDelay` ms; không có quyền clipboard → `false`, không ném lỗi.
 */
export function useCopyToClipboard(resetDelay = 2000): [boolean, (text: string) => Promise<void>] {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const copyToClipboard = useCallback(
    async (text: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        timerRef.current = setTimeout(() => setCopied(false), resetDelay);
      } catch {
        setCopied(false);
      }
    },
    [resetDelay],
  );

  return [copied, copyToClipboard];
}
