/** Phím → bước nhảy trong danh sách đoạn bật được. Ngang lẫn dọc: nhóm xuống dòng hay xếp dọc vẫn đi đúng thứ tự. */
const SEGMENT_KEY_STEP: Record<string, 'prev' | 'next' | 'first' | 'last'> = {
  ArrowLeft: 'prev',
  ArrowUp: 'prev',
  ArrowRight: 'next',
  ArrowDown: 'next',
  Home: 'first',
  End: 'last',
};

/**
 * Khoá đoạn cần nhảy tới khi bấm `eventKey` đang đứng ở `currentKey` — chỉ trong `enabledKeys` (đoạn khoá bị bỏ qua),
 * mũi tên đi vòng đầu ↔ cuối. Trả `undefined` nếu phím không phải phím điều hướng hoặc không còn đoạn nào bật.
 */
export function getRovingTargetKey(
  enabledKeys: readonly string[],
  currentKey: string | undefined,
  eventKey: string,
): string | undefined {
  const step = SEGMENT_KEY_STEP[eventKey];
  const count = enabledKeys.length;
  if (!step || count === 0) return undefined;
  if (step === 'first') return enabledKeys[0];
  if (step === 'last') return enabledKeys[count - 1];

  const index = currentKey === undefined ? -1 : enabledKeys.indexOf(currentKey);
  if (index < 0) return enabledKeys[step === 'next' ? 0 : count - 1];
  return enabledKeys[(index + (step === 'next' ? 1 : -1) + count) % count];
}
