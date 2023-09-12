import * as React from 'react';

/**
 * Rail
 */
const railOuterStyle = {
  width: '100%',
  borderRadius: 7,
  cursor: 'pointer',
};

const railInnerStyle = {
  position: 'absolute',
  width: '100%',
  height: 34,
  pointerEvents: 'none',
};

export const SliderRail = ({ getRailProps, gradient }) => {
  return (
    <>
      <div style={railOuterStyle} {...getRailProps()} />
      <div style={{ ...railInnerStyle, background: gradient }} />
    </>
  );
};

/**
 * Keyboard handle component
 * Uses a button to allow keyboard events
 */
export const KeyboardHandle = ({
  domain: [min, max],
  handle: { id, value, percent },
  disabled = false,
  getHandleProps,
  pointingToColor,
  rampValue,
}) => {
  return (
    <button
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      className="slider-keyboard-handle"
      style={{
        left: `${percent}%`,
        position: 'absolute',
        padding: 0,
        zIndex: 2,
        marginTop: -9,
        marginLeft: -10,
        width: 20,
        height: 20,
        cursor: 'pointer',
        //borderColor: `${pointingToColor}`,
        borderRadius: '50%',
        border: `2px solid rgba(255, 255, 255, 1)`,
        boxShadow: `0 2px 4px rgba(0, 0, 0, 0.5)`,
        backgroundColor: `${pointingToColor}`,
      }}
      {...getHandleProps(id)}
    >
      <div
        style={{
          position: 'relative',
          height: 0,
          marginTop: 16,
          marginBottom: 8,
          width: 0,
          opacity: 1,
          marginLeft: 2,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '10px solid white',
        }}
      />
      <div className="handle-value">{rampValue}</div>
    </button>
  );
};

/**
 * Track Component
 */
export const Track = ({ source, target, getTrackProps, disabled = false, first, last }) => {
  return (
    <React.Fragment>
      {first && (
        <div
          style={{
            position: 'absolute',
            height: 34,
            zIndex: 1,
            cursor: 'pointer',
            backgroundColor: 'black',
            opacity: 0,
            left: 0,
            width: `${source.percent}%`,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          height: 30,
          zIndex: 1,
          cursor: 'pointer',
          left: `${source.percent}%`,
          width: `${target.percent - source.percent}%`,
        }}
        {...getTrackProps()}
      />
      {last && (
        <div
          style={{
            position: 'absolute',
            height: 34,
            zIndex: 1,
            cursor: 'pointer',
            backgroundColor: 'black',
            opacity: 0,
            right: 0,
            width: `${100 - target.percent}%`,
          }}
        />
      )}
    </React.Fragment>
  );
};
