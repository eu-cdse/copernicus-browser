import React from 'react';
import { t } from 'ttag';
import Select from 'react-select';

import Legend from '../Tools/VisualizationPanel/Legend';
import { WmsStyle } from './externalLayers.utils';
import { customSelectStyle } from '../components/CustomSelectInput/CustomSelectStyle';
import { CustomDropdownIndicator } from '../components/CustomSelectInput/CustomDropdownIndicator';

const wmsStyleSelectStyle = {
  ...customSelectStyle,
  control: (css) => ({
    ...customSelectStyle.control(css),
    paddingRight: '4px',
  }),
};

interface Props {
  detailsOpen: boolean;
  legendUrl?: string;
  abstract?: string;
  styles?: WmsStyle[] | null;
  selectedStyle?: string | null;
  onStyleChange?: (styleName: string) => void;
}

// Collapsible details for an external WMS/WMTS layer row. Mirrors the non-WMS
// src/Tools/VisualizationPanel/VisualizationLayer/LayerDetails.jsx pattern: renders nothing when
// collapsed, otherwise shows the layer's legend (reusing the shared Legend component, which renders
// an image legendUrl via LegendFromUrl with a spinner + hide-on-error) plus the full abstract.
// Scoped under .external-wms-layer-details (not .layer-details) so VisualizationPanel-specific
// layout rules don't leak onto the WMS rows.
const ExternalWmsLayerDetails = ({
  detailsOpen,
  legendUrl,
  abstract,
  styles,
  selectedStyle,
  onStyleChange,
}: Props) => {
  if (!detailsOpen) {
    return null;
  }
  // A single style is the layer's only rendering, so there is nothing to choose between — only
  // offer the picker when the server advertises more than one.
  const styleOptions =
    styles && styles.length > 1 ? styles.map((s) => ({ value: s.name, label: s.title || s.name })) : null;
  return (
    <div className="external-wms-layer-details" onClick={(e) => e.stopPropagation()}>
      {styleOptions && (
        <div className="external-wms-layer-styles">
          <div className="external-wms-layer-styles-label">{t`Available layer styles`}</div>
          <Select
            value={styleOptions.find((o) => o.value === selectedStyle) ?? styleOptions[0]}
            options={styleOptions}
            onChange={(opt) => opt && onStyleChange?.(opt.value)}
            styles={wmsStyleSelectStyle}
            menuPosition="fixed"
            menuShouldBlockScroll={true}
            menuPlacement="auto"
            isSearchable={false}
            className="wms-style-select-dropdown"
            classNamePrefix="wms-style-select"
            components={{ DropdownIndicator: CustomDropdownIndicator }}
          />
        </div>
      )}
      {legendUrl && <Legend legendUrl={legendUrl} />}
      {abstract && <div className="external-wms-layer-details-abstract">{abstract}</div>}
    </div>
  );
};

export default ExternalWmsLayerDetails;
