import type { CSSProperties } from 'react';

export interface Band {
  name: string;
  color?: string;
  getDescription?: () => string;
  [key: string]: unknown;
}

export interface BandDragItem {
  name: string;
}

export interface BandDropResult {
  id: string;
}

export interface DraggableBandProps<T extends object = Record<string, string | null>> {
  band: Band;
  value?: T;
  onChange?: (value: T) => void;
  style?: CSSProperties;
}

export interface DraggableBandGhostProps {
  bands: Band[];
}

export interface IndexLayer {
  a: string | null;
  b: string | null;
}

export interface IndexConfig {
  equation: string;
  colorRamp: string[];
  values: number[];
}

export interface IndexBandsProps {
  bands: Band[];
  layers: IndexLayer;
  onChange: (layers: IndexLayer, config: IndexConfig) => void;
  evalscript?: string;
}

export interface SliderThresholdProps {
  values: number[];
  colors?: string[];
  domain: [number | string, number | string];
  gradient: string[];
  invalidMinMax: () => boolean;
  handlePositions: number[];
  onSliderUpdate: (values: number[]) => void;
  onSliderChange: (values: number[]) => void;
}
