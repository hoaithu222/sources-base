import type { MetadataRoute } from 'next';

import { PRIVATE_PATHS } from '@/app/_navigation/public-routes';
import { buildRobots, getSiteOrigin, isIndexingAllowed } from '@/core/seo';

/**
 * `/robots.txt` — sinh lúc build từ cấu hình: production cho phép, chặn vùng riêng tư + API; preview / staging chặn TOÀN BỘ
 * (`SEO_ALLOW_INDEXING`). Logic ở `core/seo/robots.utils.ts`; danh sách đường riêng tư ở `app/_navigation/public-routes.ts`.
 */
export default function robots(): MetadataRoute.Robots {
  return buildRobots({
    origin: getSiteOrigin(),
    allowIndexing: isIndexingAllowed(),
    privatePaths: PRIVATE_PATHS,
  });
}
