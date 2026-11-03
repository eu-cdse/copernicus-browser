import React from 'react';
import CollectionTooltip from '../../CollectionTooltip/CollectionTooltip';
import { SearchableSelect } from '../../../../../components/SearchableSelect/SearchableSelect';
import { defaultMultiTermFilterOption } from '../../../../../components/SearchableSelect/searchableSelect.utils';

// Above the tools panel (z-index 500), matching the portaled select in ProductInfo.
const MENU_PORTAL_Z_INDEX = 9999;

interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableMultiSelectInputProps {
  input: {
    id: string;
    title?: string;
    tooltip?: string;
    getOptions: (args: { userToken?: string }) => SearchableSelectOption[];
  };
  value?: SearchableSelectOption[];
  onChange: (value: SearchableSelectOption[]) => void;
  titleEnabled?: boolean;
  userToken?: string;
}

export const SearchableMultiSelectInput = ({
  input,
  value = [],
  onChange,
  titleEnabled = true,
  userToken,
}: SearchableMultiSelectInputProps) => {
  const options = input?.getOptions({ userToken }) ?? [];

  return (
    <div key={`${input.id}`} className="filter-item searchable-multiselect">
      {titleEnabled && (
        <div className="title">
          <span>{input.title}</span>
          {!!input.tooltip && (
            <CollectionTooltip source={input.tooltip} className={'filter-item-tooltip'}></CollectionTooltip>
          )}
        </div>
      )}
      <div className="content">
        <SearchableSelect
          isMulti
          options={options}
          value={value}
          onChange={onChange}
          filterOption={defaultMultiTermFilterOption}
          // The filters panel scrolls its content, which would clip an inline menu.
          menuPortalTarget={document.body}
          menuPortalZIndex={MENU_PORTAL_Z_INDEX}
        />
      </div>
    </div>
  );
};
