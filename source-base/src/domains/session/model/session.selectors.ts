import type { SessionState } from './session.types';

/**
 * Selector đọc phiên — luôn đọc store qua đây, không lấy cả object state.
 *
 *   const user = useSessionStore(selectUser);
 */

export const selectUser = (state: SessionState) => state.user;
export const selectStatus = (state: SessionState) => state.status;
export const selectEndReason = (state: SessionState) => state.endReason;
