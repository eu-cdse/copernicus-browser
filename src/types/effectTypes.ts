export type ColorRange = {
  from: number;
  to: number;
};

export type Effects = {
  gain?: number;
  gamma?: number;
  redRange?: ColorRange;
  greenRange?: ColorRange;
  blueRange?: ColorRange;
};
