import FileSaver from 'file-saver';
import moment from 'moment';
import { legacyGetMapFromParams } from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';

import copernicus from '../../EOBCommon/assets/cdse-logo.png';
import { getMapDOMSize } from '../../EOBCommon/utils/coords';
import { IMAGE_FORMATS } from './IMAGE_FORMATS';
import {
  getInstantsFromTimeInterval,
  isTimeSpecifiedInDate,
  formatTimeInterval,
} from '../../EOBCommon/utils/timespanHelpers';
import { getMapDataFusion } from '../../EOBCommon/utils/dataFusion';

export const CUSTOM_LAYER_LABEL = 'Custom script';

const FONT_FAMILY = 'Helvetica, Arial, sans-serif';
const FONT_BASE = 960;
const PARTITION_PADDING = 5;
const FONT_SIZES = {
  normal: { base: 6.5016, min: 11 },
  copyright: { base: 5, min: 9 },
};

const SCALEBAR_LEFT_PADDING = 10;

function getWrappedLines(ctx, text, maxWidth) {
  let lines = [];
  let line = '';
  let lineTest = '';
  let words = text.split(' ');
  for (let word of words) {
    lineTest = line + word + ' ';

    if (ctx.measureText(lineTest).width > maxWidth) {
      lines.push(line);
      line = word + ' ';
    } else {
      line = lineTest;
    }
  }

  if (line.length > 0) {
    lines.push(line.trim());
  }

  return lines;
}

function getFontSize(width, font) {
  // y = 0.0048x + 6.5016
  const size = Math.max((4.4 / FONT_BASE) * width + FONT_SIZES[font].base, FONT_SIZES[font].min);
  return size;
}

function getFont(width, { font, bold }) {
  const size = getFontSize(width, font);
  return ` ${bold ? 'Bold' : ''} ${Math.round(size)}px  ${FONT_FAMILY}`;
}

function getTextWidth(ctx, text, font) {
  ctx.font = font;
  const widthObj = ctx.measureText(text);
  return widthObj.width;
}

export const drawCaptions = async (ctx, userDescription, title, copyrightText, scaleBar, logos = true) => {
  const scalebarPartitionWidth = scaleBar
    ? Math.max(getScalebarWidth(ctx, scaleBar), ctx.canvas.width * 0.33)
    : ctx.canvas.width * 0.33;
  const copyrightPartitionWidth = (ctx.canvas.width - scalebarPartitionWidth) * 0.6 - PARTITION_PADDING;
  const logosPartitionWidth = (ctx.canvas.width - scalebarPartitionWidth) * 0.4 - PARTITION_PADDING;
  const bottomYAxis = getLowerYAxis(ctx);
  const copyrightPartitionXCoords = scalebarPartitionWidth + PARTITION_PADDING;

  if (title || userDescription) {
    const TOP_RECT_SIZE = { width: ctx.canvas.width, height: ctx.canvas.height * 0.04 };
    drawTextBoxBackground(ctx, TOP_RECT_SIZE.width, TOP_RECT_SIZE.height);
    drawDescription(ctx, TOP_RECT_SIZE.width, TOP_RECT_SIZE.height, title, userDescription);
  }
  if (scaleBar) {
    drawScalebar(ctx, scaleBar);
  }
  if (logos) {
    await drawLogos(ctx, logosPartitionWidth, bottomYAxis);
  }
  if (copyrightText) {
    drawCopyrightText(ctx, copyrightText, copyrightPartitionXCoords, copyrightPartitionWidth, bottomYAxis);
  }
};

function drawDescription(ctx, containerWidth, containerHeight, title, userDescription) {
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const normalFont = getFont(ctx.canvas.width, { font: 'normal', bold: false });
  const userDescriptionFont = getFont(ctx.canvas.width, { font: 'normal', bold: true });
  const titleWidth = title !== null ? getTextWidth(ctx, title, normalFont) : 0;
  const userDescriptionWidth =
    userDescription !== null ? getTextWidth(ctx, userDescription, userDescriptionFont) : 0;
  const totalTextWidth = titleWidth + userDescriptionWidth;
  const x = containerWidth / 2 - totalTextWidth / 2;
  const y = containerHeight / 2;

  if (userDescription !== null) {
    ctx.font = userDescriptionFont;
    ctx.fillText(userDescription, x, y);
  }
  if (title !== null) {
    ctx.font = normalFont;
    ctx.fillText(title, x + userDescriptionWidth, y);
  }
}

