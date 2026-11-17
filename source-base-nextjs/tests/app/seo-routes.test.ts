/**
 * Chính sách route cho SEO — `PUBLIC_ROUTES` (nguồn sitemap) và `PRIVATE_PATHS` (nguồn robots) phải đối lập nhau và khớp
 * hệ thống file; `robots()` / `sitemap()` / `manifest()` xuất ra thứ hợp lệ.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { PRIVATE_PATHS, PUBLIC_ROUTES } from '@/app/_navigation';
import { LOCALE_META, LOCALES } from '@/core/i18n';
import {
  GUEST_ONLY_PATHS,
  PATHS,
  PROTECTED_PATH_PREFIXES,
} from '@/shared/constants/paths.constants';
import { REPO_PATHS } from '@tests/helpers/source-files';

const ORIGIN = 'https://example.com';

/** Route tĩnh có `page.tsx` dưới `src/app/[locale]` (route nhóm `(x)` không nằm trong URL). */
function staticPageRoutes(): Set<string> {
  const prefix = 'src/app/[locale]/';
  const routes = new Set<string>();
  for (const path of REPO_PATHS) {
    if (!path.startsWith(prefix) || !path.endsWith('/page.tsx')) continue;
    const segments = path
      .slice(prefix.length, -'page.tsx'.length)
      .split('/')
      .filter((segment) => segment !== '' && !/^\(.+\)$/.test(segment));
    if (!segments.some((segment) => segment.startsWith('['))) routes.add(`/${segments.join('/')}`);
  }
  return routes;
}

/** `robots.ts` / `sitemap.ts` đọc env lúc nạp module nên nạp lại sau khi đặt env. */
async function loadSeo(env: { indexing: boolean }) {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', ORIGIN);
  vi.stubEnv('SEO_ALLOW_INDEXING', String(env.indexing));
  const [{ default: robots }, { default: sitemap }] = await Promise.all([
    import('@/app/robots'),
    import('@/app/sitemap'),
  ]);
  return { robots, sitemap };
}

afterEach(() => vi.unstubAllEnvs());

describe('danh sách route công khai / riêng tư', () => {
  it('PUBLIC_ROUTES và PRIVATE_PATHS không giao nhau', () => {
    const publicPaths = PUBLIC_ROUTES.map((route) => route.path);

    expect(publicPaths.filter((path) => PRIVATE_PATHS.includes(path))).toEqual([]);
  });

  it('mọi PUBLIC_ROUTES.path có page.tsx', () => {
    const routes = staticPageRoutes();
    const missing = PUBLIC_ROUTES.map((route) => route.path).filter((path) => !routes.has(path));

    expect(missing).toEqual([]);
  });

  it('GUEST_ONLY_PATHS, PROTECTED_PATH_PREFIXES và trang 403 đều là đường riêng tư', () => {
    const outside = [...GUEST_ONLY_PATHS, ...PROTECTED_PATH_PREFIXES, PATHS.FORBIDDEN].filter(
      (path) => !PRIVATE_PATHS.includes(path),
    );

    expect(outside).toEqual([]);
  });

  it('mọi giá trị của PATHS được xếp vào đúng MỘT nhóm: công khai hoặc riêng tư', () => {
    const publicPaths = PUBLIC_ROUTES.map((route) => route.path);
    const isPrivate = (path: string) =>
      PRIVATE_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
    const unclassified = Object.values(PATHS).filter(
      (path) => !publicPaths.includes(path) && !isPrivate(path),
    );

    expect(unclassified).toEqual([]);
  });

  it('PUBLIC_ROUTES không trùng path và có priority trong [0, 1]', () => {
    const paths = PUBLIC_ROUTES.map((route) => route.path);

    expect(new Set(paths).size).toBe(paths.length);
    for (const { priority } of PUBLIC_ROUTES) {
      expect(priority ?? 0).toBeGreaterThanOrEqual(0);
      expect(priority ?? 0).toBeLessThanOrEqual(1);
    }
  });
});

