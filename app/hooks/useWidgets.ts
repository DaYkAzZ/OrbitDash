'use client';

import { useEffect } from 'react';
import { useWidgetStore } from '../store';

/**
 * useWidgets – charge les widgets au montage et expose le store.
 */
export function useWidgets() {
  const store = useWidgetStore();

  useEffect(() => {
    store.loadWidgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}
