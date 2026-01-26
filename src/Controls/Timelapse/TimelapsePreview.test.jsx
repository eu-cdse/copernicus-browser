import React from 'react';
import { render, screen } from '@testing-library/react';
import { TimelapsePreview } from './TimelapsePreview';

// Mock react-device-detect
jest.mock('react-device-detect', () => ({
  isMobile: false,
}));

describe('TimelapsePreview', () => {
  // it('should render timelapse preview', () => {
  //   render(<TimelapsePreview images={[{}]} size={{}} activeImageIndex={0} />);
  //   expect(screen.queryByText('Share')).toBeInTheDocument();
  // });

  it('should render shared timelapse preview with .mp4', () => {
    // https://stackoverflow.com/questions/62732346/test-exception-unstable-flushdiscreteupdates
    Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
      set: jest.fn(),
    });

    render(
      <TimelapsePreview
        images={[{}]}
        size={{}}
        activeImageIndex={0}
        shouldDisplayPreviewFile={() => true}
        previewFileUrl={'test.mp4'}
      />,
    );
    expect(screen.queryByText('Edit timelapse')).toBeInTheDocument();
    expect(screen.queryByText('Download')).toBeInTheDocument();
    // expect(screen.queryByText('Share')).toBeInTheDocument();
    expect(document.querySelector('video')).toBeInTheDocument();
    expect(document.querySelector('img')).not.toBeInTheDocument();
  });

  it('should render shared timelapse preview with .gif', () => {
    render(
      <TimelapsePreview
        images={[{}]}
        size={{}}
        activeImageIndex={0}
        shouldDisplayPreviewFile={() => true}
        previewFileUrl={'test.gif'}
      />,
    );
    expect(screen.queryByText('Edit timelapse')).toBeInTheDocument();
    expect(screen.queryByText('Download')).toBeInTheDocument();
    // expect(screen.queryByText('Share')).toBeInTheDocument();
    expect(document.querySelector('video')).not.toBeInTheDocument();
    expect(document.querySelector('img')).toBeInTheDocument();
  });

  it('should render shared timelapse preview mobile', async () => {
    // Temporarily override the mock for this test
    jest.resetModules();
    jest.doMock('react-device-detect', () => ({
      isMobile: true,
    }));

    // Re-import the component to get the new mock
    const { TimelapsePreview: TimelapsePreviewMobile } = await import('./TimelapsePreview');

    render(
      <TimelapsePreviewMobile
        images={[{}]}
        size={{}}
        activeImageIndex={0}
        shouldDisplayPreviewFile={() => true}
        previewFileUrl={'test.gif'}
      />,
    );
    expect(screen.queryByText('Edit timelapse')).not.toBeInTheDocument();
  });

  it('should render timelapse preview edit', () => {
    render(<TimelapsePreview images={[{}]} size={{}} activeImageIndex={0} />);

    expect(screen.queryByText('Edit timelapse')).not.toBeInTheDocument();
    expect(screen.queryByText('Download')).toBeInTheDocument();
    // expect(screen.queryByText('Share')).toBeInTheDocument();
    expect(document.querySelector('video')).not.toBeInTheDocument();
    expect(document.querySelector('img')).toBeInTheDocument();
  });
});
