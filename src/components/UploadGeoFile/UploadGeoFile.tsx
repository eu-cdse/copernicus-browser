import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone';
import type { Geometry } from 'geojson';
import { t } from 'ttag';
import {
  CodeEditor,
  themeCdasBrowserDark,
  themeCdasBrowserLight,
} from '@sentinel-hub/evalscript-code-editor';

import Modal from '../Modal/Modal';
import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';
import InputWithBouncyLimit from '../InputWithBouncyLimit/InputWithBouncyLimit';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import {
  parseContent,
  getFileExtension,
  loadFileContent,
  parseZip,
  UPLOAD_GEOMETRY_TYPE,
  checkIfValidShapeFile,
  uploadGeoFileErrorMessages,
  GeometryValidationError,
} from './UploadGeoFile.utils';

import './UploadGeoFile.scss';

type Mode = 'file' | 'geojson' | 'wkt' | 'bbox' | 'gridRef';

type Props = {
  type: string;
  onUpload: (geometry: Geometry) => void;
  onClose: () => void;
};

const getFileUploadText = (fileUploadType: string) => {
  switch (fileUploadType) {
    case UPLOAD_GEOMETRY_TYPE.LINE:
      return t`Upload a KML/KMZ, GPX, WKT (in EPSG:4326) or GEOJSON/JSON file.`;
    default:
      return t`Upload a zipped file to create an area of interest. The area will be used for clipping when exporting an image.`;
  }
};

const getDropAFileText = (fileUploadType: string) => {
  switch (fileUploadType) {
    case UPLOAD_GEOMETRY_TYPE.LINE:
      return t`Drop a zipped SHP, KML/KMZ, GPX, WKT (in EPSG:4326) or GEOJSON/JSON file.`;
    default:
      return t`Drop a zipped SHP, KML/KMZ, WKT (in EPSG:4326) or GEOJSON/JSON file.`;
  }
};

