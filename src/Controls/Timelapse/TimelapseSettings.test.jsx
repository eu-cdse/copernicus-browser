import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import TimelapseSettings from './TimelapseSettings';
import { EXPORT_FORMAT } from '../../const';

describe('TimelapseSettings', () => {
  const defaultProps = {
    size: { width: 800, height: 600, ratio: 800 / 600 },
    format: EXPORT_FORMAT.gif,
    fadeDuration: 0.5,
    updateSize: jest.fn(),
    updateFormat: jest.fn(),
    updateFadeDuration: jest.fn(),
    toggleDownloadPanel: jest.fn(),
    delayLastFrame: false,
    updateDelayLastFrame: jest.fn(),
    showLegend: false,
    updateShowLegend: jest.fn(),
    hasLegendData: true,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the show legend checkbox unchecked when showLegend is false', () => {
    render(<TimelapseSettings {...defaultProps} showLegend={false} />);
    const checkbox = document.querySelector('.show-legend-checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('should render the show legend checkbox checked when showLegend is true', () => {
    render(<TimelapseSettings {...defaultProps} showLegend={true} />);
    const checkbox = document.querySelector('.show-legend-checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
  });

  it('should disable the checkbox and show a tooltip when hasLegendData is false', () => {
    render(<TimelapseSettings {...defaultProps} hasLegendData={false} />);
    const checkbox = document.querySelector('.show-legend-checkbox');
    expect(checkbox).toBeDisabled();
    const row = checkbox.closest('.settings-row');
    expect(row).toHaveAttribute('title', 'Layer does not have any legend data.');
  });

  it('should enable the checkbox and not show a tooltip when hasLegendData is true', () => {
    render(<TimelapseSettings {...defaultProps} hasLegendData={true} />);
    const checkbox = document.querySelector('.show-legend-checkbox');
    expect(checkbox).not.toBeDisabled();
    const row = checkbox.closest('.settings-row');
    expect(row).not.toHaveAttribute('title');
  });

  it('should call updateShowLegend with the toggled value when the checkbox is changed and Apply is clicked', () => {
    render(<TimelapseSettings {...defaultProps} showLegend={false} />);
    const checkbox = document.querySelector('.show-legend-checkbox');

    fireEvent.click(checkbox);
    fireEvent.click(screen.getByText('Apply'));

    expect(defaultProps.updateShowLegend).toHaveBeenCalledWith(true);
  });

  it('should call updateShowLegend with the original value when Apply is clicked without toggling the checkbox', () => {
    render(<TimelapseSettings {...defaultProps} showLegend={true} />);

    fireEvent.click(screen.getByText('Apply'));

    expect(defaultProps.updateShowLegend).toHaveBeenCalledWith(true);
  });
});
