import { useCallback, useEffect, useRef } from 'react';

const REFRESH_INTERVAL = 15_000;

export const useOrderRefresh = (request: () => Promise<unknown>): (() => void) => {
  const isRequestPending = useRef(false);

  const refresh = useCallback((): void => {
    if (isRequestPending.current) return;

    isRequestPending.current = true;
    const finish = (): void => {
      isRequestPending.current = false;
    };
    void request().then(finish, finish);
  }, [request]);

  useEffect(() => {
    refresh();

    const refreshVisiblePage = (): void => {
      if (document.visibilityState === 'visible') refresh();
    };
    const timer = window.setInterval(refreshVisiblePage, REFRESH_INTERVAL);

    return (): void => {
      window.clearInterval(timer);
    };
  }, [refresh]);

  return refresh;
};
