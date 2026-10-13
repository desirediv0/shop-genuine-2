import { useQuery } from '@tanstack/react-query';
import { wishlist as wishlistApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

/**
 * The signed-in user's saved items, shared by the Saved tab badge, the Saved
 * screen and the product page's Save button.
 *
 * Keyed by user id because logout does not clear the query cache: under a bare
 * `['wishlist']` key, signing in as someone else would briefly show the
 * previous person's saved items and count. Screens still invalidate with
 * `['wishlist']`, which matches this key by prefix.
 */
export function useWishlist() {
  const { user, isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ['wishlist', user?.id ?? null],
    queryFn: () => wishlistApi.list(),
    enabled: isAuthenticated,
  });

  const items = isAuthenticated ? (query.data?.wishlistItems ?? []) : [];
  return { ...query, items, count: items.length };
}
