import React from 'react';
import './Accordion.scss';

export default class Accordion extends React.PureComponent {
  render() {
    const { title, children, open, toggleOpen, hidden, disabled = false } = this.props;

    return (
      <div className="accordion-wrap">
        <div
          className={`${open ? 'accordion-title open ' : 'accordion-title '} ${disabled ? 'disabled' : ''}`}
          onClick={!disabled ? toggleOpen : null}
        >
          {title}
          {open && !hidden ? <i className="fa fa-chevron-up" /> : <i className="fa fa-chevron-down" />}
        </div>
        {open && <div className={`accordion-content ${hidden ? 'hidden' : ''} `}>{children}</div>}
      </div>
    );
  }
}
