import React from 'react';
import Toggle from 'react-toggle';
import { isSearchGroup } from './isSearchGroup';
import NonEmptyCheckboxes from './NonEmptyCheckboxes';
import CheckboxesWithChildren from './CheckboxesWithChildren';
import 'react-toggle/style.css';
import { t } from 'ttag';

import './Sentinel12SearchGroup.scss';
import { S1_ADVANCED_SEARCH_OPTIONS } from '../../Sentinel1DataSourceHandler';

class Sentinel1SearchGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      advancedOpened: false,
      ...this.getDefaultSearchFilterValues(),
    };
    this.publishStateFiltersValuesToParent();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.advancedOpened !== this.state.advancedOpened ||
      prevState.dataLocations !== this.state.dataLocations ||
      prevState.acquisitionModes !== this.state.acquisitionModes ||
      prevState.polarizations !== this.state.polarizations ||
      prevState.orbitDirections !== this.state.orbitDirections
    ) {
      this.publishStateFiltersValuesToParent();
    }
  }

  getDefaultSearchFilterValues() {
    const dataLocations = Object.keys(this.props.dataLocations);
    return {
      dataLocations: dataLocations.length > 1 ? dataLocations.slice(1, 2) : dataLocations, // only the second location (AWS) is selected by default if there are 2
      acquisitionModes: Object.keys(this.props.acquisitionModes),
      orbitDirections: Object.keys(this.props.orbitDirections),
      polarizations: Object.keys(
        this.getPolarizationsForAcquisitionModes(Object.keys(this.props.acquisitionModes)),
      ),
    };
  }

  publishStateFiltersValuesToParent() {
    const { advancedOpened, dataLocations, acquisitionModes, polarizations, orbitDirections } = this.state;
    if (advancedOpened) {
      this.props.saveFiltersValues({
        dataLocations: dataLocations,
        acquisitionModes: acquisitionModes,
        orbitDirections: orbitDirections,
        polarizations: polarizations,
      });
    } else {
      this.props.saveFiltersValues(this.getDefaultSearchFilterValues());
    }
  }

  setAcquisitionModeAndPolarizations = (acquisitionModes, polarizations) => {
    this.setState({
      acquisitionModes: acquisitionModes,
      polarizations: polarizations,
    });
  };

  getPolarizationsForAcquisitionModes(acquisitionModes) {
    return [...acquisitionModes].reduce(
      (prevValue, am) => ({ ...prevValue, ...this.props.polarizations[am] }),
      {},
    );
  }

  toggleAdvancedOpened = () => {
    this.setState((oldState) => ({
      advancedOpened: !oldState.advancedOpened,
    }));
  };

  getInitiallyCheckedPolarization = (polarizations) => {
    Object.keys(polarizations).forEach((p) => {
      polarizations[p] = Object.keys(polarizations[p]);
    });
    return polarizations;
  };

  render() {
    const { advancedOpened } = this.state;
    const { renderOptionsHelpTooltips } = this.props;

    return (
      <div className="sentinel1-dsg">
        <div>
          <label>{t`Advanced search`}:</label>
          <Toggle checked={advancedOpened} icons={false} onChange={this.toggleAdvancedOpened} />
        </div>

        {advancedOpened && (
          <div className="advanced">
            <div className="breakLines">
              <label>{t`Acquisition mode`}:</label>
              {renderOptionsHelpTooltips &&
                renderOptionsHelpTooltips(S1_ADVANCED_SEARCH_OPTIONS.ACQUISITION_MODES)}
              <CheckboxesWithChildren
                choices={this.props.acquisitionModes}
                initiallyChecked={this.state.acquisitionModes}
                children={this.props.polarizations}
                initiallyCheckedChildren={this.getInitiallyCheckedPolarization({
                  ...this.props.polarizations,
                })}
                childrenLabel={
                  <>
                    {t`Polarization`}:
                    {renderOptionsHelpTooltips &&
                      renderOptionsHelpTooltips(S1_ADVANCED_SEARCH_OPTIONS.POLARIZATIONS)}
                  </>
                }
                warningEmpty={t`Please select at least one data acquisition mode!`}
                warningEmptyChildren={t`Please select at least one polarization!`}
                onChange={this.setAcquisitionModeAndPolarizations}
              />
            </div>

            <div className="twoItemsPerLine">
              <label>{t`Orbit direction`}:</label>
              {renderOptionsHelpTooltips &&
                renderOptionsHelpTooltips(S1_ADVANCED_SEARCH_OPTIONS.ORBIT_DIRECTIONS)}
              <NonEmptyCheckboxes
                choices={this.props.orbitDirections}
                initiallyChecked={this.state.orbitDirections}
                onChange={(checked) => this.setState({ orbitDirections: checked })}
                warningEmpty={t`Please select at least one orbit direction!`}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default isSearchGroup(Sentinel1SearchGroup);
