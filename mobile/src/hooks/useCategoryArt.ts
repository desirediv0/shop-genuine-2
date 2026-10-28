import { useQueries } from '@tanstack/react-query';
import { catalogue } from '../api/services';
import { useStoreVertical } from '../context/StoreVerticalContext';
import type { Category, ProductListResponse } from '../types';

/** Photos fetched per category: enough for the 2×2 collage on All categories. */
const PHOTOS = 4;

/**
 * The newest few products in each category, from the current store — the
 * admin has uploaded no category artwork, so these photos stand in for it.
 * One small request per category, cached for ten minutes and shared by every
 * screen that shows categories (Home's tiles, Search's chips, the All
 * categories collages), so each category is fetched once.
 */
function useCategoryQueries<T>(categories: Category[], pick: (photos: string[]) => T) {
  const { verticalId, verticalParam } = useStoreVertical();
  return useQueries({
    queries: categories.map((c) => ({
      queryKey: ['categoryArt', c.slug, verticalId],
      queryFn: () => catalogue.products({ category: c.slug, limit: PHOTOS, ...verticalParam }),
      staleTime: 10 * 60_000,
      select: (d: ProductListResponse) =>
        pick(d.products.map((p) => p.image).filter((uri): uri is string => !!uri)),
    })),
  });
}

/**
 * One photo per category: its own artwork if the admin uploaded one,
 * otherwise its newest product.
 */
export function useCategoryArt(categories: Category[]): (string | null)[] {
  const results = useCategoryQueries(categories, (photos) => photos[0] ?? null);
  return categories.map((c, i) => c.image ?? results[i]?.data ?? null);
}

/** Up to four product photos per category, newest first. */
export function useCategoryPhotos(categories: Category[]): string[][] {
  const results = useCategoryQueries(categories, (photos) => photos);
  return categories.map((_, i) => results[i]?.data ?? []);
}