function getLowerYAxis(ctx) {
  return ctx.canvas.height * 0.99;
}

function getScalebarWidth(ctx, scaleBar) {
  const mapDOMSize = getMapDOMSize();
  const width = (scaleBar.width * ctx.canvas.width) / mapDOMSize.width;
  const textWidth = ctx.measureText(scaleBar.text);
  return width + textWidth.width + SCALEBAR_LEFT_PADDING + 20;
}

function getScalebarHeight(ctx) {
  return ctx.canvas.height * 0.016;
}

function drawScalebar(ctx, scaleBar) {
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = '#fff';
  ctx.fillStyle = '#fff';
  const strokeRatio = 1 / 900;
  ctx.lineWidth = Math.round(Math.max(ctx.canvas.width * strokeRatio, 1));
  ctx.beginPath();
  const mapDOMSize = getMapDOMSize();
  const width = (scaleBar.width * ctx.canvas.width) / mapDOMSize.width;
  const yAxisLineLength = getScalebarHeight(ctx);
  const baseLine = getLowerYAxis(ctx);
  ctx.moveTo(SCALEBAR_LEFT_PADDING, baseLine - yAxisLineLength);
  ctx.lineTo(SCALEBAR_LEFT_PADDING, baseLine);
  ctx.lineTo(width + SCALEBAR_LEFT_PADDING, baseLine);
  ctx.lineTo(width + SCALEBAR_LEFT_PADDING, baseLine - yAxisLineLength);
  //halfway mark
  ctx.moveTo(width / 2 + SCALEBAR_LEFT_PADDING, baseLine);
  ctx.lineTo(width / 2 + SCALEBAR_LEFT_PADDING, baseLine - yAxisLineLength / 2);
  ctx.stroke();
  //scalebar text
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = getFont(ctx.canvas.width, { font: 'normal', bold: false });
  ctx.fillText(scaleBar.text, width + 20, baseLine);
}

function drawTextBoxBackground(ctx, width, height) {
  ctx.fillStyle = 'rgba(44,48,51,0.7)';
  ctx.fillRect(0, 0, width, height);
}

function drawCopyrightText(ctx, text, copyrightPartitionX, copyrightPartitionWidth, baselineY) {
  ctx.fillStyle = '#fff';
  const x = copyrightPartitionX + copyrightPartitionWidth / 2;
  const fontSize = getFontSize(ctx.canvas.width, 'copyright');
  const lineHeight = fontSize;
  ctx.font = getFont(ctx.canvas.width, { font: 'copyright', bold: false });
  ctx.textAlign = 'center';
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  const lines = getWrappedLines(ctx, text, copyrightPartitionWidth);
  lines.forEach((line, index) => {
    const y = baselineY - (lines.length - index - 1) * lineHeight;
    ctx.fillText(line, x, y);
  });
}

async function drawLogos(ctx, logosPartitionWidth, bottomY) {
  const copernicusLogo = await loadImage(copernicus);

  const proposedWidth = Math.max(ctx.canvas.width * 0.05, 50);
  const ratio = proposedWidth / copernicusLogo.width;
  const imagePadding = 10;

  const copernicusLogoWidth = copernicusLogo.width * ratio;
  const copernicusLogoHeight = copernicusLogo.height * ratio;

  const imageWidth = copernicusLogoWidth;

  let copernicusLogoX;
  let copernicusLogoY;

  if (imageWidth > logosPartitionWidth) {
    copernicusLogoX = ctx.canvas.width - copernicusLogoWidth - imagePadding;
    copernicusLogoY = bottomY - copernicusLogoHeight - 2;
  } else {
    copernicusLogoX = ctx.canvas.width - imageWidth - imagePadding * 2;
    copernicusLogoY = bottomY - copernicusLogoHeight * 0.9; // Capital letter in image is large, so offset image y postition
  }

  ctx.shadowColor = 'black';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.drawImage(copernicusLogo, copernicusLogoX, copernicusLogoY, copernicusLogoWidth, copernicusLogoHeight);
}

