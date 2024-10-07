import React from 'react';
import ReactMarkdown from 'react-markdown';

import { tutorialLabels } from './TutorialContent';
import { REACT_MARKDOWN_REHYPE_PLUGINS } from '../rehypeConfig';

const TutorialComponent = ({
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
      <button type="button" className="close-cross" {...closeProps} title={tutorialLabels.close()}>
        <span className="rodal-close" />
      </button>
      <h4 className="tutorial-title">
        <ReactMarkdown
          children={step.title}
          rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}
          linkTarget="_blank"
        />
      </h4>
      <div className="content-wrapper">{step.content}</div>
      <div className="tutorial-footer">
        <div className="tutorial-big-buttons-wrapper">
          {index === 0 && (
            <>
              <button
                type="button"
                className="tutorial-button tutorial-closebutton"
                {...closeProps}
                title={tutorialLabels.dontShowAgain()}
              >
                {step.locale.dontShowAgain()}
              </button>

              <button
                type="button"
                className="tutorial-button tutorial-closebutton"
                {...skipProps}
                title={tutorialLabels.skip()}
              >
                {step.locale.skip()}
              </button>
            </>
          )}

          {index === size - 1 && size > 1 && (
            <>
              <button
                type="button"
                className="tutorial-button tutorial-closebutton"
                {...closeProps}
                title={tutorialLabels.close()}
              >
                {step.locale.close()}
              </button>
              <button
                type="button"
                className="tutorial-button tutorial-closebutton"
                {...closeProps}
                title={tutorialLabels.dontShowAgain()}
              >
                {step.locale.dontShowAgain()}
              </button>
            </>
          )}
        </div>

        {size > 1 && (
          <div className="tutorial-buttons">
            <span className="tutorial-page-index">
              {index + 1} / {size}
            </span>
            <button
              type="button"
              className="tutorial-button step"
              {...backProps}
              onClick={(e) => {
                backProps.onClick(e);
              }}
              disabled={index <= 0}
              title={tutorialLabels.previous()}
            >
              {step.locale.back()}
            </button>

            <button
              type="button"
              className="tutorial-button step"
              {...primaryProps}
              title={tutorialLabels.next()}
              disabled={isLastStep}
              onClick={(e) => {
                primaryProps.onClick(e);
              }}
            >
              {step.locale.next()}
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);
export default TutorialComponent;
