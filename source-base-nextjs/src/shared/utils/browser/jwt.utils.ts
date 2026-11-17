/**
 * Payload JWT → object claims (generic `T`); `null` nếu token rỗng/hỏng. Chỉ DECODE base64url,
 * KHÔNG verify chữ ký — dùng để đọc claim (vd account id) khi `user` chưa được set lúc mới đăng nhập.
 */
export function decodeJwtPayload<T = Record<string, unknown>>(
  token: string | null | undefined,
): T | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const binary = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return JSON.parse(new TextDecoder('utf-8').decode(bytes)) as T;
  } catch {
    return null;
  }
}

const USER_ID_CLAIMS = [
  'sub',
  'nameid',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
] as const;

/** Account id (GUID) từ JWT: thử lần lượt `sub`, `nameid`, claim nameidentifier của IdentityServer. */
export function getUserIdFromToken(token: string | null | undefined): string | null {
  const payload = decodeJwtPayload<Record<string, unknown>>(token);
  if (!payload) return null;
  for (const claim of USER_ID_CLAIMS) {
    const value = payload[claim];
    if (typeof value === 'string' && value) return value;
  }
  return null;
}
