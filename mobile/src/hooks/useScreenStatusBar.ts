import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';

/**
 * Status bar icons for a screen whose top is coloured: white while the screen
 * is focused (and `style` says so), dark again the moment it loses focus, so
 * the next screen — every one of which has a light top — never inherits white
 * icons it cannot show.
 */
export function useScreenStatusBar(style: 'light' | 'dark') {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(style, true);
      return () => setStatusBarStyle('dark', true);
    }, [style]),
  );
}
