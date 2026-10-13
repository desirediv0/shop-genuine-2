import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../api/config';
import { useQuery } from '@tanstack/react-query';
import { catalogue } from '../api/services';
import type { StoreVertical } from '../types';

/**
 * The selected sub-brand (Genuine Nutrition / Grocery / Pharmacy / Cosmetics).
 *
 * `null` means "All" — the combined storefront.
 *
 * The selection persists between launches. The website deliberately resets to
 * All on every visit, but a phone is a personal device returned to many times a
 * day, and re-picking your store each time is friction a browser tab does not
 * have. A stored vertical that no longer exists is discarded on load.
 */
interface StoreVerticalContextValue {
  /** Currently selected vertical id, or null for "All". */
  verticalId: string | null;
  /** The selected vertical object, or null for "All". */
  vertical: StoreVertical | null;
  verticals: StoreVertical[];
  loading: boolean;
  select: (id: string | null) => void;
  /** Spread into query params; empty when "All" is selected. */
  verticalParam: { storeVerticalId?: string };
}

const StoreVerticalContext = createContext<StoreVerticalContextValue | null>(null);

export function StoreVerticalProvider({ children }: { children: React.ReactNode }) {
  const [verticalId, setVerticalId] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['storeVerticals'],
    queryFn: () => catalogue.storeVerticals(),
    // Sub-brands change rarely; don't refetch on every screen.
    staleTime: 10 * 60 * 1000,
  });

  const verticals = useMemo(() => data?.storeVerticals ?? [], [data]);

  // Restore once the vertical list is known, so a stored id that has since been
  // deleted or deactivated falls back to "All" instead of filtering everything
  // out and leaving the shopper on a permanently empty store.
  useEffect(() => {
    if (restored || !verticals.length) return;

    let cancelled = false;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.storeVertical);
        if (!cancelled && saved && verticals.some((v) => v.id === saved)) {
          setVerticalId(saved);
        }
      } catch {
        // Storage unavailable — stay on "All".
      } finally {
        if (!cancelled) setRestored(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [verticals, restored]);

  const select = useCallback((id: string | null) => {
    setVerticalId(id);
    // Fire and forget: failing to remember the choice must not block the switch.
    if (id) {
      AsyncStorage.setItem(STORAGE_KEYS.storeVertical, id).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.storeVertical).catch(() => {});
    }
  }, []);

  const value = useMemo<StoreVerticalContextValue>(() => {
    const vertical = verticals.find((v) => v.id === verticalId) ?? null;
    return {
      verticalId,
      vertical,
      verticals,
      loading: isLoading,
      select,
      verticalParam: verticalId ? { storeVerticalId: verticalId } : {},
    };
  }, [verticalId, verticals, isLoading, select]);

  return (
    <StoreVerticalContext.Provider value={value}>{children}</StoreVerticalContext.Provider>
  );
}

export function useStoreVertical(): StoreVerticalContextValue {
  const ctx = useContext(StoreVerticalContext);
  if (!ctx) throw new Error('useStoreVertical must be used inside <StoreVerticalProvider>');
  return ctx;
}
