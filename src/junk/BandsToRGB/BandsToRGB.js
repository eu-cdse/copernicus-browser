import React from 'react';
import { t } from 'ttag';

import { DraggableBand } from './DraggableBand';
import { DraggableBandGhost } from './DraggableBandGhost';

import 'react-dragula/dist/dragula.min.css';
import './BandsToRGB.scss';
import { SelectedBand } from './SelectedBand';
import HelpTooltip from '../../Tools/SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/HelpTooltip';
import ReactMarkdown from 'react-markdown';

// value = { r:'B01', g:'B02', b: 'B03' }
export const BandsToRGB = ({ bands, value, onChange, areBandsClasses }) => {
  if (!bands) {
    return null;
  }

  const link1 = 'https://custom-scripts.sentinel-hub.com/custom-scripts/sentinel-2/composites/';
  const link2 = 'https://www.usgs.gov/media/images/common-landsat-band-rgb-composites';

  return (
    <React.Fragment>
      <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnRight">
        <ReactMarkdown linkTarget="_blank">
          {t`By using different spectral bands in the different colour channels (RGB) of an image, certain
          features can be emphasised in the data.\n\nPopular RGB composites are True Colour (red, blue and green
          bands) or False Colour (near-infrared, red and green bands).\n\nMore info [here](${link1}) or [here](${link2}).`}
        </ReactMarkdown>
      </HelpTooltip>
      <p>{areBandsClasses ? t`Drag classes onto RGB fields.` : t`Drag bands onto RGB fields.`}</p>
      <div className="colors-container">
        {bands.map((band, i) => (
          <DraggableBand key={i} band={band} value={value} onChange={onChange} />
        ))}
        <DraggableBandGhost bands={bands} />
      </div>
      <div className="colors-output">
        {['r', 'g', 'b'].map((bandName, i) => (
          <SelectedBand key={i} bands={bands} value={value} bandName={bandName} showName />
        ))}
      </div>
    </React.Fragment>
  );
};
