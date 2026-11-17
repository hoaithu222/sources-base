import { notFound } from 'next/navigation';

/**
 * Bắt mọi URL không khớp route nào dưới `[locale]` rồi đẩy sang `not-found.tsx` — giữ layout + chữ đã dịch + HTTP 404 đúng
 * chuẩn (không để Next rơi về trang 404 mặc định không có ngôn ngữ).
 */
export default function CatchAllPage() {
  notFound();
}
