import React from 'react';

import Single from './icons/single.svg?react';
import Mosaic from './icons/mosaic.svg?react';
import TimeRange from './icons/time-range.svg?react';
import Layers from './icons/Layers.svg?react';
import Highlights from './icons/Highlights.svg?react';
import Compare from './icons/Compare.svg?react';
import Pins from './icons/Pins.svg?react';
import DoubleChevronDownWhite from './icons/double-chevron-down-white.svg?react';
import CodeWhiteIcon from './icons/code-white.svg?react';
import CompareWithBadge from './icons/Compare-badge.svg?react';
import PinsWithBadge from './icons/Pins-badge.svg?react';
import Pencil from './icons/Pencil.svg?react';
import WorkspacePlus from './icons/Workspace.svg?react';
import Polygon from './icons/Polygon.svg?react';

import LayersActive from './icons/Layers-active.svg?react';
import HighlightsActive from './icons/Highlights-active.svg?react';
import CompareActive from './icons/Compare-active.svg?react';
import PinsActive from './icons/Pins-active.svg?react';
import WmsWmtsActive from './icons/WmsWmts-active.svg?react';

export const LayersActiveIcon = LayersActive;
export const HighlightsActiveIcon = HighlightsActive;
export const CompareActiveIcon = CompareActive;
export const PinsActiveIcon = PinsActive;
export const WmsWmtsActiveIcon = WmsWmtsActive;

// Keys must match the `![alt](...)` text used in the markdown strings in TutorialContent.jsx exactly.
const TUTORIAL_MARKDOWN_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Single,
  Mosaic,
  'Time Range': TimeRange,
  Layers,
  Highlights,
  'Compare mode': Compare,
  Pins,
  expand: DoubleChevronDownWhite,
  'compare-with-badge': CompareWithBadge,
  'pins-with-badge': PinsWithBadge,
  'code-icon': CodeWhiteIcon,
  'expand-description': DoubleChevronDownWhite,
  rename: Pencil,
  compare: Compare,
  'workspace-add': WorkspacePlus,
  selection: Polygon,
};

export const TutorialMarkdownImage = ({ alt }: { alt?: string }) => {
  const Icon = TUTORIAL_MARKDOWN_ICONS[alt ?? ''];
  return Icon ? <Icon className="tutorial-markdown-icon" aria-hidden="true" /> : null;
};
