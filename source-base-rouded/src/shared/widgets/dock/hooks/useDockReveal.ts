import { useCallback, useEffect, useRef, useState } from 'react';

import {
  clearTimer,
  isInShellZone,
  isInTriggerZone,
  revealDurationMs,
} from '../utils/dock-reveal.utils';
import { DOCK_DURATION } from '../dock.theme';
import type { DockPosition } from '../dock.types';

/** Pha vẽ: `stowed` chưa gọi ra · `opening` đang bung (icon bay vào) · `shown` đã bung xong. */
type DockRevealPhase = 'stowed' | 'opening' | 'shown';

interface UseDockRevealOptions {
  /** `true` ở chế độ khuất theo mép (autohide / hidden): bật theo dõi con trỏ. */
  edgeTriggered: boolean;
  /** Số mục của Dock — quyết định bao lâu icon cuối bay xong. */
  itemCount?: number;
  /** Cạnh neo — vùng kích hoạt nằm giữa mép này. Mặc định `bottom`. */
  position?: DockPosition;
}

/**
 * useDockReveal — máy trạng thái hiện / ẩn của Dock: pha vẽ, các hẹn giờ và theo dõi con trỏ ở MÉP NEO.
 *
 * Dùng:   const { navRef, phase, settingsOpen, revealNow, conceal, concealNow, handleSettingsOpenChange }
 *           = useDockReveal({ edgeTriggered, itemCount: items?.length, position });
 * Lưu ý:  ⛔ `phase` là "thanh đã được gọi ra chưa" (`stowed` | `opening` | `shown`), KHÔNG phải chế độ
 *         `mode` của người dùng. Chỉ `edgeTriggered` (autohide / hidden) mới nghe `mousemove`; `collapsed`
 *         tự gọi `revealNow` / `conceal` từ onMouseEnter / onMouseLeave. Lý do thiết kế:
 *         docs/notes/code/widgets.md.
 */
export function useDockReveal({
  edgeTriggered,
  itemCount,
  position = 'bottom',
}: UseDockRevealOptions) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [phase, setPhase] = useState<DockRevealPhase>('stowed');

  const navRef = useRef<HTMLElement | null>(null);
  const phaseRef = useRef<DockRevealPhase>('stowed');
  const settingsOpenRef = useRef(false);
  const armTimer = useRef<number | null>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const goToPhase = useCallback((next: DockRevealPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const revealNow = useCallback(() => {
    clearTimer(closeTimer);
    clearTimer(armTimer);
    if (phaseRef.current !== 'stowed') return;

    goToPhase('opening');
    clearTimer(openTimer);
    openTimer.current = window.setTimeout(() => goToPhase('shown'), revealDurationMs(itemCount));
  }, [goToPhase, itemCount]);

  const revealArmed = useCallback(() => {
    clearTimer(closeTimer);
    if (phaseRef.current !== 'stowed' || armTimer.current !== null) return;

    armTimer.current = window.setTimeout(() => {
      armTimer.current = null;
      revealNow();
    }, DOCK_DURATION.armDelay);
  }, [revealNow]);

  const conceal = useCallback(() => {
    clearTimer(armTimer);
    if (settingsOpenRef.current) return;
    if (phaseRef.current === 'stowed' || closeTimer.current !== null) return;

    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      clearTimer(openTimer);
      goToPhase('stowed');
    }, DOCK_DURATION.closeDelay);
  }, [goToPhase]);

  const concealNow = useCallback(() => {
    clearTimer(armTimer);
    clearTimer(openTimer);
    clearTimer(closeTimer);
    if (phaseRef.current === 'stowed') return;
    goToPhase('stowed');
  }, [goToPhase]);

  useEffect(
    () => () => {
      clearTimer(armTimer);
      clearTimer(openTimer);
      clearTimer(closeTimer);
    },
    [],
  );

  const handleSettingsOpenChange = useCallback((next: boolean) => {
    settingsOpenRef.current = next;
    setSettingsOpen(next);
    if (next) clearTimer(closeTimer);
  }, []);

  useEffect(() => {
    if (edgeTriggered === false) return;

    let rafId: number | null = null;
    let latest: MouseEvent | null = null;

    const check = () => {
      rafId = null;
      const e = latest;
      if (!e) return;

      if (isInTriggerZone(e, position)) {
        revealArmed();
        return;
      }

      const nav = navRef.current;
      if (nav && isInShellZone(e, nav)) {
        clearTimer(closeTimer);
        return;
      }

      conceal();
    };

    const onMove = (e: MouseEvent) => {
      latest = e;
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(check);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [edgeTriggered, position, revealArmed, conceal]);

  return {
    navRef,
    phase,
    settingsOpen,
    revealNow,
    conceal,
    concealNow,
    handleSettingsOpenChange,
  };
}
