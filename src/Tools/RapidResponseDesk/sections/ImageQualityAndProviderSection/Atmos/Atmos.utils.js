import { GHGSatLogo } from '../logos';

const atmosProvidersCollection = [
  {
    id: 'GHGSat',
    label: 'GHGSat',
    missions: [
      {
        id: 19,
        name: 'GHGSat',
        stacConstellation: ['GHGSat'],
        stacPlatform: ['GHGSat-C'],
        label: 'GHGSat Constellation',
        taskingSupported: false,
        archiveSupported: true,
        description: {
          body: 'GHGSat satellites overall mission objective is provide actionable information to operators, regulators, and other stakeholders interested in understanding, controlling, and ultimately reducing facility-level emissions of greenhouse gases.',
          footer: '',
        },
        logo: GHGSatLogo,
      },
    ],
    active: true,
  },
];

export const getActiveAtmosProviders = () => {
  return atmosProvidersCollection.filter((provider) => provider.active);
};
