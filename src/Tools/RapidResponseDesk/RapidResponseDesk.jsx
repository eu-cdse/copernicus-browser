import React, { useEffect, useRef, useState } from 'react';
import './RapidResponseDesk.scss';
import { connect } from 'react-redux';
import AreaAndTimeSection from './sections/AreaTime/AreaAndTimeSection';
import ProviderSection from './sections/ImageQualityAndProviderSection/ImageQualityAndProviderSection';
import AdvancedSection from './sections/Advanced/AdvancedSection';
import { t } from 'ttag';
import Button, { ButtonType } from '../../components/Button/Button';
import MessagePanel from '../VisualizationPanel/MessagePanel/MessagePanel';
import store, {
  areaAndTimeSectionSlice,
  collapsiblePanelSlice,
  imageQualityAndProviderSectionSlice,
  mainMapSlice,
  resultsSectionSlice,
} from '../../store';
import { useRRDHttpRequest } from '../../hooks/useRRDHttpRequest';
import ResultsSection from './sections/Results/ResultsSection';
import { RRDQueryBuilder } from '../../api/RRD/RRDQueryBuilder';
import { rrdApi } from '../../api/RRD/RRDApi';
import { handleError, resetMessagePanel } from '../../utils';
import moment from 'moment';
import {
  getResultsSectionFilterDefaultValue,
  ProviderImageTypes,
  ResultsSectionSortProperties,
} from './rapidResponseProperties';
import Loader from '../../Loader/Loader';
import { TABS } from '../../const';
import { getPolarizationFilterOptions } from './sections/ImageQualityAndProviderSection/Radar/Radar.utils';
import ProjectDetailsSection from './sections/ProjectDetails/ProjectDetailsSection';

const ErrorCode = {
  OVERLAPPED_RANGES: 'OVERLAPPED_RANGES',
  NO_COLLECTIONS: 'NO_COLLECTIONS',
  NO_POLARIZATION: 'NO_POLARIZATION',
  NO_INSTRUMENT: 'NO_INSTRUMENT',
};

const ErrorMessage = {
  [ErrorCode.OVERLAPPED_RANGES]: () => t`Overlapped ranges are not allowed`,
  [ErrorCode.NO_COLLECTIONS]: () => t`Please select at least one collection`,
  [ErrorCode.NO_POLARIZATION]: () => t`Please select at least one polarization channel`,
  [ErrorCode.NO_INSTRUMENT]: () => t`Please select at least one instrument`,
};

