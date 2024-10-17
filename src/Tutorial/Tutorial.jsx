import React, { useEffect, useState } from 'react';
import { t } from 'ttag';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';

import TutorialComponent from './TutorialComponent';
import { TUTORIAL_STEPS, TUTORIAL_STEPS_MOBILE } from './TutorialContent';

import './Tutorial.scss';
import { SHOW_TUTORIAL_LC } from '../const';

const Tutorial = ({ selectedLanguage }) => {
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [shouldRun, setShouldRun] = useState(null);

  useEffect(() => {
    const showTutorialVal = window.localStorage.getItem(SHOW_TUTORIAL_LC);
    const shouldShowTutorial = showTutorialVal ? showTutorialVal === 'true' : true;
    if (shouldShowTutorial) {
      setShouldRun(true);
    }
    setTutorialContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTutorialContent();
  }, [selectedLanguage]);

  const setTutorialContent = () => {
    setSteps(window.innerWidth > 900 ? TUTORIAL_STEPS() : TUTORIAL_STEPS_MOBILE());
  };

  const handleStartTutorial = (e) => {
    e.preventDefault();
    setShouldRun(true);
  };

  const callback = (tour) => {
    const { action, index, type, status } = tour;

    if (
      [EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type) &&
      action !== ACTIONS.CLOSE &&
      status !== STATUS.PAUSED
    ) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    } else if (action === ACTIONS.CLOSE && type === EVENTS.STEP_AFTER) {
      setStepIndex(0);
      setShouldRun(false);
    } else if (action === ACTIONS.SKIP && type === EVENTS.TOUR_END) {
      setShouldRun(false);
    }

    if (action === ACTIONS.CLOSE && type === EVENTS.STEP_AFTER) {
      window.localStorage.setItem(SHOW_TUTORIAL_LC, false);
    } else if (action === ACTIONS.SKIP && type === EVENTS.TOUR_END) {
      window.localStorage.setItem(SHOW_TUTORIAL_LC, true);
    }
  };

  return (
    <div>
      <div
        id="tutorial-animatedinfopanel-button"
        className={`tutorial-panel-button ${shouldRun === false ? 'activate-close-animation' : ''}`}
        title={t`Show tutorial`}
      >
        <span>
          <i className="fa fa-info" />
        </span>
      </div>

      <div
        id="infoButton"
        className="tutorial-infopanel-button tutorial-panel-button"
        title={t`Show tutorial`}
        onClick={handleStartTutorial}
      >
        <span>
          <i className="fa fa-info" />
        </span>
      </div>
      <Joyride
        continuous
        scrollToFirstStep
        steps={steps}
        run={shouldRun}
        callback={callback}
        stepIndex={stepIndex}
        tooltipComponent={TutorialComponent}
        floaterProps={{
          styles: {
            floater: { transition: 'opacity 0.4s ease-in-out' },
            floaterWithAnimation: { transition: 'opacity 0.4s ease-in-out' },
          },
        }}
      />
    </div>
  );
};

export default Tutorial;
