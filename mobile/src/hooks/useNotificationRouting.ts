import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { addNotificationTapListener } from '../utils/pushRegistration';

/**
 * Routes a tapped notification to the right screen.
 *
 * The server sends `data: { type: 'ORDER_STATUS', orderId, ... }` from
 * utils/pushNotification.js, so an order alert opens that order.
 *
 * expo-notifications is reached only through pushRegistration, which loads it
 * lazily — importing it here at module scope would crash startup wherever the
 * native module is absent.
 */
export function useNotificationRouting(): void {
  const router = useRouter();
  // A cold-start response stays available across remounts; only act on it once.
  const handled = useRef(false);

  useEffect(() => {
    const unsubscribe = addNotificationTapListener((data) => {
      if (!data) return;
      if (data.type === 'ORDER_STATUS' && typeof data.orderId === 'string') {
        if (handled.current) return;
        handled.current = true;
        router.push(`/orders/${data.orderId}`);
        // Allow a later tap while the app is running.
        setTimeout(() => {
          handled.current = false;
        }, 1000);
      }
    });

    return unsubscribe;
  }, [router]);
}
