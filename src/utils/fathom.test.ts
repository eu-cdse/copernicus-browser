import { handleFathomTrackEvent } from './fathom';

describe('handleFathomTrackEvent', () => {
  afterEach(() => {
    delete (window as { fathom?: unknown }).fathom;
    jest.restoreAllMocks();
  });

  test('calls window.fathom.trackEvent with the event name when no value is given', () => {
    const trackEvent = jest.fn();
    window.fathom = { trackEvent };

    handleFathomTrackEvent('External layers panel button clicked');

    expect(trackEvent).toHaveBeenCalledWith('External layers panel button clicked');
  });

  test('appends the value as "event: value" when a value is given', () => {
    const trackEvent = jest.fn();
    window.fathom = { trackEvent };

    handleFathomTrackEvent('External service added', 'WMS');

    expect(trackEvent).toHaveBeenCalledWith('External service added: WMS');
  });

  test('does not throw when window.fathom is undefined', () => {
    // Fathom is a deferred third-party script (see index.html) and is permanently absent when
    // blocked by an ad blocker, so this is the common case, not an edge case.
    expect(window.fathom).toBeUndefined();
    expect(() => handleFathomTrackEvent('External layers panel button clicked')).not.toThrow();
  });

  test('swallows an error thrown by trackEvent instead of letting it propagate', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    window.fathom = {
      trackEvent: () => {
        throw new Error('boom');
      },
    };

    expect(() => handleFathomTrackEvent('External service added', 'WMTS')).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
  });
});
