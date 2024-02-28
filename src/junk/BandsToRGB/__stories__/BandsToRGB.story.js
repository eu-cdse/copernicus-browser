import React from 'react';
import { storiesOf } from '@storybook/react';
import { DndProvider } from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch';

import { BandsToRGB } from '../BandsToRGB';

import './BandsToRGB.story.scss';

const stories = storiesOf('BandsToRGB', module);

stories.add('BandsToRGB', () => {
  const bands = [
    {
      name: 'B01',
      description: 'Band 1 - Coastal aerosol - 443 nm ',
      color: '#6e66a2',
    },
    {
      name: 'B02',
      description: 'Band 2 - Blue - 490 nm ',
      color: '#3c75bc',
    },
    {
      name: 'B03',
      description: 'Band 3 - Green - 560 nm ',
      color: '#1a934e',
    },
    {
      name: 'B04',
      description: 'Band 4 - Red - 665 nm ',
      color: '#cc3f11',
    },
    {
      name: 'B05',
      description: 'Band 5 - Vegetation Red Edge - 705 nm',
      color: '#d07b80',
    },
    {
      name: 'B06',
      description: 'Band 6 - Vegetation Red Edge - 740 nm',
      color: '#c45c63',
    },
    {
      name: 'B07',
      description: 'Band 7 - Vegetation Red Edge - 783 nm',
      color: '#c6444e',
    },
    {
      name: 'B08',
      description: 'Band 8 - NIR - 842 nm',
      color: '#cd262e',
    },
    {
      name: 'B09',
      description: 'Band 9 - Water vapour - 945 nm',
      color: '#7b5e72',
    },
    {
      name: 'B10',
      description: 'Band 10 - SWIR - Cirrus - 1375 nm',
      color: '#754a66',
    },
    {
      name: 'B11',
      description: 'Band 11 - SWIR - 1610 nm',
      color: '#784065',
    },
    {
      name: 'B12',
      description: 'Band 12 - SWIR - 2190 nm',
      color: '#6e2050',
    },
    {
      name: 'B8A',
      description: 'Band 8A - Vegetation Red Edge - 865 nm',
      color: '#d50d18',
    },
  ];

  return (
    <DndProvider options={HTML5toTouch}>
      <div
        style={{
          backgroundColor: '#3B3D4D',
        }}
      >
        <BandsToRGB
          bands={bands}
          value={{ r: 'B01', g: 'B02', b: 'B03' }}
          onChange={(value) => console.log(value)}
        />
      </div>
    </DndProvider>
  );
});

stories.add('S-3 SLSTR', ({ state, setState }) => {
  const groupedBands = {
    radiance: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
    bt: ['S7', 'S8', 'S9', 'F1', 'F2'],
    meteo: [
      'CLOUD_FRACTION',
      'SEA_ICE_FRACTION',
      'SEA_SURFACE_TEMPERATURE',
      'DEW_POINT',
      'SKIN_TEMPERATURE',
      'SNOW_ALBEDO',
      'SNOW_DEPTH',
      'SOIL_WETNESS',
      'TEMPERATURE',
      'TOTAL_COLUMN_OZONE',
      'TOTAL_COLUMN_WATER_VAPOR',
    ],
  };
  const allBands = [].concat(Object.values(groupedBands)).flat();
  const bandsWithColors = allBands.map((b) => ({
    name: b,
    description: b,
    color: '#000000',
  }));

  const value = state.value || { r: 'S1', g: 'S2', b: 'S3' };
  return (
    <DndProvider options={HTML5toTouch}>
      <div
        style={{
          backgroundColor: '#3B3D4D',
        }}
      >
        <BandsToRGB bands={bandsWithColors} value={value} onChange={(v) => setState({ value: v })} />
      </div>
    </DndProvider>
  );
});
