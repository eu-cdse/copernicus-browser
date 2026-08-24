import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { UploadGeoFile } from './UploadGeoFile';
import { UPLOAD_GEOMETRY_TYPE, uploadGeoFileErrorMessages } from './UploadGeoFile.utils';

beforeEach(() => {
  const appDiv = document.createElement('div');
  appDiv.id = 'app';
  document.body.appendChild(appDiv);
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('UploadGeoFile', () => {
  describe('mode tabs', () => {
    it('renders File/GeoJSON/WKT/Bounding box/Grid reference tabs for a POLYGON (AOI) upload', () => {
      render(<UploadGeoFile type={UPLOAD_GEOMETRY_TYPE.POLYGON} onUpload={jest.fn()} onClose={jest.fn()} />);

      expect(screen.getByRole('tab', { name: 'File' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'GeoJSON' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'WKT' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Bounding box' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Grid reference' })).toBeInTheDocument();
    });

    it('renders only File/GeoJSON/WKT tabs for a LINE (LOI) upload', () => {
      render(<UploadGeoFile type={UPLOAD_GEOMETRY_TYPE.LINE} onUpload={jest.fn()} onClose={jest.fn()} />);

      expect(screen.getByRole('tab', { name: 'File' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'GeoJSON' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'WKT' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Bounding box' })).not.toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Grid reference' })).not.toBeInTheDocument();
    });

    it('switches the displayed input when a different tab is selected', () => {
      render(<UploadGeoFile type={UPLOAD_GEOMETRY_TYPE.POLYGON} onUpload={jest.fn()} onClose={jest.fn()} />);

      expect(screen.queryByPlaceholderText(/Enter a GEOREF or MGRS reference/)).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('tab', { name: 'Grid reference' }));

      expect(screen.getByPlaceholderText('Enter a GEOREF or MGRS reference.')).toBeInTheDocument();
    });

    it('clears a previous error when switching modes', () => {
      render(<UploadGeoFile type={UPLOAD_GEOMETRY_TYPE.POLYGON} onUpload={jest.fn()} onClose={jest.fn()} />);

      fireEvent.click(screen.getByRole('tab', { name: 'Bounding box' }));
      fireEvent.input(screen.getByLabelText('Min X'), { target: { value: '10' } });
      fireEvent.click(screen.getByText('Upload'));
      expect(screen.getByText(uploadGeoFileErrorMessages.INVALID_BBOX_VALUES())).toBeInTheDocument();

      fireEvent.click(screen.getByRole('tab', { name: 'WKT' }));
      expect(screen.queryByText(uploadGeoFileErrorMessages.INVALID_BBOX_VALUES())).not.toBeInTheDocument();
    });
  });

  describe('isSubmitDisabled', () => {
    const getUploadButton = () => screen.getByText('Upload').closest('a')!;

    it('disables Upload while on the file tab', () => {
      render(<UploadGeoFile type={UPLOAD_GEOMETRY_TYPE.POLYGON} onUpload={jest.fn()} onClose={jest.fn()} />);

      expect(getUploadButton()).toHaveClass('disabled');
    });

    it('enables Upload for WKT only once text is entered', () => {
      render(<UploadGeoFile type={UPLOAD_GEOMETRY_TYPE.POLYGON} onUpload={jest.fn()} onClose={jest.fn()} />);
      fireEvent.click(screen.getByRole('tab', { name: 'WKT' }));

      expect(getUploadButton()).toHaveClass('disabled');

      fireEvent.change(screen.getByPlaceholderText(/Paste your WKT geometry/), {
        target: { value: 'POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))' },
      });

      expect(getUploadButton()).not.toHaveClass('disabled');
    });

    it('enables Upload for grid reference only once text is entered', () => {
      render(<UploadGeoFile type={UPLOAD_GEOMETRY_TYPE.POLYGON} onUpload={jest.fn()} onClose={jest.fn()} />);
      fireEvent.click(screen.getByRole('tab', { name: 'Grid reference' }));

      expect(getUploadButton()).toHaveClass('disabled');

      fireEvent.change(screen.getByPlaceholderText('Enter a GEOREF or MGRS reference.'), {
        target: { value: '33TWN0000' },
      });

      expect(getUploadButton()).not.toHaveClass('disabled');
    });

    it('enables Upload for bounding box as soon as a single coordinate is filled in', () => {
      render(<UploadGeoFile type={UPLOAD_GEOMETRY_TYPE.POLYGON} onUpload={jest.fn()} onClose={jest.fn()} />);
      fireEvent.click(screen.getByRole('tab', { name: 'Bounding box' }));

      expect(getUploadButton()).toHaveClass('disabled');

      fireEvent.input(screen.getByLabelText('Min X'), { target: { value: '10' } });

      expect(getUploadButton()).not.toHaveClass('disabled');
    });
  });

  describe('bounding box validation', () => {
    const fillBbox = (values: { minX?: string; minY?: string; maxX?: string; maxY?: string }) => {
      if (values.minX !== undefined) {
        fireEvent.input(screen.getByLabelText('Min X'), { target: { value: values.minX } });
      }
      if (values.minY !== undefined) {
        fireEvent.input(screen.getByLabelText('Min Y'), { target: { value: values.minY } });
      }
      if (values.maxX !== undefined) {
        fireEvent.input(screen.getByLabelText('Max X'), { target: { value: values.maxX } });
      }
      if (values.maxY !== undefined) {
        fireEvent.input(screen.getByLabelText('Max Y'), { target: { value: values.maxY } });
      }
    };

    it('shows an error and does not call onUpload when some coordinates are missing', () => {
      const onUpload = jest.fn();
      render(<UploadGeoFile type={UPLOAD_GEOMETRY_TYPE.POLYGON} onUpload={onUpload} onClose={jest.fn()} />);
      fireEvent.click(screen.getByRole('tab', { name: 'Bounding box' }));

      fillBbox({ minX: '10' });
      fireEvent.click(screen.getByText('Upload'));

      expect(screen.getByText(uploadGeoFileErrorMessages.INVALID_BBOX_VALUES())).toBeInTheDocument();
      expect(onUpload).not.toHaveBeenCalled();
    });

    it('shows an order error and does not call onUpload when minX is not less than maxX', () => {
      const onUpload = jest.fn();
      render(<UploadGeoFile type={UPLOAD_GEOMETRY_TYPE.POLYGON} onUpload={onUpload} onClose={jest.fn()} />);
      fireEvent.click(screen.getByRole('tab', { name: 'Bounding box' }));

      fillBbox({ minX: '10', minY: '0', maxX: '5', maxY: '10' });
      fireEvent.click(screen.getByText('Upload'));

      expect(screen.getByText(uploadGeoFileErrorMessages.INVALID_BBOX_ORDER())).toBeInTheDocument();
      expect(onUpload).not.toHaveBeenCalled();
    });

    it('calls onUpload with a polygon derived from the bbox when all coordinates are valid', () => {
      const onUpload = jest.fn();
      render(<UploadGeoFile type={UPLOAD_GEOMETRY_TYPE.POLYGON} onUpload={onUpload} onClose={jest.fn()} />);
      fireEvent.click(screen.getByRole('tab', { name: 'Bounding box' }));

      fillBbox({ minX: '10', minY: '20', maxX: '30', maxY: '40' });
      fireEvent.click(screen.getByText('Upload'));

      expect(onUpload).toHaveBeenCalledTimes(1);
      expect(onUpload).toHaveBeenCalledWith(expect.objectContaining({ type: 'Polygon' }));
    });
  });
});
