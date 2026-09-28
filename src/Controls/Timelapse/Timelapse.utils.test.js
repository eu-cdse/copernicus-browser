import { LatLngBounds } from 'leaflet';
import moment from 'moment';
import {
  addLabelsAndLogos,
  getFlyoversToFetch,
  getMinMaxDates,
  getTimelapseBounds,
  isImageApplicable,
  isImageClearEnough,
  isImageCoverageEnough,
} from './Timelapse.utils';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { drawLegendImage, loadLegendImageSafely } from '../ImgDownload/ImageDownload.utils';

jest.mock('../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers', () => ({
  getDataSourceHandler: jest.fn(),
}));

jest.mock('../ImgDownload/ImageDownload.utils', () => ({
  ...jest.requireActual('../ImgDownload/ImageDownload.utils'),
  drawLegendImage: jest.fn(),
  loadLegendImageSafely: jest.fn(),
}));

describe('getTimelapseBounds', () => {
  const rectangularBounds = new LatLngBounds(
    { lat: 46.11441972281433, lng: 14.609413146972656 },
    { lat: 45.9647540591795, lng: 14.377498626708986 },
  );

  const squareBounds = new LatLngBounds(
    { lat: 45.9647540591795, lng: 14.385652542114277 },
    { lat: 46.114419722814326, lng: 14.601259231567363 },
  );

  const aoi = {
    bounds: rectangularBounds,
  };

  it('should return a center square bbox when bounds are passed', () => {
    expect(getTimelapseBounds(rectangularBounds)).toEqual(squareBounds);
  });

  it('should return aoi bounds when aoi bounds are passed', () => {
    expect(getTimelapseBounds(rectangularBounds, aoi)).toEqual(rectangularBounds);
  });
});

describe('getMinMaxDates', () => {
  it('should return min and max dates', () => {
    getDataSourceHandler.mockReturnValue({
      getMinMaxDates: jest.fn(() => ({
        minDate: moment.utc('2020-01-01'),
        maxDate: moment.utc('2020-01-02'),
      })),
    });

    expect(getMinMaxDates()).toEqual({
      minDate: moment.utc('2020-01-01'),
      maxDate: moment.utc('2020-01-02'),
    });
  });

  it('should return default min and max date', () => {
    getDataSourceHandler.mockReturnValue({
      getMinMaxDates: jest.fn(() => ({
        maxDate: moment.utc('2020-01-02'),
      })),
    });

    expect(getMinMaxDates()).toEqual({
      minDate: moment.utc('1970-01-01'),
      maxDate: moment.utc('2020-01-02'),
    });
  });
});