export async function loadImage(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(t`Error fetching image: url is empty!`);
      return;
    }
    const img = document.createElement('img');
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      reject(t`Error fetching image:` + ` ${url} ${e}`);
    };
    img.src = url;
  });
}

function getJsonFromUrl(urlParams) {
  var result = {};
  urlParams.split('&').forEach(function (part) {
    var item = part.split('=');
    result[item[0].toLowerCase()] = decodeURIComponent(item[1]);
  });
  return result;
}

async function drawSHGetMapOnCanvas(ctx, url, apiType, dataFusion, effects) {
  // since we already have the URL by the time we want to call sentinelhub-js' GetMap, we need to parse
  // params from URL again: (not proud, but any other solution would be... more involved :) )

  const [baseUrl, urlParams] = url.split('?');
  const params = getJsonFromUrl(urlParams);
  return await drawHugeMapOnCanvas(ctx, apiType, baseUrl, params, dataFusion, effects);
}

async function drawHugeMapOnCanvas(ctx, apiType, baseUrl, params, dataFusion, effects) {
  const LIMIT_DIM = 2000;
  const xSplitBy = Math.ceil(params.width / LIMIT_DIM);
  const chunkWidth = Math.ceil(params.width / xSplitBy);
  const ySplitBy = Math.ceil(params.height / LIMIT_DIM);
  const chunkHeight = Math.ceil(params.height / ySplitBy);

  const [lng0, lat0, lng1, lat1] = params.bbox.split(',').map((l) => Number(l));
  const xToLng = (x) => Math.round(Math.min(lng0, lng1) + (x / params.width) * Math.abs(lng1 - lng0));
  const yToLat = (y) => Math.round(Math.max(lat0, lat1) - (y / params.height) * Math.abs(lat1 - lat0));

  for (let x = 0; x < params.width; x += chunkWidth) {
    const xTo = Math.min(x + chunkWidth, params.width);
    for (let y = 0; y < params.height; y += chunkHeight) {
      const yTo = Math.min(y + chunkHeight, params.height);
      const paramsChunk = {
        ...params,
        width: xTo - x,
        height: yTo - y,
        bbox: [xToLng(x), yToLat(yTo), xToLng(xTo), yToLat(y)],
        preview: 3,
      };
      if (effects.gainEffect !== undefined) {
        paramsChunk.gain = effects.gainEffect;
      }
      if (effects.gammaEffect !== undefined) {
        paramsChunk.gamma = effects.gammaEffect;
      }

      const overrideGetMapParams = {};
      const shjsEffects = {};
      if (effects.redRangeEffect) {
        shjsEffects.redRange = { from: effects.redRangeEffect[0], to: effects.redRangeEffect[1] };
      }
      if (effects.greenRangeEffect) {
        shjsEffects.greenRange = { from: effects.greenRangeEffect[0], to: effects.greenRangeEffect[1] };
      }
      if (effects.blueRangeEffect) {
        shjsEffects.blueRange = { from: effects.blueRangeEffect[0], to: effects.blueRangeEffect[1] };
      }
      if (Object.keys(shjsEffects).length) {
        overrideGetMapParams.effects = shjsEffects;
      }
      if (effects.mosaickingOrder) {
        paramsChunk.mosaickingOrder = effects.mosaickingOrder;
      }
      if (effects.upsampling) {
        paramsChunk.upsampling = effects.upsampling;
      }
      if (effects.downsampling) {
        paramsChunk.downsampling = effects.downsampling;
      }

      const overrideLayerConstructorParams = {};
      if (effects.minQa !== undefined) {
        overrideLayerConstructorParams.minQa = effects.minQa;
      }

      const blob = dataFusion
        ? await getMapDataFusion(baseUrl, paramsChunk, dataFusion) // overrideGetMapParams not yet supported
        : await legacyGetMapFromParams(
            baseUrl,
            paramsChunk,
            apiType,
            null,
            overrideLayerConstructorParams,
            overrideGetMapParams,
          );
      await drawBlobOnCanvas(ctx, blob, x, y);
    }
  }
}

