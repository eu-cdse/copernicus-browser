import { useCallback, useEffect } from 'react';

const KEY_EVENT_TYPE = 'keyup';

const useKeyPressed = (keyName, callback) => {
  const handleKeyPressed = useCallback(
    (event) => {
      if (event.key === keyName) {
        callback();
      }
    },
    [keyName, callback],
  );

  useEffect(() => {
    document.addEventListener(KEY_EVENT_TYPE, handleKeyPressed);

    return () => {
      document.removeEventListener(KEY_EVENT_TYPE, handleKeyPressed);
    };
  });
};

export default useKeyPressed;
