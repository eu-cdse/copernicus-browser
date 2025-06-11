import React from 'react';
import './ProvidersAndMissions.scss';
import { connect } from 'react-redux';
import { t } from 'ttag';
import CustomCheckbox from '../../../../../components/CustomCheckbox/CustomCheckbox';
import CollectionTooltip from '../../../../VisualizationPanel/CollectionSelection/CollectionTooltip/CollectionTooltip';

const ProvidersAndMission = ({
  providersAndMissions,
  storeProvidersAndMissions,
  providersCollection,
  isTaskingEnabled,
  isArchiveEnabled,
}) => {
  const updateProviderCheckboxValue = (selectedProvider) => {
    const currentProvider = providersAndMissions.find((provider) => provider.id === selectedProvider.id);
    let newArray = isTaskingEnabled ? [] : [...providersAndMissions];
    if (currentProvider) {
      newArray = newArray.filter((provider) => provider.id !== currentProvider.id);
    } else {
      let { missions, ...trimmedProvider } = selectedProvider;

      const filteredMissions = missions?.filter((mission) =>
        isTaskingEnabled ? mission.taskingSupported : mission.archiveSupported,
      );

      if (filteredMissions?.length === 1) {
        trimmedProvider = { ...trimmedProvider, missions: [{ ...filteredMissions[0] }] };
      }

      newArray.push(trimmedProvider);
    }

    storeProvidersAndMissions(newArray);
  };

  const updateMissionCheckboxValue = (selectedProvider, selectedMission) => {
    if (isTaskingEnabled) {
      const trimmedProvider = {
        ...selectedProvider,
        missions: [{ ...selectedMission }],
      };
      storeProvidersAndMissions([trimmedProvider]);
      return;
    }

    const provider = providersAndMissions.find((provider) => provider.id === selectedProvider.id);
    const currentMissions = provider?.missions?.find((mission) => mission.id === selectedMission.id);

    let newArray = provider?.missions ? [...provider?.missions] : [];
    if (currentMissions) {
      newArray = newArray.filter((mission) => mission.id !== selectedMission.id);
    } else {
      newArray.push({ ...selectedMission });
      newArray.forEach((mission) => delete mission.description);
    }

    const newProvider = { ...provider, missions: newArray };
    const providers = [...providersAndMissions].filter((provider) => provider.id !== selectedProvider.id);
    providers.push(newProvider);

    storeProvidersAndMissions(providers);
  };

  const isProviderSelected = (provider) => {
    return providersAndMissions.some((currentProvider) => currentProvider.id === provider.id);
  };

  const isMissionSelected = (selectedProvider, mission) => {
    const provider = providersAndMissions.find((provider) => provider.id === selectedProvider.id);

    if (provider.missions) {
      return provider.missions.some((currentMission) => currentMission.id === mission.id);
    } else {
      return false;
    }
  };

  const hasAnyVisibleMissionsUnderCurrentFilterConditions = (provider) => {
    return provider.missions.some((mission) => isMissionAvailableUnderCurrentFilterConditions(mission));
  };

  const isMissionAvailableUnderCurrentFilterConditions = (mission) => {
    return (mission.taskingSupported && isTaskingEnabled) || (mission.archiveSupported && isArchiveEnabled);
  };

  return (
    <div className="providers-and-missions-container">
      <div className="data-source-advanced-wrapper">
        <div className="data-source-advanced-title-wrapper">
          <div className="data-source-advanced-title">{t`Data providers and missions`}:</div>
          <div className="data-source-advanced-title-subtitle">({t`Required`})*</div>
        </div>
        {isTaskingEnabled && (
          <CollectionTooltip
            title={'Single Collection Selection for Tasking'}
            source={
              'For Tasking orders, only one provider can be selected at a time. This limitation ensures efficient and accurate tasking requests. Please choose a single collection before proceeding.'
            }
          />
        )}
      </div>
      <div className="checkbox-providers-missions">
        {providersCollection.map(
          (provider) =>
            hasAnyVisibleMissionsUnderCurrentFilterConditions(provider) && (
              <div className="provider-content" key={`${provider.id}`}>
                <div className="provider">
                  <CustomCheckbox
                    onChange={() => updateProviderCheckboxValue(provider)}
                    checked={isProviderSelected(provider)}
                    label={provider.label}
                  />
                </div>
                {isProviderSelected(provider) && (
                  <div className="checkbox-missions">
                    {provider.missions.map(
                      (mission) =>
                        isMissionAvailableUnderCurrentFilterConditions(mission) && (
                          <div key={`${mission.id}`} className="mission">
                            <CustomCheckbox
                              onChange={() => updateMissionCheckboxValue(provider, mission)}
                              checked={isMissionSelected(provider, mission)}
                              label={mission.label}
                            />
                            <CollectionTooltip title={mission.label} source={mission.description.body} />
                          </div>
                        ),
                    )}
                  </div>
                )}
              </div>
            ),
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
  isTaskingEnabled: store.areaAndTimeSection.isTaskingEnabled,
  isArchiveEnabled: store.areaAndTimeSection.isArchiveEnabled,
});

export default connect(mapStoreToProps, null)(ProvidersAndMission);
