import { advancedSectionSlice } from './advancedSectionSlice';
import { imageQualityAndProviderSectionSlice } from './imageQualityAndProviderSectionSlice';
import { ProviderImageTypes } from '../../Tools/RapidResponseDesk/rapidResponseProperties';

const { setIncidenceAngle } = advancedSectionSlice.actions;
const { setImageType } = imageQualityAndProviderSectionSlice.actions;

describe('advancedSectionSlice reducer', () => {
  it('defaults the incidence angle to 0-50 (optical is the initial image type)', () => {
    expect(advancedSectionSlice.getInitialState().incidenceAngle).toEqual([0, 50]);
  });

  it('still lets the user set the incidence angle', () => {
    const state = advancedSectionSlice.reducer(
      advancedSectionSlice.getInitialState(),
      setIncidenceAngle([10, 70]),
    );
    expect(state.incidenceAngle).toEqual([10, 70]);
  });

  describe('reacting to imageQualityAndProviderSectionSlice.setImageType', () => {
    it('resets the incidence angle to 0-90 when switching to radar', () => {
      const state = advancedSectionSlice.reducer(
        advancedSectionSlice.getInitialState(),
        setImageType(ProviderImageTypes.radar),
      );
      expect(state.incidenceAngle).toEqual([0, 90]);
    });

    it('resets the incidence angle to 0-50 when switching back to optical', () => {
      const radarState = advancedSectionSlice.reducer(
        advancedSectionSlice.getInitialState(),
        setImageType(ProviderImageTypes.radar),
      );
      const state = advancedSectionSlice.reducer(radarState, setImageType(ProviderImageTypes.optical));
      expect(state.incidenceAngle).toEqual([0, 50]);
    });

    it.each([
      [ProviderImageTypes.optical, [0, 50]],
      [ProviderImageTypes.radar, [0, 90]],
    ])('overwrites a value the user set when switching to %s', (imageType, expected) => {
      const state = advancedSectionSlice.reducer(
        advancedSectionSlice.reducer(advancedSectionSlice.getInitialState(), setIncidenceAngle([20, 30])),
        setImageType(imageType),
      );
      expect(state.incidenceAngle).toEqual(expected);
    });

    it('leaves the incidence angle untouched when switching to atmos', () => {
      const state = advancedSectionSlice.reducer(
        advancedSectionSlice.reducer(advancedSectionSlice.getInitialState(), setIncidenceAngle([20, 30])),
        setImageType(ProviderImageTypes.atmos),
      );
      expect(state.incidenceAngle).toEqual([20, 30]);
    });
  });
});
