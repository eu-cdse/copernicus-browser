import React, { useEffect, useState } from 'react';
import range from 'lodash/range';
import { t } from 'ttag';

import { getShortMonth } from '../EOBDatePicker/MomentLocaleUtils';
import CustomCheckbox from '../../../components/CustomCheckbox/CustomCheckbox';

import './EOBFilterSearchByMonths.scss';

const EOBFilterSearchByMonths = (props) => {
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState(undefined);
  const { isDisabled, onChange } = props;

  useEffect(() => {
    setSelectedMonths(isFiltering && !isDisabled ? new Set(range(12)) : undefined);
  }, [isFiltering, isDisabled]);

  useEffect(
    () => onChange(selectedMonths ? Array.from(selectedMonths) : selectedMonths),
    [selectedMonths, onChange],
  );

  const handleFilterCheckboxChange = () => setIsFiltering(!isFiltering);

  const toggleMonth = (monthIndex) => {
    setSelectedMonths((prevSelectedMonths) => {
      const newValue = new Set(prevSelectedMonths);
      newValue.has(monthIndex) ? newValue.delete(monthIndex) : newValue.add(monthIndex);
      return newValue;
    });
  };

  return (
    <div className={`filter-search-by-months ${isDisabled ? 'disabled' : ''}`}>
      <CustomCheckbox
        value="filter-by-months"
        checked={isFiltering}
        onChange={handleFilterCheckboxChange}
        label={t`Filter by months`}
      />

      {isFiltering && (
        <div className="months">
          {range(12).map((monthIndex) => (
            <CustomCheckbox
              key={monthIndex}
              value={monthIndex}
              checked={selectedMonths?.has(monthIndex)}
              onChange={() => toggleMonth(monthIndex)}
              label={getShortMonth(monthIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EOBFilterSearchByMonths;
