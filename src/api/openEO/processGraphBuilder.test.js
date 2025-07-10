import { BBox, CRS_EPSG4326 } from '@sentinel-hub/sentinelhub-js';
import processGraphBuilder from './processGraphBuilder';

describe('set attributes in processGraph', () => {
  const graph = {
    load2: {
      process_id: 'load_collection',
      arguments: {
        id: 'sentinel-2-l2a',
        spatial_extent: {},
        temporal_extent: null,
        bands: ['B04', 'B03', 'B02'],
      },
    },
  };
  test('Set spatial and temporal extent', () => {
    const bbox = new BBox(CRS_EPSG4326, 1, 4, 2, 5);
    const newGraph = processGraphBuilder.loadCollection(graph, {
      spatial_extent: {
        west: bbox.minX,
        east: bbox.maxX,
        south: bbox.minY,
        north: bbox.maxY,
        height: 100,
        width: 100,
      },
      temporal_extent: ['2024-12-07T00:00:00Z', '2024-12-07T23:59:59Z'],
    });

    expect(newGraph).toEqual({
      load2: {
        process_id: 'load_collection',
        arguments: {
          id: 'sentinel-2-l2a',
          spatial_extent: {
            west: 1,
            east: 2,
            south: 4,
            north: 5,
            width: 100,
            height: 100,
          },
          temporal_extent: ['2024-12-07T00:00:00Z', '2024-12-07T23:59:59Z'],
          bands: ['B04', 'B03', 'B02'],
        },
      },
    });
  });
});
