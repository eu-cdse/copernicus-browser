import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';
import Tooltip from 'react-tooltip-lite';
import './HelpTooltip.scss';

class HelpTooltip extends Component {
  state = {
    opened: false,
  };

  toggleTooltip = () => {
    this.setState((oldState) => ({
      opened: !oldState.opened,
    }));
  };

  handleClickOutside = (e) => {
    const clickIsInside = Array.from(document.querySelectorAll('[class^="react-tooltip-lite"]')).some(
      (elem) => elem.contains(e.target),
    );
    if (this.props.closeOnClickOutside && !clickIsInside) {
      this.setState({
        opened: false,
      });
    }
  };

  render() {
    return (
      <Tooltip
        isOpen={this.state.opened}
        tagName="span"
        direction={this.props.direction}
        content={this.props.children}
        className={`help-tooltip ${this.props.className} ${this.state.opened ? 'opened' : 'closed'}`}
      >
        <span onClick={this.toggleTooltip} className="help-tooltip-icon">
          <i className="fa fa-info-circle" />
        </span>
      </Tooltip>
    );
  }
}

export default onClickOutside(HelpTooltip);
