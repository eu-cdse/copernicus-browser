import React from 'react';
import { addParameters, configure, addDecorator } from '@storybook/react';
import './i18nInit';

addParameters({
  options: {
    storySort: (a, b) => a[1].id.localeCompare(b[1].id),
  },
});

/**
 * Uses Webpack Context
 * https://webpack.js.org/guides/dependency-management/#require-context
 * We are importing all stories from the packages directory.
 * If required we can update this to start at route, but for now lets
 * keep it at components.
 */
const req = require.context('../src', true, /.story.(jsx?|js?)$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

/**
 * Idea on how to use controlled components in StoryBook:
 *   https://levelup.gitconnected.com/adding-state-to-storybook-in-react-c6744fda25b4
 */
class Stage extends React.Component {
  state = {};
  render() {
    return <div {...this.props}>{this.props.children(this.state, s => this.setState(s))}</div>;
  }
}
function State({ state, ...props }) {
  return (
    <div
      style={{
        backgroundColor: '#333',
        color: '#fff',
        borderTop: '40px solid #fff',
        padding: '10px 20px',
      }}
      {...props}
    >
      Parent state: <pre style={{ fontSize: 16 }}>{JSON.stringify(state)}</pre>
    </div>
  );
}

// Custom decorator
addDecorator(story => (
  <Stage>
    {(state, setState) => (
      <div style={{ display: 'flex', flexFlow: 'column' }}>
        {story({ state, setState })}
        <State state={state} />
      </div>
    )}
  </Stage>
));

configure(loadStories, module);