describe('sitemap()', () => {
  it('mỗi route công khai có một mục CHO TỪNG ngôn ngữ, URL tuyệt đối đúng tiền tố', async () => {
    const { sitemap } = await loadSeo({ indexing: true });
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toHaveLength(PUBLIC_ROUTES.length * LOCALES.length);
    expect(urls).toContain(`${ORIGIN}/`);
    expect(urls).toContain(`${ORIGIN}/en`);
    expect(urls).toContain(`${ORIGIN}/about`);
    expect(urls).toContain(`${ORIGIN}/en/about`);
  });

  it('mỗi mục có hreflang cho mọi ngôn ngữ, trỏ tới đúng bản dịch của cùng trang', async () => {
    const { sitemap } = await loadSeo({ indexing: true });

    for (const entry of sitemap()) {
      const languages = entry.alternates?.languages as Record<string, string>;
      expect(Object.keys(languages).sort()).toEqual(
        LOCALES.map((locale) => LOCALE_META[locale].hrefLang).sort(),
      );
      expect(Object.values(languages)).toContain(entry.url);
    }
  });

  it('không có đường riêng tư nào trong URL hay hreflang', async () => {
    const { sitemap } = await loadSeo({ indexing: true });
    const everyUrl = sitemap().flatMap((entry) => [
      entry.url,
      ...Object.values((entry.alternates?.languages ?? {}) as Record<string, string>),
    ]);
    const leaked = everyUrl.filter((url) => {
      const pathname = new URL(url).pathname.replace(/^\/en(?=\/|$)/, '') || '/';
      return PRIVATE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
    });

    expect(leaked).toEqual([]);
  });

  it('môi trường không được lập chỉ mục (preview / staging) → sitemap rỗng', async () => {
    const { sitemap } = await loadSeo({ indexing: false });

    expect(sitemap()).toEqual([]);
  });
});

describe('robots()', () => {
  it('cho lập chỉ mục: cho phép "/", chặn /api/ và mọi đường riêng tư của MỌI ngôn ngữ, trỏ tới sitemap', async () => {
    const { robots } = await loadSeo({ indexing: true });
    const result = robots();
    const rules = result.rules as { userAgent: string; allow: string; disallow: string[] };

    expect(rules.userAgent).toBe('*');
    expect(rules.allow).toBe('/');
    expect(rules.disallow).toContain('/api/');
    for (const path of PRIVATE_PATHS) {
      expect(rules.disallow).toContain(path);
      expect(rules.disallow).toContain(`/en${path}`);
    }
    expect(result.sitemap).toBe(`${ORIGIN}/sitemap.xml`);
    expect(result.host).toBe(ORIGIN);
  });

  it('không chặn nhầm route công khai', async () => {
    const { robots } = await loadSeo({ indexing: true });
    const { disallow } = robots().rules as { disallow: string[] };

    for (const { path } of PUBLIC_ROUTES) {
      const variants = LOCALES.map((locale) =>
        locale === 'vi' ? path : `/${locale}${path === '/' ? '' : path}`,
      );
      expect(disallow.filter((entry) => variants.includes(entry))).toEqual([]);
    }
  });

  it('môi trường không được lập chỉ mục → chặn TOÀN BỘ, không sitemap', async () => {
    const { robots } = await loadSeo({ indexing: false });
    const result = robots();

    expect(result.rules).toEqual({ userAgent: '*', disallow: '/' });
    expect(result.sitemap).toBeUndefined();
  });
});

describe('manifest()', () => {
  it('start_url là bảng điều khiển; icon khai báo đều có file thật trong public/', async () => {
    const { default: manifest } = await import('@/app/manifest');
    const result = await manifest();

    expect(result.start_url).toBe(PATHS.DASHBOARD);
    expect(result.display).toBe('standalone');
    expect(result.icons?.length).toBeGreaterThan(0);
    const missing = (result.icons ?? [])
      .map((icon) => icon.src)
      .filter((src) => !REPO_PATHS.has(`public${src}`));
    expect(missing).toEqual([]);
  });

  it('icon maskable và icon thường đều có đủ cỡ 192 / 512', async () => {
    const { default: manifest } = await import('@/app/manifest');
    const icons = (await manifest()).icons ?? [];
    const sizesOf = (purpose: string) =>
      icons.filter((icon) => icon.purpose === purpose).map((icon) => icon.sizes);

    expect(sizesOf('any')).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(sizesOf('maskable')).toContain('512x512');
  });

  it('chữ lấy từ ngôn ngữ mặc định', async () => {
    const { default: manifest } = await import('@/app/manifest');
    const result = await manifest();

    expect(result.lang).toBe(LOCALE_META.vi.htmlLang);
    expect(result.description).toBeTruthy();
  });
});
