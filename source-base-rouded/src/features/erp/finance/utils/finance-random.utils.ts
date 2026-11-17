/**
 * Bộ sinh số giả ngẫu nhiên CÓ HẠT GIỐNG cho dữ liệu mẫu phân hệ Tài chính: cùng hạt giống → cùng dãy số, nên bút
 * toán / công nợ sinh ra ổn định giữa các lần tải, bài kiểm và ảnh chụp.
 *
 * Dùng:   const rand = seededRandom(hashSeed('112|2026-10')); amountBetween(rand, 50, 300) → số đồng tròn nghìn.
 */

/** Băm chuỗi thành hạt giống 32-bit (FNV-1a). */
export function hashSeed(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Hàm trả số trong [0, 1) theo thuật toán mulberry32 — gọi liên tiếp ra một dãy cố định cho mỗi hạt giống. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Số nguyên trong [min, max] (gồm hai đầu). */
export function intBetween(rand: () => number, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1));
}

/** Một phần tử bất kỳ của mảng. */
export function pickOne<T>(rand: () => number, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)];
}

/** Số tiền (đồng) trong khoảng `minMillion`–`maxMillion` triệu, làm tròn tới nghìn đồng. */
export function amountBetween(rand: () => number, minMillion: number, maxMillion: number): number {
  const million = minMillion + rand() * (maxMillion - minMillion);
  return Math.round(million * 1_000) * 1_000;
}

/** Chọn theo trọng số `weight` (mặc định 1) của từng phần tử. */
export function pickWeighted<T extends { weight?: number }>(
  rand: () => number,
  items: readonly T[],
): T {
  const total = items.reduce((sum, item) => sum + (item.weight ?? 1), 0);
  let cursor = rand() * total;
  for (const item of items) {
    cursor -= item.weight ?? 1;
    if (cursor < 0) return item;
  }
  return items[items.length - 1];
}
