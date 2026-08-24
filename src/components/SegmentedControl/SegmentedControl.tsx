import React from 'react';
import './SegmentedControl.scss';

type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

export function SegmentedControl<T extends string>({ options, value, onChange, disabled }: Props<T>) {
  return (
    <div className="segmented-control" role="tablist">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          disabled={disabled}
          className={`segmented-control-option${option.value === value ? ' selected' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default SegmentedControl;
