import { serializeJsonLd } from './json-ld.utils';

interface JsonLdProps {
  /** Một đối tượng schema.org (có `@context`) hoặc mảng nhiều đối tượng. */
  data: object | readonly object[];
}

/**
 * JsonLd — nhúng dữ liệu có cấu trúc schema.org vào trang dưới dạng `<script type="application/ld+json">`.
 *
 * Dùng trong Server Component (layout / page), dữ liệu dựng bằng hàm ở `json-ld.utils.ts`.
 * Lưu ý: dùng thẻ `<script>` thuần, KHÔNG `next/script` — JSON-LD là dữ liệu, không phải mã chạy.
 *
 * @param props.data - Một đối tượng hoặc mảng đối tượng JSON-LD.
 *
 * @example
 * <JsonLd data={[websiteJsonLd(site), breadcrumbJsonLd(trail)]} />
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      type="application/ld+json"
    />
  );
}
