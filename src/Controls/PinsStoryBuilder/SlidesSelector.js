import React from 'react';
import moment from 'moment';
import { t } from 'ttag';

import PinPreviewImage from '../../Tools/Pins/PinPreviewImage';
import EditableString from '../../Tools/Pins/EditableString';
import { NotificationPanel } from '../../Notification/NotificationPanel';
import { constructEffectsFromPinOrHighlight } from '../../utils/effectsUtils';

export default class SlidesSelector extends React.Component {
  render() {
    const { slides, onToggleSlide, saveNewSlideTitle } = this.props;
    const slidesWithinBounds = slides.filter((s) => s.withinBounds);
    const N_PINS_OUTSIDE_BOUNDS = slides.length - slidesWithinBounds.length;
    let warningMsg = null;
    if (slidesWithinBounds.length === 0) {
      warningMsg = t`No pins were found within the current field of view.`;
    } else if (N_PINS_OUTSIDE_BOUNDS > 0) {
      warningMsg = t`Some pins (${N_PINS_OUTSIDE_BOUNDS}) are ignored because they are not within the selected area.`;
    }
    return (
      <div className="pins-selector">
        {slides.map(
          (slide, i) =>
            slide.withinBounds && (
              <Slide
                key={slide.pin._id}
                pin={slide.pin}
                title={slide.title}
                onClick={() => onToggleSlide(i)}
                selected={slide.selected}
                saveNewSlideTitle={(title) => saveNewSlideTitle(i, title)}
              />
            ),
        )}

        {warningMsg && (
          <>
            <NotificationPanel type="warning" msg={warningMsg} className="pin-story-warning" />
            <div className="info-panel">
              <i className={`fa fa-info`} />
              {t`To create a pin story, navigate to the desired position on the map.\n\nAll pins within the current field of view will be used to create the story, the rest will be ignored.`}
            </div>
          </>
        )}
      </div>
    );
  }
}

class Slide extends React.Component {
  render() {
    const { pin, title, onClick, selected, saveNewSlideTitle } = this.props;

    const effects = constructEffectsFromPinOrHighlight(pin);
    const pinItem = { ...pin, ...effects };

    return (
      <div className="pin-item">
        <div className="pin-content" onClick={onClick}>
          <div className="slide-image">
            <span className={`pin-selector ${selected ? 'selected' : ''}`} />
            <PinPreviewImage pin={pinItem} />
          </div>
          <div className="pin-info">
            <EditableString text={title} onEditSave={saveNewSlideTitle} />
            <div>
              <span className="pin-date">{moment.utc(pin.toTime).format('YYYY-MM-DD')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
