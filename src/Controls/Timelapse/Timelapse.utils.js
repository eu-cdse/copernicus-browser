import moment from 'moment';
import L, { LatLngBounds } from 'leaflet';
import axios from 'axios';
import gifshot from 'gifshot';

import {
  fetchImage,
  getAppropriateApiType,
  constructBBoxFromBounds,
  getDimensionsInMeters,
  getMapDimensions,
} from '../ImgDownload/ImageDownload.utils';
import {
  getDataSourceHandler,
  checkIfCustom,
  getDatasetLabel,
} from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

import copernicus from '../../junk/EOBCommon/assets/cdse-logo.png';
import { convertToWgs84, wgs84ToMercator } from '../../junk/EOBCommon/utils/coords';
import { DATASOURCES, TRANSITION } from '../../const';
import planetUtils from '../../Tools/SearchPanel/dataSourceHandlers/planetNicfi.utils';
import { drawBlobOnCanvas } from '@sentinel-hub/sentinelhub-js';
import store, { timelapseSlice } from '../../store';

export const DEFAULT_IMAGE_DIMENSION = 512;

export function getTimelapseBounds(mapBounds, aoi) {
  if (aoi && aoi.bounds) {
    return aoi.bounds;
  }

  const rectMax = wgs84ToMercator(mapBounds.getNorthEast());
  const rectMin = wgs84ToMercator(mapBounds.getSouthWest());

  const center = {
    x: (rectMax.x + rectMin.x) / 2,
    y: (rectMax.y + rectMin.y) / 2,
  };
  const squareEdge = Math.min(rectMax.x - rectMin.x, rectMax.y - rectMin.y);

  const squareMax = {
    x: center.x + squareEdge / 2,
    y: center.y + squareEdge / 2,
  };
  const squareMin = {
    x: center.x - squareEdge / 2,
    y: center.y - squareEdge / 2,
  };

  const southWest = convertToWgs84([squareMin.x, squareMin.y]);
  const northEast = convertToWgs84([squareMax.x, squareMax.y]);

  return new LatLngBounds({ lat: southWest[1], lng: southWest[0] }, { lat: northEast[1], lng: northEast[0] });
}

export function determineDefaultImageSize(bounds, aoi) {
  const timelapseBounds = getTimelapseBounds(bounds, aoi);
  const dimenstions = getDimensionsInMeters(timelapseBounds);
  const ratio = dimenstions.width / dimenstions.height;
  const totalPixels = DEFAULT_IMAGE_DIMENSION * DEFAULT_IMAGE_DIMENSION;

  const height = Math.sqrt(totalPixels / ratio);
  const width = height * ratio;

  return {
    width: Math.round(width),
    height: Math.round(height),
    ratio,
  };
}

export function determineDefaultImageSize3D(pixelBounds) {
  const { width, height } = getMapDimensions(pixelBounds);
  const ratio = width / height;
  const totalPixels = DEFAULT_IMAGE_DIMENSION * DEFAULT_IMAGE_DIMENSION;

  const finalHeight = Math.sqrt(totalPixels / ratio);
  const finalWidth = finalHeight * ratio;

  return {
    width: Math.round(finalWidth),
    height: Math.round(finalHeight),
    ratio,
  };
}

export function getMinMaxDates(datasetId) {
  let minDate, maxDate;
  const dsh = getDataSourceHandler(datasetId);
  if (dsh) {
    ({ minDate, maxDate } = dsh.getMinMaxDates(datasetId));
  }
  minDate = minDate ? minDate : moment.utc('1970-01-01');
  maxDate = maxDate ? maxDate : moment.utc();
  return { minDate, maxDate };
}

export function getFlyoversToFetch(flyovers, period) {
  flyovers.forEach((f) => {
    f.fromTime = moment.utc(f.fromTime);
    f.toTime = moment.utc(f.toTime);
  });
  const flyoversByPeriod = createIntervalsFromFlyovers(flyovers, period);
  return findBestFlyoverPerInterval(flyoversByPeriod);
}

