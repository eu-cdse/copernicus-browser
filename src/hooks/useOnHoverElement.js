import { useEffect, useRef } from 'react';

function useOnHoverElement(onHover, onLeave) {
  const elementRef = useRef(null);

  useEffect(() => {
    const handleMouseEnter = () => {
      if (typeof onHover === 'function') {
        onHover();
      }
    };

    const handleMouseLeave = () => {
      if (typeof onLeave === 'function') {
        onLeave();
      }
    };

    const containerElement = elementRef.current;

    if (containerElement) {
      containerElement.addEventListener('mouseenter', handleMouseEnter);
      containerElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (containerElement) {
        containerElement.removeEventListener('mouseenter', handleMouseEnter);
        containerElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [onHover, onLeave]);

  return elementRef;
}

export default useOnHoverElement;
