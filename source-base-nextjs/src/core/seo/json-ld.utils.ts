import type { BreadcrumbList, Organization, WebPage, WebSite, WithContext } from 'schema-dts';

/**
 * Dữ liệu có cấu trúc JSON-LD (schema.org) — hàm dựng THUẦN, có kiểu từ `schema-dts`.
 *
 *   <JsonLd data={websiteJsonLd({ name, url, description, inLanguage })} />
 *
 * Lưu ý: `serializeJsonLd` thay `<` bằng chuỗi escape `\u003c` — chuỗi do người dùng nhập (tên sản phẩm, mô tả…) chứa
 * `</script>` sẽ KHÔNG thoát được khỏi thẻ `<script>` (XSS). Khuyến nghị của Next: nextjs.org/docs/app/guides/json-ld.
 */

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

interface OrganizationInput {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

export function organizationJsonLd({
  name,
  url,
  logo,
  description,
  sameAs,
}: OrganizationInput): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    ...(logo ? { logo } : {}),
    ...(description ? { description } : {}),
    ...(sameAs?.length ? { sameAs } : {}),
  };
}

interface WebSiteInput {
  name: string;
  url: string;
  description?: string;
  /** Mã ngôn ngữ BCP 47 của trang (`vi`, `en`). */
  inLanguage: string;
}

export function websiteJsonLd({
  name,
  url,
  description,
  inLanguage,
}: WebSiteInput): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    inLanguage,
    ...(description ? { description } : {}),
  };
}

interface WebPageInput {
  name: string;
  url: string;
  description?: string;
  inLanguage: string;
  /** URL của `WebSite` chứa trang này. */
  isPartOf: string;
}

export function webPageJsonLd({
  name,
  url,
  description,
  inLanguage,
  isPartOf,
}: WebPageInput): WithContext<WebPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    url,
    inLanguage,
    isPartOf: { '@type': 'WebSite', url: isPartOf },
    ...(description ? { description } : {}),
  };
}

export interface BreadcrumbItem {
  name: string;
  /** URL tuyệt đối. */
  url: string;
}

/** Vị trí 1-based theo thứ tự mảng: trang chủ → … → trang hiện tại. */
export function breadcrumbJsonLd(items: readonly BreadcrumbItem[]): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
