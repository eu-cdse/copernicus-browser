import React from 'react';
import { t } from 'ttag';
import RCSlider from 'rc-slider';

export default class SlideshowControls extends React.Component {
  updateSpeedFps = (ev) => {
    const x = parseInt(ev.target.value);
    this.props.updateSpeedFps(x);
  };

  render() {
    const {
      togglePlay,
      isPlaying,
      speedFps,
      slideshowIndex,
      nSlides,
      currentSlideLabel,
      onSlideshowIndexChange,
      stopPlay,
    } = this.props;
    return (
      <div className="controls">
        <button className="play-pause" onClick={togglePlay}>
          <i className={`fa ${isPlaying ? 'fa-pause' : 'fa-play'}`} />
        </button>

        <span className="interval-panel">
          <label>{t`Speed:`}</label>
          <input value={`${speedFps}`} onChange={this.updateSpeedFps} type="number" min={1} max={10} />{' '}
          <span>{t`frames / s`}</span>
        </span>

        <RCSlider
          min={0}
          disabled={nSlides === 0}
          max={nSlides - 1}
          step={1}
          onBeforeChange={stopPlay}
          onChange={onSlideshowIndexChange}
          value={slideshowIndex}
          tipFormatter={(value) => currentSlideLabel}
          className="timeline-slider"
        />

        <small className="timeline-label">
          {slideshowIndex + 1} / {nSlides}: {currentSlideLabel}
        </small>
      </div>
    );
  }
}
