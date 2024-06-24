import React from 'react';
import { t } from 'ttag';
import ReactMarkdown from 'react-markdown';
import ExternalLink from '../../../../../ExternalLink/ExternalLink';

const CopernicusGlobalSurfaceWaterMarkdown = () => t`
The **Global Surface Water** collection is derived from Landsat 5, 7 and 8 imagery and shows various aspects of the spatio-temporal distribution of surface water between 1984 and 2021 (with annual revisions) at a global scale in six different layers. Surface water is considered as any uncovered stretch of water (fresh and salt water areas) greater than 30m² visible from space, including natural and artificial water bodies. More information [here](https://collections.sentinel-hub.com/global-surface-water/).

**Coverage**: Global coverage from longitude 170°E to 180°W and latitude 80°N to 50°S.

**Data Availability**: 1984 - 2019, 1984 - 2020, 1984 - 2021.

**Spatial resolution**: 30 meters.

**Common Usage**: Monitoring of water bodies for water resource management, climate modelling, biodiversity conservation and food security.
`;

const CopernicusGlobalSurfaceWaterTooltip = () => (
  <div>
    <div className="data-source-group-tooltip-description">
      <ReactMarkdown children={CopernicusGlobalSurfaceWaterMarkdown()} linkTarget="_blank" />
    </div>
    <div className="data-source-group-tooltip-credits">
      <div>{t`Credits:`}</div>
      <div>
        <ExternalLink href="https://global-surface-water.appspot.com/#">
          European Commission, Joint Research Centre (JRC)
        </ExternalLink>
      </div>
    </div>
  </div>
);

export { CopernicusGlobalSurfaceWaterMarkdown, CopernicusGlobalSurfaceWaterTooltip };
