import NProgress from 'nprogress';
import { isFunction } from '../utils';

export function progressWithDelayedAction({ parent, delay, action, resetAction }) {
  // Create a safer progress bar configuration that handles missing parent elements
  let progressBar;

  function ensureProgressBar() {
    if (!progressBar) {
      // Check if the parent element exists, if not fall back to body
      const parentElement = document.querySelector(parent);
      progressBar = NProgress.configure({
        showSpinner: false,
        parent: parentElement ? parent : 'body',
      });
    }
    return progressBar;
  }

  function isParentAvailable() {
    return document.querySelector(parent) !== null;
  }

  let delayedActionTimeout = null;

  function isStarted() {
    return isParentAvailable() ? ensureProgressBar().isStarted() : false;
  }

  function resetDelayedAction() {
    if (delayedActionTimeout) {
      clearTimeout(delayedActionTimeout);
      if (resetAction && isFunction(resetAction)) {
        resetAction();
      }
    }
  }

  function done() {
    resetDelayedAction();
    if (isParentAvailable()) {
      ensureProgressBar().done();
    }
  }

  function inc() {
    if (isParentAvailable()) {
      ensureProgressBar().inc();
    }
  }

  function remove() {
    resetDelayedAction();
    if (isParentAvailable()) {
      ensureProgressBar().remove();
    }
  }

  function start() {
    resetDelayedAction();
    if (action && isFunction(action)) {
      delayedActionTimeout = setTimeout(action, delay);
    }
    if (isParentAvailable()) {
      ensureProgressBar().start();
    }
  }

  return {
    isStarted,
    done,
    inc,
    remove,
    start,
  };
}