const RapidResponseDesk = ({
  selectedTabIndex,
  user,
  aoi,
  mapBounds,
  areaAndTimeSection,
  providerSection,
  advancedSection,
  resultsSection,
  isTaskingEnabled,
  isArchiveEnabled,
}) => {
  const [cartSize, setCartSize] = useState(0);

  const divErrorMessageRef = useRef();
  const divResultsRef = useRef();
  const scrollToErrorMessage = () => {
    const { current } = divErrorMessageRef;
    if (current !== null) {
      current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToResults = () => {
    const { current } = divResultsRef;
    if (current !== null) {
      current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [requestInProgress, setHttpRequest] = useRRDHttpRequest(scrollToErrorMessage);

  useEffect(() => {
    // TODO: Use this later on to get all collections (currently hardcoded)
    // rrdApi.getCollections(user.access_token).then((response) => {
    //   console.warn(response);
    // });

    rrdApi.getCart(user.access_token).then((response) => {
      store.dispatch(resultsSectionSlice.actions.setCartResults(response));
    });
  }, [user]);

  useEffect(() => {
    let sumOfItemsInCart = 0;
    if (resultsSection.cartResults?.quote) {
      for (let product of resultsSection.cartResults.quote.products) {
        sumOfItemsInCart += product.scenes.length;
      }
    }
    setCartSize(sumOfItemsInCart);
  }, [resultsSection.cartResults]);

  useEffect(() => {
    if (selectedTabIndex !== TABS.RAPID_RESPONSE_DESK) {
      resetMessagePanel();
    }
  }, [selectedTabIndex]);

  const isPolarizationValid = () => {
    if (providerSection.imageType !== ProviderImageTypes.radar) {
      return true;
    }

    return (
      providerSection.radarPolarizationFilterArray && providerSection.radarPolarizationFilterArray.length > 0
    );
  };

  const isInstrumentValid = () => {
    if (providerSection.imageType !== ProviderImageTypes.radar) {
      return true;
    }
    return (
      providerSection.radarInstrumentFilterArray && providerSection.radarInstrumentFilterArray.length > 0
    );
  };

  const isAnyMissionSelected = () => {
    const hasValidOptical = providerSection.selectedOpticalProvidersAndMissions.some(
      (provider) => provider.missions?.length > 0,
    );

    const hasValidRadar = providerSection.selectedRadarProvidersAndMissions.some(
      (provider) => provider.missions?.length > 0,
    );

    const hasValidAtmos = providerSection.selectedAtmosProvidersAndMissions.some(
      (provider) => provider.missions?.length > 0,
    );

    store.dispatch(
      imageQualityAndProviderSectionSlice.actions.setSelectedOpticalProvidersAndMissions(
        providerSection.selectedOpticalProvidersAndMissions,
      ),
    );

    store.dispatch(
      imageQualityAndProviderSectionSlice.actions.setSelectedRadarProvidersAndMissions(
        providerSection.selectedRadarProvidersAndMissions,
      ),
    );

    store.dispatch(
      imageQualityAndProviderSectionSlice.actions.setSelectedAtmosProvidersAndMissions(
        providerSection.selectedAtmosProvidersAndMissions,
      ),
    );

    return hasValidOptical || hasValidRadar || hasValidAtmos;
  };

  const isSearchCriteriaValid = () => {
    let errors = [];

    if (areaAndTimeSection.overlappedRanges.length > 0) {
      errors.push(ErrorMessage[ErrorCode.OVERLAPPED_RANGES]());
    }

    if (!isAnyMissionSelected()) {
      errors.push(ErrorMessage[ErrorCode.NO_COLLECTIONS]());
    }

    if (!isPolarizationValid()) {
      errors.push(ErrorMessage[ErrorCode.NO_POLARIZATION]());
    }

    if (!isInstrumentValid()) {
      errors.push(ErrorMessage[ErrorCode.NO_INSTRUMENT]());
    }

    if (errors.length > 0) {
      handleError({ message: errors.join('\n') });
      return false;
    }

    return true;
  };

  const ensureInternalFeatureIds = (features) => {
    return features.map((item) => ({
      ...item,
      ...{
        _internalId: Date.now().toString(36) + Math.random().toString(36).slice(2, 10),
      },
    }));
  };

  const triggerSearchQuery = () => {
    store.dispatch(mainMapSlice.actions.clearQuicklookOverlays());
    resetMessagePanel();
    if (!isSearchCriteriaValid()) {
      scrollToErrorMessage();
      return;
    }

    store.dispatch(resultsSectionSlice.actions.setResults(undefined));

    const correctedTimespanArray = areaAndTimeSection.timespanArray.map((timeSpan) => {
      const now = moment.utc();
      let correctedFrom = moment.utc(timeSpan.from);
      let correctedTo = moment.utc(timeSpan.to);

      if (isArchiveEnabled === isTaskingEnabled) {
        throw Error('invalidDateRange');
      }

      if (isTaskingEnabled) {
        const minFutureStart = now.clone().add(5, 'minute');
        if (correctedFrom.isBefore(minFutureStart)) {
          correctedFrom = minFutureStart;
        }
      } else {
        const maxPastEnd = now.clone().subtract(5, 'minute');
        if (correctedTo.isAfter(maxPastEnd)) {
          correctedTo = maxPastEnd;
        }
      }

      return { ...timeSpan, from: correctedFrom, to: correctedTo };
    });

    store.dispatch(areaAndTimeSectionSlice.actions.setTimespanArray(correctedTimespanArray));
    const latestAreaAndTimeSection = store.getState().areaAndTimeSection;

    const latestProviderMissionsCollectionsArray = {
      selectedOpticalProvidersAndMissions: providerSection.selectedOpticalProvidersAndMissions.filter(
        (provider) => provider.missions?.length > 0,
      ),
      selectedRadarProvidersAndMissions: providerSection.selectedRadarProvidersAndMissions.filter(
        (provider) => provider.missions?.length > 0,
      ),

      selectedAtmosProvidersAndMissions: providerSection.selectedAtmosProvidersAndMissions.filter(
        (provider) => provider.missions?.length > 0,
      ),
    };

    store.dispatch(
      imageQualityAndProviderSectionSlice.actions.setSelectedOpticalProvidersAndMissions(
        latestProviderMissionsCollectionsArray.selectedOpticalProvidersAndMissions,
      ),
    );
    store.dispatch(
      imageQualityAndProviderSectionSlice.actions.setSelectedRadarProvidersAndMissions(
        latestProviderMissionsCollectionsArray.selectedRadarProvidersAndMissions,
      ),
    );
    store.dispatch(
      imageQualityAndProviderSectionSlice.actions.setSelectedAtmosProvidersAndMissions(
        latestProviderMissionsCollectionsArray.selectedAtmosProvidersAndMissions,
      ),
    );
    const latestProviderSection = store.getState().imageQualityAndProviderSection;
    const latestradarPolarizationFilterArray =
      store.getState().imageQualityAndProviderSection.radarPolarizationFilterArray;

    const filteredPolarizationOptions = latestradarPolarizationFilterArray.filter((option) =>
      getPolarizationFilterOptions(isTaskingEnabled).some(
        (validOption) => validOption.value === option.value,
      ),
    );

    store.dispatch(
      imageQualityAndProviderSectionSlice.actions.setRadarPolarizationFilterArray(
        filteredPolarizationOptions,
      ),
    );

    const searchRequestBody = new RRDQueryBuilder(
      aoi,
      mapBounds,
      latestAreaAndTimeSection,
      latestProviderSection,
      advancedSection,
      resultsSection,
      isTaskingEnabled,
    ).createSearchRequestBody();

    setHttpRequest({
      request: rrdApi.search,
      authToken: user.access_token,
      queryBody: searchRequestBody,
      responseHandler: (response) => {
        if (response) {
          let result;
          if (Array.isArray(response)) {
            result = response.flatMap((tempResponse) => tempResponse.features);
          } else {
            result = response.features;
          }
          result = ensureInternalFeatureIds(result);
          if (result.length > 0) {
            store.dispatch(collapsiblePanelSlice.actions.setOrderPanels(false));
          } else {
            store.dispatch(collapsiblePanelSlice.actions.setOrderPanels(true));
          }
          store.dispatch(resultsSectionSlice.actions.setResults(result));
          store.dispatch(resultsSectionSlice.actions.setFilterState(getResultsSectionFilterDefaultValue()));

          const defaultSort = isTaskingEnabled
            ? ResultsSectionSortProperties[1].value
            : ResultsSectionSortProperties[0].value;
          store.dispatch(resultsSectionSlice.actions.setSortState(defaultSort));
          store.dispatch(resultsSectionSlice.actions.setFiltersForSearch(searchRequestBody));
          store.dispatch(collapsiblePanelSlice.actions.setResultsExpanded(true));
          scrollToResults();
        }
      },
    });
  };

  return (
    <div className="rapid-response-desk">
      <div className="rapid-response-desk-body">
        <div ref={divErrorMessageRef}>
          <MessagePanel />
        </div>
        <ProjectDetailsSection />
        <AreaAndTimeSection />
        <ProviderSection />
        <AdvancedSection />
        {(resultsSection.results || requestInProgress) && (
          <div ref={divResultsRef}>
            <ResultsSection isSearchProcessing={requestInProgress} />
          </div>
        )}
      </div>
      {requestInProgress && <Loader className="rapid-response-desk-loader" />}

      <div className="rapid-response-desk-footer">
        <div className="wrapped-buttons">
          <Button
            outlined={true}
            label={t`View cart` + ` (${cartSize})`}
            styleClassName="uppercase-text"
            style={{ marginRight: '8px' }}
            labelStyle={{ fontSize: '13px' }}
            onClick={() => {
              const targetUrl = `${import.meta.env.VITE_RRD_DASHBOARD_BASE_URL}/shopping-cart/`;
              window.open(targetUrl, '_blank');
            }}
          ></Button>
          <Button
            outlined={true}
            label={t`Ordering system`}
            styleClassName="uppercase-text"
            labelStyle={{ fontSize: '13px' }}
            onClick={() => {
              const targetUrl = `${import.meta.env.VITE_RRD_DASHBOARD_BASE_URL}`;
              window.open(targetUrl, '_blank');
            }}
          ></Button>
        </div>
        <div className="search-button">
          <Button
            onClick={triggerSearchQuery}
            disabled={requestInProgress}
            type={ButtonType.success}
            label={t`Search`}
            styleClassName="uppercase-text"
            style={{ width: '126px' }}
            labelStyle={{ fontSize: '13px' }}
          ></Button>
        </div>
      </div>
    </div>
  );
};

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
  selectedTabIndex: store.tabs.selectedTabIndex,
  user: store.auth.user,
  aoi: store.aoi,
  mapBounds: store.mainMap.bounds,
  areaAndTimeSection: store.areaAndTimeSection,
  providerSection: store.imageQualityAndProviderSection,
  advancedSection: store.advancedSection,
  resultsSection: store.resultsSection,
  isTaskingEnabled: store.areaAndTimeSection.isTaskingEnabled,
  isArchiveEnabled: store.areaAndTimeSection.isArchiveEnabled,
});

export default connect(mapStoreToProps, null)(RapidResponseDesk);