function createIntervalsFromFlyovers(flyovers, period) {
  if (period === 'orbit') {
    return flyovers.map((f) => [f]);
  }

  const intervalsForPeriod = [];
  let intervalIndex = 0;
  for (let flyoverIndex = 0; flyoverIndex < flyovers.length; flyoverIndex++) {
    if (flyoverIndex === 0) {
      intervalsForPeriod[intervalIndex] = [flyovers[flyoverIndex]];
      continue;
    }
    if (
      flyovers[flyoverIndex - 1].fromTime.isSame(flyovers[flyoverIndex].fromTime, period) ||
      flyovers[flyoverIndex - 1].toTime.isSame(flyovers[flyoverIndex].toTime, period) ||
      flyovers[flyoverIndex - 1].fromTime.isSame(flyovers[flyoverIndex].toTime, period) ||
      flyovers[flyoverIndex - 1].toTime.isSame(flyovers[flyoverIndex].fromTime, period)
    ) {
      intervalsForPeriod[intervalIndex].push(flyovers[flyoverIndex]);
    } else {
      intervalIndex++;
      intervalsForPeriod[intervalIndex] = [flyovers[flyoverIndex]];
    }
  }

  return intervalsForPeriod;
}

function findBestFlyoverPerInterval(flyovers) {
  const bestFlyovers = [];
  for (let period of flyovers) {
    period.sort(sortByBestCoverage);
    bestFlyovers.push(period[0]);
  }
  return bestFlyovers;
}

function sortByBestCoverage(a, b) {
  const aCoverage = a.coveragePercent !== undefined ? a.coveragePercent : 100;
  const bCoverage = b.coveragePercent !== undefined ? b.coveragePercent : 100;
  const aClearSkyCoverage =
    a.meta && a.meta.averageCloudCoverPercent !== undefined ? 100 - a.meta.averageCloudCoverPercent : 100;
  const bClearSkyCoverage =
    b.meta && b.meta.averageCloudCoverPercent !== undefined ? 100 - b.meta.averageCloudCoverPercent : 100;

  return bCoverage * bClearSkyCoverage - aCoverage * aClearSkyCoverage;
}

export async function fetchTimelapseImage(params) {
  const { layer, toTime, selectedPeriod, datasetId, width, height, showBorders, imageFormat, bounds } =
    params;

  const apiType = await getAppropriateApiType(layer, imageFormat);
  const options = {
    ...params,
    bounds,
    apiType,
  };

  let blob = await fetchImage(layer, options).catch((err) => {
    console.warn('Unable to fetch image', err);
    throw err;
  });

  if (showBorders) {
    const bbox = constructBBoxFromBounds(bounds);
    blob = await addOverlays(
      blob,
      [bbox.minX, bbox.minY, bbox.maxX, bbox.maxY],
      [timelapseBorders],
      width,
      height,
    );
  }

  const dsh = getDataSourceHandler(datasetId);

  const objectURL = URL.createObjectURL(blob);
  const objectURLWithLogos = await addLabelsAndLogos(
    dateTimeDisplayFormat(toTime, selectedPeriod),
    objectURL,
    width,
    height,
    L.CRS.EPSG3857.distance(
      L.latLng(bounds.getSouth(), bounds.getWest()),
      L.latLng(bounds.getSouth(), bounds.getEast()),
    ),
    dsh?.isCopernicus(),
    dsh?.isSentinelHub() || checkIfCustom(datasetId),
  );
  URL.revokeObjectURL(objectURL);

  return {
    url: objectURLWithLogos,
  };
}

export function dateTimeDisplayFormat(datetime, period) {
  return period === 'orbit'
    ? datetime.clone().format('YYYY-MM-DD HH:mm:ss')
    : datetime.clone().format('YYYY-MM-DD');
}

