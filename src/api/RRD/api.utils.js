import { getActiveOpticalProviders } from '../../Tools/RapidResponseDesk/sections/ImageQualityAndProviderSection/Optical/Optical.utils';
import { getActiveRadarProviders } from '../../Tools/RapidResponseDesk/sections/ImageQualityAndProviderSection/Radar/Radar.utils';

export function getRrdCollectionId(constellation, platform, isTasking) {
  let id = -1;
  const opticalProvidersCollection = getActiveOpticalProviders();
  const radarProvidersCollection = getActiveRadarProviders();
  const modeKey = isTasking ? 'taskingSupported' : 'archiveSupported';

  opticalProvidersCollection.forEach((provider) => {
    provider.missions.forEach((mission) => {
      if (
        mission[modeKey] &&
        mission.stacConstellation.includes(constellation) &&
        mission.stacPlatform.includes(platform)
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
        mission.stacPlatform.includes(platform)
      ) {
        id = mission.id;
      }
    });
  });

  return id;
}
