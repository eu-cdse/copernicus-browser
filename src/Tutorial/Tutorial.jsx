import React, { Component } from 'react';
import Joyride, { ACTIONS, EVENTS } from 'react-joyride';
// import { TUTORIAL_STEPS, TUTORIAL_STEPS_MOBILE } from './TutorialContent';
import { t } from 'ttag';
import ReactMarkdown from 'react-markdown';

import { localeNames, tutorialStyles } from './TutorialContent';

import './Tutorial.scss';

const SHOW_TUTORIAL_LC = 'cdsebrowser_show_tutorial';
const ROADMAP_URL = 'https://documentation.dataspace.copernicus.eu/Roadmap.html';

const infoMd = () => t`# Welcome to the Browser!

Use **Visualize** to interactively browse, analyze and process satellite imagery, including the complete archive of Sentinel data with other collections alongside, and **Search** to find or download products from various satellite missions.

These options will be expanded in the future, so check back regularly and keep up to date with the [Roadmap](${ROADMAP_URL}).
`;

class Tutorial extends Component {
  static defaultProps = {
    joyride: {},
  };

  TutorialComponent = ({
    tooltipProps,
    backProps,
    closeProps,
    index,
    isLastStep,
    primaryProps,
    size,
    skipProps,
    step,
  }) => (
    <div className="tutorial-wrap" {...tooltipProps}>
      <div className="tutorial-body">
        <button type="button" className="close-cross" onClick={closeProps.onClick} title={t`Close`}>
          <span className="rodal-close" />
        </button>
        <h4 className="tutorial-title">{step.title}</h4>
        <div className="content-wrapper">{step.content}</div>
        <div className="tutorial-firstpage-footer">
          <button
            type="button"
            className="tutorial-button tutorial-firstpage-closebutton"
            title={t`OK`}
            onClick={this.handleCloseFirstStep}
          >
            {t`OK`}
          </button>
        </div>
      </div>
    </div>
  );

  constructor(props) {
    super(props);
    this.state = {
      run: false,
      stepIndex: 0, // a controlled tutorial
    };
  }

  componentDidMount() {
    const showTutorialVal = window.localStorage.getItem(SHOW_TUTORIAL_LC);
    const showTutorialBool = showTutorialVal ? showTutorialVal === 'true' : true;
    if (showTutorialBool && !this.props.popupDisabled) {
      this.setState({ run: true });
    }
    this.setTutorialContent();
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedLanguage !== prevProps.selectedLanguage) {
      this.setTutorialContent();
    }
  }

  setTutorialContent() {
    this.setState({
      steps: [
        {
          content: (
            <div className="content-div-style" style={{ textAlign: 'center', paddingBottom: '30px' }}>
              <ReactMarkdown children={infoMd()} linkTarget="_blank" />
            </div>
          ),
          target: 'body',
          placement: 'center',
          disableBeacon: true,
          styles: tutorialStyles,
          locale: localeNames,
        },
      ],
    });
  }

  callback = (tour) => {
    const { action, index, size, type } = tour;

    // controlled tutorial
    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type) && action !== ACTIONS.CLOSE) {
      // go forward or backward
      this.setState({ stepIndex: index + (action === ACTIONS.PREV ? -1 : 1) });
    } else if (
      (action === ACTIONS.CLOSE && type === EVENTS.STEP_AFTER) ||
      (action === ACTIONS.SKIP && type === EVENTS.TOUR_END)
    ) {
      // [x] or 'skip' (close) clicked, stay on same step
      this.setState({ run: false });
    } else if (action === ACTIONS.NEXT && type === EVENTS.TOUR_END) {
      // 'end tutorial' clicked, reset to step 0
      this.setState({ run: false, stepIndex: 0 });
    }

    if (
      ((action === ACTIONS.CLOSE && type === EVENTS.STEP_AFTER) ||
        (action === ACTIONS.NEXT && type === EVENTS.TOUR_END)) &&
      (index !== 0 || size === 1)
    ) {
      window.localStorage.setItem(SHOW_TUTORIAL_LC, false);
    } else if (action === ACTIONS.SKIP && type === EVENTS.TOUR_END) {
      window.localStorage.setItem(SHOW_TUTORIAL_LC, true);
    }
  };

  handleStartTutorial = (e) => {
    e.preventDefault();
    this.setState({ run: true });
  };

  handleCloseFirstStep = (e) => {
    e.preventDefault();
    this.setState({ run: false });
    window.localStorage.setItem(SHOW_TUTORIAL_LC, false);
  };

  render() {
    return (
      <div>
        <Joyride
          continuous
          scrollToFirstStep
          steps={this.state.steps}
          run={this.state.run}
          callback={this.callback}
          stepIndex={this.state.stepIndex}
          tooltipComponent={this.TutorialComponent}
          floaterProps={{
            styles: {
              floater: { transition: 'opacity 0.4s ease-in-out' },
              floaterWithAnimation: { transition: 'opacity 0.4s ease-in-out' },
            },
          }}
        />
      </div>
    );
  }
}

export default Tutorial;
