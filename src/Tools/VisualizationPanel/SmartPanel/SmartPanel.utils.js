const SHOW_ZOOM_IN_ACTION_ANIMATION = 'eobrowser_show_zoom_in_action_animation';

export function disableShowingZoomInActionAnimation() {
  localStorage.setItem(SHOW_ZOOM_IN_ACTION_ANIMATION, false);
}

export function isZoomInActionAnimationDisabled() {
  return localStorage.getItem(SHOW_ZOOM_IN_ACTION_ANIMATION) === 'false';
}
