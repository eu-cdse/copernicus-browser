import React from 'react';
import type { Geometry } from 'geojson';
import type { LatLngBounds } from 'leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import { TABS } from '../../const';
import GeometryOverlays from './GeometryOverlays';
import ResultsPreviewGroup from './ResultsPreviewGroup';
import ElevationPointLayer from './ElevationPointLayer';
import TimelapseAreaPreview from '../../Controls/Timelapse/TimelapseAreaPreview';
import QuicklookOverlaysGroup from './QuicklookOverlaysGroup';
import type { QuicklookOverlay as QuicklookOverlayData } from '../../store/slices/mainMapSlice';

type Tile = {
  id?: string;
  _internalId?: string;
  geometry?: object;
  [key: string]: unknown;
};

type Props = {
  // geometry overlays
  aoiGeometry: Geometry | null;
  aoiBounds: LatLngBounds | null;
  aoiLastEdited: boolean;
  loiGeometry: Geometry | null;
  loiLastEdited: boolean;
  poiPosition: [number, number] | null;
  poiLastEdited: boolean;

  // search & RRD previews
  selectedTabIndex: number;
  searchResultsAreas: Tile[];
  highlightedTileId: string | undefined;
  onPreviewClick: (e: LeafletMouseEvent) => void;
  RRDProcessedResults: Tile[];
  highlightedRRDResultId: string | undefined;
  onPreviewRRDClick: (e: LeafletMouseEvent) => void;

  // elevation point
  elevationFeature: unknown;

  // timelapse
  displayTimelapseAreaPreview: boolean;
  lat: number;
  lng: number;
  mapBounds: LatLngBounds | null;

  // quicklooks
  filteredQuicklookOverlays: QuicklookOverlayData[];
};

const MapOverlays = ({
  // geometry overlays
  aoiGeometry,
  aoiBounds,
  aoiLastEdited,
  loiGeometry,
  loiLastEdited,
  poiPosition,
  poiLastEdited,

  // search & RRD previews
  selectedTabIndex,
  searchResultsAreas,
  highlightedTileId,
  onPreviewClick,
  RRDProcessedResults,
  highlightedRRDResultId,
  onPreviewRRDClick,

  // elevation point
  elevationFeature,

  // timelapse
  displayTimelapseAreaPreview,
  lat,
  lng,
  mapBounds,

  // quicklooks
  filteredQuicklookOverlays,
}: Props) => {
  return (
    <>
      {/* AOI / LOI / POI */}
      <GeometryOverlays
        aoiGeometry={aoiGeometry}
        aoiBounds={aoiBounds}
        aoiLastEdited={aoiLastEdited}
        loiGeometry={loiGeometry}
        loiLastEdited={loiLastEdited}
        poiPosition={poiPosition}
        poiLastEdited={poiLastEdited}
      />

      {/* Search results preview */}
      {selectedTabIndex === TABS.SEARCH_TAB && (
        <ResultsPreviewGroup
          tiles={searchResultsAreas}
          highlightedId={highlightedTileId}
          idKey="id"
          onClick={onPreviewClick}
        />
      )}

      {/* RRD results preview */}
      {selectedTabIndex === TABS.RAPID_RESPONSE_DESK && (
        <ResultsPreviewGroup
          tiles={RRDProcessedResults}
          highlightedId={highlightedRRDResultId}
          idKey="_internalId"
          onClick={onPreviewRRDClick}
        />
      )}

      {/* Elevation point */}
      <ElevationPointLayer feature={elevationFeature} />

      {/* Timelapse area preview */}
      {displayTimelapseAreaPreview && selectedTabIndex === TABS.VISUALIZE_TAB && (
        <TimelapseAreaPreview lat={lat} lng={lng} mapBounds={mapBounds} />
      )}

      {/* Quicklook overlays */}
      <QuicklookOverlaysGroup quicklookOverlays={filteredQuicklookOverlays} />
    </>
  );
};

export default React.memo(MapOverlays);
