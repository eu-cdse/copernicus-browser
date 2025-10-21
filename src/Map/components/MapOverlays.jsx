import React from 'react';
import { TABS } from '../../const';
import GeometryOverlays from './GeometryOverlays';
import ResultsPreviewGroup from './ResultsPreviewGroup';
import ElevationPointLayer from './ElevationPointLayer';
import TimelapseAreaPreview from '../../Controls/Timelapse/TimelapseAreaPreview';
import QuicklookOverlaysGroup from './QuicklookOverlaysGroup';

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
  zoom,
  mapBounds,

  // quicklooks
  filteredQuicklookOverlays,
}) => {
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
        <TimelapseAreaPreview lat={lat} lng={lng} zoom={zoom} mapBounds={mapBounds} />
      )}

      {/* Quicklook overlays */}
      <QuicklookOverlaysGroup quicklookImages={filteredQuicklookOverlays} />
    </>
  );
};

export default React.memo(MapOverlays);
