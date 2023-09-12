import React from 'react';
import { t } from 'ttag';

import { ReactComponent as PencilIcon } from './icons/pencil-icon.svg';

const BLOCKABLE_OUTSIDE_EVENTS = ['click', 'mousedown', 'mouseup', 'touch', 'touchstart', 'touchend'];

class EditableString extends React.Component {
  outerSpanRef = null;

  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      newText: null,
    };
    this.outerSpanRef = React.createRef();
  }

  startEditing() {
    BLOCKABLE_OUTSIDE_EVENTS.forEach((evType) => {
      window.addEventListener(evType, this.onOutsideEvent, true);
    });
    this.setState({
      editing: true,
      newText: this.props.text,
    });
  }

  stopEditing(doSave = false) {
    BLOCKABLE_OUTSIDE_EVENTS.forEach((evType) => {
      window.removeEventListener(evType, this.onOutsideEvent, true);
    });
    if (doSave) {
      this.props.onEditSave(this.state.newText);
    }
    this.setState({
      editing: false,
      newText: null,
    });
  }

  onEditClick = (ev) => {
    ev.stopPropagation();
    this.startEditing();
  };

  onOutsideEvent = (ev) => {
    if (this.outerSpanRef.current.contains(ev.target)) {
      return; // this is not an outside event, ignore it
    }

    // we want to cancel all "blockable" events:
    ev.stopPropagation();
    ev.preventDefault();

    // Outside click actually triggers a series of events (mousedown, mouseup, click). We want to
    // keep capturing them until the last one, which is 'click' (both for mouse and touch events).
    if (ev.type === 'click') {
      // 'click' is the last event both for mouse and touch events
      this.stopEditing(false);
    }
  };

  onTextChange = (ev) => {
    this.setState({
      newText: ev.target.value,
    });
  };

  onKeyUp = (ev) => {
    switch (ev.keyCode) {
      case 13: // Enter
        ev.stopPropagation();
        ev.preventDefault();
        this.stopEditing(true);
        return;
      case 27: // Esc
        ev.stopPropagation();
        ev.preventDefault();
        this.stopEditing(false);
        return;
      default:
        break;
    }
  };

  onFocus = (ev) => {
    ev.target.select();
  };

  onSaveClick = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    this.stopEditing(true);
  };

  onCancelClick = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    this.stopEditing(false);
  };

  stopEventPropagation = (ev) => {
    ev.stopPropagation();
  };

  render() {
    return (
      <div
        className="pin-editable-title"
        ref={this.outerSpanRef}
        onClick={this.state.editing ? this.stopEventPropagation : null}
      >
        <div className="pin-title-text">
          {this.state.editing ? (
            <input
              type="text"
              className="clickable"
              value={this.state.newText}
              onChange={this.onTextChange}
              onKeyUp={this.onKeyUp}
              autoFocus={true}
              onFocus={this.onFocus}
            />
          ) : this.state.newText ? (
            this.state.newText.length < 70 ? (
              this.state.newText
            ) : (
              this.state.newText.substring(0, 70) + '...'
            )
          ) : this.props.text.length < 70 ? (
            this.props.text
          ) : (
            this.props.text.substring(0, 70) + '...'
          )}
        </div>
        <div className="pin-edit-controls" title={t`Rename pin`}>
          {this.state.editing ? (
            <React.Fragment>
              <div className="clickable cancel" title={t`Reject changes`} onClick={this.onCancelClick}>
                <i className="fa fa-close" />
              </div>
              <div className="clickable confirm" title={t`Confirm changes`} onClick={this.onSaveClick}>
                <i className="fa fa-check" />
              </div>
            </React.Fragment>
          ) : (
            <span onClick={this.onEditClick}>
              <PencilIcon />
            </span>
          )}
        </div>
      </div>
    );
  }
}

export default EditableString;
