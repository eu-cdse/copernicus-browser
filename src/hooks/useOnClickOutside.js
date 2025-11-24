import { useEffect } from 'react';

export function useOnClickOutside(ref, handler, additionalRef = null) {
  useEffect(() => {
    function listener(event) {
      if (
        !ref.current ||
        ref.current.contains(event.target) ||
        (additionalRef && additionalRef.current && additionalRef.current.contains(event.target))
      ) {
        return;
      }
      handler(event);
    }
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, additionalRef]);
}
