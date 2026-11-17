import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlProxy from 'next-intl/middleware';

import { parseAppEnv, parseServerEnv } from '@/core/config/env.schema';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from '@/core/i18n/locales';
import type { Locale } from '@/core/i18n/locales';
import { routing } from '@/core/i18n/routing';
import { PATHS, RETURN_PATH_PARAM, isProtectedPath } from '@/shared/constants/paths.constants';
import { createReturnPath } from '@/shared/utils/url/return-path.utils';

/**
 * proxy.ts (Next 16 — tên mới của `middleware.ts`) — chạy TRƯỚC khi route render, hai việc:
 *
 *   1. Chặn sớm theo phiên: route cần đăng nhập mà không có cookie phiên → `/login?next=…`. Không kiểm chữ ký token — đó
 *      là việc của BE; đây chỉ là cổng nhanh để người lạ không nhận HTML của vùng riêng tư. Cookie hết hạn / hỏng thì guard
 *      phía client (`AuthGate`) xử lý. Trang khách KHÔNG bị chặn ở đây: chuyển người đã đăng nhập đi do `GuestGate` — nếu
 *      proxy làm việc đó, cookie còn mà phiên hỏng sẽ gây vòng lặp `/login` ⇄ `/dashboard`.
 *   2. Định tuyến ngôn ngữ (next-intl): chọn ngôn ngữ, redirect / rewrite theo tiền tố.
 *
 * Lưu ý: ⛔ KHÔNG import `server-only` hay `@/core/config/server-config` ở đây (proxy không chạy trong điều
 *        kiện react-server) — đọc env bằng `parseServerEnv` thuần. Matcher bên dưới bỏ qua `/api`, file tĩnh,
 *        `_next` — thêm đường mới cần bỏ qua thì sửa matcher, đừng thêm `if` đầu hàm.
 */

const appEnv = parseAppEnv({
  NEXT_PUBLIC_APP_MODE: process.env.NEXT_PUBLIC_APP_MODE,
  NEXT_PUBLIC_AUTH_ENABLED: process.env.NEXT_PUBLIC_AUTH_ENABLED,
});
const serverEnv = parseServerEnv(process.env);
const intlProxy = createIntlProxy(routing);

interface LocalizedRequest {
  locale: Locale;
  /** Đường dẫn đã bỏ tiền tố ngôn ngữ. */
  path: string;
  /** Tiền tố để dựng URL đích (`''` cho ngôn ngữ mặc định, `/en` cho ngôn ngữ khác). */
  prefix: string;
}

function readLocalizedRequest(request: NextRequest): LocalizedRequest {
  const { pathname } = request.nextUrl;
  const [, first = ''] = pathname.split('/');

  if (isLocale(first) && first !== DEFAULT_LOCALE) {
    const rest = pathname.slice(first.length + 1);
    return { locale: first, path: rest === '' ? '/' : rest, prefix: `/${first}` };
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  return { locale, path: pathname, prefix: locale === DEFAULT_LOCALE ? '' : `/${locale}` };
}

function redirectTo(request: NextRequest, target: string): NextResponse {
  return NextResponse.redirect(new URL(target, request.url));
}

function guardBySession(request: NextRequest): NextResponse | null {
  if (!appEnv.authEnabled) return null;

  const { path, prefix } = readLocalizedRequest(request);
  const hasSession = request.cookies.has(serverEnv.authSessionCookie);

  if (isProtectedPath(path) && !hasSession) {
    const next = createReturnPath(path, request.nextUrl.search);
    const query = next ? `?${RETURN_PATH_PARAM}=${encodeURIComponent(next)}` : '';
    return redirectTo(request, `${prefix}${PATHS.LOGIN}${query}`);
  }

  return null;
}

export default function proxy(request: NextRequest): NextResponse {
  return guardBySession(request) ?? intlProxy(request);
}

export const config = {
  /** Mọi đường TRỪ: `/api`, `/trpc`, nội bộ Next / Vercel, và file có đuôi (ảnh, font, `favicon.ico`, `robots.txt`, `sitemap.xml`…). */
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
