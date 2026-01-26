import React, { Component } from 'react';
import { EOBMeasurePanelButton } from '../../junk/EOBMeasurePanelButton/EOBMeasurePanelButton';
import store, { notificationSlice } from '../../store';
import { connect } from 'react-redux';
import './leaflet-ruler';
import L from 'leaflet';

class Measure extends Component {
  state = {
    isMeasuring: false,
    distance: null,
    area: null,
  };

  componentDidMount() {
    L.DomEvent.disableScrollPropagation(this.ref);
    L.DomEvent.disableClickPropagation(this.ref);
    this.ruler = L.ruler().addTo(this.props.map);
    this.props.map.on('measure:startMeasure', () => {
      this.setState({ isMeasuring: true, distance: null, area: null });
    });
    this.props.map.on('measure:move', (e) => {
      this.setState({ distance: e.distance, area: e.area });
    });
    this.props.map.on('measure:pointAdded', (e) => {
      this.setState({ distance: e.distance, area: e.area });
    });
    this.props.map.on('measure:finish', (e) => {
      this.setState({ distance: e.distance, area: e.area });
    });
    this.props.map.on('measure:removed', () => {
      this.setState({ isMeasuring: false, distance: null, area: null });
    });
  }

  render() {
    return (
      <div
        ref={(r) => {
          this.ref = r;
        }}
        className={`measure-wrapper ${this.props.className}`}
      >
        <EOBMeasurePanelButton
          active={this.state.isMeasuring}
          isLoggedIn={this.props.user}
          toggleMeasure={() => {
            this.ruler.toggle();
            if (this.state.isMeasuring) {
              this.ruler.removeMeasurement();
            }
          }}
          removeMeasurement={() => this.ruler.removeMeasurement()}
          hasMeasurement={this.state.distance !== null || this.state.area !== null}
          distance={this.state.distance}
          area={this.state.area}
          onErrorMessage={(msg) => store.dispatch(notificationSlice.actions.displayError(msg))}
        />
      </div>
    );
  }
}

const mapStoreToProps = (store) => ({
  user: store.auth.user.userdata,
});

export default connect(mapStoreToProps, null)(Measure);
