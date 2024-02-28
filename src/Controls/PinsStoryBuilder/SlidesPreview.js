import React from 'react';

import SlideshowControls from './SlideshowControls';

export default class SlidesPreview extends React.Component {
  state = {
    slideshowIndex: 0,
    isPlaying: false,
  };
  intervalHandle = null;

  componentDidUpdate(prevProps, prevState) {
    // when isPlaying or some animation parameter changes, reset the animation timer:
    if (prevState.isPlaying !== this.state.isPlaying || prevProps.speedFps !== this.props.speedFps) {
      if (prevState.isPlaying) {
        clearInterval(this.intervalHandle);
        this.intervalHandle = null;
      }
      if (this.state.isPlaying) {
        const interval = Math.round(1000 / this.props.speedFps);
        this.intervalHandle = setInterval(this.incrementSlideshowIndex, interval);
      }
    }
  }

  componentWillUnmount() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }
  }

  static getDerivedStateFromProps(props, state) {
    // when number of slides changes, make sure that slideshowIndex still makes sense:
    if (state.slideshowIndex >= props.selectedSlides.length) {
      return {
        slideshowIndex: Math.max(props.selectedSlides.length - 1, 0),
      };
    }
    return {};
  }

  incrementSlideshowIndex = () => {
    const nSlides = this.props.selectedSlides.length;
    this.setState((prevState) => ({
      slideshowIndex: nSlides > 0 ? (prevState.slideshowIndex + 1) % nSlides : 0,
    }));
  };

  handleSlideshowIndexChange = (newIndex) => {
    this.setState({
      slideshowIndex: newIndex,
    });
  };

  togglePlay = () => {
    this.setState((prevState) => ({
      isPlaying: !prevState.isPlaying,
    }));
  };

  stopPlay = () => {
    this.setState({ isPlaying: false });
  };

  updateSlideshowIndex = (value) => {
    this.setState({ slideshowIndex: value });
  };

  render() {
    const { selectedSlides, images, updateSpeedFps, speedFps, imageWidth, imageHeight } = this.props;
    const { slideshowIndex, isPlaying } = this.state;

    if (!selectedSlides || selectedSlides.length === 0) {
      return <div className="slides-preview" />;
    }

    const slideId = selectedSlides[slideshowIndex].id;
    return (
      <div className="slides-preview">
        <img
          alt=""
          src={images[slideId]}
          width={imageWidth / 2}
          height={imageHeight / 2}
          onClick={this.togglePlay}
        />

        <SlideshowControls
          togglePlay={this.togglePlay}
          isPlaying={isPlaying}
          speedFps={speedFps}
          updateSpeedFps={updateSpeedFps}
          slideshowIndex={slideshowIndex}
          nSlides={selectedSlides.length}
          currentSlideLabel={selectedSlides[slideshowIndex].title}
          onSlideshowIndexChange={this.updateSlideshowIndex}
          stopPlay={this.stopPlay}
        />
      </div>
    );
  }
}
