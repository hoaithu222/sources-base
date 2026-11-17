import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

/**
 * Điều hướng nhận biết ngôn ngữ — DÙNG THAY `next/link` và `next/navigation`.
 *
 *   <Link href="/login">…</Link>      → `/login` (vi) · `/en/login` (en) — tự thêm tiền tố
 *   const router = useRouter();       router.push('/dashboard') · router.replace(path, { locale: 'en' })
 *   const pathname = usePathname();   đường dẫn KHÔNG tiền tố ngôn ngữ — so sánh thẳng với `PATHS.*`
 *
 * Lưu ý:  `useSearchParams` giữ nguyên ở `next/navigation` (không phụ thuộc ngôn ngữ).
 */

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
