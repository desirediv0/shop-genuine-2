import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogue } from '../api/services';
import type { StoreVertical } from '../types';

/**
 * The selected sub-brand (Genuine Nutrition / Grocery / Pharmacy / Cosmetics).
 *
 * `null` means "All" — the combined storefront. Selection is intentionally held
 * in memory only, so every launch starts on All, matching the website
 * (client/src/context/StoreTypeContext.jsx makes the same choice). Swap in
 * AsyncStorage here if you later want it to persist between sessions.
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

  const { data, isLoading } = useQuery({
    queryKey: ['storeVerticals'],
    queryFn: () => catalogue.storeVerticals(),
    // Sub-brands change rarely; don't refetch on every screen.
    staleTime: 10 * 60 * 1000,
  });

  const verticals = useMemo(() => data?.storeVerticals ?? [], [data]);

  const select = useCallback((id: string | null) => setVerticalId(id), []);

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
