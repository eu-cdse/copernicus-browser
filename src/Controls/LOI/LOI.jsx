import React, { useState, memo } from 'react';
import { t } from 'ttag';
import L from 'leaflet';
import store, { loiSlice, modalSlice } from '../../store';
import { connect } from 'react-redux';
import length from '@turf/length';
import { PrettyDistance } from '../../junk/EOBMeasurePanelButton/EOBMeasurePanelButton';
import { EOBUploadGeoFile } from '../../junk/EOBUploadGeoFile/EOBUploadGeoFile';
import { UPLOAD_GEOMETRY_TYPE } from '../../junk/EOBUploadGeoFile/EOBUploadGeoFile.utils';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { useLoi } from './useLoi';
import LoiIcon from './loi-icon.svg?react';
import { ModalId } from '../../const';
import CopyToClipboardButton from '../../components/CopyToClipboardButton/CopyToClipboardButton';

const LOIPanelWrapper = memo(({ className, children, title }) => {
  return (
    <div className={`loi-wrapper ${className}`}>
      <div className={`loiPanel panelButton floatItem`} title={title}>
        {children}
      </div>
    </div>
  );
});

const MenuItem = ({ title, className, onClick, iconClassName }) => {
  return (
    // jsx-a11y/anchor-is-valid
    // eslint-disable-next-line
    <a
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={className}
    >
      <i className={iconClassName} />
    </a>
  );
};

const LOI = ({ className, map, loiBounds, loiGeometry }) => {
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [uploadDialog, showUploadDialog] = useState(false);
  const { startDrawingLoi, resetLoi } = useLoi(map, { onEndDrawing: () => {} });

  const menuItems = [
    {
      key: 'copyToClipboard',
      displayed: menuExpanded && !!loiGeometry,
      render: () => (
        <CopyToClipboardButton
          className={`copy-coord`}
          title={t`Copy geometry to clipboard`}
          value={loiGeometry}
        />
      ),
    },
    {
      key: 'featureInfo',
      displayed: menuExpanded && !!loiGeometry && !isNaN(length(loiGeometry, { units: 'meters' })),
      render: () => <PrettyDistance value={length(loiGeometry, { units: 'meters' })} />,
    },
    {
      key: 'uploadButton',
      displayed: menuExpanded,
      render: () => (
        <MenuItem
          iconClassName="fa fa-upload"
          title={t`Upload a file to create a line`}
          onClick={() => {
            showUploadDialog(true);
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
          title={t`Elevation profile`}
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
            startDrawingLoi();
          }}
        />
      ),
    },
  ];

  const panelTitle = t`Draw a line`;
  const panelTitleRemove = t`Remove line`;
  const panelTitleClose = t`Close line options`;
  const title = menuExpanded ? (loiGeometry ? panelTitleRemove : panelTitleClose) : panelTitle;

  return (
    <LOIPanelWrapper className={className} title={title}>
      <div className="loiMenu">
        {menuItems
          .filter((item) => item.displayed)
          .map((item) => (
            <React.Fragment key={item.key}>{item.render()}</React.Fragment>
          ))}
      </div>
      {/* jsx-a11y/anchor-is-valid */}
      {/* eslint-disable-next-line */}
      <a
        className={`loiIcon ${menuExpanded ? 'open-options' : ''}`}
        onClick={() => {
          setMenuExpanded(!menuExpanded);
          resetLoi();
        }}
      >
        <LoiIcon />
      </a>
      {uploadDialog && (
        <EOBUploadGeoFile
          onUpload={(geometry) => {
            const layer = L.geoJSON(geometry);
            store.dispatch(loiSlice.actions.set({ geometry, bounds: layer.getBounds() }));
            map.fitBounds(layer.getBounds());
            showUploadDialog(false);
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
