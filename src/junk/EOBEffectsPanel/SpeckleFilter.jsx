import React from 'react';
import Select from 'react-select';
import { t } from 'ttag';

import HelpTooltip from '../../Tools/SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/HelpTooltip';
import ExternalLink from '../../ExternalLink/ExternalLink';

import { capitalize, findSpeckleFilterIndex } from '../../utils/effectsUtils';
import { customSelectStyle } from '../../components/CustomSelectInput/CustomSelectStyle';
import { CustomDropdownIndicator } from '../../components/CustomSelectInput/CustomDropdownIndicator';

import './SpeckleFilter.scss';

const SpeckleFilter = ({
  speckleFilter,
  canApplySpeckleFilter,
  supportedSpeckleFilters,
  onUpdateSpeckleFilter,
}) => {
  const speckleFilterOptions = [
    { value: null, label: t`Layer default`, params: null },
    ...supportedSpeckleFilters.map((sf) => ({ ...sf, value: sf.label, label: capitalize(sf.label) })),
  ];

  const speckleFilterIndex = findSpeckleFilterIndex(speckleFilterOptions, speckleFilter);

  const updateSpeckleFilter = (speckleFilter) => {
    onUpdateSpeckleFilter(speckleFilter ? speckleFilter.params : undefined);
  };

  return (
    <div className="effect-container effect-with-dropdown">
      <span className="effect-name">
        {t`Speckle Filter`}
        <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
          {t`Speckle filtering is only applied at zoom levels 12 and above for IW and zoom levels 8 and above for EW acquisition. Zoom levels outside this range will render without speckle filtering, even if it is set.`}
          <br />
          <br />
          <ExternalLink href="https://docs.sentinel-hub.com/api/latest/data/sentinel-1-grd/#speckle-filtering">
            {t`More information`}
          </ExternalLink>
        </HelpTooltip>
      </span>
      <div className="effect-dropdown">
        {!canApplySpeckleFilter && speckleFilterIndex > 1 && (
          <span
            className="alert"
            title={t`Speckle filtering not applied. Zoom in to apply speckle filtering.`}
          >
            !
          </span>
        )}
        <Select
          value={speckleFilter ? speckleFilterOptions[speckleFilterIndex] : speckleFilterOptions[0]}
          options={speckleFilterOptions}
          onChange={updateSpeckleFilter}
          styles={customSelectStyle}
          menuPosition="fixed"
          menuShouldBlockScroll={true}
          className="speckleFilter-select-dropdown"
          classNamePrefix="speckleFilter-select"
          components={{ DropdownIndicator: CustomDropdownIndicator }}
          isSearchable={false}
          menuPlacement="auto"
        />
      </div>
    </div>
  );
};

export default SpeckleFilter;
