import React, { useRef } from 'react';
import { connect } from 'react-redux';

import { t } from 'ttag';
import { AOISelection } from './AOISelection';
import DateInput from './DateInput';
import { SelectInput } from './SelectInput';
import { providerSpecificSearchParameters, minDateRange, maxDateRange } from './config';
import { TPDICollectionsWithLabels } from './Search';

const SearchForm = ({ searchParams, handleSearchParamChange, aoiGeometry, aoiIsDrawing, mapBounds }) => {
  const fromTimeRef = useRef(null);
  const toTimeRef = useRef(null);

  const renderDataProviderParameters = (dataProvider, params, onChangeHandler) => {
    let providerParameters = providerSpecificSearchParameters[dataProvider];
    if (!!providerParameters && !params.advancedOptions) {
      providerParameters = providerParameters.filter(
        (input) => input.advanced === undefined || !input.advanced,
      );
    }

    return (
      <>
        {!!providerParameters &&
          providerParameters.map((input) =>
            input.render({ input: input, params: params, onChangeHandler: onChangeHandler }),
          )}
      </>
    );
  };

  return (
    <>
      <AOISelection aoiGeometry={aoiGeometry} aoiIsDrawing={aoiIsDrawing} mapBounds={mapBounds} />
      <DateInput
        id="fromTime-date-input"
        key="fromTime"
        name="fromTime"
        value={searchParams.fromTime}
        label={t`From`}
        onChangeHandler={(name, selectedDate) =>
          handleSearchParamChange(name, selectedDate.clone().startOf('day'))
        }
        min={minDateRange}
        max={searchParams.toTime}
        calendarContainerRef={fromTimeRef}
      />

      <DateInput
        name="toTime"
        value={searchParams.toTime}
        label={t`To`}
        onChangeHandler={(name, selectedDate) =>
          handleSearchParamChange(name, selectedDate.clone().endOf('day'))
        }
        min={searchParams.fromTime}
        max={maxDateRange}
        calendarContainerRef={toTimeRef}
      />

      <SelectInput
        input={{
          id: 'dataProvider',
          label: () => t`Constellation`,
          options: TPDICollectionsWithLabels,
        }}
        params={searchParams}
        onChangeHandler={handleSearchParamChange}
      />

      {renderDataProviderParameters(searchParams.dataProvider, searchParams, handleSearchParamChange)}
    </>
  );
};

const mapStoreToProps = (store) => ({
  aoiGeometry: store.aoi.geometry,
  aoiIsDrawing: store.aoi.isDrawing,
  mapBounds: store.mainMap.bounds,
});

export default connect(mapStoreToProps, null)(SearchForm);