export function addLabelsAndLogos(
  dateToBeShown,
  objectUrl,
  width,
  height,
  imageWidthMeters,
  showCopernicusLogos = true,
) {
  const canvas = document.createElement('canvas');

  return new Promise((resolve, reject) => {
    const mainImg = new Image();
    const cpImg = new Image();
    cpImg.crossOrigin = '';
    mainImg.crossOrigin = '';
    canvas.width = width;
    canvas.height = height;
    mainImg.onload = () => {
      try {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(mainImg, 0, 0);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';

        const dateSize = ctx.measureText(dateToBeShown);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        const rightLeftPadding = 5;
        ctx.fillRect(
          canvas.width - dateSize.width - rightLeftPadding * 2,
          0,
          dateSize.width + rightLeftPadding * 4,
          parseInt(ctx.font, 10) + 10,
        );
        ctx.textAlign = 'left';
        ctx.fillStyle = '#eee';

        ctx.fillText(dateToBeShown, canvas.width - dateSize.width - rightLeftPadding, 16);
        //scale
        if (imageWidthMeters !== null) {
          const { widthPx, label } = scalebarPixelWidthAndDistance(imageWidthMeters / width);

          ctx.shadowColor = 'black';
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.strokeStyle = '#fff';
          ctx.fillStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.textAlign = 'center';
          ctx.beginPath();
          ctx.moveTo(10, 15);
          ctx.lineTo(10, 5);
          ctx.font = '11px Arial';
          ctx.lineTo(widthPx + 10, 5);
          ctx.lineTo(widthPx + 10, 15);
          ctx.stroke();
          ctx.textAlign = 'center';
          ctx.shadowColor = 'black';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.strokeStyle = '#767777';
          ctx.strokeText(label, widthPx / 2 + 10, 17);
          ctx.fillText(label, widthPx / 2 + 10, 17);
        }

        // logos
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        let startXpos = canvas.width;
        if (showCopernicusLogos) {
          //copernicus logo
          const cpImgResizeFactor = 0.8;
          const cpImgWidth = cpImg.width * cpImgResizeFactor;
          const cpImgHeight = cpImg.height * cpImgResizeFactor;
          const cpImgXpos = startXpos - cpImgWidth - 8;
          const cpImgYpos = canvas.height - cpImgHeight - 8;
          ctx.drawImage(cpImg, cpImgXpos, cpImgYpos, cpImgWidth, cpImgHeight);
        }

        const dataUrl = canvas.toDataURL('image/jpg', 0.9);
        URL.revokeObjectURL(mainImg.src);
        resolve(dataUrl);
      } catch (e) {
        reject('Error generating image');
      }
    };

    mainImg.onerror = (err) => {
      reject(err);
    };
    mainImg.src = objectUrl;
    cpImg.src = copernicus;
  });
}

export function scalebarPixelWidthAndDistance(metersPerPixel) {
  const proposedScaleBarWidth = 50;
  const roundedMeters = roundScalebarMeters(metersPerPixel * proposedScaleBarWidth);
  const meterOrKilo = getMorKm(roundedMeters);
  const width = roundedMeters / metersPerPixel;
  return {
    widthPx: width,
    label: meterOrKilo,
  };
}

function roundScalebarMeters(distance) {
  const ceilingFactor = getRoundingFactor(distance);
  return Math.round(distance / ceilingFactor) * ceilingFactor;
}

function getMorKm(distance) {
  const divided = distance / 1000;
  if (divided >= 1) {
    return `${divided} km`;
  } else {
    return `${distance} m`;
  }
}

function getRoundingFactor(imageWidthInMeters) {
  const fact = Math.round(Math.log10(imageWidthInMeters)); // 1876 -> log10(1000) = 3
  return Math.pow(10, fact) / 2; // 1000 / 2 = 500;
}

