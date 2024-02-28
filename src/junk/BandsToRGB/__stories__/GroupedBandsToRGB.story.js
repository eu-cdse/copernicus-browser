import React from 'react';
import { storiesOf } from '@storybook/react';
import { DndProvider } from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch';

import { GroupedBandsToRGB } from '../GroupedBandsToRGB';

import './BandsToRGB.story.scss';

const stories = storiesOf('BandsToRGB', module);

stories.add('S-3 SLSTR grouped', ({ state, setState }) => {
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
  const groups = Object.keys(groupedBands);

  const groupedBandsWithColors = {};
  groups.forEach((g) => {
    groupedBandsWithColors[g] = groupedBands[g].map((b) => ({
      name: b,
      description: b,
      color: '#000000',
    }));
  });

  const value = state.value || { r: 'S7', g: 'S8', b: 'F2' };
  return (
    <DndProvider options={HTML5toTouch}>
      <div
        style={{
          backgroundColor: '#3B3D4D',
        }}
      >
        <GroupedBandsToRGB
          groupedBands={groupedBandsWithColors}
          value={value}
          onChange={(v) => setState({ value: v })}
        />
      </div>
    </DndProvider>
  );
});

stories.add('S-3 SLSTR grouped, with an empty group', ({ state, setState }) => {
  const groupedBands = {
    radiance: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
    bt: ['S7', 'S8', 'S9', 'F1', 'F2'],
    meteo: [],
  };
  const groups = Object.keys(groupedBands);

  const groupedBandsWithColors = {};
  groups.forEach((g) => {
    groupedBandsWithColors[g] = groupedBands[g].map((b) => ({
      name: b,
      description: b,
      color: '#000000',
    }));
  });

  const value = state.value || { r: 'S1', g: 'S3', b: 'S5' };
  return (
    <DndProvider options={HTML5toTouch}>
      <div
        style={{
          backgroundColor: '#3B3D4D',
        }}
      >
        <GroupedBandsToRGB
          groupedBands={groupedBandsWithColors}
          value={value}
          onChange={(v) => setState({ value: v })}
        />
      </div>
    </DndProvider>
  );
});

stories.add('S-3 SLSTR grouped, with invalid (cross-group) initial value', ({ state, setState }) => {
  const groupedBands = {
    radiance: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
    bt: ['F1', 'F2'],
    meteo: [],
  };
  const groups = Object.keys(groupedBands);

  const groupedBandsWithColors = {};
  groups.forEach((g) => {
    groupedBandsWithColors[g] = groupedBands[g].map((b) => ({
      name: b,
      description: b,
      color: '#000000',
    }));
  });

  const value = state.value || { r: 'F1', g: 'S3', b: 'S5' };
  return (
    <DndProvider options={HTML5toTouch}>
      <div
        style={{
          backgroundColor: '#3B3D4D',
        }}
      >
        <GroupedBandsToRGB
          groupedBands={groupedBandsWithColors}
          value={value}
          onChange={(v) => setState({ value: v })}
        />
      </div>
    </DndProvider>
  );
});
