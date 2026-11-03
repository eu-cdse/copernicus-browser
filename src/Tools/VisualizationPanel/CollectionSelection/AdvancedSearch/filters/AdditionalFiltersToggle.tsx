import React, { useLayoutEffect, useRef } from 'react';
import { t } from 'ttag';

import { ADDITIONAL_FILTERS_ENABLED } from '../const';
import { useAppSelector } from '../../../../../hooks';

interface AdditionalFiltersToggleProps {
  isSelected: boolean;
  isDisplayed: boolean;
  onOpen: () => void;
  // Not read here; a change re-measures the toggle, as the rows above it may have grown or shrunk.
  selectedCollections: Record<string, unknown>;
  setAdditionalFiltersPositionTop: (top: number) => void;
  disabled: boolean;
}

const AdditionalFiltersToggle = ({
  isSelected,
  isDisplayed,
  onOpen,
  selectedCollections,
  setAdditionalFiltersPositionTop,
  disabled,
}: AdditionalFiltersToggleProps) => {
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const scrollTop = useAppSelector((state) => state.tabs.scrollTop);

  useLayoutEffect(() => {
    if (isDisplayed && filterButtonRef.current) {
      setAdditionalFiltersPositionTop(filterButtonRef.current.getBoundingClientRect().top);
    }
  }, [isDisplayed, selectedCollections, scrollTop, setAdditionalFiltersPositionTop]);

  if (!ADDITIONAL_FILTERS_ENABLED) {
    return null;
  }

  return (
    <button
      type="button"
      ref={filterButtonRef}
      className={`additional-filters-toggle button ${isSelected ? 'selected' : ''}`}
      onClick={onOpen}
      disabled={disabled}
      aria-expanded={isSelected}
    >
      <i className="fa fa-filter" aria-hidden="true" />
      <span>{t`Filters`}</span>
    </button>
  );
};

export default AdditionalFiltersToggle;
