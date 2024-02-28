import React from 'react';
import L from 'leaflet';
import { t } from 'ttag';

import './EOBModeSelection.scss';
import Toggle from 'react-toggle';

const ModeSelectionButton = ({ highlighted, modes, selectedModeId, onSelectMode }) => (
  <div
    className="mode-selection-button floatItem"
    title={t`Select mode`}
    onClick={() => {
      onSelectMode(selectedModeId === modes[0].id ? modes[1].id : modes[0].id);
    }}
  >
    <i className={`fa fa-graduation-cap ${highlighted ? `active` : null}`} />
    <div className="label">{t`Education`}</div>
    <Toggle checked={highlighted} onChange={() => {}} />
  </div>
);

class EOBModeSelection extends React.Component {
  static defaultProps = {
    highlighted: false,
    modes: [],
    onSelectMode: () => {},
    selectedModeId: null,
  };

  componentDidMount() {
    L.DomEvent.disableScrollPropagation(this.ref);
    L.DomEvent.disableClickPropagation(this.ref);
  }

  render() {
    const { highlighted, modes, selectedModeId } = this.props;
    return (
      <div className="mode-selection" ref={(r) => (this.ref = r)}>
        <ModeSelectionButton
          modes={modes}
          highlighted={highlighted}
          selectedModeId={selectedModeId}
          onSelectMode={this.props.onSelectMode}
        />
      </div>
    );
  }
}

export default EOBModeSelection;
