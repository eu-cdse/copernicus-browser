import { SHOW_ZOOM_IN_ACTION_ANIMATION } from '../../../const';
import { getFromLocalStorage, saveToLocalStorage } from '../../../utils/localStorage.utils';

export function disableShowingZoomInActionAnimation() {
  saveToLocalStorage(SHOW_ZOOM_IN_ACTION_ANIMATION, false);
}

export function isZoomInActionAnimationDisabled() {
  return getFromLocalStorage(SHOW_ZOOM_IN_ACTION_ANIMATION) === 'false';
}