function timelapseBorders(width, height, bbox) {
  return {
    sortIndex: 1,
    url: `https://api.maptiler.com/maps/${import.meta.env.VITE_MAPTILER_MAP_ID_BORDERS}/static/${bbox[0]},${
      bbox[1]
    },${bbox[2]},${bbox[3]}/${width}x${height}.png?key=${
      import.meta.env.VITE_MAPTILER_KEY
    }&attribution=false&padding=0`,
    params: {},
  };
}

export const findDefaultActiveImageIndex = (
  images,
  canWeFilterByClouds,
  canWeFilterByCoverage,
  maxCCPercentAllowed,
  minCoverageAllowed,
) => {
  const index = images.findIndex((image) =>
    isImageApplicable(
      image,
      canWeFilterByClouds,
      canWeFilterByCoverage,
      maxCCPercentAllowed,
      minCoverageAllowed,
    ),
  );
  if (index < 0) {
    return null;
  }
  return index;
};

export const findNextActiveImageIndex = (
  images,
  canWeFilterByClouds,
  canWeFilterByCoverage,
  maxCCPercentAllowed,
  minCoverageAllowed,
  activeImageIndex,
) => {
  if (!images) {
    return null;
  }

  for (let i = 1; i <= images.length; i++) {
    const index = (activeImageIndex + i) % images.length;
    if (
      isImageApplicable(
        images[index],
        canWeFilterByClouds,
        canWeFilterByCoverage,
        maxCCPercentAllowed,
        minCoverageAllowed,
      )
    ) {
      return index;
    }
  }
};

export const isImageApplicable = (
  image,
  canWeFilterByClouds,
  canWeFilterByCoverage,
  maxCCPercentAllowed,
  minCoverageAllowed,
) => {
  return (
    isImageSelected(image) &&
    isImageClearEnough(image.averageCloudCoverPercent, canWeFilterByClouds, maxCCPercentAllowed) &&
    isImageCoverageEnough(image.coveragePercent, canWeFilterByCoverage, minCoverageAllowed)
  );
};

export const isImageSelected = (image) => image && image.isSelected;

export const isImageClearEnough = (averageCloudCoverPercent, canWeFilterByClouds, maxCCPercentAllowed) =>
  canWeFilterByClouds ? Math.round(averageCloudCoverPercent) <= maxCCPercentAllowed : true;

export const isImageCoverageEnough = (coveragePercent, canWeFilterByCoverage, minCoverageAllowed) =>
  canWeFilterByCoverage ? Math.round(coveragePercent) >= minCoverageAllowed : true;

export const generateS3PreSignedPost = async (access_token, filename) => {
  try {
    const url = `${import.meta.env.VITE_EOB_BACKEND}generatepresignedpost`;
    const requestParams = {
      responseType: 'json',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params: {
        filename,
      },
    };

    const res = await axios.get(url, requestParams);
    return res.data;
  } catch (err) {
    console.warn('Error generating presigned post', err);
    throw err;
  }
};

export const uploadFileToS3 = async (preSignedPost, file) => {
  try {
    const postData = new FormData();
    for (let key in preSignedPost.fields) {
      postData.append(key, preSignedPost.fields[key]);
    }
    postData.append('file', file);

    await axios.post(preSignedPost.url, postData);
  } catch (err) {
    console.warn('Error uploading file to S3', err);
    throw err;
  }
};

export const getS3FileUrl = (res) => {
  return res.url + (res.url.at(-1) === '/' ? '' : '/') + res.fields.key;
};

