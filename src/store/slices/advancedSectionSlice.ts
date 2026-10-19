import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  DEFAULT_INCIDENCE_ANGLE_BY_IMAGE_TYPE,
  ProviderImageTypes,
} from '../../Tools/RapidResponseDesk/rapidResponseProperties';
import { imageQualityAndProviderSectionSlice } from './imageQualityAndProviderSectionSlice';

export interface AdvancedSectionState {
  aoiCoverage: number;
  azimuth: [number, number];
  sunAzimuth: [number, number];
  sunElevation: [number, number];
  incidenceAngle: [number, number];
}

const initialState: AdvancedSectionState = {
  aoiCoverage: 1,
  azimuth: [0, 360],
  sunAzimuth: [0, 360],
  sunElevation: [0, 90],
  incidenceAngle: [...DEFAULT_INCIDENCE_ANGLE_BY_IMAGE_TYPE[ProviderImageTypes.optical]] as [number, number],
};

export const advancedSectionSlice = createSlice({
  name: 'advancedSection',
  initialState,
  reducers: {
    setAoiCoverage: (state, action: PayloadAction<number>) => {
      state.aoiCoverage = action.payload;
    },
    setAzimuth: (state, action: PayloadAction<[number, number]>) => {
      state.azimuth = action.payload;
    },
    setSunAzimuth: (state, action: PayloadAction<[number, number]>) => {
      state.sunAzimuth = action.payload;
    },
    setSunElevation: (state, action: PayloadAction<[number, number]>) => {
      state.sunElevation = action.payload;
    },
    setIncidenceAngle: (state, action: PayloadAction<[number, number]>) => {
      state.incidenceAngle = action.payload;
    },
  },
  // Optical and radar share a single incidenceAngle value, so it has to be reset to the default of
  // the newly selected image type from one place shared by every caller of setImageType, rather
  // than duplicated at each handler. Image types without a default (atmos) leave it untouched.
  extraReducers: (builder) => {
    builder.addCase(imageQualityAndProviderSectionSlice.actions.setImageType, (state, action) => {
      const defaultIncidenceAngle = DEFAULT_INCIDENCE_ANGLE_BY_IMAGE_TYPE[action.payload];
      if (defaultIncidenceAngle) {
        state.incidenceAngle = [...defaultIncidenceAngle] as [number, number];
      }
    });
  },
});
