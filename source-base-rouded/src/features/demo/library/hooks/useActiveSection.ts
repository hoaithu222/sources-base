import { useEffect, useState } from 'react';

import { DEMO_SECTIONS } from '../sections.constants';

/** Khu vực CUỐI (theo thứ tự trang) đang nằm trong dải đỉnh vùng cuộn — lý do: `notes/code/demo.md`. */
function lastInBand(inBand: ReadonlySet<string>): string | undefined {
  for (let i = DEMO_SECTIONS.length - 1; i >= 0; i -= 1) {
    if (inBand.has(DEMO_SECTIONS[i].id)) return DEMO_SECTIONS[i].id;
  }
  return undefined;
}

/**
 * useActiveSection — id khu vực của `/demo` đang nằm ở dải đỉnh vùng cuộn, để mục lục (cột hoặc dải chip) tô
 * đúng mục. Nghe bằng `IntersectionObserver` với `root` = vùng cuộn thật, dải `rootMargin: 0 0 -75% 0`.
 *
 * @param scrollRef - Phần tử cuộn chứa các `<section id>` của `DEMO_SECTIONS`.
 * @returns `[activeId, setActiveId]` — setter để mục lục tô ngay lúc bấm, không chờ nhịp cuộn.
 *
 * @example
 * const [activeId, setActiveId] = useActiveSection(scrollRef);
 */
export function useActiveSection(scrollRef: React.RefObject<HTMLElement | null>) {
  const [activeId, setActiveId] = useState<string>(DEMO_SECTIONS[0]?.id ?? '');

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const inBand = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        const current = lastInBand(inBand);
        if (current) setActiveId(current);
      },
      { root, rootMargin: '0px 0px -75% 0px', threshold: 0 },
    );

    for (const s of DEMO_SECTIONS) {
      const el = root.querySelector(`#${s.id}`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [scrollRef]);

  return [activeId, setActiveId] as const;
}