export function UploadGeoFile({ type, onUpload, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('file');
  const [error, setError] = useState<string | null>(null);
  const [geoJsonText, setGeoJsonText] = useState('');
  const [wktText, setWktText] = useState('');
  const [gridRefText, setGridRefText] = useState('');
  const [minX, setMinX] = useState(NaN);
  const [minY, setMinY] = useState(NaN);
  const [maxX, setMaxX] = useState(NaN);
  const [maxY, setMaxY] = useState(NaN);

  const segments = (
    type === UPLOAD_GEOMETRY_TYPE.LINE
      ? [
          { value: 'file', label: t`File` },
          { value: 'geojson', label: t`GeoJSON` },
          { value: 'wkt', label: t`WKT` },
        ]
      : [
          { value: 'file', label: t`File` },
          { value: 'geojson', label: t`GeoJSON` },
          { value: 'wkt', label: t`WKT` },
          { value: 'bbox', label: t`Bounding box` },
          { value: 'gridRef', label: t`Grid reference` },
        ]
  ) as { value: Mode; label: string }[];

  const title =
    type === UPLOAD_GEOMETRY_TYPE.LINE ? t`Define Line of Interest (LOI)` : t`Define Area of Interest (AOI)`;

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setError(null);
  };

  const handleParseContent = (
    content: string,
    uploadType: string,
    format: string | null,
    fallbackMessage?: string,
  ) => {
    try {
      // parseContent is a plain JS export; TS infers its `format` param as `null | undefined`
      // from the default value, so the actual format strings need a cast here.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const area = parseContent(content, uploadType, format as any);
      onUpload(area);
    } catch (e) {
      if (!fallbackMessage || e instanceof GeometryValidationError) {
        setError(e.message);
      } else {
        setError(fallbackMessage);
      }
    }
  };

  const handleParseZip = async (content: File, uploadType: string) => {
    try {
      await checkIfValidShapeFile(content);
      const area = await parseZip(content, uploadType);
      onUpload(area);
    } catch (e) {
      setError(e.message);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      (async () => {
        const file = acceptedFiles[0];
        const format = getFileExtension(file.name);
        try {
          if (format !== 'zip') {
            const data = await loadFileContent(file, format);
            handleParseContent(data, type, format);
          } else {
            await handleParseZip(file, type);
          }
        } catch (e) {
          setError(e.message);
        }
      })();
    }
  };

  const validateBbox = () => {
    if ([minX, minY, maxX, maxY].some((value) => Number.isNaN(value))) {
      return uploadGeoFileErrorMessages.INVALID_BBOX_VALUES();
    }
    if (!(minX < maxX && minY < maxY)) {
      return uploadGeoFileErrorMessages.INVALID_BBOX_ORDER();
    }
    return null;
  };

  const handleSubmit = () => {
    switch (mode) {
      case 'geojson':
        handleParseContent(geoJsonText, type, 'geojson', uploadGeoFileErrorMessages.ERROR_PARSING_GEOJSON());
        break;
      case 'wkt':
        handleParseContent(wktText, type, 'wkt', uploadGeoFileErrorMessages.ERROR_PARSING_WKT());
        break;
      case 'gridRef':
        handleParseContent(gridRefText, type, 'gridRef', uploadGeoFileErrorMessages.INVALID_GRID_REFERENCE());
        break;
      case 'bbox': {
        const bboxError = validateBbox();
        if (bboxError) {
          setError(bboxError);
          return;
        }
        handleParseContent(
          JSON.stringify([minX, minY, maxX, maxY]),
          type,
          'bbox',
          uploadGeoFileErrorMessages.INVALID_BBOX_VALUES(),
        );
        break;
      }
      default:
        break;
    }
  };

  const isSubmitDisabled = () => {
    switch (mode) {
      case 'geojson':
        return !geoJsonText;
      case 'wkt':
        return !wktText;
      case 'gridRef':
        return !gridRefText;
      case 'bbox':
        return [minX, minY, maxX, maxY].every((value) => Number.isNaN(value));
      default:
        return true;
    }
  };

  const renderModeContent = () => {
    switch (mode) {
      case 'file':
        return (
          <>
            <p>{getFileUploadText(type)}</p>
            <Dropzone multiple={false} onDrop={onDrop}>
              {({ getRootProps, getInputProps, isDragAccept, isDragReject }) => (
                <div
                  {...getRootProps({
                    className: `fileUploadPanel${isDragAccept ? ' ok' : ''}${isDragReject ? ' false' : ''}`,
                  })}
                >
                  <input {...getInputProps()} />
                  {getDropAFileText(type)}
                </div>
              )}
            </Dropzone>
          </>
        );
      case 'geojson':
        return (
          <>
            <p>{t`Paste your GeoJSON geometry.`}</p>
            <div className="code-editor-wrap">
              <CodeEditor
                themeDark={themeCdasBrowserDark}
                themeLight={themeCdasBrowserLight}
                defaultEditorTheme="light"
                value={geoJsonText}
                onChange={setGeoJsonText}
                portalId="code_editor_portal"
                zIndex={9999}
                onRunEvalscriptClick={handleSubmit}
                runEvalscriptButtonText={t`Upload`}
                runningEvalscriptButtonText={t`Uploading`}
                language="json"
              />
            </div>
          </>
        );
      case 'wkt':
        return (
          <div className="geometryInput">
            <textarea
              placeholder={t`Paste your WKT geometry, e.g. POLYGON((...)).`}
              rows={8}
              value={wktText}
              onChange={(e) => setWktText(e.target.value)}
            ></textarea>
          </div>
        );
      case 'gridRef':
        return (
          <div className="gridRefInput">
            <input
              type="text"
              placeholder={t`Enter a GEOREF or MGRS reference.`}
              value={gridRefText}
              onChange={(e) => setGridRefText(e.target.value)}
            />
          </div>
        );
      case 'bbox':
        return (
          <div className="bboxInput">
            <label>
              {t`Min X`}
              <InputWithBouncyLimit
                className="bbox-coord-input"
                inputType="text"
                value={minX}
                setValue={setMinX}
                min={-180}
                max={180}
                step={0.0001}
                allowNull={true}
                placeholder=""
              />
            </label>
            <label>
              {t`Min Y`}
              <InputWithBouncyLimit
                className="bbox-coord-input"
                inputType="text"
                value={minY}
                setValue={setMinY}
                min={-90}
                max={90}
                step={0.0001}
                allowNull={true}
                placeholder=""
              />
            </label>
            <label>
              {t`Max X`}
              <InputWithBouncyLimit
                className="bbox-coord-input"
                inputType="text"
                value={maxX}
                setValue={setMaxX}
                min={-180}
                max={180}
                step={0.0001}
                allowNull={true}
                placeholder=""
              />
            </label>
            <label>
              {t`Max Y`}
              <InputWithBouncyLimit
                className="bbox-coord-input"
                inputType="text"
                value={maxY}
                setValue={setMaxY}
                min={-90}
                max={90}
                step={0.0001}
                allowNull={true}
                placeholder=""
              />
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  return ReactDOM.createPortal(
    <Modal
      animation="slideUp"
      visible={true}
      customStyles={{
        width: 'auto',
        maxWidth: 420,
        height: 'auto',
        bottom: 'auto',
        top: '50%',
        transform: 'translateY(-50%)',
      }}
      onClose={onClose}
      closeOnEsc={true}
    >
      <div className="fileUploadWindow">
        <h3>{title}</h3>

        <SegmentedControl options={segments} value={mode} onChange={handleModeChange} />

        <div className="upload-content">{renderModeContent()}</div>

        <EOBButton
          text={t`Upload`}
          className={`primary upload-button${mode === 'file' ? ' hidden' : ''}`}
          fluid
          disabled={isSubmitDisabled()}
          onClick={handleSubmit}
        />

        {error && <p className="error">{error}</p>}
      </div>
    </Modal>,
    document.querySelector('#app')!,
  );
}
