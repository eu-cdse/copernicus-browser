import React from 'react';
import ReactMarkdown from 'react-markdown';
import HelpTooltip from '../../Tools/SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/HelpTooltip';
import { REACT_MARKDOWN_REHYPE_PLUGINS } from '../../rehypeConfig';

import { isFunction } from '../../utils';

import './RadioButton.scss';

const RadioButton = ({
  name,
  value,
  checked,
  className,
  style,
  onChange,
  label,
  disabled = false,
  getTooltipContent = undefined,
  title = undefined,
}) => {
  return (
    <div className={'radio-button' + (disabled ? ' disabled' : '')} title={title}>
      <label className={className} style={style}>
        {label}
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
      </label>
      {getTooltipContent && isFunction(getTooltipContent) && (
        <HelpTooltip direction="right" closeOnClickOutside={true}>
          <ReactMarkdown rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}>{getTooltipContent()}</ReactMarkdown>
        </HelpTooltip>
      )}
    </div>
  );
};

export default RadioButton;
