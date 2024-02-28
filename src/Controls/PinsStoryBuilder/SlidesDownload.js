import React from 'react';
import gifshot from 'gifshot';
import FileSaver from 'file-saver';
import { t } from 'ttag';
import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';

class SlidesDownload extends React.Component {
  state = {
    preparingGif: false,
    error: null,
  };

  createGif = () => {
    const { selectedSlides, images, imageWidth, imageHeight, speedFps, fileName = 'timelapse' } = this.props;

    if (!selectedSlides || selectedSlides.length === 0) {
      return;
    }

    this.setState({ error: null, preparingGif: true });
    gifshot.createGIF(
      {
        images: selectedSlides.map((s) => images[s.id]),
        interval: 1 / speedFps,
        gifWidth: imageWidth,
        gifHeight: imageHeight,
        numWorkers: 4,
        progressCallback: (progress) => {
          this.setState({ gifCreationProgress: Math.round(progress * 100) });
        },
      },
      (obj) => {
        if (obj.error) {
          this.setState({
            error: obj.error,
            preparingGif: false,
          });
          return;
        }
        this.setState({
          preparingGif: false,
          gifCreationProgress: null,
        });
        FileSaver.saveAs(obj.image, `${fileName.replace(' ', '_')}.gif`);
      },
    );
  };

  render() {
    const { selectedSlides } = this.props;
    const { preparingGif, error, gifCreationProgress } = this.state;

    const buttonDisabled = !selectedSlides || selectedSlides.length === 0;
    return (
      <div className="slides-download">
        <EOBButton
          onClick={this.createGif}
          icon="download"
          loading={preparingGif}
          disabled={buttonDisabled}
          text={t`Download`}
          progress={gifCreationProgress}
        />
        {error && (
          <div className="error">
            <i className="fa fa-exclamation-triangle" /> {error}
          </div>
        )}
      </div>
    );
  }
}

export default SlidesDownload;
