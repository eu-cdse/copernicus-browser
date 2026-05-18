import React, { Component, createRef } from 'react';

interface KeyboardHandleProps {
  offset: number;
  pointingToColor?: string;
  rampValue: number;
  tabIndex?: number;
}

// Must remain a class component: rc-slider v8 calls findDOMNode(ref) inside
// isEventFromHandle, which only works on class component instances. Converting
// to a functional component with forwardRef would break keyboard navigation.
export class KeyboardHandle extends Component<KeyboardHandleProps> {
  private divRef = createRef<HTMLDivElement>();

  clickFocus() {
    this.divRef.current?.focus();
  }

  focus() {
    this.divRef.current?.focus();
  }

  render() {
    const { offset, pointingToColor, rampValue, tabIndex } = this.props;

    return (
      <div
        ref={this.divRef}
        tabIndex={tabIndex ?? 0}
        onMouseDown={(e) => e.preventDefault()}
        className="slider-keyboard-handle"
        style={{
          left: `${offset}%`,
          position: 'absolute',
          zIndex: 2,
          marginTop: -9,
          marginLeft: -10,
          width: 20,
          height: 20,
          cursor: 'pointer',
          borderRadius: '50%',
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
          backgroundColor: pointingToColor,
        }}
      >
        <div
          style={{
            position: 'relative',
            height: 0,
            marginTop: 16,
            marginBottom: 8,
            width: 0,
            marginLeft: 2,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '10px solid white',
            pointerEvents: 'none',
          }}
        />
        <div className="handle-value" style={{ pointerEvents: 'none' }}>
          {rampValue}
        </div>
      </div>
    );
  }
}
