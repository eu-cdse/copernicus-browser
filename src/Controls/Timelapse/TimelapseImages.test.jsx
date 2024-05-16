import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TimelapseImages } from './TimelapseImages';
import moment from 'moment';
import { TimelapsePreview } from './TimelapsePreview';

const images = [
  {
    url: 'image-url-1',
    isSelected: true,
    coveragePercent: 100,
    averageCloudCoverPercent: 10,
    toTime: moment(),
    layer: {},
  },
  {
    url: 'image-url-2',
    isSelected: true,
    coveragePercent: 91,
    averageCloudCoverPercent: 51,
    toTime: moment(),
    layer: {},
  },
  {
    url: 'image-url-3',
    isSelected: false,
    coveragePercent: 82,
    averageCloudCoverPercent: 92,
    toTime: moment(),
    layer: {},
  },
  {
    url: 'image-url-4',
    isSelected: false,
    coveragePercent: 43,
    averageCloudCoverPercent: 53,
    toTime: moment(),
    layer: {},
  },
  {
    url: 'image-url-5',
    isSelected: false,
    coveragePercent: 34,
    averageCloudCoverPercent: 44,
    toTime: moment(),
    layer: {},
  },
];

describe('TimelapseImages', () => {
  it('should render timelapse images', () => {
    render(<TimelapseImages images={[]} />);
    expect(screen.queryByText('Visualisations')).toBeInTheDocument();
    expect(screen.queryByText('Borders')).toBeInTheDocument();
    expect(screen.queryByText('Select All')).toBeInTheDocument();
  });

  it('should render with filter by coverage', () => {
    render(<TimelapseImages images={[]} canWeFilterByCoverage={true} />);
    expect(screen.queryByText(/Min. tile coverage/)).toBeInTheDocument();
  });

  it('should render with filter by clouds', () => {
    render(<TimelapseImages images={[]} canWeFilterByClouds={true} />);
    expect(screen.queryByText(/Max. cloud coverage/)).toBeInTheDocument();
  });

  it('should only display applicable images', () => {
    render(
      <TimelapseImages
        canWeFilterByCoverage={true}
        canWeFilterByClouds={true}
        minCoverageAllowed={50}
        maxCCPercentAllowed={80}
        activeImageIndex={0}
        images={images}
      />,
    );

    expect(document.querySelectorAll('.image-container .image-item').length).toBe(5);
    expect(document.querySelectorAll('.image-container .image-item:not(.not-applicable)').length).toBe(2);
    expect(document.querySelectorAll('.image-container .image-item .selected').length).toBe(2);
    expect(document.querySelectorAll('.image-container .image-item.not-applicable').length).toBe(3);
    expect(document.querySelectorAll('.image-container .image-item.active').length).toBe(1);

    expect(screen.queryByText(/100%/)).toBeInTheDocument();
    expect(screen.queryByText(/10%/)).toBeInTheDocument();

    expect(screen.queryByText(/91%/)).toBeInTheDocument();
    expect(screen.queryByText(/51%/)).toBeInTheDocument();

    expect(screen.queryByText(/82%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/92%/)).not.toBeInTheDocument();

    expect(screen.queryByText(/43%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/53%/)).not.toBeInTheDocument();

    expect(screen.queryByText(/34%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/44%/)).not.toBeInTheDocument();
  });

  it('should call a callback', () => {
    const toggleImageSelected = jest.fn();
    const setImageToActive = jest.fn();

    render(
      <TimelapseImages
        canWeFilterByCoverage={true}
        canWeFilterByClouds={false}
        minCoverageAllowed={50}
        maxCCPercentAllowed={80}
        toggleImageSelected={toggleImageSelected}
        setImageToActive={setImageToActive}
        activeImageIndex={0}
        images={images}
      />,
    );

    fireEvent.click(document.querySelector('.image-container:nth-child(1) .image-select'));
    expect(toggleImageSelected).toHaveBeenCalledWith(0);

    fireEvent.click(document.querySelector('.image-container:nth-child(2) .image-select'));
    expect(toggleImageSelected).toHaveBeenCalledWith(1);

    fireEvent.click(document.querySelector('.image-container:nth-child(3) .image-select'));
    expect(toggleImageSelected).toHaveBeenCalledWith(2);

    fireEvent.click(document.querySelector('.image-container:nth-child(2) img'));
    expect(setImageToActive).toHaveBeenCalledWith(1);

    fireEvent.click(document.querySelector('.image-container:nth-child(3) img'));
    expect(setImageToActive).toHaveBeenCalledWith(2);
  });
});

describe('TimelapseImages - Timelapse preview sync', () => {
  it('should show same number of images', () => {
    render(
      <>
        <TimelapseImages
          canWeFilterByCoverage={true}
          canWeFilterByClouds={true}
          minCoverageAllowed={50}
          maxCCPercentAllowed={80}
          activeImageIndex={0}
          images={images}
        />
        <TimelapsePreview
          canWeFilterByCoverage={true}
          canWeFilterByClouds={true}
          minCoverageAllowed={50}
          maxCCPercentAllowed={80}
          images={images}
          activeImageIndex={0}
          size={{}}
        />
      </>,
    );

    expect(document.querySelectorAll('.image-container .image-item.active').length).toBe(1);
    expect(document.querySelectorAll('.image-container .image-item .selected').length).toBe(2);

    expect(screen.queryByText(/1 \/ 2/)).toBeInTheDocument();
  });
});
