'use client';

import { useEffect, useState } from 'react';

export interface NowTick {
  now: Date;
  year: number;
  /** 0..11 (khớp `Date.getMonth()`). */
  monthIdx: number;
  /** 1..31. */
  day: number;
}

/**
 * `const { now, year, monthIdx, day } = useNowTick(intervalMs = 60_000)` — re-render mỗi `intervalMs` để bám
 * thời điểm hiện tại (badge "Cập nhật", tháng/năm hiện tại, countdown). Mặc định mỗi phút; đừng đặt < 1000.
 */
export function useNowTick(intervalMs = 60_000): NowTick {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return {
    now,
    year: now.getFullYear(),
    monthIdx: now.getMonth(),
    day: now.getDate(),
  };
}
