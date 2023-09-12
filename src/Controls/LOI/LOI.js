import React, { useRef, useState } from 'react';
import { t } from 'ttag';
import L from 'leaflet';
import store, { loiSlice, modalSlice } from '../../store';
import { connect } from 'react-redux';
import length from '@turf/length';
import { PrettyDistance } from '../../junk/EOBMeasurePanelButton/EOBMeasurePanelButton';
import { EOBUploadGeoFile } from '../../junk/EOBUploadGeoFile/EOBUploadGeoFile';
import { UPLOAD_GEOMETRY_TYPE } from '../../junk/EOBUploadGeoFile/EOBUploadGeoFile.utils';
import CopyGeometryToClipboardButton from '../../junk/EOBAOIPanelButton/CopyGeometryToClipboardButton';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { useLoi } from './useLoi';
import { ReactComponent as LoiIcon } from './loi-icon.svg';
import { ModalId } from '../../const';

const LOIPanelWrapper = ({ setMenuExpanded, className, shouldClose, children }) => {
  const closeTimeout = useRef(null);
  return (
    <div className={`loi-wrapper ${className}`}>
      <div
        className={`loiPanel panelButton floatItem`}
        onMouseEnter={() => {
          if (closeTimeout?.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
          }
          setMenuExpanded(true);
        }}
        onMouseLeave={() => {
          if (shouldClose) {
            closeTimeout.current = setTimeout(() => {
              setMenuExpanded(false);
            }, 400);
          }
        }}
        title={t`Draw a line`}
      >
        {children}
      </div>
    </div>
  );
};

const MenuItem = ({ title, className, onClick, iconClassName }) => {
  return (
    // jsx-a11y/anchor-is-valid
    // eslint-disable-next-line
    <a title={title} onClick={onClick} className={className}>
      <i className={iconClassName} />
    </a>
  );
};

const LOI = ({ className, map, loiBounds, loiGeometry }) => {
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [uploadDialog, showUploadDialog] = useState(false);
  const { startDrawingLoi, resetLoi } = useLoi(map, { onEndDrawing: () => setDrawing(false) });

  const menuItems = [
    {
      key: 'copyToClipboard',
      displayed: menuExpanded && !!loiGeometry,
      render: () => <CopyGeometryToClipboardButton geometry={loiGeometry} />,
    },
    {
      key: 'featureInfo',
      displayed: menuExpanded && !!loiGeometry && !isNaN(length(loiGeometry, { units: 'meters' })),
      render: () => <PrettyDistance distance={length(loiGeometry, { units: 'meters' })} />,
    },
    {
      key: 'uploadButton',
      displayed: menuExpanded,
      render: () => (
        <MenuItem
          iconClassName="fa fa-upload"
          title={t`Upload a file to create a line`}
          onClick={() => {
            setDrawing(true);
            showUploadDialog(true);
          }}
        />
      ),
    },
    {
      key: 'removeGeometry',
      displayed: menuExpanded && (loiGeometry || drawing),
      render: () => (
        <MenuItem
          iconClassName="fa fa-close"
          title={t`Remove geometry`}
          onClick={() => {
            setDrawing(false);
            setMenuExpanded(false);
            resetLoi();
          }}
        />
      ),
    },
    {
      key: 'centerOnFeature',
      displayed: menuExpanded && !!loiGeometry,
      render: () => (
        <MenuItem
          iconClassName="fa fa-crosshairs"
          title={t`Center map on feature`}
          onClick={() => map.fitBounds(loiBounds)}
        />
      ),
    },
    {
      key: 'elevationProfile',
      displayed: menuExpanded && !!loiGeometry,
      render: () => (
        <MenuItem
          iconClassName="fa fa-area-chart"
          title={`Elevation profile`}
          onClick={() => store.dispatch(modalSlice.actions.addModal({ modal: ModalId.ELEVATION_PROFILE }))}
        />
      ),
    },
    {
      key: 'edit',
      displayed: menuExpanded,
      render: () => (
        <MenuItem
          iconClassName="fa fa-pencil"
          title={t`Draw a line`}
          onClick={() => {
            setDrawing(true);
            startDrawingLoi();
          }}
        />
      ),
    },
  ];

  return (
    <LOIPanelWrapper
      className={className}
      setMenuExpanded={setMenuExpanded}
      shouldClose={!loiGeometry && !drawing}
    >
      <div className="loiMenu">
        {menuItems
          .filter((item) => item.displayed)
          .map((item) => (
            <React.Fragment key={item.key}>{item.render()}</React.Fragment>
          ))}
      </div>
      {
        // eslint-disable-next-line
        <a className={'loiIcon'} onClick={() => setMenuExpanded(!menuExpanded)} title={t`Draw a line`}>
          <LoiIcon />
        </a>
      }
      {uploadDialog && (
        <EOBUploadGeoFile
          onUpload={(geometry) => {
            const layer = L.geoJSON(geometry);
            store.dispatch(loiSlice.actions.set({ geometry, bounds: layer.getBounds() }));
            map.fitBounds(layer.getBounds());
            showUploadDialog(false);
            setDrawing(false);
          }}
          onClose={() => showUploadDialog(false)}
          type={UPLOAD_GEOMETRY_TYPE.LINE}
        />
      )}
    </LOIPanelWrapper>
  );
};

const mapStoreToProps = (store) => ({
  loiGeometry: store.loi.geometry,
  loiBounds: store.loi.bounds,
});

export default connect(mapStoreToProps, null)(LOI);
