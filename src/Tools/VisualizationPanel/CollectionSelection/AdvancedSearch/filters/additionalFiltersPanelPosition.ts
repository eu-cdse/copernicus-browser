export const ADDITIONAL_FILTERS_MIN_TOP = 120;
export const ADDITIONAL_FILTERS_EDGE_GAP = 8;

interface PanelStyleInput {
  anchorTop: number;
  panelHeight: number;
  bottomLimit: number;
}

// Anchored next to its toggle when it fits; otherwise its bottom edge sits on bottomLimit,
// and if still taller than the space available, its height is capped (content scrolls).
export const getAdditionalFiltersPanelStyle = ({
  anchorTop,
  panelHeight,
  bottomLimit,
}: PanelStyleInput): { top: string; maxHeight?: string } => {
  const preferredTop = Math.max(anchorTop, ADDITIONAL_FILTERS_MIN_TOP);
  if (preferredTop + panelHeight <= bottomLimit) {
    return { top: `${preferredTop}px` };
  }
  const top = Math.max(ADDITIONAL_FILTERS_EDGE_GAP, bottomLimit - panelHeight);
  // Deliberately not clamped to ADDITIONAL_FILTERS_MIN_TOP: a panel too tall to fit may rise up to
  // the edge gap so it can use the full window height before its content has to scroll.
  return { top: `${top}px`, maxHeight: `${bottomLimit - top}px` };
};
