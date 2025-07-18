import React from 'react';
import { GeoJSON } from 'react-leaflet';

const defaultStyle = () => {
  return {
    weight: 1,
    color: '#398ade',
    opacity: 0.8,
    fillColor: '#398ade',
    fillOpacity: 0.15,
  };
};

const hoverStyle = () => {
  return {
    weight: 3,
    color: '#57de71',
    opacity: 1,
    fillColor: '#57de71',
    fillOpacity: 0.7,
  };
};

class PreviewLayer extends React.Component {
  state = {
    style: defaultStyle,
  };

  onMouseOver = () => {
    this.setState({
      style: hoverStyle,
    });
  };

  onMouseOut = () => {
    this.setState({
      style: defaultStyle,
    });
  };

  updateStyleIfHighlighted = (state) => {
    if (state) {
      return hoverStyle;
    } else {
      return defaultStyle;
    }
  };

  componentDidUpdate(prevProps) {
    if (prevProps.isHighlighted !== this.props.isHighlighted) {
      this.setState({
        style: this.updateStyleIfHighlighted(this.props.isHighlighted),
      });
    }
  }

  render() {
    if (this.props.tile.geometry === undefined || Object.keys(this.props.tile.geometry).length === 0) {
      return null;
    }
    return (
      <>
        <GeoJSON
          key={`preview-layer-${this.props.tile?.id}-${this.props.isHighlighted}`}
          data={this.props.tile.geometry}
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}
          style={this.props.isHighlighted ? hoverStyle : this.state.style}
          pane={this.props.pane}
        />
      </>
    );
  }
}

export default PreviewLayer;
