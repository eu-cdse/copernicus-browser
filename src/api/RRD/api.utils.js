import { getActiveAtmosProviders } from '../../Tools/RapidResponseDesk/sections/ImageQualityAndProviderSection/Atmos/Atmos.utils';
import { getActiveOpticalProviders } from '../../Tools/RapidResponseDesk/sections/ImageQualityAndProviderSection/Optical/Optical.utils';
import { getActiveRadarProviders } from '../../Tools/RapidResponseDesk/sections/ImageQualityAndProviderSection/Radar/Radar.utils';

export function getRrdCollectionId(constellation, platform, isTasking) {
  let id = -1;
  const opticalProvidersCollection = getActiveOpticalProviders();
  const radarProvidersCollection = getActiveRadarProviders();
  const atmosProvidersCollection = getActiveAtmosProviders();
  const modeKey = isTasking ? 'taskingSupported' : 'archiveSupported';

  opticalProvidersCollection.forEach((provider) => {
    provider.missions.forEach((mission) => {
      if (
        mission[modeKey] &&
        mission.stacConstellation.includes(constellation) &&
        mission.stacPlatform.find((p) => platform.startsWith(p))
      ) {
        id = mission.id;
      }
    });
  });

  radarProvidersCollection.forEach((provider) => {
    provider.missions.forEach((mission) => {
      if (
        mission[modeKey] &&
        mission.stacConstellation.includes(constellation) &&
        mission.stacPlatform.find((p) => platform.startsWith(p))
      ) {
        id = mission.id;
      }
    });
  });

  atmosProvidersCollection.forEach((provider) => {
    provider.missions.forEach((mission) => {
      if (
        mission[modeKey] &&
        mission.stacConstellation.includes(constellation) &&
        mission.stacPlatform.find((p) => platform.startsWith(p))
      ) {
        id = mission.id;
      }
    });
  });

  return id;
}