async function drawBlobOnCanvas(ctx, blob, x, y) {
  const objectURL = URL.createObjectURL(blob);
  // wait until objectUrl is drawn on the image, so you can safely draw img on canvas:
  const imgDrawn = await new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject(t`Could not load image from blob`);
    };
    img.src = objectURL;
  });
  ctx.drawImage(imgDrawn, x, y);
  URL.revokeObjectURL(objectURL);
}

async function createCanvasBlob(
  obj,
  imageFormat,
  showCaptions,
  addMapoverlays,
  showLegend,
  drawMapOverlays,
  getLegendImageURL,
  scaleBar,
  apiType,
  dataFusion,
  effects,
) {
  const { width, height, url, title, userDescription, copyrightText, legendData } = obj;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  await drawSHGetMapOnCanvas(ctx, url, apiType, dataFusion, effects);

  if (addMapoverlays) {
    const overlayCanvas = await drawMapOverlays(ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(overlayCanvas, 0, 0);
  }
  if (showCaptions) {
    await drawCaptions(ctx, userDescription, title, copyrightText, scaleBar);
  }

  if (showLegend && legendData) {
    try {
      const legendUrl = await getLegendImageURL(legendData);
      const legendImage = await loadImage(legendUrl);
      drawLegendImage(ctx, legendImage, true, showCaptions);
    } catch (e) {
      //just print error message and skip drawing legend
      console.error('Error drawing legend', e);
    }
  }
  const dataurl = canvas.toDataURL(imageFormat);
  const urlBlob = dataURLtoBlob(dataurl);
  return urlBlob;
}

export function drawLegendImage(ctx, legendImage, left, showCaptions) {
  if (legendImage === null || legendImage === undefined) {
    return;
  }
  const initialWidth = ctx.canvas.width * 0.05; //5%
  let ratio = initialWidth / legendImage.width;
  if (ratio < 0.6) {
    ratio = 0.6;
  }
  if (ratio > 1) {
    ratio = 1;
  }

  const legendWidth = Math.round(legendImage.width * ratio);
  const legendHeight = Math.round(legendImage.height * ratio);
  let legendX;
  let legendY;
  if (left) {
    legendX = SCALEBAR_LEFT_PADDING;
  } else {
    legendX = ctx.canvas.width - legendWidth - SCALEBAR_LEFT_PADDING;
  }
  legendY =
    (showCaptions ? getLowerYAxis(ctx) : ctx.canvas.height) -
    legendHeight -
    (showCaptions ? getScalebarHeight(ctx) + 10 : 10);

  ctx.lineJoin = 'round';
  ctx.lineWidth = '1';
  ctx.strokeStyle = 'black';
  ctx.strokeRect(legendX - 1, legendY - 1, legendWidth + 2, legendHeight + 2);

  ctx.drawImage(
    legendImage,
    0,
    0,
    legendImage.width,
    legendImage.height,
    legendX,
    legendY,
    legendWidth,
    legendHeight,
  );
}

export const SENTINEL_COPYRIGHT_TEXT = `Credit: European Union, contains modified Copernicus Sentinel data ${moment
  .utc()
  .format('YYYY')}, processed with EO Browser`;

async function getImgObject(
  customObject = {},
  imageFormat,
  imgWmsUrl,
  imageW,
  imageH,
  userDescription,
  name,
  time,
  datasource,
  presetArg,
  presets,
  instances,
  mapBounds,
) {
  const preset = customObject.preset || presetArg;
  const imageExt = IMAGE_FORMATS.find((f) => f.value === imageFormat).ext;
  const { name: cName, preset: cPreset, time: cTime, url: cUrl, legendData } = customObject;
  const presetName = presets[datasource].find((p) => p.id === (cPreset || preset));

  const interestedDatasource = instances.find((instance) => instance.name === datasource);
  const copyrightText = datasource.includes('Sentinel') ? SENTINEL_COPYRIGHT_TEXT : '';

  if (interestedDatasource.constructSpacecraftInfo) {
    let fromMoment;
    let toMoment;
    const { timeFrom, timeTo } = getInstantsFromTimeInterval(time);
    fromMoment = moment.utc(timeFrom);
    toMoment = moment.utc(timeTo);

    if (!isTimeSpecifiedInDate(timeFrom)) {
      fromMoment.startOf('day');
    }

    if (!isTimeSpecifiedInDate(timeTo)) {
      toMoment.endOf('day');
    }
    const { tiles } = await interestedDatasource.getTilesFromIndexService(mapBounds, fromMoment, toMoment);
    name = interestedDatasource.constructSpacecraftInfo(tiles);
  }

  const title = `${formatTimeInterval(cTime || time)}, ${cName || name}, ${
    presetName ? presetName.name : cPreset || preset
  }`;
  // use custom object or default for rendering image
  return {
    url: cUrl || imgWmsUrl,
    title,
    width: imageW,
    height: imageH,
    imageExt,
    userDescription: userDescription && userDescription.length > 0 ? `${userDescription}, ` : '',
    copyrightText,
    legendData,
  };
}

async function downloadCanvas(
  customObj,
  imageFormat,
  imgWmsUrl,
  imageW,
  imageH,
  userDescription,
  showCaptions,
  addMapoverlays,
  showLegend,
  name,
  time,
  datasource,
  presetArg,
  presets,
  instances,
  mapBounds,
  drawMapOverlays,
  getLegendImageURL,
  scaleBar,
  apiType,
  dataFusion,
  effects,
) {
  return new Promise((resolve, reject) => {
    getImgObject(
      customObj,
      imageFormat,
      imgWmsUrl,
      imageW,
      imageH,
      userDescription,
      name,
      time,
      datasource,
      presetArg,
      presets,
      instances,
      mapBounds,
    ).then((obj) => {
      createCanvasBlob(
        obj,
        imageFormat,
        showCaptions,
        addMapoverlays,
        showLegend,
        drawMapOverlays,
        getLegendImageURL,
        scaleBar,
        apiType,
        dataFusion,
        effects,
      )
        .then((blob) => {
          FileSaver.saveAs(blob, `${obj.title}.${obj.imageExt}`);
          resolve();
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  });
}

function dataURLtoBlob(dataurl) {
  var parts = dataurl.split(','),
    mime = parts[0].match(/:(.*?);/)[1];
  if (parts[0].indexOf('base64') !== -1) {
    var bstr = atob(parts[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  } else {
    var raw = decodeURIComponent(parts[1]);
    return new Blob([raw], { type: mime });
  }
}

export function downloadOne(
  layerUrl,
  imageFormat,
  imgWmsUrl,
  imageH,
  imageW,
  userDescription,
  showCaptions,
  addMapoverlays,
  showLegend,
  name,
  time,
  datasource,
  presetArg,
  presets,
  instances,
  mapBounds,
  drawMapOverlays,
  getLegendImageURL,
  scaleBar,
  dataFusion,
  effects,
) {
  return new Promise((resolve, reject) => {
    const { preset, src, legendData, apiType } = layerUrl;
    if (['image/png', 'image/jpeg'].includes(imageFormat)) {
      downloadCanvas(
        { url: src, preset, legendData },
        imageFormat,
        imgWmsUrl,
        imageH,
        imageW,
        userDescription,
        showCaptions,
        addMapoverlays,
        showLegend,
        name,
        time,
        datasource,
        presetArg,
        presets,
        instances,
        mapBounds,
        drawMapOverlays,
        getLegendImageURL,
        scaleBar,
        apiType,
        dataFusion,
        effects,
      )
        .then((blob) => {
          resolve();
        })
        .catch((err) => {
          console.error('Could not download files', err);
          reject(t`Could not download files:` + ` ${err.message}`);
        });
    } else {
      reject(t`Can't download via canvas`);
    }
  });
}
