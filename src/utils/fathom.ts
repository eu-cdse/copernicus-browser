// Fathom is loaded as a deferred third-party script (see index.html), so `window.fathom` is
// undefined until it loads and permanently undefined when blocked by an ad blocker — a very
// common case for analytics scripts. The repo has already been bitten by exactly this kind of
// deferred-third-party-script race (see the `window.grecaptcha` comment in AuthProvider.jsx), so
// this call is optional-chained and wrapped in a try/catch: a blocked/proxied Fathom must never
// break the user action it's attached to.
export function handleFathomTrackEvent(event: string, value?: string): void {
  const trackedEvent = value ? `${event}: ${value}` : event;
  try {
    window.fathom?.trackEvent(trackedEvent);
  } catch (err) {
    console.warn('Fathom trackEvent failed', err);
  }
}
