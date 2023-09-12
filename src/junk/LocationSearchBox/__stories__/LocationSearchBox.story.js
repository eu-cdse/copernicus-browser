import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';

import LocationSearchBox from '../LocationSearchBox';
import LocationSearchBoxControlled from '../LocationSearchBoxControlled';
import './DisplayWall.scss';

const stories = storiesOf('LocationSearchBox', module);

const setMapLocation = (data) => {
  console.log('this function gets called when user selects the location', data.location);
};

stories
  .add('default', () => (
    <LocationSearchBox mapboxAccessToken={process.env.REACT_APP_MAPBOX_KEY} onSelect={setMapLocation} />
  ))
  .add('custom props - EOB', () => (
    <LocationSearchBox
      mapboxAccessToken={process.env.REACT_APP_MAPBOX_KEY}
      placeholder="Go to Place"
      minChar={4}
      resultsShown={5}
      onSelect={setMapLocation}
    />
  ));

class SimulateInputFromOutside extends Component {
  state = {
    value: '',
  };

  insertChars = () => {
    this.setState({ value: 'ljub' });
  };

  onChange = (value) => {
    this.setState({ value: value });
  };

  render() {
    const { value } = this.state;

    return (
      <div>
        <button onClick={this.insertChars}>Insert chars</button>
        <LocationSearchBoxControlled
          value={value}
          onChange={this.onChange}
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_KEY}
          placeholder="Go to Place"
          minChar={1}
          resultsShown={5}
          onSelect={setMapLocation}
        />
      </div>
    );
  }
}

stories.add('Simulate input from outside', () => <SimulateInputFromOutside />);

stories.add('Slim default', () => (
  <LocationSearchBox
    mapboxAccessToken={process.env.REACT_APP_MAPBOX_KEY}
    placeholder="Go to Place"
    minChar={4}
    resultsShown={5}
    onSelect={setMapLocation}
    slim={true}
  />
));

class DisplayWall extends Component {
  state = {
    value: '',
  };

  menuStyle = {
    position: 'absolute',
    zIndex: 9999,
    overflow: 'auto',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: '25em',
    background: '#fff',
    marginTop: '-1px',
    marginRight: '3px',
    border: '2px solid #267dc0',
    borderTop: 0,
    borderRadius: '0px 0px 5px 5px',
    minWidth: '194px',
  };

  insertChars = () => {
    this.setState({ value: 'ljub' });
  };

  onChange = (value) => {
    this.setState({ value: value });
  };

  render() {
    const { value } = this.state;

    return (
      <>
        <button onClick={this.insertChars}>Insert chars</button>
        <div style={{ width: '200px' }} className="location-search-box-controlled">
          <LocationSearchBoxControlled
            value={value}
            onChange={this.onChange}
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_KEY}
            placeholder="Search for a place!"
            minChar={1}
            resultsShown={5}
            onSelect={setMapLocation}
            slim={true}
            menuStyle={this.menuStyle}
            highlightedBgColor="#f5f5f5"
          />
        </div>
      </>
    );
  }
}

stories.add('Display Wall', () => <DisplayWall />);

stories.add('google default', () => (
  <LocationSearchBox
    minChar={4}
    googleAccessToken={process.env.REACT_APP_GOOGLE_TOKEN}
    onSelect={setMapLocation}
  />
));

stories.add('mapbox and google should be error', () => (
  <LocationSearchBox
    minChar={4}
    mapboxAccessToken={process.env.REACT_APP_MAPBOX_KEY}
    googleAccessToken={process.env.REACT_APP_GOOGLE_TOKEN}
    onSelect={setMapLocation}
  />
));

stories.add('no access token should search only by coordinates', () => (
  <LocationSearchBox minChar={4} onSelect={setMapLocation} />
));
