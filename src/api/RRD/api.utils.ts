import { getActiveAtmosProviders } from '../../Tools/RapidResponseDesk/sections/ImageQualityAndProviderSection/Atmos/Atmos.utils';
import { getActiveOpticalProviders } from '../../Tools/RapidResponseDesk/sections/ImageQualityAndProviderSection/Optical/Optical.utils';
import { getActiveRadarProviders } from '../../Tools/RapidResponseDesk/sections/ImageQualityAndProviderSection/Radar/Radar.utils';

export type Mission = {
  id: number;
  name: string;
  label: string;
  stacConstellation: string[];
  stacPlatform: string[];
  taskingSupported: boolean;
  archiveSupported: boolean;
  description: { body: string; footer: string };
  logo: string;
  taskName?: string;
  instruments?: string[];
  propertyType?: string[];
};

export function getAllMissions(): Mission[] {
  const allProviders = [
    ...getActiveOpticalProviders(),
    ...getActiveRadarProviders(),
    ...getActiveAtmosProviders(),
  ];
  return allProviders.flatMap((provider: { missions: Mission[] }) => provider.missions);
}

export function getRrdCollectionId(constellation: string, platform: string, isTasking: boolean): number {
  const modeKey = isTasking ? 'taskingSupported' : 'archiveSupported';
  const match = getAllMissions()
    .filter(
      (m) =>
        m[modeKey] &&
        m.stacConstellation.includes(constellation) &&
        m.stacPlatform.find((p) => platform.startsWith(p)),
    )
    .at(-1);
  return match ? match.id : -1;
}
