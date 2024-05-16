import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export const Captcha = forwardRef(({ action, onExecute, sitekey, onError, onLoad }, ref) => {
  const instance = useRef(null);

  const executeCaptcha = () => {
    window.grecaptcha.enterprise.ready(async () => {
      try {
        const siteResponse = await window.grecaptcha.enterprise.execute(sitekey, {
          action,
        });
        onExecute(siteResponse);
      } catch (err) {
        console.error(err.message);
        onError(err.message);
      }
    });
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        executeCaptcha,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const loadCaptchaScript = () => {
    if (window.grecaptcha === undefined) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.onload = onLoad;
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${sitekey}`;
      if (instance.current !== null) {
        instance.current.appendChild(script);
      }
    }
  };

  useEffect(
    () => {
      loadCaptchaScript();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return <div ref={instance} />;
});
