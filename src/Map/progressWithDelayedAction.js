import NProgress from 'nprogress';
import { isFunction } from '../utils';

export function progressWithDelayedAction({ parent, delay, action, resetAction }) {
  const progressBar = NProgress.configure({
    showSpinner: false,
    parent: parent,
  });
  let delayedActionTimeout = null;

  function isStarted() {
    return progressBar.isStarted();
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
    progressBar.done();
  }

  function inc() {
    progressBar.inc();
  }

  function remove() {
    resetDelayedAction();
    progressBar.remove();
  }

  function start() {
    resetDelayedAction();
    if (action && isFunction(action)) {
      delayedActionTimeout = setTimeout(action, delay);
    }
    progressBar.start();
  }

  return {
    isStarted,
    done,
    inc,
    remove,
    start,
  };
}
