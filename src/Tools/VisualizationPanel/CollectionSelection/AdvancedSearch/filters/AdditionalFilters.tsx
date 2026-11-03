import React, { ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { t } from 'ttag';

import { ADDITIONAL_FILTERS_ENABLED } from '../const';
import useWindowSize from '../../../../../hooks/useWindowSize';
import styleVariables from '../../../../../variables.module.scss';
import {
  ADDITIONAL_FILTERS_EDGE_GAP,
  getAdditionalFiltersPanelStyle,
} from './additionalFiltersPanelPosition';

import './AdditionalFilters.scss';

const toolsWidth = parseInt(styleVariables.toolsWidth, 10);
const additionalFiltersPanelWidth = parseInt(styleVariables.additionalFiltersPanelWidth, 10);

interface AdditionalFilter {
  id: string;
  render: (args: {
    input: AdditionalFilter;
    value: unknown;
    onChange: (value: unknown) => void;
    userToken?: string;
  }) => ReactNode;
  [key: string]: unknown;
}

interface AdditionalFiltersProps {
  collectionId: string;
  title: string;
  onClose: () => void;
  onReset: () => void;
  selectedFilters?: Record<string, unknown>;
  onChange: (collectionId: string, filterId: string, value: unknown) => void;
  allFilters?: AdditionalFilter[];
  positionTop: number;
  userToken?: string;
}

// The panel must end above the map attribution bar; without one, above the bottom of the window.
const getBottomLimit = (windowHeight: number) => {
  const attribution = document.querySelector('#map .leaflet-control-attribution');
  const bottom = attribution ? attribution.getBoundingClientRect().top : windowHeight;
  return bottom - ADDITIONAL_FILTERS_EDGE_GAP;
};

const AdditionalFilters = ({
  collectionId,
  title,
  onClose,
  onReset,
  selectedFilters,
  onChange,
  allFilters,
  positionTop,
  userToken,
}: AdditionalFiltersProps) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(0);
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  useLayoutEffect(() => {
    const content = contentRef.current;
    const filters = filtersRef.current;
    if (!content || !filters) {
      return;
    }
    // Natural height: content's scrollHeight is unaffected by the panel's own max-height.
    const measure = () =>
      setPanelHeight(
        (headerRef.current?.offsetHeight ?? 0) +
          content.scrollHeight +
          (footerRef.current?.offsetHeight ?? 0),
      );
    measure();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    // The filters wrapper keeps its natural size even when the content is capped and scrolls,
    // so it also reports filters that grow or are added after mount.
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(filters);
    return () => resizeObserver.disconnect();
  }, [collectionId]);

  if (!ADDITIONAL_FILTERS_ENABLED) {
    return null;
  }

  if (!allFilters) {
    return null;
  }

  const isNextToTools = windowWidth > toolsWidth + additionalFiltersPanelWidth;
  const style = isNextToTools
    ? getAdditionalFiltersPanelStyle({
        anchorTop: positionTop,
        panelHeight,
        bottomLimit: getBottomLimit(windowHeight),
      })
    : {};

  return (
    <div className="additional-filters" style={style}>
      <div className="header" ref={headerRef}>
        <div>{title}</div>
        <button type="button" className="close-btn" onClick={onClose} aria-label={t`Close`} title={t`Close`}>
          <i className="fa fa-times" aria-hidden="true" />
        </button>
      </div>
      <div className="content" ref={contentRef}>
        <div ref={filtersRef}>
          {allFilters.map((filterItem) =>
            filterItem.render({
              input: filterItem,
              value: selectedFilters?.[filterItem.id],
              onChange: (value) => onChange(collectionId, filterItem.id, value),
              userToken: userToken,
            }),
          )}
        </div>
      </div>
      <div className="footer" ref={footerRef}>
        <button type="button" className="reset-btn" onClick={onReset}>
          {t`Reset filters`}
        </button>
      </div>
    </div>
  );
};

export default AdditionalFilters;