export const generateTimelapseWithGifshot = ({ imageUrls, datasetId, timelapseFPS, size, progress }) => {
  return new Promise((resolve, reject) => {
    progress(0);

    if (imageUrls.length === 0) {
      reject();
    }

    gifshot.createGIF(
      {
        images: imageUrls,
        gifWidth: size && size.width,
        gifHeight: size && size.height,
        interval: 1 / timelapseFPS,
        numWorkers: 4,
        progressCallback: (percent) => {
          progress(percent);
        },
      },
      (obj) => {
        if (obj.error) {
          reject();
        } else {
          progress(1);

          const file = new File([obj.image], generateTimelapseFilename(datasetId) + '.gif', {
            type: obj.image.type,
          });
          resolve(file);
        }
      },
    );
  });
};

export const generateTimelapseWithFFMPEG = ({
  imageUrls,
  datasetId,
  timelapseFPS,
  fadeDuration,
  transition,
  size,
  progress,
}) => {
  let isOutOfMemory = false;

  return new Promise((resolve, reject) => {
    progress(0);

    const worker = new Worker('ffmpeg.js/ffmpeg-worker-mp4.js');
    worker.onmessage = (e) => {
      const msg = e.data;
      switch (msg.type) {
        default:
          break;
        case 'ready':
          runFFmpegProcess();
          break;
        case 'stdout':
          console.log(msg.data);
          break;
        case 'stderr':
          console.log(msg.data);
          isOutOfMemory = isOutOfMemory || msg.data === 'OOM';
          updateProgress(msg.data, imageUrls.length);
          break;
        case 'done':
          console.log(msg.data);
          doneFFmpegProcess(msg);
          break;
      }
    };

    // ffmpeg requires even numbers for width and height
    const width = floorToEven(size.width);
    const height = floorToEven(size.height);

    const runFFmpegProcess = () => {
      worker.postMessage({
        type: 'run',
        MEMFS: imageUrls.map((url, index) => ({
          name: `img${`00${index}`.slice(-3)}.png`,
          data: convertDataURIToBinary(url),
        })),
        arguments:
          transition === TRANSITION.none ? ffmpegArgumentsTransitionNone() : ffmpegArgumentsTransitionFade(),
      });
    };

    const ffmpegArgumentsTransitionNone = () => {
      // https://superuser.com/questions/624567/how-to-create-a-video-from-images-using-ffmpeg
      return [
        '-r',
        timelapseFPS.toString(),
        '-i',
        'img%03d.png',
        '-vf',
        'crop=trunc(iw/2)*2:trunc(ih/2)*2',
        '-pix_fmt',
        'yuv420p',
        'out.mp4',
      ];
    };

    const ffmpegArgumentsTransitionFade = () => {
      // https://superuser.com/questions/833232/create-video-with-5-images-with-fadein-out-effect-in-ffmpeg/
      return [
        ...imageUrls.flatMap((url, index) => [
          '-loop',
          '1',
          '-t',
          (1 / timelapseFPS).toString(),
          '-i',
          `img${`00${index}`.slice(-3)}.png`,
        ]),
        ...(imageUrls.length > 1
          ? [
              '-filter_complex',
              [
                ...imageUrls.map((url, index) => `[${index}]crop=${width}:${height}[cropped${index}]`),
                ...imageUrls
                  .slice(0, -1)
                  .map(
                    (url, index) =>
                      `[cropped${index + 1}]fade=d=${
                        fadeDuration / timelapseFPS
                      }:t=in:alpha=1,setpts=PTS-STARTPTS+${(index + 1) / timelapseFPS}/TB[fade${index + 1}]`,
                  ),
                ...imageUrls
                  .slice(0, -1)
                  .map(
                    (url, index) =>
                      `[${index === 0 ? 'cropped0' : `slice${index}`}][fade${index + 1}]overlay[slice${
                        index + 1
                      }]`,
                  ),
              ].join(';'),
              '-map',
              `[slice${imageUrls.length - 1}]`,
            ]
          : []),
        '-pix_fmt',
        'yuv420p',
        'out.mp4',
      ];
    };

    const updateProgress = (data, totalImages) => {
      const parsedProgress = data.match(/frame=\s*(\d+)\sfps/);
      if (parsedProgress) {
        const outputFPS = transition === TRANSITION.none ? 1 : 25;
        const totalFrames = (totalImages * outputFPS) / timelapseFPS;
        progress(Math.min(parsedProgress[1] / totalFrames, 1));
      }
    };

    const doneFFmpegProcess = (msg) => {
      progress(1);

      if (!isOutOfMemory && msg.data?.MEMFS[0]?.data?.length > 0) {
        const file = new File([msg.data.MEMFS[0].data], generateTimelapseFilename(datasetId) + '.mp4', {
          type: 'video/mp4',
        });
        resolve(file);
      } else {
        reject();
      }
    };

    const convertDataURIToBinary = (dataURI) => {
      const base64 = dataURI.split(',')[1];
      const raw = window.atob(base64);

      const array = new Uint8Array(new ArrayBuffer(raw.length));
      for (let i = 0; i < raw.length; i++) {
        array[i] = raw.charCodeAt(i);
      }
      return array;
    };
  });
};