describe('getFlyoversToFetch', () => {
  const flyovers = [
    {
      coveragePercent: 100,
      fromTime: moment.utc('2021-11-25').startOf('day'),
      toTime: moment.utc('2021-11-25').endOf('day'),
      meta: {
        averageCloudCoverPercent: 55,
      },
    },
    {
      coveragePercent: 40,
      fromTime: moment.utc('2021-11-26').startOf('day'),
      toTime: moment.utc('2021-11-26').endOf('day'),
      meta: {
        averageCloudCoverPercent: 90,
      },
    },
    {
      coveragePercent: 99,
      fromTime: moment.utc('2021-12-15').startOf('day'),
      toTime: moment.utc('2021-12-15').endOf('day'),
      meta: {
        averageCloudCoverPercent: 15,
      },
    },
    {
      coveragePercent: 99,
      fromTime: moment.utc('2021-12-23').startOf('day'),
      toTime: moment.utc('2021-12-23').endOf('day'),
      meta: {
        averageCloudCoverPercent: 15,
      },
    },
    {
      coveragePercent: 50,
      fromTime: moment.utc('2021-12-23').startOf('day'),
      toTime: moment.utc('2021-12-23').endOf('day'),
      meta: {
        averageCloudCoverPercent: 99,
      },
    },
    {
      coveragePercent: 90,
      fromTime: moment.utc('2022-01-06').startOf('day'),
      toTime: moment.utc('2022-01-06').endOf('day'),
      meta: {
        averageCloudCoverPercent: 20,
      },
    },
    {
      coveragePercent: 50,
      fromTime: moment.utc('2022-02-07').startOf('day'),
      toTime: moment.utc('2022-02-07').endOf('day'),
      meta: {
        averageCloudCoverPercent: 100,
      },
    },
  ];

  it('should return all flyovers by orbit', () => {
    const flyoversToFetch = getFlyoversToFetch(flyovers, 'orbit');

    expect(flyoversToFetch.length).toEqual(7);
  });

  it('should return best flyover by day', () => {
    const flyoversToFetch = getFlyoversToFetch(flyovers, 'day');

    expect(flyoversToFetch.length).toEqual(6);
  });

  it('should return best flyover by week', () => {
    const flyoversToFetch = getFlyoversToFetch(flyovers, 'week');

    expect(flyoversToFetch.length).toEqual(5);
  });

  it('should return best flyover by month', () => {
    const flyoversToFetch = getFlyoversToFetch(flyovers, 'month');

    expect(flyoversToFetch.length).toEqual(4);
  });

  it('should return best flyover by year', () => {
    const flyoversToFetch = getFlyoversToFetch(flyovers, 'year');

    expect(flyoversToFetch.length).toEqual(2);
    expect(flyoversToFetch[0].coveragePercent).toEqual(99);
    expect(flyoversToFetch[0].meta.averageCloudCoverPercent).toEqual(15);
    expect(flyoversToFetch[1].coveragePercent).toEqual(90);
    expect(flyoversToFetch[1].meta.averageCloudCoverPercent).toEqual(20);
  });
});

describe('isImageApplicable', () => {
  it('should be applicable when is selected', () => {
    const image = {
      isSelected: true,
      averageCloudCoverPercent: 10,
      coveragePercent: 100,
    };
    expect(isImageApplicable(image, true, true, 50, 80)).toBe(true);

    image.averageCloudCoverPercent = 50;
    expect(isImageApplicable(image, true, true, 50, 80)).toBe(true);

    image.coveragePercent = 75;
    expect(isImageApplicable(image, true, true, 50, 80)).toBe(false);

    image.isSelected = false;
    expect(isImageApplicable(image, true, true, 50, 80)).toBe(false);
  });
});

describe('isImageCoverageEnough', () => {
  it('should be applicable when coverage is high enough', () => {
    // we are rounding `coveragePercent` to whole number before doing the comparison so that it's consistent with display that's also rounded
    const image = {
      isSelected: true,
      averageCloudCoverPercent: 10,
      coveragePercent: 100,
    };
    expect(isImageCoverageEnough(image.coveragePercent, true, 80)).toBe(true);

    image.coveragePercent = 70;
    expect(isImageCoverageEnough(image.coveragePercent, true, 80)).toBe(false);

    image.coveragePercent = 79.4; // round to 79
    expect(isImageCoverageEnough(image.coveragePercent, true, 80)).toBe(false);

    image.coveragePercent = 79.5; // round to 80
    expect(isImageCoverageEnough(image.coveragePercent, true, 80)).toBe(true);

    image.coveragePercent = 80;
    expect(isImageCoverageEnough(image.coveragePercent, true, 80)).toBe(true);

    image.coveragePercent = 80.5; // round to 81
    expect(isImageCoverageEnough(image.coveragePercent, true, 80)).toBe(true);
  });
});

