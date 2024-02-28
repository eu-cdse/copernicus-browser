import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';
import Tooltip from 'react-tooltip-lite';

import './CollectionTooltip.scss';

class CollectionTooltipContainer extends Component {
  state = {
    isOpened: false,
  };

  toggleTooltip = () => {
    this.setState((oldState) => ({
      isOpened: !oldState.isOpened,
    }));
  };

  handleClickOutside = (e) => {
    const { closeOnClickOutside } = this.props;
    const tooltipClassName = 'react-tooltip-lite';
    const clickIsInside = Array.from(document.querySelectorAll(`[class^="${tooltipClassName}"]`)).some(
      (elem) => elem.contains(e.target),
    );
    if (closeOnClickOutside && !clickIsInside) {
      this.setState({
        isOpened: false,
      });
    }
  };

  render() {
    const { isOpened } = this.state;
    const { direction, children, className } = this.props;

    return (
      <Tooltip
        isOpen={isOpened}
        tagName="div"
        direction={direction}
        content={children}
        className={`collection-tooltip ${className} ${isOpened ? 'opened' : 'closed'}`}
      >
        <div onClick={this.toggleTooltip} className="collection-tooltip-icon">
          <i className="fa fa-info"></i>
        </div>
      </Tooltip>
    );
  }
}

export default onClickOutside(CollectionTooltipContainer);
