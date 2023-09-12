import { useEffect } from 'react';

export const useTimeout = (id, delay, callback) => {
  useEffect(() => {
    const setTimeoutId = setTimeout(() => callback(), delay);

    return () => clearTimeout(setTimeoutId);
  }, [id, delay, callback]);
};
