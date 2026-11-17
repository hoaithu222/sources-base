const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/** `1536` → `"1.5 KB"`. Số âm / không hữu hạn → `"0 B"`. */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1) return '0 B';
  const i = Math.min(SIZE_UNITS.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  const formatted = i === 0 ? value.toFixed(0) : value.toFixed(value < 10 ? 2 : 1);
  return `${parseFloat(formatted)} ${SIZE_UNITS[i]}`;
}
