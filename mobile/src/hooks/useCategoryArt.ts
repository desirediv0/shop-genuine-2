import { useQueries } from '@tanstack/react-query';
import { catalogue } from '../api/services';
import { useStoreVertical } from '../context/StoreVerticalContext';
import type { Category, ProductListResponse } from '../types';

/**
 * A photo for each category: its own artwork if the admin uploaded one (none
 * has yet), otherwise the newest product in it from the current store. One
 * ~1 KB request per category, cached for ten minutes and shared by every
 * screen that shows categories, so Home's tiles and Search's chips load once.
 */
export function useCategoryArt(categories: Category[]): (string | null)[] {
  const { verticalId, verticalParam } = useStoreVertical();
  const results = useQueries({
    queries: categories.map((c) => ({
      queryKey: ['categoryArt', c.slug, verticalId],
      queryFn: () => catalogue.products({ category: c.slug, limit: 1, ...verticalParam }),
      enabled: !c.image,
      staleTime: 10 * 60_000,
      select: (d: ProductListResponse) => d.products[0]?.image ?? null,
    })),
  });
  return categories.map((c, i) => c.image ?? results[i]?.data ?? null);
}
