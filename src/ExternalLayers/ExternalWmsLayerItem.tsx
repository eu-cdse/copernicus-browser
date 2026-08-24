import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { t } from 'ttag';
import L from 'leaflet';

import { externalLayersSlice } from '../store';
import { ExternalServer } from '../store/slices/externalLayersSlice';
import {
  ExternalLayer,
  validateWmsUrl,
  safeHostname,
  PreviewBbox,
  buildWmtsPreviewTileUrl,
} from './externalLayers.utils';
import { buildExternalWmsGetMapUrl } from '../Controls/ImgDownload/WmsDownload.utils';
import ActionBar from '../components/ActionBar/ActionBar';
import ExternalLink from '../ExternalLink/ExternalLink';
import ExternalWmsLayerDetails from './ExternalWmsLayerDetails';
import DoubleChevronDown from '../icons/double-chevron-down.svg?react';
import DoubleChevronUp from '../icons/double-chevron-up.svg?react';

const EMPTY_IMAGE_DATA_URI = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

function buildPreviewUrl(
  server: { url: string; type: string; version?: string },
  layer: { name: string; tileUrl?: string; legendUrl?: string; bbox?: PreviewBbox; tileSize?: number },
): string {
  if (server.type === 'WMTS' && layer.tileUrl) {
    return buildWmtsPreviewTileUrl(layer.tileUrl, layer.bbox, layer.tileSize);
  }
  // Aim the GetMap thumbnail at the layer's advertised extent (so regional layers show their
  // data); fall back to the whole world when no usable bbox is advertised.
  const b = layer.bbox;
  const bounds =
    b && b.east > b.west && b.north > b.south
      ? L.latLngBounds([b.south, b.west], [b.north, b.east])
      : L.latLngBounds([-90, -180], [90, 180]);
  return buildExternalWmsGetMapUrl(server.url, layer.name, bounds, 64, 64);
}

interface Props {
  server: ExternalServer;
  layer: ExternalLayer;
  isActive: boolean;
  layerActions: unknown[];
  layerActionsOpen?: boolean;
  toggleLayerActions?: (e: React.MouseEvent) => void;
}

const ExternalWmsLayerItem = ({
  server,
  layer,
  isActive,
  layerActions,
  layerActionsOpen,
  toggleLayerActions,
}: Props) => {
  const dispatch = useDispatch();
  const [detailsOpen, setDetailsOpen] = useState(false);

  // metadataUrls is already filtered to human-viewable web pages at parse time (raw XML/data
  // documents are dropped via isWebPageMetadata in externalLayers.utils).
  const metadataUrls = layer.metadataUrls ?? [];
  // Unfolding a row reveals its legend and full abstract, mirroring the non-WMS layer details
  // (see VisualizationLayer/LayerDetails). The chevron is disabled when there is nothing to show.
  const hasDetails = !!layer.legendUrl || !!layer.abstract;

  const toggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailsOpen((open) => !open);
  };

  return (
    <div
      role="option"
      aria-selected={isActive}
      className={`layer-container external-wms-layer-item ${isActive ? 'active' : ''}`}
      onClick={() => {
        // The Add to Compare/Pins action buttons live inside this row, and their clicks
        // bubble up here. Re-selecting the already-active layer is a no-op, so skip it to
        // avoid a redundant dispatch (the reducer also preserves the chosen date on a
        // same-layer re-select, so the picker keeps its value either way).
        if (isActive) {
          return;
        }
        dispatch(
          externalLayersSlice.actions.setActiveExternalLayer({
            serverId: server.id,
            layerName: layer.name,
            layerId: layer.id,
          }),
        );
      }}
    >
      <div className="layer-header">
        <div className="preview">
          <img
            className="icon"
            src={buildPreviewUrl(server, layer)}
            alt=""
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = EMPTY_IMAGE_DATA_URI;
            }}
          />
        </div>
        <div className="title">
          <span
            className={`external-wms-layer-title${isActive ? ' active-title' : ''}`}
            title={layer.title || layer.name}
          >
            {layer.title || layer.name}
          </span>
          {layer.abstract && <div className="external-wms-layer-abstract">{layer.abstract}</div>}
          {layer.timeDimension && (
            <div className="external-wms-layer-time-dimension">{layer.timeDimension}</div>
          )}
        </div>
        {isActive && (
          <div className="icons">
            <div
              title={t`Add to`}
              className={`plus ${layerActionsOpen ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (toggleLayerActions) {
                  toggleLayerActions(e);
                }
              }}
            >
              <i className={`fas ${layerActionsOpen ? 'fa-minus' : 'fa-plus'}`} /> {t`Add to`}
            </div>
            {detailsOpen ? (
              <DoubleChevronUp
                className={`double-chevron-up ${hasDetails ? '' : 'disabled'}`}
                title={t`Hide details`}
                onClick={toggleDetails}
              />
            ) : (
              <DoubleChevronDown
                className={`double-chevron-down ${hasDetails ? '' : 'disabled'}`}
                title={t`Show details`}
                onClick={toggleDetails}
              />
            )}
          </div>
        )}
      </div>
      {/* Rendered as a full-width row BELOW the header (not inside .title): on the active row
          the .icons block takes 125px and shrinks .title, which would shift the right-aligned
          metadata left and misalign it against the other rows. */}
      {(layer.attribution || metadataUrls.length > 0) && (
        <div className="external-wms-layer-meta-row">
          <div className="external-wms-layer-attribution">
            {layer.attribution &&
              (validateWmsUrl(layer.attribution) ? (
                // Attribution without its own <Title> falls back to the bare OnlineResource
                // URL (see extractWmsAttribution); show its hostname instead of the full,
                // often-long URL as the visible text, keeping the full URL in the tooltip.
                <span onClick={(e) => e.stopPropagation()}>
                  <ExternalLink
                    href={layer.attribution}
                    className="external-wms-layer-attribution-link"
                    title={layer.attribution}
                  >
                    {safeHostname(layer.attribution)}
                  </ExternalLink>
                </span>
              ) : (
                layer.attribution
              ))}
          </div>
          {/* A layer can advertise several MetadataURLs; number them (1-based) when
              there's more than one. The number is concatenated outside the t`` tagged
              template so only the word "Metadata" is translated. */}
          {metadataUrls.length > 0 && (
            <div className="external-wms-layer-metadata" onClick={(e) => e.stopPropagation()}>
              {metadataUrls.map((url, idx) => {
                const label = metadataUrls.length > 1 ? `${t`Metadata`} ${idx + 1}` : t`Metadata`;
                // metadataUrls come from an untrusted server's GetCapabilities response;
                // only render as a clickable link when the scheme is http(s), otherwise a
                // malicious/misconfigured server could hand us a javascript: URI.
                return validateWmsUrl(url) ? (
                  <ExternalLink
                    key={`${url}-${idx}`}
                    href={url}
                    className="external-wms-layer-metadata-link"
                    title={url}
                  >
                    {label}
                  </ExternalLink>
                ) : (
                  <span key={`${url}-${idx}`} className="external-wms-layer-metadata-plain" title={url}>
                    {label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
      <ExternalWmsLayerDetails
        detailsOpen={detailsOpen && isActive}
        legendUrl={layer.legendUrl}
        abstract={layer.abstract}
      />
      <ActionBar
        className="layer-actions"
        actionsOpen={!!(layerActionsOpen && isActive)}
        actions={layerActions}
      />
    </div>
  );
};

export default ExternalWmsLayerItem;
