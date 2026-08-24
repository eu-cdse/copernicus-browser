import React from 'react';
import { render } from '@testing-library/react';

// The project's fileTransform.cjs returns a plain filename string for the default export of
// .svg files, which is not a valid React element type. Mock the icon actually used by this test
// with a lightweight component rendering a real <svg> so TutorialMarkdownImage can render it.
jest.mock('./icons/single.svg?react', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('svg', props),
  };
});

import { TutorialMarkdownImage } from './TutorialIcons';

describe('TutorialMarkdownImage', () => {
  it('renders the matching icon as an svg element', () => {
    const { container } = render(<TutorialMarkdownImage alt="Single" />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders nothing when alt does not match a known icon', () => {
    const { container } = render(<TutorialMarkdownImage alt="not-a-real-icon" />);

    expect(container.querySelector('svg')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
