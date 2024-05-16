import { t } from 'ttag';

import ArrowSvg from '../../../../../icons/arrow.svg?react';
import { ADDITIONAL_FILTERS_ENABLED } from './AdditionalFilters.utils';
import { useLayoutEffect, useRef } from 'react';
import { connect } from 'react-redux';

const AdditionalFiltersToggle = ({
  isSelected,
  isDisplayed,
  onOpen,
  scrollTop,
  selectedCollections,
  setAdditionalFiltersPositionTop,
  disabled,
}) => {
  const filterButtonRef = useRef(null);

  useLayoutEffect(() => {
    if (isDisplayed) {
      setAdditionalFiltersPositionTop(filterButtonRef.current.getBoundingClientRect().top);
    }
  }, [isDisplayed, selectedCollections, scrollTop, setAdditionalFiltersPositionTop]);

  if (!ADDITIONAL_FILTERS_ENABLED) {
    return null;
  }

  return (
    <div
      ref={filterButtonRef}
      className={`additional-filters-toggle button ${isSelected ? 'selected' : ''} ${
        disabled ? 'disabled' : ''
      }`}
      onClick={disabled ? null : onOpen}
    >
      <div>{t`Filters`}</div>
      <ArrowSvg />
    </div>
  );
};

const mapStoreToProps = (store) => ({
  scrollTop: store.tabs.scrollTop,
});

export default connect(mapStoreToProps, null)(AdditionalFiltersToggle);
