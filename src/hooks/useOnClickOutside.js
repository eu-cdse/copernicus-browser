import { useEffect } from 'react';

const EMPTY_REFS = [];

export function useOnClickOutside(ref, handler, additionalRefs = EMPTY_REFS) {
  useEffect(() => {
    function listener(event) {
      if (
        !ref.current ||
        ref.current.contains(event.target) ||
        additionalRefs.some((r) => r && r.current && r.current.contains(event.target))
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
  }, [ref, handler, additionalRefs]);
}