describe('isImageClearEnough', () => {
  it('should be applicable when cloud coverage is low enough', () => {
    // we are rounding `averageCloudCoverPercent` to whole number before doing the comparison so that it's consistent with display that's also rounded
    const image = {
      isSelected: true,
      averageCloudCoverPercent: 10,
      coveragePercent: 100,
    };
    expect(isImageClearEnough(image.averageCloudCoverPercent, true, 50)).toBe(true);

    image.averageCloudCoverPercent = 70;
    expect(isImageClearEnough(image.averageCloudCoverPercent, true, 50)).toBe(false);

    image.averageCloudCoverPercent = 50.5; // round to 51
    expect(isImageClearEnough(image.averageCloudCoverPercent, true, 50)).toBe(false);

    image.averageCloudCoverPercent = 50.4; // round to 50
    expect(isImageClearEnough(image.averageCloudCoverPercent, true, 50)).toBe(true);

    image.averageCloudCoverPercent = 50;
    expect(isImageClearEnough(image.averageCloudCoverPercent, true, 50)).toBe(true);

    image.averageCloudCoverPercent = 49.5; // round to 50
    expect(isImageClearEnough(image.averageCloudCoverPercent, true, 50)).toBe(true);
  });
});

describe('addLabelsAndLogos - legend', () => {
  let OriginalImage;

  beforeEach(() => {
    // jest-canvas-mock provides canvas.getContext/toDataURL; URL.createObjectURL is
    // mocked globally in setupTests.js but revokeObjectURL (called from the mainImg
    // onload handler) is not, so it needs to be defined here.
    global.URL.revokeObjectURL = jest.fn();

    // Intercept `new Image()` so that setting `src` immediately (but asynchronously,
    // like a real image load would be) fires `onload`, without a real network request.
    // Returning a real `<img>` element (rather than a plain object) keeps it a valid
    // CanvasImageSource for `ctx.drawImage(mainImg, ...)`.
    OriginalImage = global.Image;
    global.Image = function MockImageConstructor() {
      const el = document.createElement('img');
      Object.defineProperty(el, 'src', {
        set(_value) {
          setTimeout(() => {
            if (el.onload) {
              el.onload();
            }
          }, 0);
        },
        get() {
          return '';
        },
        configurable: true,
      });
      return el;
    };
  });

  afterEach(() => {
    global.Image = OriginalImage;
    loadLegendImageSafely.mockReset();
    drawLegendImage.mockReset();
  });

  // showCopernicusLogos is passed as `false` throughout so these tests only exercise
  // the legend-loading/drawing behaviour, independent of the (module-level cached)
  // Copernicus logo loading.
  const callAddLabelsAndLogos = ({ showLegend = false, legendDefinition, legendUrl } = {}) =>
    addLabelsAndLogos(
      '2024-01-01',
      'blob:mock-object-url',
      100,
      100,
      1000,
      false,
      showLegend,
      legendDefinition,
      legendUrl,
    );

  it('loads the legend via loadLegendImageSafely and draws it when showLegend is true', async () => {
    const legendDefinition = { items: [{ color: '#fff', label: 'a' }] };
    const legendUrl = 'https://example.com/legend.png';
    const fakeLegendImg = { width: 10, height: 10 };
    loadLegendImageSafely.mockResolvedValue(fakeLegendImg);

    await callAddLabelsAndLogos({ showLegend: true, legendDefinition, legendUrl });

    expect(loadLegendImageSafely).toHaveBeenCalledWith(legendDefinition, legendUrl, '[Timelapse]');
    expect(drawLegendImage).toHaveBeenCalledWith(expect.anything(), fakeLegendImg, true, false);
  });

  it('does not load or draw a legend when showLegend is false', async () => {
    await callAddLabelsAndLogos({ showLegend: false });

    expect(loadLegendImageSafely).not.toHaveBeenCalled();
    expect(drawLegendImage).not.toHaveBeenCalled();
  });

  it('does not draw a legend, but still resolves with the rendered image, when loadLegendImageSafely resolves to null', async () => {
    const legendUrl = 'https://example.com/legend.png';
    loadLegendImageSafely.mockResolvedValue(null);

    const dataUrl = await callAddLabelsAndLogos({ showLegend: true, legendUrl });

    expect(drawLegendImage).not.toHaveBeenCalled();
    expect(dataUrl).toEqual(expect.stringContaining('data:image'));
  });
});
