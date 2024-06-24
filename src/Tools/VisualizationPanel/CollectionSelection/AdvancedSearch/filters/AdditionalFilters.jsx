import React from 'react';
import { t } from 'ttag';

import ChevronCollapse from '../../../../../Tools/Header/chevron-collapse.svg?react';
import { ADDITIONAL_FILTERS_ENABLED } from './AdditionalFilters.utils';

import './AdditionalFilters.scss';
import { useEffect, useState } from 'react';
import useWindowSize from '../../../../../hooks/useWindowSize';

import { toolsWidth, additionalFiltersPanelWidth } from '../../../../../variables.module.scss';

const getNumValue = (pxValue) => parseInt(pxValue.replace(/px/));

const AdditionalFilters = ({
  collectionId,
  title,
  onClose,
  onReset,
  selectedFilters,
  onChange,
  allFilters,
  positionTop,
}) => {
  const [style, setStyle] = useState({});
  const { width: windowWidth } = useWindowSize();

  useEffect(() => {
    if (windowWidth > getNumValue(toolsWidth) + getNumValue(additionalFiltersPanelWidth)) {
      setStyle({ top: `${Math.max(positionTop, 120)}px` });
    } else {
      setStyle({});
    }
  }, [positionTop, windowWidth]);

  if (!ADDITIONAL_FILTERS_ENABLED) {
    return null;
  }

  if (!allFilters) {
    return null;
  }

  return (
    <div className="additional-filters" style={style}>
      <div className="header">
        <div>{title}</div>
        <ChevronCollapse onClick={onClose} />
      </div>
      <div className="content">
        {allFilters.map((filterItem) =>
          filterItem.render({
            input: filterItem,
            value: selectedFilters?.[filterItem.id],
            onChange: (value) => onChange(collectionId, filterItem.id, value),
          }),
        )}
      </div>
      <div className="footer">
        <span onClick={onReset}>{t`Reset filters`}</span>
      </div>
    </div>
  );
};

export default AdditionalFilters;
