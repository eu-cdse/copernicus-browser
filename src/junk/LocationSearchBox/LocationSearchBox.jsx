import React from 'react';

import LocationSearchBoxControlled from './LocationSearchBoxControlled';

class LocationSearchBox extends React.PureComponent {
  state = {
    value: '',
  };

  handleInputChange = (value) => {
    this.setState({ value: value });
  };

  render() {
    const { value } = this.state;

    return <LocationSearchBoxControlled value={value} onChange={this.handleInputChange} {...this.props} />;
  }
}

export default LocationSearchBox;