export const generateTimelapseFilename = (datasetId) => {
  const random = Math.round(Date.now() * Math.random() * 1000);
  const datasetLabel = getDatasetLabel(datasetId) || datasetId;
  return `${datasetLabel.replace(' ', '_')}-${random}-timelapse`;
};

const floorToEven = (value) => {
  return Math.floor(value / 2) * 2;
};

// call wms and return blob
async function getOverlayImageBlob(width, height, bbox, overlayLayer) {
  const layerParams = overlayLayer(width, height, bbox);
  const res = await axios.get(layerParams.url, {
    responseType: 'blob',
    params: layerParams.params,
  });
  return new Blob([res.data], { type: 'image/jpeg' });
}

const maxSupportedDimension = 2048;

const getMaxSupportedDimension = (size) => {
  return size ? (size < maxSupportedDimension ? size : maxSupportedDimension) : maxSupportedDimension;
};

// draw all layers defined in overlayLayers over original image imgBlob
async function addOverlays(imgBlob, bbox, overlayLayers, timelapseWidth, timelapseHeight) {
  try {
    //draw original image on canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = timelapseWidth;
    canvas.height = timelapseHeight;
    await drawBlobOnCanvas(context, imgBlob);

    //get overlay images
    const overlayImages = [];
    await Promise.all(
      overlayLayers.map(async (overlayLayer) => {
        const overlayImageBlob = await getOverlayImageBlob(
          getMaxSupportedDimension(canvas.width),
          getMaxSupportedDimension(canvas.height),
          bbox,
          overlayLayer,
        );
        overlayImages.push({
          idx: overlayLayer.idx,
          imgBlob: overlayImageBlob,
        });
      }),
    );

    //sort images and draw them on canvas
    await Promise.all(
      overlayImages
        .sort((a, b) => a.sortIndex - b.sortIndex)
        .map(
          async (image) => await drawBlobOnCanvas(context, image.imgBlob, 0, 0, canvas.width, canvas.height),
        ),
    );

    //export canvas back to blob
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });

    return blob;
  } catch (e) {
    //if something goes wrong just return original image
    console.error(e);
    return imgBlob;
  }
}

// We need to get get a new layer for each flyover if the datasource is PLANET NICFI as we cant change the date per PLANET NICFI layer
export const getFlyOverVisualization = async (visualization, flyover) => {
  const dsh = getDataSourceHandler(visualization.datasetId);
  const isPlanetNicfi = dsh && dsh.datasource === DATASOURCES.PLANET_NICFI;
  return {
    ...visualization,
    ...(isPlanetNicfi && {
      layer: await planetUtils.getSameLayerWithDifferentDate(visualization.layer.layerId, flyover.fromTime),
    }),
  };
};

export const resetNewLayersCount = ({ newLayersCount }) => {
  if (newLayersCount) {
    store.dispatch(timelapseSlice.actions.setNewLayersCount(0));
  }
};
